import { db } from './db';
import crypto from 'node:crypto';

// ================= CENTRALIZED TOOL CREDIT COSTS =================
// Centralized server-side configuration as required:
// Change costs here in ONE place.
export const INITIAL_FREE_CREDITS = 100;

export const TOOL_CREDIT_COSTS: Record<string, number> = {
  // Required 18 AI Tools
  'blog-writer': 5,
  'facebook-post': 2,
  'youtube-script': 8,
  'email-writer': 3,
  'product-description': 3,
  'grammar-fixer': 1,
  'translator': 2,
  'video-prompt-generator': 4,
  'storyboard-generator': 6,
  'youtube-shorts-ideas': 3,
  'reel-caption-generator': 2,
  'business-name-generator': 2,
  'slogan-generator': 2,
  'brand-color-generator': 2,
  'seo-article-writer': 10,
  'keyword-generator': 2,
  'meta-tags-generator': 2,
  'faq-generator': 3,

  // Additional catalog tools
  'ai-chat': 1,
  'ai-image-generator': 4,
  'background-remover': 2,
  'image-upscaler': 2,
  'image-to-prompt': 1,
  'ai-avatar-generator': 3,
  'logo-maker': 3,
  'schema-generator': 2,
};

export const TOOL_NAMES: Record<string, string> = {
  'blog-writer': 'Blog Writer',
  'facebook-post': 'Facebook Post Generator',
  'youtube-script': 'YouTube Script Writer',
  'email-writer': 'Email Writer',
  'product-description': 'Product Description Generator',
  'grammar-fixer': 'Grammar Fixer',
  'translator': 'Translator',
  'video-prompt-generator': 'Video Prompt Generator',
  'storyboard-generator': 'Storyboard Generator',
  'youtube-shorts-ideas': 'YouTube Shorts Ideas',
  'reel-caption-generator': 'Reel Caption Generator',
  'business-name-generator': 'Business Name Generator',
  'slogan-generator': 'Slogan Generator',
  'brand-color-generator': 'Brand Color Generator',
  'seo-article-writer': 'SEO Article Writer',
  'keyword-generator': 'Keyword Generator',
  'meta-tags-generator': 'Meta Tags Generator',
  'faq-generator': 'FAQ Generator',
  'ai-chat': 'AI Chat',
  'ai-image-generator': 'AI Image Generator',
  'background-remover': 'Background Remover',
  'image-upscaler': 'Image Upscaler',
  'image-to-prompt': 'Image to Prompt',
  'ai-avatar-generator': 'AI Avatar Generator',
  'logo-maker': 'Logo Maker',
  'schema-generator': 'Schema Generator',
};

/**
 * Returns the authoritative credit cost for a tool.
 * Never trust a credit cost passed from the frontend.
 */
export function getToolCreditCost(toolId: string): number {
  return TOOL_CREDIT_COSTS[toolId] ?? 2;
}

export function getToolDisplayName(toolId: string): string {
  return TOOL_NAMES[toolId] || toolId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Retrieves the authoritative credit balance for a user.
 */
export function getUserBalance(userId: string): number {
  const row = db.prepare('SELECT balance FROM credit_balances WHERE user_id = ?').get(userId) as { balance: number } | undefined;
  return row ? row.balance : 0;
}

export interface CreditReservationResult {
  success: boolean;
  cost: number;
  balanceBefore: number;
  balanceAfter: number;
  error?: string;
  code?: 'INSUFFICIENT_CREDITS' | 'ZERO_CREDITS' | 'DUPLICATE_IN_PROGRESS';
}

/**
 * Atomically reserves/deducts credits for a tool generation request.
 * Protects against race conditions, negative balances, and duplicate requests.
 */
export function reserveCredits(
  userId: string,
  toolId: string,
  requestId: string
): CreditReservationResult {
  const cost = getToolCreditCost(toolId);
  const toolName = getToolDisplayName(toolId);

  // Check idempotency first: if this request was already recorded
  const existingRequest = db.prepare(
    'SELECT status, response_body FROM idempotency_records WHERE request_id = ?'
  ).get(requestId) as { status: string; response_body?: string } | undefined;

  if (existingRequest) {
    if (existingRequest.status === 'processing') {
      return {
        success: false,
        cost,
        balanceBefore: getUserBalance(userId),
        balanceAfter: getUserBalance(userId),
        error: 'A generation with this request ID is already processing.',
        code: 'DUPLICATE_IN_PROGRESS',
      };
    }
  }

  // Check current balance
  const currentBalance = getUserBalance(userId);

  if (currentBalance === 0) {
    return {
      success: false,
      cost,
      balanceBefore: 0,
      balanceAfter: 0,
      error: 'Your free credits are finished. You can continue using the AI tools when more credits become available.',
      code: 'ZERO_CREDITS',
    };
  }

  if (currentBalance < cost) {
    return {
      success: false,
      cost,
      balanceBefore: currentBalance,
      balanceAfter: currentBalance,
      error: "You don't have enough credits for this tool.",
      code: 'INSUFFICIENT_CREDITS',
    };
  }

  // Atomically deduct the credits in SQLite transaction
  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    const updateResult = db.prepare(`
      UPDATE credit_balances
      SET balance = balance - ?, updated_at = ?
      WHERE user_id = ? AND balance >= ?
    `).run(cost, new Date().toISOString(), userId, cost);

    if (updateResult.changes === 0) {
      db.exec('ROLLBACK;');
      return {
        success: false,
        cost,
        balanceBefore: getUserBalance(userId),
        balanceAfter: getUserBalance(userId),
        error: "You don't have enough credits for this tool.",
        code: 'INSUFFICIENT_CREDITS',
      };
    }

    const newBalance = currentBalance - cost;
    const now = new Date().toISOString();
    const txId = `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Record credit transaction
    db.prepare(`
      INSERT INTO credit_transactions (id, user_id, amount, type, tool_id, request_id, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(txId, userId, -cost, 'tool_usage', toolId, requestId, toolName, now);

    // Record idempotency placeholder
    db.prepare(`
      INSERT OR REPLACE INTO idempotency_records (request_id, user_id, tool_id, status, result, response_body, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(requestId, userId, toolId, 'processing', null, null, now);

    db.exec('COMMIT;');

    return {
      success: true,
      cost,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
    };
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch (_) {}
    throw err;
  }
}

/**
 * Refunds reserved credits when generation fails before successful completion.
 */
export function refundCredits(
  userId: string,
  toolId: string,
  requestId: string,
  cost: number
): number {
  const toolName = getToolDisplayName(toolId);
  const now = new Date().toISOString();
  const txId = `tx_ref_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    db.prepare(`
      UPDATE credit_balances
      SET balance = balance + ?, updated_at = ?
      WHERE user_id = ?
    `).run(cost, now, userId);

    db.prepare(`
      INSERT INTO credit_transactions (id, user_id, amount, type, tool_id, request_id, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(txId, userId, cost, 'refund', toolId, requestId, `Refund (failed generation - ${toolName})`, now);

    db.prepare(`
      UPDATE idempotency_records
      SET status = 'failed'
      WHERE request_id = ?
    `).run(requestId);

    db.exec('COMMIT;');
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch (_) {}
    console.error('Error refunding credits:', err);
  }

  return getUserBalance(userId);
}

/**
 * Finalizes successful generation: records usage history and stores response for idempotency.
 */
export function finalizeGeneration(
  userId: string,
  toolId: string,
  requestId: string,
  cost: number,
  promptSummary: string,
  result: string,
  responseBody: any
) {
  const toolName = getToolDisplayName(toolId);
  const now = new Date().toISOString();
  const histId = `hist_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    db.prepare(`
      INSERT INTO usage_history (id, user_id, tool_id, tool_name, credits_used, request_id, status, prompt_summary, result, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(histId, userId, toolId, toolName, cost, requestId, 'success', promptSummary.slice(0, 200), result, now);

    db.prepare(`
      UPDATE idempotency_records
      SET status = 'completed', result = ?, response_body = ?
      WHERE request_id = ?
    `).run(result, JSON.stringify(responseBody), requestId);

    db.exec('COMMIT;');
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch (_) {}
    console.error('Error finalizing generation history:', err);
  }
}

/**
 * Retrieves credit transaction history for a user.
 */
export function getUserTransactions(userId: string, limit = 50) {
  return db.prepare(`
    SELECT id, user_id as userId, amount, type, tool_id as toolId, request_id as requestId, description, created_at as createdAt
    FROM credit_transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(userId, limit);
}

/**
 * Retrieves tool generation usage history for a user.
 */
export function getUserUsageHistory(userId: string, limit = 50) {
  return db.prepare(`
    SELECT id, user_id as userId, tool_id as toolId, tool_name as toolName, credits_used as creditsUsed, request_id as requestId, status, prompt_summary as promptSummary, result, created_at as createdAt
    FROM usage_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(userId, limit);
}

/**
 * Retrieves idempotency record if already completed.
 */
export function getCompletedIdempotency(requestId: string): any | null {
  const row = db.prepare(`
    SELECT response_body
    FROM idempotency_records
    WHERE request_id = ? AND status = 'completed'
  `).get(requestId) as { response_body?: string } | undefined;

  if (row?.response_body) {
    try {
      return JSON.parse(row.response_body);
    } catch {
      return null;
    }
  }
  return null;
}
