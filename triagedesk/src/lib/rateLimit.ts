// Simple in-memory rate limiter (MVP). Explain: "in production I'd use Redis/Upstash
// so it works across server instances — this demonstrates the concept."
const hits = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 10;            // max requests
const WINDOW_MS = 60_000;    // per 60 seconds

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false; // blocked
  entry.count++;
  return true;
}
