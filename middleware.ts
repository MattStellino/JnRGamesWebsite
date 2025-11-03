import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // Allow access to login page and NextAuth API routes without authentication
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth/')) {
    const response = NextResponse.next()
    addSecurityHeaders(response)
    return response
  }
  
  // Protect all other admin routes
  if (pathname.startsWith('/admin')) {
    // Get the JWT token from the cookie
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development'
    })
    
    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Custom middleware check:', {
        pathname,
        hasToken: !!token,
        tokenId: token?.id,
        tokenUsername: token?.username,
        cookies: req.cookies.getAll().map(c => c.name)
      })
    }
    
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      const response = NextResponse.redirect(loginUrl)
      addSecurityHeaders(response)
      return response
    }
    
    // Token exists, allow access
    const response = NextResponse.next()
    addSecurityHeaders(response)
    // Prevent caching of admin pages to ensure fresh auth checks on back navigation
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  }
  
  // For all other routes, just add security headers
  const response = NextResponse.next()
  addSecurityHeaders(response)
  return response
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  // Prevent caching to ensure authentication is always checked
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
}

export const config = {
  matcher: [
    '/admin/:path*',
    // Exclude NextAuth API routes from middleware matching
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
