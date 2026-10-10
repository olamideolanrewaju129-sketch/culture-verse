import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get current user's contributions
router.get('/mine', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const stmt = db.prepare(`
    SELECT c.*, cult.name as culture_name, cult.slug as culture_slug,
           cat.name as category_name, cat.slug as category_slug
    FROM contributions c
    JOIN cultures cult ON c.culture_id = cult.id
    JOIN categories cat ON c.category_id = cat.id
    WHERE c.contributor_id = ?
    ORDER BY c.updated_at DESC
  `);
  const contributions = stmt.all(userId);

  return res.json({ contributions });
});

// Get single contribution by id
router.get('/:id', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const stmt = db.prepare(`
    SELECT c.*, cult.name as culture_name, cult.slug as culture_slug,
           cat.name as category_name, cat.slug as category_slug
    FROM contributions c
    JOIN cultures cult ON c.culture_id = cult.id
    JOIN categories cat ON c.category_id = cat.id
    WHERE c.id = ? AND (c.contributor_id = ? OR ? = 'admin')
  `);
  const contribution = stmt.get(id, userId, req.user!.role);

  if (!contribution) {
    return res.status(404).json({ error: 'Contribution not found or unauthorized.' });
  }

  return res.json({ contribution });
});

// Create contribution (Draft or Submit for Review)
router.post('/', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const {
    title,
    summary,
    content,
    culture_id,
    category_id,
    content_type = 'article',
    language = 'English',
    source_references,
    media_url,
    status = 'pending', // 'draft' or 'pending'
    permission_declaration,
  } = req.body;

  if (!title || !content || !culture_id || !category_id) {
    return res.status(400).json({ error: 'Title, content, culture, and category are required.' });
  }

  if (status === 'pending' && !permission_declaration) {
    return res.status(400).json({
      error: 'You must confirm that you have permission or customary rights to share this cultural knowledge.',
    });
  }

  // Resolve culture_id if slug passed
  let cultId = culture_id;
  const cultRow = db.prepare('SELECT id FROM cultures WHERE slug = ? OR id = ?').get(culture_id, culture_id) as any;
  if (cultRow) cultId = cultRow.id;

  // Resolve category_id if slug passed
  let catId = category_id;
  const catRow = db.prepare('SELECT id FROM categories WHERE (slug = ? OR id = ?) AND culture_id = ?').get(category_id, category_id, cultId) as any;
  if (catRow) catId = catRow.id;

  const contributionId = 'cnt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const insertStmt = db.prepare(`
    INSERT INTO contributions (
      id, contributor_id, title, summary, content, culture_id, category_id,
      content_type, language, source_references, media_url, permission_status, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    insertStmt.run(
      contributionId,
      userId,
      title.trim(),
      summary?.trim() || title.trim(),
      content.trim(),
      cultId,
      catId,
      content_type,
      language,
      source_references || null,
      media_url || null,
      permission_declaration ? 'granted' : 'pending_consent',
      status === 'draft' ? 'draft' : 'pending'
    );

    return res.status(201).json({
      message:
        status === 'draft'
          ? 'Draft saved successfully.'
          : 'Thank you! Your cultural contribution has been submitted for editorial and cultural review.',
      contribution_id: contributionId,
    });
  } catch (err: any) {
    console.error('Error creating contribution:', err);
    return res.status(500).json({ error: 'Failed to record contribution.' });
  }
});

// Update contribution (for drafts or responding to revision requests)
router.put('/:id', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { title, summary, content, culture_id, category_id, content_type, language, source_references, media_url, status } = req.body;

  // Check ownership
  const existing = db.prepare('SELECT * FROM contributions WHERE id = ?').get(id) as any;
  if (!existing) {
    return res.status(404).json({ error: 'Contribution not found.' });
  }

  if (existing.contributor_id !== userId && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to modify this contribution.' });
  }

  let newStatus = existing.status;
  if (status === 'pending') {
    newStatus = 'pending';
  } else if (status === 'draft') {
    newStatus = 'draft';
  }

  const updateStmt = db.prepare(`
    UPDATE contributions
    SET title = COALESCE(?, title),
        summary = COALESCE(?, summary),
        content = COALESCE(?, content),
        culture_id = COALESCE(?, culture_id),
        category_id = COALESCE(?, category_id),
        content_type = COALESCE(?, content_type),
        language = COALESCE(?, language),
        source_references = COALESCE(?, source_references),
        media_url = COALESCE(?, media_url),
        status = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  updateStmt.run(
    title?.trim() || null,
    summary?.trim() || null,
    content?.trim() || null,
    culture_id || null,
    category_id || null,
    content_type || null,
    language || null,
    source_references || null,
    media_url || null,
    newStatus,
    id
  );

  return res.json({ message: 'Contribution updated successfully.' });
});

export default router;
