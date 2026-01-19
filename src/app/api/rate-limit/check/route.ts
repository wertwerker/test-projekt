import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// =====================================================
// BUG-5 Fix: Rate Limit Check API
// =====================================================
// This API route allows the login page to check the
// current rate limit status for the client's IP.
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)

    // Create service role client for rate limit checks
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const { data: rateLimitStatus, error } = await supabase.rpc(
      'check_rate_limit',
      { p_ip_address: ip }
    )

    if (error) {
      console.error('[Rate Limit API] Error checking rate limit:', error)
      return NextResponse.json(
        { error: 'Failed to check rate limit' },
        { status: 500 }
      )
    }

    if (!rateLimitStatus || rateLimitStatus.length === 0) {
      return NextResponse.json({
        locked: false,
        remaining_seconds: 0,
        attempts: 0,
      })
    }

    const status = rateLimitStatus[0]

    if (status.is_locked) {
      const minutes = Math.ceil(status.remaining_seconds / 60)
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: `Zu viele fehlgeschlagene Login-Versuche. Bitte versuche es in ${minutes} Minuten erneut.`,
          remaining_seconds: status.remaining_seconds,
          locked: true,
          attempts: status.attempts,
        },
        { status: 429 }
      )
    }

    return NextResponse.json({
      locked: false,
      remaining_seconds: 0,
      attempts: status.attempts,
    })
  } catch (err) {
    console.error('[Rate Limit API] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// Helper: Extract Client IP Address
// =====================================================
function getClientIP(request: NextRequest): string {
  // Try x-forwarded-for header first (proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // Try x-real-ip header
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  // Fallback to request IP
  return request.ip || '127.0.0.1'
}
