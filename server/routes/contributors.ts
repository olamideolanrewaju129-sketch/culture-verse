import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Get list of contributors
router.get('/', (_req, res) => {
  const stmt = db.prepare(`
    SELECT u.id, u.full_name, u.biography, u.profile_image,
           c.name as preferred_culture_name, c.slug as preferred_culture_slug,
           (SELECT count(*) FROM cultural_resources cr WHERE cr.contributor_id = u.id AND cr.status = 'published') as published_resources_count,
           (SELECT count(*) FROM courses crs WHERE crs.instructor_id = u.id AND crs.status = 'published') as courses_count
    FROM users u
    LEFT JOIN cultures c ON u.preferred_culture_id = c.id
    WHERE (
      EXISTS (SELECT 1 FROM cultural_resources cr WHERE cr.contributor_id = u.id AND cr.status = 'published')
      OR EXISTS (SELECT 1 FROM courses crs WHERE crs.instructor_id = u.id AND crs.status = 'published')
      OR u.role = 'admin'
    )
    ORDER BY published_resources_count DESC, u.full_name ASC
  `);
  const contributors = stmt.all();
  return res.json({ contributors });
});

// Get contributor details by id
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const userStmt = db.prepare(`
    SELECT u.id, u.full_name, u.biography, u.profile_image, u.created_at,
           c.name as preferred_culture_name, c.slug as preferred_culture_slug
    FROM users u
    LEFT JOIN cultures c ON u.preferred_culture_id = c.id
    WHERE u.id = ?
  `);
  const contributor = userStmt.get(id) as any;

  if (!contributor) {
    return res.status(404).json({ error: 'Contributor profile not found.' });
  }

  // Published resources by this contributor
  const resourcesStmt = db.prepare(`
    SELECT cr.id, cr.title, cr.slug, cr.summary, cr.content_type, cr.read_time_minutes, cr.published_at,
           c.name as culture_name, c.slug as culture_slug, cat.name as category_name
    FROM cultural_resources cr
    JOIN cultures c ON cr.culture_id = c.id
    JOIN categories cat ON cr.category_id = cat.id
    WHERE cr.contributor_id = ? AND cr.status = 'published'
    ORDER BY cr.published_at DESC
  `);
  const resources = resourcesStmt.all(id);

  // Courses taught by this contributor
  const coursesStmt = db.prepare(`
    SELECT crs.id, crs.title, crs.slug, crs.description, crs.difficulty, crs.price, crs.currency, crs.cover_image,
           c.name as culture_name, c.slug as culture_slug
    FROM courses crs
    JOIN cultures c ON crs.culture_id = c.id
    WHERE crs.instructor_id = ? AND crs.status = 'published'
  `);
  const courses = coursesStmt.all(id);

  return res.json({
    contributor: {
      ...contributor,
      resources_count: resources.length,
      courses_count: courses.length,
    },
    resources,
    courses,
  });
});

export default router;
