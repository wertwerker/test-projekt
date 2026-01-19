import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// =====================================================
// BUG-5 Fix: Login API with Rate Limiting
// =====================================================
// This API route handles login attempts and tracks
// failed attempts in the rate_limits table.
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const ip = getClientIP(request)

    // Create clients
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const supabaseService = createServerClient(
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

    // Check rate limit BEFORE attempting login
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseService.rpc(
      'check_rate_limit',
      { p_ip_address: ip }
    )

    if (rateLimitError) {
      console.error('[Login API] Error checking rate limit:', rateLimitError)
    } else if (rateLimitCheck && rateLimitCheck.length > 0) {
      const status = rateLimitCheck[0]
      if (status.is_locked) {
        const minutes = Math.ceil(status.remaining_seconds / 60)
        return NextResponse.json(
          {
            error: 'rate_limit_exceeded',
            message: `Zu viele fehlgeschlagene Login-Versuche. Bitte versuche es in ${minutes} Minuten erneut.`,
            remaining_seconds: status.remaining_seconds,
            locked: true,
          },
          { status: 429 }
        )
      }
    }

    // Attempt login
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      // Record failed attempt
      try {
        await supabaseService.rpc('record_failed_attempt', {
          p_ip_address: ip,
        })
      } catch (err) {
        console.error('[Login API] Error recording failed attempt:', err)
      }

      // Return appropriate error message
      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          {
            error: 'email_not_confirmed',
            message: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Prüfen Sie Ihren Posteingang.',
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        {
          error: 'invalid_credentials',
          message: 'Ungültige E-Mail oder Passwort',
        },
        { status: 401 }
      )
    }

    // Successful login - reset rate limit
    try {
      await supabaseService.rpc('reset_rate_limit', {
        p_ip_address: ip,
      })
    } catch (err) {
      console.error('[Login API] Error resetting rate limit:', err)
    }

    return NextResponse.json({
      success: true,
      session: authData.session,
    })
  } catch (err) {
    console.error('[Login API] Unexpected error:', err)
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
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  return request.ip || '127.0.0.1'
}
