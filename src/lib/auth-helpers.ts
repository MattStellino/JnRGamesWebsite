import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

/**
 * Check if user is authenticated
 * Returns the session if authenticated, or null if not
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
  
  return { session }
}

/**
 * Rate limit helper for admin routes
 */
export function checkAdminRateLimit(ip: string | null): boolean {
  // Basic rate limiting - in production, use Redis
  // This is a simple implementation
  return true // For now, always allow - implement proper rate limiting
}

