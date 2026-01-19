"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import HCaptcha from "@hcaptcha/react-hcaptcha"

const MAX_ATTEMPTS = 3

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [serverRateLimitError, setServerRateLimitError] = useState<{
    locked: boolean
    remaining_seconds: number
    message: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  // Check for server-side rate limit on mount
  useEffect(() => {
    const checkServerRateLimit = async () => {
      try {
        // Make a HEAD request to check rate limit without actually logging in
        const response = await fetch('/login', { method: 'HEAD' })
        if (response.status === 429) {
          const data = await response.json()
          setServerRateLimitError(data)
        }
      } catch (err) {
        // Ignore errors - user can still try to login
        console.error('[Login] Error checking rate limit:', err)
      }
    }

    checkServerRateLimit()
  }, [])

  const onSubmit = async (data: LoginInput) => {
    // Check CAPTCHA if required
    if (showCaptcha && !captchaToken) {
      setError("Bitte lösen Sie das CAPTCHA")
      return
    }

    setIsLoading(true)
    setError(null)
    setServerRateLimitError(null)

    try {
      // Call our login API that handles rate limiting
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        // Handle rate limit
        if (response.status === 429) {
          setServerRateLimitError(responseData)
          setError(responseData.message)
          setIsLoading(false)
          return
        }

        // Handle auth errors
        if (responseData.error === 'email_not_confirmed') {
          setError(responseData.message)
          setIsLoading(false)
          return
        }

        // Failed login - show CAPTCHA after first failure
        // Server will handle the actual rate limiting
        setShowCaptcha(true)
        setError(responseData.message || "Ungültige E-Mail oder Passwort")
        setIsLoading(false)
        return
      }

      // Successful login
      setShowCaptcha(false)
      setCaptchaToken(null)

      // Hard redirect to ensure cookies are set properly
      window.location.href = "/"
    } catch (err) {
      console.error('[Login] Unexpected error:', err)
      setError("Ein unerwarteter Fehler ist aufgetreten")
      setIsLoading(false)
    }
  }

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token)
    setError(null)
  }

  const handleCaptchaExpire = () => {
    setCaptchaToken(null)
  }

  // Calculate remaining time display
  const getRemainingTimeDisplay = () => {
    if (!serverRateLimitError?.remaining_seconds) return ""
    const minutes = Math.ceil(serverRateLimitError.remaining_seconds / 60)
    return `${minutes} Minute${minutes !== 1 ? 'n' : ''}`
  }

  const isLockedOut = serverRateLimitError?.locked || false

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Anmelden
          </CardTitle>
          <CardDescription>
            Melden Sie sich mit Ihrer E-Mail und Ihrem Passwort an
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLockedOut && (
              <Alert variant="destructive">
                <AlertDescription>
                  {serverRateLimitError?.message || 'Zu viele fehlgeschlagene Versuche. Bitte versuchen Sie es später erneut.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@beispiel.de"
                disabled={isLoading || isLockedOut}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <Link
                  href="/reset-password"
                  className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isLoading || isLockedOut}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {showCaptcha && !isLockedOut && (
              <div className="flex justify-center">
                <HCaptcha
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001"}
                  onVerify={handleCaptchaVerify}
                  onExpire={handleCaptchaExpire}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isLockedOut}
            >
              {isLoading
                ? "Wird angemeldet..."
                : isLockedOut
                  ? `Gesperrt (${getRemainingTimeDisplay()})`
                  : "Anmelden"
              }
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-slate-600 text-center">
            Noch kein Account?{" "}
            <Link href="/signup" className="text-slate-900 hover:underline font-medium">
              Jetzt registrieren
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
