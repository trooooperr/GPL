// High-performance in-memory sliding window rate limiter
// Designed for 1000+ req/sec throughput with auto cleanup

class TokenBucketLimiter {
  constructor() {
    this.hits = new Map();
    // Run cleanup every 60 seconds
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 60000);
    }
  }

  check(key, limit = 60, windowSeconds = 60) {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    
    let record = this.hits.get(key);
    if (!record) {
      record = [];
      this.hits.set(key, record);
    }

    // Filter out timestamps outside the window
    const cutoff = now - windowMs;
    const active = record.filter(timestamp => timestamp > cutoff);
    
    if (active.length >= limit) {
      this.hits.set(key, active);
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.ceil((active[0] + windowMs - now) / 1000)
      };
    }

    active.push(now);
    this.hits.set(key, active);

    return {
      allowed: true,
      remaining: limit - active.length,
      resetInSeconds: windowSeconds
    };
  }

  reset(key) {
    this.hits.delete(key);
  }

  cleanup() {
    const now = Date.now();
    const maxWindow = 300000; // 5 minutes
    for (const [key, timestamps] of this.hits.entries()) {
      if (timestamps.length === 0 || timestamps[timestamps.length - 1] < now - maxWindow) {
        this.hits.delete(key);
      }
    }
  }
}

// Global instance preserved across Next.js dev reloads
const globalForLimiter = globalThis;
export const rateLimiter = globalForLimiter.__rateLimiter || new TokenBucketLimiter();
if (process.env.NODE_ENV !== "production") globalForLimiter.__rateLimiter = rateLimiter;

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}
