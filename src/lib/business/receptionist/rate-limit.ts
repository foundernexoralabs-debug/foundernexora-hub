// @polsia:user-owned — per-visitor rate limiting for the Guide and the report bridge.
//
// A sliding window held in memory. On a serverless host each warm instance keeps its own
// window, so this is a per-instance ceiling that stops floods and runaway loops, not a global
// quota; the model provider's own limits remain the outer guard. Keys are hashed, so raw IP
// addresses are never stored.

import { createHmac, randomBytes } from 'node:crypto';

export interface RateLimitResult {
  allowed: boolean;
  /** Requests left in the current window after this one. */
  remaining: number;
  /** Seconds until the oldest request leaves the window (0 when allowed). */
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitResult;
}

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

/** Several rules at once, e.g. 8 a minute AND 40 an hour. Every rule must allow the request. */
export function createRateLimiter(rules: readonly RateLimitRule[], maxKeys = 10_000): RateLimiter {
  const hits = new Map<string, number[]>();
  const longest = Math.max(...rules.map((rule) => rule.windowMs));

  return {
    check(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((time) => now - time < longest);
      let retryAfterMs = 0;
      let remaining = Number.POSITIVE_INFINITY;
      for (const rule of rules) {
        const inWindow = recent.filter((time) => now - time < rule.windowMs);
        if (inWindow.length >= rule.limit) {
          const oldest = inWindow[inWindow.length - rule.limit] ?? now;
          retryAfterMs = Math.max(retryAfterMs, rule.windowMs - (now - oldest));
        }
        remaining = Math.min(remaining, rule.limit - inWindow.length - 1);
      }
      if (retryAfterMs > 0) {
        hits.set(key, recent);
        return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
      }
      recent.push(now);
      // Re-insert so Map order tracks recency, then evict the stalest keys past the cap.
      hits.delete(key);
      hits.set(key, recent);
      while (hits.size > maxKeys) {
        const stalest = hits.keys().next().value;
        if (stalest === undefined) break;
        hits.delete(stalest);
      }
      return { allowed: true, remaining: Math.max(0, remaining), retryAfterSeconds: 0 };
    },
  };
}

/** A random per-instance secret, so a hashed key cannot be reversed by trying every IP address. */
const KEY_SALT = randomBytes(32);

/** The visitor's IP from proxy headers, hashed with a secret salt. Never logged or stored in the clear. */
export function clientKey(headers: Headers, scope: string): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || headers.get('x-real-ip')?.trim() || 'unknown';
  return createHmac('sha256', KEY_SALT).update(`${scope}:${ip}`).digest('hex').slice(0, 24);
}
