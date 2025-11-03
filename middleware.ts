import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Security headers
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    // Production-ready CSP - remove unsafe-inline and unsafe-eval
    // Note: You may need to adjust script-src based on your build output
    // Next.js uses nonces for inline scripts in production
    // Temporarily disable CSP to fix chunk loading issues
    // CSP can be re-enabled later with proper nonce configuration
    // const isProduction = process.env.NODE_ENV === 'production'
    // const csp = isProduction
    //   ? "default-src 'self'; " +
    //     "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    //     "style-src 'self' 'unsafe-inline'; " +
    //     "img-src 'self' data: https: blob:; " +
    //     "font-src 'self' data:; " +
    //     "connect-src 'self'; " +
    //     "frame-ancestors 'none'; " +
    //     "base-uri 'self'; " +
    //     "form-action 'self'; " +
    //     "object-src 'none'; " +
    //     "upgrade-insecure-requests;"
    //   : "default-src 'self'; " +
    //     "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    //     "style-src 'self' 'unsafe-inline'; " +
    //     "img-src 'self' data: https: blob:; " +
    //     "font-src 'self' data:; " +
    //     "connect-src 'self'; " +
    //     "frame-ancestors 'none'; " +
    //     "base-uri 'self'; " +
    //     "form-action 'self'; " +
    //     "object-src 'none';"
    // response.headers.set('Content-Security-Policy', csp)
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page and NextAuth API routes without authentication
        const pathname = req.nextUrl.pathname
        if (pathname === '/admin/login' || pathname.startsWith('/api/auth/')) {
          return true
        }
        // Protect all other admin routes
        if (pathname.startsWith('/admin')) {
          // Log token for debugging (remove in production)
          if (process.env.NODE_ENV === 'development') {
            console.log('Middleware token check:', { 
              pathname, 
              hasToken: !!token,
              tokenKeys: token ? Object.keys(token) : null
            })
          }
          return !!token
        }
        return true
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    // Exclude NextAuth API routes from middleware matching
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
