import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuth, requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get knowledge gaps
router.get('/', optionalAuth, (req, res) => {
  const { culture, status = 'open' } = req.query;

  let query = `
    SELECT kg.*, cult.name as culture_name, cult.slug as culture_slug,
           cat.name as category_name, cat.slug as category_slug,
           u.full_name as submitter_name
    FROM knowledge_gaps kg
    JOIN cultures cult ON kg.culture_id = cult.id
    JOIN categories cat ON kg.category_id = cat.id
    LEFT JOIN users u ON kg.submitted_by = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ` AND kg.status = ?`;
    params.push(status);
  }

  if (culture && culture !== 'all') {
    query += ` AND (cult.slug = ? OR cult.id = ?)`;
    params.push(culture, culture);
  }

  query += ` ORDER BY kg.votes_count DESC, kg.created_at DESC`;

  const stmt = db.prepare(query);
  const gaps = stmt.all(...params);

  return res.json({ knowledge_gaps: gaps });
});

// Submit a new knowledge gap suggestion
router.post('/', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { title, description, culture_id, category_id, why_it_matters } = req.body;

  if (!title || !description || !culture_id || !category_id) {
    return res.status(400).json({ error: 'Title, description, culture, and category are required.' });
  }

  // Resolve culture_id if slug
  let cultId = culture_id;
  const cultRow = db.prepare('SELECT id FROM cultures WHERE slug = ? OR id = ?').get(culture_id, culture_id) as any;
  if (cultRow) cultId = cultRow.id;

  // Resolve category_id if slug
  let catId = category_id;
  const catRow = db.prepare('SELECT id FROM categories WHERE (slug = ? OR id = ?) AND culture_id = ?').get(category_id, category_id, cultId) as any;
  if (catRow) catId = catRow.id;

  const gapId = 'gap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const insertStmt = db.prepare(`
    INSERT INTO knowledge_gaps (id, submitted_by, title, description, culture_id, category_id, why_it_matters)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    insertStmt.run(gapId, userId, title.trim(), description.trim(), cultId, catId, why_it_matters?.trim() || null);
    return res.status(201).json({
      message: 'Thank you! Your topic suggestion has been registered in the Cultural Knowledge Gap index.',
      gap_id: gapId,
    });
  } catch (err: any) {
    console.error('Error creating knowledge gap:', err);
    return res.status(500).json({ error: 'Failed to record knowledge gap suggestion.' });
  }
});

// Upvote a knowledge gap
router.post('/:id/vote', optionalAuth, (req, res) => {
  const { id } = req.params;
  const updateStmt = db.prepare('UPDATE knowledge_gaps SET votes_count = votes_count + 1 WHERE id = ?');
  const result = updateStmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Knowledge gap not found.' });
  }

  const updated = db.prepare('SELECT votes_count FROM knowledge_gaps WHERE id = ?').get(id) as any;
  return res.json({ message: 'Vote recorded!', votes_count: updated.votes_count });
});

export default router;
