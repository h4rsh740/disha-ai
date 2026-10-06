import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/onboarding(.*)',
  '/careers(.*)',
  '/career-path(.*)',
  '/family(.*)',
  '/counsellor(.*)',
  '/api/health(.*)',
  '/api/ai(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // If Clerk is not yet configured with a publishable key, bypass route protection
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }

  // Protect private routes like /dashboard or /admin if desired
  if (!isPublicRoute(req)) {
    // Optionally enforce auth for non-public routes
    // await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
