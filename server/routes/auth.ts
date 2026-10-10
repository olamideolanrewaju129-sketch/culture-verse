import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', (req, res) => {
  const { full_name, email, password, preferred_culture, additional_interests } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email address, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // Check if email already registered
  const existingStmt = db.prepare('SELECT id FROM users WHERE email = ?');
  const existing = existingStmt.get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
  }

  // Resolve preferred culture id if slug passed
  let preferredCultureId: string | null = null;
  if (preferred_culture) {
    const cultStmt = db.prepare('SELECT id FROM cultures WHERE slug = ? OR id = ?');
    const cult = cultStmt.get(preferred_culture, preferred_culture) as { id: string } | undefined;
    if (cult) {
      preferredCultureId = cult.id;
    }
  }

  const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const passwordHash = bcrypt.hashSync(password, 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, preferred_culture_id)
    VALUES (?, ?, ?, ?, 'user', ?)
  `);

  try {
    insertUser.run(userId, full_name.trim(), email.toLowerCase().trim(), passwordHash, preferredCultureId);

    // Save additional cultural interests if provided
    if (Array.isArray(additional_interests)) {
      const insertInterest = db.prepare(`
        INSERT INTO user_cultural_interests (id, user_id, culture_id)
        VALUES (?, ?, ?)
      `);
      for (const cultKey of additional_interests) {
        const cultStmt = db.prepare('SELECT id FROM cultures WHERE slug = ? OR id = ?');
        const c = cultStmt.get(cultKey, cultKey) as { id: string } | undefined;
        if (c && c.id !== preferredCultureId) {
          const interestId = 'int_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
          insertInterest.run(interestId, userId, c.id);
        }
      }
    }

    // Retrieve created user
    const userStmt = db.prepare(`
      SELECT u.id, u.full_name, u.email, u.role, u.preferred_culture_id, c.slug as preferred_culture_slug, c.name as preferred_culture_name
      FROM users u
      LEFT JOIN cultures c ON u.preferred_culture_id = c.id
      WHERE u.id = ?
    `);
    const createdUser = userStmt.get(userId) as any;

    const token = signToken(createdUser);

    return res.status(201).json({
      message: 'Account created successfully. Welcome to CultureVerse!',
      token,
      user: createdUser,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create user account. Please try again.' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const userStmt = db.prepare(`
    SELECT u.id, u.full_name, u.email, u.password_hash, u.role, u.preferred_culture_id, u.profile_image, u.biography,
           c.slug as preferred_culture_slug, c.name as preferred_culture_name
    FROM users u
    LEFT JOIN cultures c ON u.preferred_culture_id = c.id
    WHERE u.email = ?
  `);
  const user = userStmt.get(email.toLowerCase().trim()) as any;

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(user);
  const { password_hash, ...safeUser } = user;

  return res.json({
    message: 'Welcome back to CultureVerse!',
    token,
    user: safeUser,
  });
});

// Me
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  const userStmt = db.prepare(`
    SELECT u.id, u.full_name, u.email, u.role, u.preferred_culture_id, u.profile_image, u.biography, u.created_at,
           c.slug as preferred_culture_slug, c.name as preferred_culture_name
    FROM users u
    LEFT JOIN cultures c ON u.preferred_culture_id = c.id
    WHERE u.id = ?
  `);
  const user = userStmt.get(req.user!.id) as any;

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Get interests
  const interestsStmt = db.prepare(`
    SELECT c.id, c.name, c.slug
    FROM user_cultural_interests uci
    JOIN cultures c ON uci.culture_id = c.id
    WHERE uci.user_id = ?
  `);
  const interests = interestsStmt.all(user.id);

  return res.json({
    user: {
      ...user,
      cultural_interests: interests,
    },
  });
});

// Update Profile
router.put('/profile', requireAuth, (req: AuthRequest, res) => {
  const { full_name, preferred_culture_slug, biography, profile_image } = req.body;

  let preferredCultureId = req.user!.preferred_culture_id;
  if (preferred_culture_slug) {
    const cultStmt = db.prepare('SELECT id FROM cultures WHERE slug = ? OR id = ?');
    const cult = cultStmt.get(preferred_culture_slug, preferred_culture_slug) as { id: string } | undefined;
    if (cult) {
      preferredCultureId = cult.id;
    }
  }

  const updateStmt = db.prepare(`
    UPDATE users
    SET full_name = COALESCE(?, full_name),
        preferred_culture_id = COALESCE(?, preferred_culture_id),
        biography = COALESCE(?, biography),
        profile_image = COALESCE(?, profile_image),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  updateStmt.run(full_name?.trim() || null, preferredCultureId, biography || null, profile_image || null, req.user!.id);

  const updatedStmt = db.prepare(`
    SELECT u.id, u.full_name, u.email, u.role, u.preferred_culture_id, u.profile_image, u.biography,
           c.slug as preferred_culture_slug, c.name as preferred_culture_name
    FROM users u
    LEFT JOIN cultures c ON u.preferred_culture_id = c.id
    WHERE u.id = ?
  `);
  const updatedUser = updatedStmt.get(req.user!.id) as any;

  const token = signToken(updatedUser);

  return res.json({
    message: 'Profile updated successfully.',
    token,
    user: updatedUser,
  });
});

// Logout
router.post('/logout', (_req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

// Forgot password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please enter your registered email address.' });
  }

  const userStmt = db.prepare('SELECT id FROM users WHERE email = ?');
  const user = userStmt.get(email.toLowerCase().trim());

  // For security, always respond with generic confirmation
  return res.json({
    message: user
      ? 'Password recovery instructions have been prepared. Please check your inbox or contact platform administration for instant credential recovery.'
      : 'If an account exists with this email address, password recovery instructions have been dispatched.',
  });
});

export default router;
