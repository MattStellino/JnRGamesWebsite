import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message: string
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  '/api/contact': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many contact form submissions. Please try again later.'
  },
  '/api/items': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please slow down.'
  },
  '/api/auth': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Too many authentication attempts. Please try again later.'
  }
}

// In-memory store (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(request: NextRequest, endpoint: string): NextResponse | null {
  const config = rateLimitConfigs[endpoint]
  if (!config) return null

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  
  const current = requestCounts.get(key)
  
  if (!current || now > current.resetTime) {
    requestCounts.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return null
  }
  
  if (current.count >= config.maxRequests) {
    return NextResponse.json(
      { error: config.message },
      { status: 429 }
    )
  }
  
  current.count++
  return null
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  const keysToDelete: string[] = []
  requestCounts.forEach((value, key) => {
    if (now > value.resetTime) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => requestCounts.delete(key))
}, 5 * 60 * 1000) // Clean every 5 minutes


