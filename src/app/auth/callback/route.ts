import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Route based on auth type
      if (type === 'signup') {
        // Email verification after signup
        return NextResponse.redirect(new URL('/verify-email?verified=true', requestUrl.origin))
      }

      if (type === 'recovery') {
        // Password reset flow
        return NextResponse.redirect(new URL('/reset-password', requestUrl.origin))
      }

      // Default: redirect to home or specified next page
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    // Error during token exchange - likely expired or invalid
    if (type === 'signup') {
      return NextResponse.redirect(
        new URL('/verify-email?error=expired', requestUrl.origin)
      )
    }

    if (type === 'recovery') {
      return NextResponse.redirect(
        new URL('/reset-password?error=expired', requestUrl.origin)
      )
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(
    new URL('/login?error=auth_callback_error', requestUrl.origin)
  )
}
