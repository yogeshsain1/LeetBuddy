import { NextRequest } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const configs: Record<string, RateLimitConfig> = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  },
};

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Clean up expired entries
 */
function cleanup() {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

/**
 * Check rate limit
 */
export function checkRateLimit(
  request: NextRequest,
  type: keyof typeof configs = "api"
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIP(request);
  const config = configs[type];
  const key = `${type}:${ip}`;
  const now = Date.now();

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    cleanup();
  }

  // Initialize or get current limit data
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  // Increment counter
  store[key].count++;

  const allowed = store[key].count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - store[key].count);

  return {
    allowed,
    remaining,
    resetTime: store[key].resetTime,
  };
}

/**
 * Rate limit middleware
 */
export function rateLimit(type: keyof typeof configs = "api") {
  return (request: NextRequest) => {
    const result = checkRateLimit(request, type);

    if (!result.allowed) {
      throw new Error("Too many requests. Please try again later.");
    }

    return result;
  };
}
