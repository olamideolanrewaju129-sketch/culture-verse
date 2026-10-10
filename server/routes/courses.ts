import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuth, requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all courses
router.get('/', optionalAuth, (req: AuthRequest, res) => {
  const { culture, difficulty, search } = req.query;

  let query = `
    SELECT crs.*, c.name as culture_name, c.slug as culture_slug,
           u.full_name as instructor_name, u.biography as instructor_bio, u.profile_image as instructor_image,
           (SELECT count(*) FROM course_modules WHERE course_id = crs.id) as modules_count,
           (SELECT count(*) FROM lessons l JOIN course_modules cm ON l.module_id = cm.id WHERE cm.course_id = crs.id) as lessons_count
    FROM courses crs
    JOIN cultures c ON crs.culture_id = c.id
    LEFT JOIN users u ON crs.instructor_id = u.id
    WHERE crs.status = 'published'
  `;
  const params: any[] = [];

  if (culture && culture !== 'all') {
    query += ` AND (c.slug = ? OR c.id = ?)`;
    params.push(culture, culture);
  }

  if (difficulty && difficulty !== 'all') {
    query += ` AND crs.difficulty = ?`;
    params.push(difficulty);
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    query += ` AND (crs.title LIKE ? OR crs.description LIKE ?)`;
    const searchParam = `%${search.trim()}%`;
    params.push(searchParam, searchParam);
  }

  query += ` ORDER BY crs.created_at DESC`;

  const stmt = db.prepare(query);
  const courses = stmt.all(...params) as any[];

  // If user authenticated, check enrolment
  if (req.user) {
    const enrollStmt = db.prepare('SELECT course_id FROM course_enrolments WHERE user_id = ?');
    const enrolledIds = new Set((enrollStmt.all(req.user.id) as any[]).map(e => e.course_id));
    courses.forEach(c => {
      c.is_enrolled = enrolledIds.has(c.id);
    });
  }

  return res.json({ courses });
});

// Get single course by id or slug with curriculum
router.get('/:id', optionalAuth, (req: AuthRequest, res) => {
  const { id } = req.params;

  const courseStmt = db.prepare(`
    SELECT crs.*, c.name as culture_name, c.slug as culture_slug,
           u.full_name as instructor_name, u.biography as instructor_bio, u.profile_image as instructor_image
    FROM courses crs
    JOIN cultures c ON crs.culture_id = c.id
    LEFT JOIN users u ON crs.instructor_id = u.id
    WHERE (crs.id = ? OR crs.slug = ?) AND crs.status = 'published'
  `);
  const course = courseStmt.get(id, id) as any;

  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }

  // Get modules
  const modulesStmt = db.prepare(`
    SELECT * FROM course_modules
    WHERE course_id = ?
    ORDER BY position ASC
  `);
  const modules = modulesStmt.all(course.id) as any[];

  // Get lessons for each module
  const lessonsStmt = db.prepare(`
    SELECT id, module_id, title, duration_minutes, position
    FROM lessons
    WHERE module_id = ?
    ORDER BY position ASC
  `);

  let totalLessons = 0;
  modules.forEach(m => {
    m.lessons = lessonsStmt.all(m.id);
    totalLessons += m.lessons.length;
  });

  // Check enrollment and progress if logged in
  let is_enrolled = false;
  let completed_lessons_count = 0;
  let completed_lesson_ids: string[] = [];

  if (req.user) {
    const enrollStmt = db.prepare('SELECT 1 FROM course_enrolments WHERE user_id = ? AND course_id = ?');
    is_enrolled = !!enrollStmt.get(req.user.id, course.id);

    const progStmt = db.prepare('SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ?');
    completed_lesson_ids = (progStmt.all(req.user.id, course.id) as any[]).map(p => p.lesson_id);
    completed_lessons_count = completed_lesson_ids.length;
  }

  const progress_percentage = totalLessons > 0 ? Math.round((completed_lessons_count / totalLessons) * 100) : 0;

  return res.json({
    course: {
      ...course,
      total_lessons: totalLessons,
      is_enrolled,
      completed_lessons_count,
      completed_lesson_ids,
      progress_percentage,
    },
    modules,
  });
});

// Enrol in course (Free course instant enrolment, or already paid)
router.post('/:id/enrol', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const courseStmt = db.prepare('SELECT * FROM courses WHERE id = ? OR slug = ?');
  const course = courseStmt.get(id, id) as any;

  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }

  // Check if already enrolled
  const existingStmt = db.prepare('SELECT * FROM course_enrolments WHERE user_id = ? AND course_id = ?');
  const existing = existingStmt.get(userId, course.id);
  if (existing) {
    return res.json({ message: 'You are already enrolled in this course.', course_id: course.id });
  }

  // If paid course, verify payment
  if (course.price > 0) {
    const verifiedOrder = db.prepare(`
      SELECT o.id FROM orders o
      JOIN payments p ON p.order_id = o.id
      WHERE o.user_id = ? AND o.course_id = ? AND o.status = 'paid' AND p.status = 'successful'
    `).get(userId, course.id);

    if (!verifiedOrder) {
      return res.status(402).json({
        error: 'Payment required for this course.',
        price: course.price,
        currency: course.currency,
        course_id: course.id,
      });
    }
  }

  const enrolId = 'enr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const insertEnrol = db.prepare(`
    INSERT INTO course_enrolments (id, user_id, course_id, payment_status)
    VALUES (?, ?, ?, 'completed')
  `);
  insertEnrol.run(enrolId, userId, course.id);

  return res.status(201).json({
    message: `Successfully enrolled in ${course.title}!`,
    course_id: course.id,
  });
});

// Get user's learning progress & enrolled courses
router.get('/user/my-learning', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const stmt = db.prepare(`
    SELECT crs.*, c.name as culture_name, c.slug as culture_slug,
           u.full_name as instructor_name, ce.enrolled_at,
           (SELECT count(*) FROM lessons l JOIN course_modules cm ON l.module_id = cm.id WHERE cm.course_id = crs.id) as total_lessons,
           (SELECT count(*) FROM lesson_progress lp WHERE lp.user_id = ? AND lp.course_id = crs.id) as completed_lessons
    FROM course_enrolments ce
    JOIN courses crs ON ce.course_id = crs.id
    JOIN cultures c ON crs.culture_id = c.id
    LEFT JOIN users u ON crs.instructor_id = u.id
    WHERE ce.user_id = ?
    ORDER BY ce.enrolled_at DESC
  `);
  const enrollments = stmt.all(userId, userId) as any[];

  enrollments.forEach(e => {
    e.progress_percentage = e.total_lessons > 0 ? Math.round((e.completed_lessons / e.total_lessons) * 100) : 0;
    e.is_completed = e.total_lessons > 0 && e.completed_lessons >= e.total_lessons;
  });

  return res.json({ learning: enrollments });
});

// Get full lesson details for course player
router.get('/lessons/:lessonId', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { lessonId } = req.params;

  const lessonStmt = db.prepare(`
    SELECT l.*, cm.course_id, cm.title as module_title, crs.title as course_title,
           crs.slug as course_slug, c.slug as culture_slug, c.name as culture_name
    FROM lessons l
    JOIN course_modules cm ON l.module_id = cm.id
    JOIN courses crs ON cm.course_id = crs.id
    JOIN cultures c ON crs.culture_id = c.id
    WHERE l.id = ?
  `);
  const lesson = lessonStmt.get(lessonId) as any;

  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found.' });
  }

  // Verify user is enrolled
  const enrolledStmt = db.prepare('SELECT 1 FROM course_enrolments WHERE user_id = ? AND course_id = ?');
  const isEnrolled = !!enrolledStmt.get(userId, lesson.course_id);
  if (!isEnrolled) {
    return res.status(403).json({ error: 'You must be enrolled in this course to access lessons.' });
  }

  // Check if this lesson is completed
  const progressStmt = db.prepare('SELECT 1 FROM lesson_progress WHERE user_id = ? AND lesson_id = ?');
  const isCompleted = !!progressStmt.get(userId, lessonId);

  // Get full curriculum for sidebar navigation in player
  const modulesStmt = db.prepare(`SELECT * FROM course_modules WHERE course_id = ? ORDER BY position ASC`);
  const modules = modulesStmt.all(lesson.course_id) as any[];
  const lessonsStmt = db.prepare(`SELECT id, module_id, title, duration_minutes, position FROM lessons WHERE module_id = ? ORDER BY position ASC`);
  modules.forEach(m => {
    m.lessons = lessonsStmt.all(m.id);
  });

  // Get completed lesson ids
  const completedIdsStmt = db.prepare('SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ?');
  const completedLessonIds = (completedIdsStmt.all(userId, lesson.course_id) as any[]).map(p => p.lesson_id);

  return res.json({
    lesson: {
      ...lesson,
      is_completed: isCompleted,
    },
    modules,
    completedLessonIds,
  });
});

// Mark lesson as complete
router.post('/lessons/:lessonId/complete', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { lessonId } = req.params;

  const lessonStmt = db.prepare(`
    SELECT l.id, cm.course_id
    FROM lessons l
    JOIN course_modules cm ON l.module_id = cm.id
    WHERE l.id = ?
  `);
  const lesson = lessonStmt.get(lessonId) as any;

  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found.' });
  }

  const progressId = 'prg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const insertProgress = db.prepare(`
    INSERT OR REPLACE INTO lesson_progress (id, user_id, lesson_id, course_id, completed_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);
  insertProgress.run(progressId, userId, lesson.id, lesson.course_id);

  // Calculate new progress percentage
  const totalStmt = db.prepare(`
    SELECT count(*) as count FROM lessons l
    JOIN course_modules cm ON l.module_id = cm.id
    WHERE cm.course_id = ?
  `);
  const totalLessons = (totalStmt.get(lesson.course_id) as any).count;

  const completedStmt = db.prepare(`
    SELECT count(*) as count FROM lesson_progress
    WHERE user_id = ? AND course_id = ?
  `);
  const completedCount = (completedStmt.get(userId, lesson.course_id) as any).count;

  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 100;

  return res.json({
    message: 'Lesson marked as complete! Well done.',
    progress_percentage: percentage,
    is_course_finished: completedCount >= totalLessons,
  });
});

export default router;
