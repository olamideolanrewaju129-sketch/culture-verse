import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Metrics summary (Genuine counts from database)
router.get('/metrics', requireAdmin, (_req: AuthRequest, res) => {
  const usersCount = (db.prepare('SELECT count(*) as c FROM users').get() as any).c;
  const resourcesCount = (db.prepare("SELECT count(*) as c FROM cultural_resources WHERE status = 'published'").get() as any).c;
  const pendingContributionsCount = (db.prepare("SELECT count(*) as c FROM contributions WHERE status = 'pending'").get() as any).c;
  const totalContributionsCount = (db.prepare('SELECT count(*) as c FROM contributions').get() as any).c;
  const coursesCount = (db.prepare("SELECT count(*) as c FROM courses WHERE status = 'published'").get() as any).c;
  const knowledgeGapsCount = (db.prepare("SELECT count(*) as c FROM knowledge_gaps WHERE status = 'open'").get() as any).c;
  const ordersCount = (db.prepare('SELECT count(*) as c FROM orders').get() as any).c;

  return res.json({
    metrics: {
      users_count: usersCount,
      resources_count: resourcesCount,
      pending_contributions_count: pendingContributionsCount,
      total_contributions_count: totalContributionsCount,
      courses_count: coursesCount,
      knowledge_gaps_count: knowledgeGapsCount,
      orders_count: ordersCount,
    },
  });
});

// View contributions for review
router.get('/contributions', requireAdmin, (req: AuthRequest, res) => {
  const { status = 'all' } = req.query;

  let query = `
    SELECT c.*, cult.name as culture_name, cult.slug as culture_slug,
           cat.name as category_name, cat.slug as category_slug,
           u.full_name as contributor_name, u.email as contributor_email
    FROM contributions c
    JOIN cultures cult ON c.culture_id = cult.id
    JOIN categories cat ON c.category_id = cat.id
    JOIN users u ON c.contributor_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ` AND c.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY c.created_at DESC`;

  const stmt = db.prepare(query);
  const contributions = stmt.all(...params);

  return res.json({ contributions });
});

// Review contribution (Approve, Reject, or Request Revision)
router.post('/contributions/:id/review', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { action, review_notes, auto_publish = true } = req.body;

  if (!['approved', 'rejected', 'revision_requested'].includes(action)) {
    return res.status(400).json({ error: 'Action must be approved, rejected, or revision_requested.' });
  }

  const existingStmt = db.prepare('SELECT * FROM contributions WHERE id = ?');
  const contribution = existingStmt.get(id) as any;

  if (!contribution) {
    return res.status(404).json({ error: 'Contribution not found.' });
  }

  const updateStmt = db.prepare(`
    UPDATE contributions
    SET status = ?,
        review_notes = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  updateStmt.run(action, review_notes || null, id);

  // If approved and auto_publish, promote to cultural_resources
  if (action === 'approved' && auto_publish) {
    const slugBase = contribution.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    const slug = slugBase + '-' + Math.random().toString(36).substring(2, 6);
    const resourceId = 'res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const insertResource = db.prepare(`
      INSERT INTO cultural_resources (
        id, title, slug, summary, content, culture_id, category_id,
        contributor_id, content_type, language, media_url, status, visibility, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 'public', CURRENT_TIMESTAMP)
    `);

    insertResource.run(
      resourceId,
      contribution.title,
      slug,
      contribution.summary || contribution.title,
      contribution.content,
      contribution.culture_id,
      contribution.category_id,
      contribution.contributor_id,
      contribution.content_type,
      contribution.language,
      contribution.media_url
    );

    if (contribution.source_references) {
      const srcId = 'src_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      db.prepare(`
        INSERT INTO resource_sources (id, resource_id, source_title, author, notes)
        VALUES (?, ?, 'Contributor Source Citations', ?, ?)
      `).run(srcId, resourceId, 'Community Knowledge Keeper', contribution.source_references);
    }
  }

  // Notify user
  const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  let notifMessage = `Your contribution "${contribution.title}" status has been updated to: ${action}.`;
  if (review_notes) notifMessage += ` Notes: ${review_notes}`;

  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message)
    VALUES (?, ?, 'Contribution Status Update', ?)
  `).run(notifId, contribution.contributor_id, notifMessage);

  return res.json({
    message: `Contribution successfully marked as ${action}.`,
  });
});

// Manage published resources
router.get('/resources', requireAdmin, (_req: AuthRequest, res) => {
  const stmt = db.prepare(`
    SELECT cr.*, cult.name as culture_name, cat.name as category_name, u.full_name as contributor_name
    FROM cultural_resources cr
    JOIN cultures cult ON cr.culture_id = cult.id
    JOIN categories cat ON cr.category_id = cat.id
    LEFT JOIN users u ON cr.contributor_id = u.id
    ORDER BY cr.published_at DESC
  `);
  const resources = stmt.all();
  return res.json({ resources });
});

// Manage knowledge gaps
router.get('/knowledge-gaps', requireAdmin, (_req: AuthRequest, res) => {
  const stmt = db.prepare(`
    SELECT kg.*, cult.name as culture_name, cat.name as category_name, u.full_name as submitter_name
    FROM knowledge_gaps kg
    JOIN cultures cult ON kg.culture_id = cult.id
    JOIN categories cat ON kg.category_id = cat.id
    LEFT JOIN users u ON kg.submitted_by = u.id
    ORDER BY kg.created_at DESC
  `);
  const knowledge_gaps = stmt.all();
  return res.json({ knowledge_gaps });
});

// Update knowledge gap status
router.put('/knowledge-gaps/:id', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.prepare('UPDATE knowledge_gaps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
  return res.json({ message: 'Knowledge gap status updated.' });
});

// View registered users
router.get('/users', requireAdmin, (_req: AuthRequest, res) => {
  const stmt = db.prepare(`
    SELECT u.id, u.full_name, u.email, u.role, u.created_at, cult.name as preferred_culture_name,
      (SELECT count(*) FROM course_enrolments WHERE user_id = u.id) as enrolled_courses_count,
      (SELECT count(*) FROM contributions WHERE contributor_id = u.id) as contributions_count
    FROM users u
    LEFT JOIN cultures cult ON u.preferred_culture_id = cult.id
    ORDER BY u.created_at DESC
  `);
  const users = stmt.all();
  return res.json({ users });
});

// View courses
router.get('/courses', requireAdmin, (_req: AuthRequest, res) => {
  const stmt = db.prepare(`
    SELECT crs.*, cult.name as culture_name, u.full_name as instructor_name,
      (SELECT count(*) FROM course_enrolments WHERE course_id = crs.id) as enrollments_count
    FROM courses crs
    JOIN cultures cult ON crs.culture_id = cult.id
    LEFT JOIN users u ON crs.instructor_id = u.id
    ORDER BY crs.created_at DESC
  `);
  const courses = stmt.all();
  return res.json({ courses });
});

export default router;
