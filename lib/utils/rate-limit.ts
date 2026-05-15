import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 submissions per hour
}

/**
 * Check rate limit for IP address
 * Returns true if under limit, false if exceeded
 */
export async function checkRateLimit(
  ip: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const windowStart = new Date(Date.now() - config.windowMs).toISOString()

    // Get count of requests from this IP in the time window
    const { count, error } = await supabase
      .from('rate_limit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', windowStart)

    if (error) {
      console.error('Rate limit check error:', error)
      // On error, allow the request (fail open)
      return true
    }

    return (count ?? 0) < config.maxRequests
  } catch (error) {
    console.error('Rate limit check error:', error)
    // On error, allow the request (fail open)
    return true
  }
}

/**
 * Log a request for rate limiting
 */
export async function logRateLimitRequest(ip: string, endpoint: string): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.from('rate_limit_logs').insert({
      ip_address: ip,
      endpoint,
    })
  } catch (error) {
    console.error('Rate limit log error:', error)
    // Silently fail - don't block the request if logging fails
  }
}

/**
 * Middleware to check rate limits
 */
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<NextResponse | null> {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  const isUnderLimit = await checkRateLimit(ip, config)

  if (!isUnderLimit) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(config.windowMs / 1000)),
        },
      }
    )
  }

  // Log this request
  await logRateLimitRequest(ip, request.nextUrl.pathname)

  return null // OK to proceed
}
