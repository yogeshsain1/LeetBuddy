import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers middleware
 * Adds comprehensive security headers to all responses
 */
export function securityHeaders(request: NextRequest) {
  const response = NextResponse.next();

  // Prevent clickjacking attacks
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://slelguoygbfzlpylpxfs.supabase.co;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  // HSTS (HTTP Strict Transport Security)
  // Only enable in production with HTTPS
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

/**
 * CSRF Token validation
 * Validates CSRF tokens for state-changing requests
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const method = request.method;

  // Only validate for state-changing methods
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    return true;
  }

  const csrfTokenFromHeader = request.headers.get("x-csrf-token");
  const csrfTokenFromCookie = request.cookies.get("csrf-token")?.value;

  if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
    return false;
  }

  return csrfTokenFromHeader === csrfTokenFromCookie;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
