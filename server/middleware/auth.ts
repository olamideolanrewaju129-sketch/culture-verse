import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'cultureverse-secure-jwt-secret-african-heritage-2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  preferred_culture_id: string | null;
  full_name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function signToken(user: { id: string; email: string; role: string; preferred_culture_id?: string | null; full_name: string }) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      preferred_culture_id: user.preferred_culture_id || null,
      full_name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Verify user exists in db
    const stmt = db.prepare('SELECT id, full_name, email, role, preferred_culture_id FROM users WHERE id = ?');
    const user = stmt.get(decoded.id) as AuthenticatedUser | undefined;

    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired authentication session.' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrative privilege required.' });
    }
    next();
  });
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    const stmt = db.prepare('SELECT id, full_name, email, role, preferred_culture_id FROM users WHERE id = ?');
    const user = stmt.get(decoded.id) as AuthenticatedUser | undefined;
    if (user) {
      req.user = user;
    }
  } catch {
    // Ignore invalid tokens for optional endpoints
  }
  next();
}
