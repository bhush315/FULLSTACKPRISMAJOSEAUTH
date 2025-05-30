import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;

  // Check for protected routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const verifiedToken = await verifyToken(token);

    if (!verifiedToken) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Role-based routing
    if (pathname.startsWith("/admin") && verifiedToken.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard") && verifiedToken.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // API routes protection
  if (pathname.startsWith("/api/")) {
    // Public API routes - skip auth check
    if (pathname === "/api/auth/login" || pathname === "/api/auth/register") {
      return NextResponse.next();
    }

    // Protected API routes - check auth
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const verifiedToken = await verifyToken(token);

    if (!verifiedToken) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Admin API routes - check role
    if (pathname.startsWith("/api/admin/") && verifiedToken.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

// Configure the paths that middleware should run on
export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/admin/:path*"],
};
// This middleware checks if the user is authenticated and authorized to access protected routes.
// If the user is not authenticated, they are redirected to the login page.
