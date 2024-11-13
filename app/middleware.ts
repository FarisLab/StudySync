import { withAuth } from 'next-auth/middleware';
import type { NextAuthMiddlewareOptions } from 'next-auth/middleware';
import type { JWT } from 'next-auth/jwt';

// Define middleware options
const options: NextAuthMiddlewareOptions = {
  callbacks: {
    authorized: ({ token }: { token: JWT | null }) => {
      console.log('Middleware authorization check:', { 
        hasToken: !!token,
        tokenId: token?.id
      });
      return !!token;
    },
  },
};

// Export the middleware with proper typing
export default withAuth(options);

// Define protected routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/folders/:path*',
    '/api/topics/:path*',
  ],
}; 