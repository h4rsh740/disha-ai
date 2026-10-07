import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Pass through all requests cleanly; Firebase auth state is handled client-side
  // via AuthProvider and server API routes can verify Firebase ID tokens if needed.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
