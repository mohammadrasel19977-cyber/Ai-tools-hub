import express from 'express';
import path from 'path';
import crypto from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { handleGeminiChat, handleGeminiBlog } from './server/gemini';
import { registerUser, loginUser, logoutUser, getAuthenticatedUser } from './server/auth';
import { 
  getToolCreditCost, 
  reserveCredits, 
  refundCredits, 
  finalizeGeneration, 
  getUserTransactions, 
  getUserUsageHistory,
  getCompletedIdempotency,
  TOOL_CREDIT_COSTS
} from './server/credits';
import { checkRateLimit } from './server/rateLimiter';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'AI Tools Hub API',
      geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    });
  });

  // Centralized Tool Credit Costs
  app.get('/api/tools/costs', (_req, res) => {
    res.json({
      success: true,
      costs: TOOL_CREDIT_COSTS,
    });
  });

  // ================= 1. AUTHENTICATION ENDPOINTS =================
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body || {};
    const result = registerUser(name || '', email || '', password || '');
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    const result = loginUser(email || '', password || '');
    if (!result.success) {
      return res.status(401).json(result);
    }
    return res.json(result);
  });

  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
    logoutUser(token);
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Your session has expired. Please log in again.',
        code: 'SESSION_EXPIRED',
      });
    }
    return res.json({
      success: true,
      user,
    });
  });

  // ================= 2. USER CREDITS & HISTORY ENDPOINTS =================
  app.get('/api/user/credits', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Please log in to continue.',
        code: 'AUTH_REQUIRED',
      });
    }
    return res.json({
      success: true,
      balance: user.credits,
      maxCredits: user.maxCredits,
      plan: user.plan,
    });
  });

  app.get('/api/user/transactions', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Please log in to continue.',
        code: 'AUTH_REQUIRED',
      });
    }
    const transactions = getUserTransactions(user.id);
    return res.json({
      success: true,
      transactions,
    });
  });

  app.get('/api/user/history', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Please log in to continue.',
        code: 'AUTH_REQUIRED',
      });
    }
    const history = getUserUsageHistory(user.id);
    return res.json({
      success: true,
      history,
    });
  });

  // ================= 3. GENERATION WITH SECURE CREDIT DEDUCTION =================
  app.post('/api/chat', async (req, res) => {
    // 1. Authentication check
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Please log in to continue.',
        code: 'AUTH_REQUIRED',
      });
    }

    // 2. Rate limiting check (per authenticated user and per IP)
    const rateCheck = checkRateLimit(req, user.id);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: rateCheck.retryAfterSeconds,
      });
    }

    // 3. Identify requested tool and server-side credit cost
    const toolId = req.body?.toolId || 'ai-chat';
    const cost = getToolCreditCost(toolId);
    const requestId = req.body?.requestId || `req_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    // 4. Check idempotency (prevent double charging on retry / double click)
    const completed = getCompletedIdempotency(requestId);
    if (completed) {
      return res.json(completed);
    }

    // 5. Check balance & reserve/deduct required credits safely
    const reservation = reserveCredits(user.id, toolId, requestId);
    if (!reservation.success) {
      const status = reservation.code === 'ZERO_CREDITS' ? 403 : 402;
      return res.status(status).json({
        success: false,
        error: reservation.error,
        code: reservation.code,
        balance: reservation.balanceBefore,
        cost: reservation.cost,
      });
    }

    // 6. Execute Gemini generation
    try {
      const result = await handleGeminiChat(req.body);

      if (result.status === 200 && result.body.success) {
        // 7. Success: finalize deduction and record usage history
        const promptSummary =
          (typeof req.body.message === 'string' && req.body.message) ||
          (req.body.inputs ? Object.values(req.body.inputs).find((v) => typeof v === 'string' && String(v).trim()) : '') ||
          toolId;

        const responsePayload = {
          ...result.body,
          creditsDeducted: reservation.cost,
          balance: reservation.balanceAfter,
          requestId,
        };

        finalizeGeneration(
          user.id,
          toolId,
          requestId,
          reservation.cost,
          String(promptSummary).slice(0, 150),
          result.body.result || '',
          responsePayload
        );

        return res.status(200).json(responsePayload);
      } else {
        // 8. Generation returned error: refund reserved credits
        console.error('Gemini generation error:', result.body?.error);
        const restoredBalance = refundCredits(user.id, toolId, requestId, reservation.cost);
        return res.status(result.status || 500).json({
          success: false,
          error: 'Generation failed. Your credits have been refunded.',
          code: 'GENERATION_FAILED',
          refunded: true,
          balance: restoredBalance,
          requestId,
        });
      }
    } catch (err: any) {
      // Unhandled exception: refund reserved credits
      console.error('Unhandled generation exception:', err?.message);
      const restoredBalance = refundCredits(user.id, toolId, requestId, reservation.cost);
      return res.status(500).json({
        success: false,
        error: 'Generation failed. Your credits have been refunded.',
        code: 'GENERATION_FAILED',
        refunded: true,
        balance: restoredBalance,
        requestId,
      });
    }
  });

  app.post('/api/blog', async (req, res) => {
    // 1. Authentication check
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Please log in to continue.',
        code: 'AUTH_REQUIRED',
      });
    }

    // 2. Rate limiting check
    const rateCheck = checkRateLimit(req, user.id);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    const toolId = 'blog-writer';
    const cost = getToolCreditCost(toolId);
    const requestId = req.body?.requestId || `req_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    const completed = getCompletedIdempotency(requestId);
    if (completed) {
      return res.json(completed);
    }

    const reservation = reserveCredits(user.id, toolId, requestId);
    if (!reservation.success) {
      const status = reservation.code === 'ZERO_CREDITS' ? 403 : 402;
      return res.status(status).json({
        success: false,
        error: reservation.error,
        code: reservation.code,
        balance: reservation.balanceBefore,
        cost: reservation.cost,
      });
    }

    try {
      const result = await handleGeminiBlog(req.body);
      if (result.status === 200 && result.body.success) {
        const responsePayload = {
          ...result.body,
          creditsDeducted: reservation.cost,
          balance: reservation.balanceAfter,
          requestId,
        };

        finalizeGeneration(
          user.id,
          toolId,
          requestId,
          reservation.cost,
          req.body.topic || 'Blog Article',
          result.body.result || '',
          responsePayload
        );

        return res.status(200).json(responsePayload);
      } else {
        console.error('Gemini blog error:', result.body?.error);
        const restoredBalance = refundCredits(user.id, toolId, requestId, reservation.cost);
        return res.status(result.status || 500).json({
          success: false,
          error: 'Generation failed. Your credits have been refunded.',
          code: 'GENERATION_FAILED',
          refunded: true,
          balance: restoredBalance,
          requestId,
        });
      }
    } catch (err: any) {
      const restoredBalance = refundCredits(user.id, toolId, requestId, reservation.cost);
      return res.status(500).json({
        success: false,
        error: 'Generation failed. Your credits have been refunded.',
        code: 'GENERATION_FAILED',
        refunded: true,
        balance: restoredBalance,
        requestId,
      });
    }
  });

  // Vite middleware for development vs static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
