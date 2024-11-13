import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: '/auth',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/((?!auth|api|_next/static|_next/image|favicon.ico).*)',
  ],
} 