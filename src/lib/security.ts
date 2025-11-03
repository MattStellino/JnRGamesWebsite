// Input sanitization - serverless-safe version (no jsdom dependency)
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove HTML tags and dangerous characters
  let sanitized = input.trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: URLs
    .replace(/data:/gi, '')
    // Remove dangerous characters
    .replace(/[<>]/g, '')
  
  return sanitized
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

// Price validation
export function validatePrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && price <= 1000000
}

// Name validation
export function validateName(name: string): boolean {
  const nameRegex = /^[a-zA-Z\s\-'\.]{2,50}$/
  return nameRegex.test(name)
}

// Description validation
export function validateDescription(description: string): boolean {
  return description.length <= 1000
}

// URL validation
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Rate limiting helper
export function createRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}:${Math.floor(Date.now() / 60000)}` // 1 minute windows
}

// CSRF token generation
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// SQL injection prevention
export function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''").replace(/;/g, '')
}

// XSS prevention
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}


