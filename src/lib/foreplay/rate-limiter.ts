/**
 * Sliding-window in-memory rate limiter for Foreplay API proxy routes.
 *
 * Limits: 30 requests / 60 s per IP (adjustable via constants).
 * In-memory only — resets on cold start. Suitable for single-instance
 * deployments (local / single Vercel function). If you scale horizontally
 * switch this to an upstash/redis adapter.
 */

const WINDOW_MS  = 60_000; // 1 minute
const MAX_PER_IP = 300;    // max requests per IP per window

/**  Map<ip, timestamp[]> — each entry is the time (ms) a request arrived */
const log = new Map<string, number[]>();

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  /** Milliseconds until the oldest request ages out and frees a slot */
  resetInMs: number;
}

/**
 * Call once per incoming request.
 * Returns `allowed: false` when the IP has exhausted its quota.
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now        = Date.now();
  const windowStart = now - WINDOW_MS;

  const prev    = log.get(ip) ?? [];
  const recent  = prev.filter((t) => t > windowStart);

  if (recent.length >= MAX_PER_IP) {
    const oldest   = Math.min(...recent);
    const resetInMs = oldest + WINDOW_MS - now;
    log.set(ip, recent);
    return { allowed: false, remaining: 0, resetInMs };
  }

  recent.push(now);
  log.set(ip, recent);

  // Probabilistic GC — sweep stale IP entries roughly every 200 calls
  if (Math.random() < 0.005) {
    for (const [key, ts] of log.entries()) {
      if (ts.every((t) => t <= windowStart)) log.delete(key);
    }
  }

  return { allowed: true, remaining: MAX_PER_IP - recent.length, resetInMs: 0 };
}

/** Extract best-effort client IP from a Next.js `Request`. */
export function getClientIp(request: Request): string {
  const headers = (request as Request & { headers: Headers }).headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
