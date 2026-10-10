import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Get all cultures
router.get('/', (_req, res) => {
  const culturesStmt = db.prepare(`
    SELECT c.*,
      (SELECT count(*) FROM categories WHERE culture_id = c.id) as categories_count,
      (SELECT count(*) FROM cultural_resources WHERE culture_id = c.id AND status = 'published') as resources_count,
      (SELECT count(*) FROM courses WHERE culture_id = c.id AND status = 'published') as courses_count
    FROM cultures c
    WHERE c.status = 'active'
    ORDER BY c.name ASC
  `);
  const cultures = culturesStmt.all();
  return res.json({ cultures });
});

// Get single culture by slug or id
router.get('/:slug', (req, res) => {
  const { slug } = req.params;

  const cultureStmt = db.prepare(`
    SELECT c.*,
      (SELECT count(*) FROM categories WHERE culture_id = c.id) as categories_count,
      (SELECT count(*) FROM cultural_resources WHERE culture_id = c.id AND status = 'published') as resources_count,
      (SELECT count(*) FROM courses WHERE culture_id = c.id AND status = 'published') as courses_count
    FROM cultures c
    WHERE c.slug = ? OR c.id = ?
  `);
  const culture = cultureStmt.get(slug, slug) as any;

  if (!culture) {
    return res.status(404).json({ error: `Culture '${slug}' not found.` });
  }

  // Get categories
  const categoriesStmt = db.prepare(`
    SELECT cat.*,
      (SELECT count(*) FROM cultural_resources WHERE category_id = cat.id AND status = 'published') as resources_count
    FROM categories cat
    WHERE cat.culture_id = ?
    ORDER BY cat.name ASC
  `);
  const categories = categoriesStmt.all(culture.id);

  // Get featured resources
  const resourcesStmt = db.prepare(`
    SELECT cr.*, c.name as culture_name, c.slug as culture_slug,
           cat.name as category_name, cat.slug as category_slug,
           u.full_name as contributor_name, u.profile_image as contributor_image
    FROM cultural_resources cr
    JOIN cultures c ON cr.culture_id = c.id
    JOIN categories cat ON cr.category_id = cat.id
    LEFT JOIN users u ON cr.contributor_id = u.id
    WHERE cr.culture_id = ? AND cr.status = 'published'
    ORDER BY cr.published_at DESC
    LIMIT 6
  `);
  const featured_resources = resourcesStmt.all(culture.id);

  // Get courses
  const coursesStmt = db.prepare(`
    SELECT crs.*, c.name as culture_name, c.slug as culture_slug,
           u.full_name as instructor_name,
           (SELECT count(*) FROM course_modules WHERE course_id = crs.id) as modules_count,
           (SELECT count(*) FROM lessons l JOIN course_modules cm ON l.module_id = cm.id WHERE cm.course_id = crs.id) as lessons_count
    FROM courses crs
    JOIN cultures c ON crs.culture_id = c.id
    LEFT JOIN users u ON crs.instructor_id = u.id
    WHERE crs.culture_id = ? AND crs.status = 'published'
    ORDER BY crs.created_at DESC
  `);
  const courses = coursesStmt.all(culture.id);

  return res.json({
    culture,
    categories,
    featured_resources,
    courses,
  });
});

export default router;
