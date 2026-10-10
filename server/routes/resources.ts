import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuth, requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all resources with filtering, search, pagination
router.get('/', optionalAuth, (req: AuthRequest, res) => {
  const { culture, category, type, search, sort = 'newest' } = req.query;

  let query = `
    SELECT cr.*, c.name as culture_name, c.slug as culture_slug,
           cat.name as category_name, cat.slug as category_slug,
           u.full_name as contributor_name, u.profile_image as contributor_image
    FROM cultural_resources cr
    JOIN cultures c ON cr.culture_id = c.id
    JOIN categories cat ON cr.category_id = cat.id
    LEFT JOIN users u ON cr.contributor_id = u.id
    WHERE cr.status = 'published' AND cr.visibility = 'public'
  `;

  const params: any[] = [];

  if (culture && culture !== 'all') {
    query += ` AND (c.slug = ? OR c.id = ?)`;
    params.push(culture, culture);
  }

  if (category && category !== 'all') {
    query += ` AND (cat.slug = ? OR cat.id = ?)`;
    params.push(category, category);
  }

  if (type && type !== 'all') {
    query += ` AND cr.content_type = ?`;
    params.push(type);
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    query += ` AND (cr.title LIKE ? OR cr.summary LIKE ? OR cr.content LIKE ?)`;
    const searchParam = `%${search.trim()}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  if (sort === 'oldest') {
    query += ` ORDER BY cr.published_at ASC`;
  } else if (sort === 'title') {
    query += ` ORDER BY cr.title ASC`;
  } else {
    query += ` ORDER BY cr.published_at DESC`;
  }

  const stmt = db.prepare(query);
  const resources = stmt.all(...params) as any[];

  // If user is authenticated, check saved status
  if (req.user) {
    const savedStmt = db.prepare('SELECT resource_id FROM saved_resources WHERE user_id = ?');
    const saved = new Set((savedStmt.all(req.user.id) as any[]).map(r => r.resource_id));
    resources.forEach(r => {
      r.is_saved = saved.has(r.id);
    });
  }

  return res.json({ resources });
});

// Get single resource by id or slug
router.get('/:id', optionalAuth, (req: AuthRequest, res) => {
  const { id } = req.params;

  const resourceStmt = db.prepare(`
    SELECT cr.*, c.name as culture_name, c.slug as culture_slug,
           cat.name as category_name, cat.slug as category_slug,
           u.full_name as contributor_name, u.biography as contributor_bio, u.profile_image as contributor_image
    FROM cultural_resources cr
    JOIN cultures c ON cr.culture_id = c.id
    JOIN categories cat ON cr.category_id = cat.id
    LEFT JOIN users u ON cr.contributor_id = u.id
    WHERE (cr.id = ? OR cr.slug = ?) AND cr.status = 'published'
  `);
  const resource = resourceStmt.get(id, id) as any;

  if (!resource) {
    return res.status(404).json({ error: 'Cultural resource not found or awaiting publication.' });
  }

  // Get sources and references
  const sourcesStmt = db.prepare('SELECT * FROM resource_sources WHERE resource_id = ?');
  const sources = sourcesStmt.all(resource.id);

  // Get related resources
  const relatedStmt = db.prepare(`
    SELECT cr.id, cr.title, cr.slug, cr.summary, cr.content_type, cr.media_url, cr.read_time_minutes,
           c.name as culture_name, c.slug as culture_slug, cat.name as category_name
    FROM cultural_resources cr
    JOIN cultures c ON cr.culture_id = c.id
    JOIN categories cat ON cr.category_id = cat.id
    WHERE (cr.culture_id = ? OR cr.category_id = ?) AND cr.id != ? AND cr.status = 'published'
    LIMIT 4
  `);
  const related = relatedStmt.all(resource.culture_id, resource.category_id, resource.id);

  // Check saved status
  let is_saved = false;
  if (req.user) {
    const savedStmt = db.prepare('SELECT 1 FROM saved_resources WHERE user_id = ? AND resource_id = ?');
    is_saved = !!savedStmt.get(req.user.id, resource.id);
  }

  return res.json({
    resource: {
      ...resource,
      sources,
      is_saved,
    },
    related,
  });
});

export default router;
