import createIntlMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// Define protected routes
const isProtectedRoute = createRouteMatcher([
    '/:locale/studio(.*)',
    '/studio(.*)',
]);

// API routes should skip i18n
const isApiRoute = createRouteMatcher([
    '/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    // Skip intl middleware for API routes
    if (isApiRoute(req)) {
        // Still protect API routes that need auth
        if (req.nextUrl.pathname.startsWith('/api/generate') ||
            req.nextUrl.pathname.startsWith('/api/generations')) {
            await auth.protect();
        }
        return; // Don't apply intlMiddleware to API routes
    }

    // If it's a protected route, require authentication
    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    return intlMiddleware(req);
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
