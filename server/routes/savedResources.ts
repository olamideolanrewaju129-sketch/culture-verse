import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get user saved resources
router.get('/', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const stmt = db.prepare(`
    SELECT cr.*, c.name as culture_name, c.slug as culture_slug,
           cat.name as category_name, cat.slug as category_slug,
           sr.created_at as saved_at
    FROM saved_resources sr
    JOIN cultural_resources cr ON sr.resource_id = cr.id
    JOIN cultures c ON cr.culture_id = c.id
    JOIN categories cat ON cr.category_id = cat.id
    WHERE sr.user_id = ?
    ORDER BY sr.created_at DESC
  `);
  const saved_resources = stmt.all(userId);
  return res.json({ saved_resources });
});

// Save a resource
router.post('/', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { resource_id } = req.body;

  if (!resource_id) {
    return res.status(400).json({ error: 'resource_id is required' });
  }

  // Check resource exists
  const resourceExists = db.prepare('SELECT id FROM cultural_resources WHERE id = ?').get(resource_id);
  if (!resourceExists) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const id = 'sav_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  try {
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO saved_resources (id, user_id, resource_id)
      VALUES (?, ?, ?)
    `);
    insertStmt.run(id, userId, resource_id);
    return res.json({ message: 'Resource saved to your cultural library.' });
  } catch (err: any) {
    console.error('Save resource error:', err);
    return res.status(500).json({ error: 'Failed to save resource.' });
  }
});

// Remove saved resource
router.delete('/:resourceId', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { resourceId } = req.params;

  const deleteStmt = db.prepare('DELETE FROM saved_resources WHERE user_id = ? AND resource_id = ?');
  deleteStmt.run(userId, resourceId);

  return res.json({ message: 'Resource removed from saved collection.' });
});

export default router;
