import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // =====================================================
  // BUG-5 Fix: Server-Side Rate Limiting
  // =====================================================
  // Check rate limit for login page before processing auth
  if (request.nextUrl.pathname === '/login') {
    const ip = getClientIP(request)

    // Create service role client for rate limit checks
    const serviceSupabase = createServerClient(
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

    try {
      const { data: rateLimitStatus, error } = await serviceSupabase.rpc(
        'check_rate_limit',
        { p_ip_address: ip }
      )

      if (error) {
        console.error('[Rate Limit] Error checking rate limit:', error)
      } else if (rateLimitStatus && rateLimitStatus.length > 0) {
        const status = rateLimitStatus[0]

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
    } catch (err) {
      console.error('[Rate Limit] Unexpected error:', err)
    }
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Auth routes - redirect to home if already authenticated
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// =====================================================
// Helper: Extract Client IP Address
// =====================================================
function getClientIP(request: NextRequest): string {
  // Try x-forwarded-for header first (proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  // Try x-real-ip header
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  // Fallback to localhost (development)
  return '127.0.0.1'
}
