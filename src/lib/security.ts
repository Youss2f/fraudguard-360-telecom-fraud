import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Rate limiting store (in-memory for demo, Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security configuration
const SECURITY_CONFIG = {
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  },
  security: {
    enableRateLimit: process.env.ENABLE_RATE_LIMITING !== 'false',
    enableCors: process.env.ENABLE_CORS !== 'false',
    enableValidation: process.env.ENABLE_VALIDATION !== 'false',
  }
}

// Get client identifier for rate limiting
function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // In production, could also use API key or user ID
  const apiKey = request.headers.get('x-api-key')
  return apiKey ? `api:${apiKey}` : `ip:${ip}`
}

// Rate limiting middleware
export function rateLimit(request: NextRequest): NextResponse | null {
  if (!SECURITY_CONFIG.security.enableRateLimit) {
    return null // Skip rate limiting if disabled
  }

  const clientId = getClientId(request)
  const now = Date.now()
  const windowMs = SECURITY_CONFIG.rateLimit.windowMs
  const maxRequests = SECURITY_CONFIG.rateLimit.maxRequests

  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }

  // Get or create rate limit entry
  let entry = rateLimitStore.get(clientId)
  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + windowMs }
    rateLimitStore.set(clientId, entry)
  }

  // Check rate limit
  entry.count++
  
  if (entry.count > maxRequests) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000} seconds`,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetTime.toString(),
          'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
        }
      }
    )
  }

  return null // Allow request
}

// CORS middleware
export function corsHeaders(request: NextRequest): Record<string, string> {
  if (!SECURITY_CONFIG.security.enableCors) {
    return {}
  }

  const origin = request.headers.get('origin')
  const { allowedOrigins, allowedMethods, allowedHeaders } = SECURITY_CONFIG.cors

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': allowedMethods.join(', '),
    'Access-Control-Allow-Headers': allowedHeaders.join(', '),
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  // Check if origin is allowed
  if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Credentials'] = 'true'
  }

  return headers
}

// Security headers
export function securityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

// Input validation schemas
export const ValidationSchemas = {
  // Subscriber search validation
  subscriberSearch: z.object({
    id: z.string().min(1, 'ID is required').max(50, 'ID too long'),
    type: z.enum(['msisdn', 'imsi']).optional().default('msisdn'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),

  // Login validation
  login: z.object({
    username: z.string().min(1, 'Username is required').max(50, 'Username too long'),
    password: z.string().min(1, 'Password is required').max(100, 'Password too long'),
  }),

  // User creation validation
  createUser: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['ADMIN', 'ANALYST', 'INVESTIGATOR', 'VIEWER', 'DEMO']),
  }),

  // Investigation creation
  createInvestigation: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required').max(1000),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    subscriberId: z.string().optional(),
  }),
}

// Validation middleware
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  if (!SECURITY_CONFIG.security.enableValidation) {
    return { success: true, data: data as T } // Skip validation if disabled
  }

  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// API key validation (for external integrations)
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey) {
    return false
  }

  // In production, validate against database or environment variables
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || []
  return validApiKeys.includes(apiKey)
}

// Comprehensive security middleware wrapper
export function withSecurity(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Apply rate limiting
      const rateLimitResponse = rateLimit(request)
      if (rateLimitResponse) {
        return rateLimitResponse
      }

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: corsHeaders(request),
        })
      }

      // Execute the handler
      const response = await handler(request, ...args)

      // Add security headers
      const headers = {
        ...corsHeaders(request),
        ...securityHeaders(),
      }

      // Apply headers to response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response

    } catch (error) {
      console.error('Security middleware error:', error)
      
      // Return safe error response
      return NextResponse.json(
        { 
          error: 'Internal server error',
          message: 'An unexpected error occurred'
        },
        { 
          status: 500,
          headers: {
            ...corsHeaders(request),
            ...securityHeaders(),
          }
        }
      )
    }
  }
}

// Logging helper for security events
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  request?: NextRequest
) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
    userAgent: request?.headers.get('user-agent') || 'unknown',
  }

  console.log('SECURITY_EVENT:', JSON.stringify(logData))
  
  // In production, send to security monitoring system
  // await sendToSecurityMonitoring(logData)
}
