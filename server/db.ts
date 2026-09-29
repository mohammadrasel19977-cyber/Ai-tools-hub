import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'app.db');

export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high concurrency and performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize database schema with constraints and indexes
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    plan TEXT NOT NULL DEFAULT 'free',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS credit_balances (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL CHECK (balance >= 0),
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS credit_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    tool_id TEXT,
    request_id TEXT,
    description TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS usage_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_id TEXT NOT NULL,
    tool_name TEXT,
    credits_used INTEGER NOT NULL,
    request_id TEXT,
    status TEXT NOT NULL,
    prompt_summary TEXT,
    result TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS idempotency_records (
    request_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_id TEXT NOT NULL,
    status TEXT NOT NULL,
    result TEXT,
    response_body TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_credit_trans_user ON credit_transactions(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_usage_hist_user ON usage_history(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_idempotency_user ON idempotency_records(user_id, request_id);
`);

// Password hashing utility using scrypt
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: calculatedHash } = hashPassword(password, salt);
  const a = Buffer.from(calculatedHash, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Seed default users if table is empty so quick-login demo accounts work immediately
export function seedDefaultUsers() {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers.count === 0) {
    const now = new Date().toISOString();
    
    // 1. Seed demo user (Alex Rivera)
    const demoSalt = crypto.randomBytes(16).toString('hex');
    const demoHash = crypto.scryptSync('Demo1234!', demoSalt, 64).toString('hex');
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, salt, role, plan, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('usr_demo_882', 'alex.rivera@techcorp.io', 'Alex Rivera', demoHash, demoSalt, 'user', 'free', now);

    db.prepare(`
      INSERT INTO credit_balances (user_id, balance, updated_at)
      VALUES (?, ?, ?)
    `).run('usr_demo_882', 100, now);

    db.prepare(`
      INSERT INTO credit_transactions (id, user_id, amount, type, tool_id, request_id, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('tx_welcome_demo', 'usr_demo_882', 100, 'welcome_bonus', null, null, 'Welcome Free Credits', now);

    // 2. Seed admin user
    const adminSalt = crypto.randomBytes(16).toString('hex');
    const adminHash = crypto.scryptSync('Admin1234!', adminSalt, 64).toString('hex');
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, salt, role, plan, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('usr_admin_001', 'admin@aitoolshub.io', 'Admin Administrator', adminHash, adminSalt, 'admin', 'pro', now);

    db.prepare(`
      INSERT INTO credit_balances (user_id, balance, updated_at)
      VALUES (?, ?, ?)
    `).run('usr_admin_001', 1000, now);

    db.prepare(`
      INSERT INTO credit_transactions (id, user_id, amount, type, tool_id, request_id, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('tx_welcome_admin', 'usr_admin_001', 1000, 'welcome_bonus', null, null, 'Welcome Free Credits (Admin Tier)', now);
  }
}

seedDefaultUsers();
