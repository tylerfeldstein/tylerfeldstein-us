import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/api/(.*)',
  '/runs/(.*)',
  '/runs',
  '/sitemap.xml',
  '/robots.txt',
];

const isProtectedRoute = createRouteMatcher(['/messages(.*)'])

const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware(async (auth, req) => {
  // Security fix for CVE-2025-29927 (GHSA-f82v-jwr5-mffw)
  const hasSubrequestHeader = req.headers.get("x-middleware-subrequest");
  const { userId } = await auth()
  
  if (hasSubrequestHeader) {
    return NextResponse.json(
      { error: "Unauthorized request" },
      { status: 401 }
    );
  }

  if (!userId && isProtectedRoute(req)) {
    // Redirect to home page with sign-in modal trigger and return URL
    const url = new URL('/', req.url);
    url.searchParams.set('showSignIn', 'true');
    // Encode the full URL to handle special characters and preserve query parameters
    url.searchParams.set('returnTo', encodeURIComponent(req.url));
    return NextResponse.redirect(url);
  }

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

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
