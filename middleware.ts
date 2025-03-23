import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/api/(.*)',
  '/runs/(.*)',
  '/runs',
  '/sitemap.xml',
  '/robots.txt',
];

// Create matcher for protected routes
const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware((auth, req) => {
  // Security fix for CVE-2025-29927 (GHSA-f82v-jwr5-mffw)
  // Block requests with x-middleware-subrequest header
  const hasSubrequestHeader = req.headers.get("x-middleware-subrequest");
  if (hasSubrequestHeader) {
    return NextResponse.json(
      { error: "Unauthorized request" },
      { status: 401 }
    );
  }

  // If the route is not public, rely on layout.tsx for auth protection
  // Removing the problematic auth check here since we handle it in layout.tsx
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
