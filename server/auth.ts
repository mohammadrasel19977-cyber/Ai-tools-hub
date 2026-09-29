import { db, hashPassword, verifyPassword } from './db';
import { INITIAL_FREE_CREDITS, getUserBalance } from './credits';
import crypto from 'node:crypto';
import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  plan: 'free' | 'starter' | 'pro' | 'business';
  createdAt: string;
}

export interface SessionUser extends AuthUser {
  credits: number;
  maxCredits: number;
}

/**
 * Registers a new user and grants the initial 100 FREE CREDITS once.
 */
export function registerUser(name: string, email: string, password: string): {
  success: boolean;
  user?: SessionUser;
  token?: string;
  error?: string;
} {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim() || cleanEmail.split('@')[0];

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  // Check if user already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  const { hash, salt } = hashPassword(password);

  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    // 1. Insert user
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, salt, role, plan, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, cleanEmail, cleanName, hash, salt, 'user', 'free', now);

    // 2. Grant INITIAL_FREE_CREDITS (100) exactly once
    db.prepare(`
      INSERT INTO credit_balances (user_id, balance, updated_at)
      VALUES (?, ?, ?)
    `).run(userId, INITIAL_FREE_CREDITS, now);

    // 3. Record welcome credit transaction
    const txId = `tx_welcome_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    db.prepare(`
      INSERT INTO credit_transactions (id, user_id, amount, type, tool_id, request_id, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(txId, userId, INITIAL_FREE_CREDITS, 'welcome_bonus', null, null, 'Welcome Free Credits', now);

    // 4. Create active session token (valid for 30 days)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`
      INSERT INTO sessions (token, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(token, userId, now, expiresAt);

    db.exec('COMMIT;');

    const sessionUser: SessionUser = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      role: 'user',
      plan: 'free',
      createdAt: now,
      credits: INITIAL_FREE_CREDITS,
      maxCredits: INITIAL_FREE_CREDITS,
    };

    return {
      success: true,
      user: sessionUser,
      token,
    };
  } catch (err: any) {
    try { db.exec('ROLLBACK;'); } catch (_) {}
    console.error('Registration error:', err);
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
}

/**
 * Authenticates an existing user via email and password.
 */
export function loginUser(email: string, password: string): {
  success: boolean;
  user?: SessionUser;
  token?: string;
  error?: string;
} {
  const cleanEmail = email.trim().toLowerCase();

  const userRow = db.prepare(`
    SELECT id, email, name, password_hash, salt, role, plan, created_at
    FROM users
    WHERE email = ?
  `).get(cleanEmail) as {
    id: string;
    email: string;
    name: string;
    password_hash: string;
    salt: string;
    role: 'user' | 'admin';
    plan: 'free' | 'starter' | 'pro' | 'business';
    created_at: string;
  } | undefined;

  if (!userRow) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const isValid = verifyPassword(password, userRow.password_hash, userRow.salt);
  if (!isValid) {
    return { success: false, error: 'Invalid email or password.' };
  }

  // Create new session
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(token, userRow.id, now, expiresAt);

  const balance = getUserBalance(userRow.id);

  const sessionUser: SessionUser = {
    id: userRow.id,
    email: userRow.email,
    name: userRow.name,
    role: userRow.role,
    plan: userRow.plan,
    createdAt: userRow.created_at,
    credits: balance,
    maxCredits: userRow.plan === 'free' ? 100 : 2000,
  };

  return {
    success: true,
    user: sessionUser,
    token,
  };
}

/**
 * Extracts and validates bearer token from request.
 */
export function getAuthenticatedUser(req: Request): SessionUser | null {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : (req.headers['x-auth-token'] as string) || '';

  if (!token) return null;

  const now = new Date().toISOString();
  const session = db.prepare(`
    SELECT user_id, expires_at
    FROM sessions
    WHERE token = ? AND expires_at > ?
  `).get(token, now) as { user_id: string; expires_at: string } | undefined;

  if (!session) return null;

  const userRow = db.prepare(`
    SELECT id, email, name, role, plan, created_at
    FROM users
    WHERE id = ?
  `).get(session.user_id) as {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    plan: 'free' | 'starter' | 'pro' | 'business';
    created_at: string;
  } | undefined;

  if (!userRow) return null;

  const balance = getUserBalance(userRow.id);

  return {
    id: userRow.id,
    email: userRow.email,
    name: userRow.name,
    role: userRow.role,
    plan: userRow.plan,
    createdAt: userRow.created_at,
    credits: balance,
    maxCredits: userRow.plan === 'free' ? 100 : 2000,
  };
}

/**
 * Destroys session on logout.
 */
export function logoutUser(token: string): boolean {
  if (!token) return false;
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  return true;
}
