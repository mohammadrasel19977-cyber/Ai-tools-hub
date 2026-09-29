import type { Request } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // e.g. 60,000 ms (1 minute)
  maxRequests: number; // e.g. 20 requests per minute
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 20,
};

/**
 * Checks rate limit for a client IP or authenticated user ID.
 * Returns true if allowed, false if limit exceeded.
 */
export function checkRateLimit(
  req: Request,
  userId?: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; retryAfterSeconds: number } {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  // Use userId if available, else client IP
  const key = userId ? `usr:${userId}` : `ip:${ip}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.count >= config.maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return { allowed: false, retryAfterSeconds: retryAfter };
  }

  record.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
