import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that don't require authentication (but middleware still runs for Clerk context)
const isPublicRoute = createRouteMatcher([
  '/',
  '/analyze',
  '/pricing',
  '/privacy',
  '/terms',
  '/examples(.*)', // Public - showcase examples for marketing
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/analyze', // Public but we check auth in the route itself
  '/api/get-upload-url', // Public - needed for S3 presigned URLs
  '/api/check-usage', // Public - checks if user can analyze
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Include API routes
    '/(api|trpc)(.*)',
  ],
};
