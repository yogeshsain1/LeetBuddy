import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { securityHeaders } from "@/lib/security";

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/signin", "/signup"];

// Routes that require authentication
const protectedRoutes = [
  "/profile",
  "/messages",
  "/friends",
  "/groups",
  "/settings",
  "/notifications",
  "/activity",
  "/leaderboard",
  "/community",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply security headers to all responses
  let response: NextResponse;

  // Allow all API routes to pass through without auth check
  if (pathname.startsWith("/api/")) {
    response = NextResponse.next();
    return securityHeaders(request);
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    response = NextResponse.next();
    return securityHeaders(request);
  }

  // Check if route requires authentication
  const requiresAuth = protectedRoutes.some((route) => pathname.startsWith(route));

  if (requiresAuth) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        // Redirect to login if not authenticated
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", pathname);
        response = NextResponse.redirect(url);
        return securityHeaders(request);
      }

      // User is authenticated, allow access
      response = NextResponse.next();
      return securityHeaders(request);
    } catch (error) {
      console.error("Middleware auth error:", error);
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      response = NextResponse.redirect(url);
      return securityHeaders(request);
    }
  }

  response = NextResponse.next();
  return securityHeaders(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
