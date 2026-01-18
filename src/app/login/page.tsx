"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import HCaptcha from "@hcaptcha/react-hcaptcha"

const MAX_ATTEMPTS = 3
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [remainingTime, setRemainingTime] = useState<string>("")

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  // Load rate limit data from localStorage
  useEffect(() => {
    const storedAttempts = localStorage.getItem("loginAttempts")
    const storedLockoutEnd = localStorage.getItem("lockoutEnd")

    if (storedAttempts) {
      const attempts = parseInt(storedAttempts, 10)
      setFailedAttempts(attempts)
      if (attempts >= MAX_ATTEMPTS) {
        setShowCaptcha(true)
      }
    }

    if (storedLockoutEnd) {
      const lockoutEndTime = parseInt(storedLockoutEnd, 10)
      const now = Date.now()

      if (now < lockoutEndTime) {
        setIsLockedOut(true)
        setLockoutEnd(lockoutEndTime)
      } else {
        // Lockout expired, clear data
        localStorage.removeItem("loginAttempts")
        localStorage.removeItem("lockoutEnd")
        setFailedAttempts(0)
        setShowCaptcha(false)
      }
    }
  }, [])

  // Update remaining time for lockout
  useEffect(() => {
    if (!isLockedOut || !lockoutEnd) return

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = lockoutEnd - now

      if (remaining <= 0) {
        setIsLockedOut(false)
        setLockoutEnd(null)
        setFailedAttempts(0)
        setShowCaptcha(false)
        localStorage.removeItem("loginAttempts")
        localStorage.removeItem("lockoutEnd")
        setRemainingTime("")
      } else {
        const minutes = Math.floor(remaining / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        setRemainingTime(`${minutes}:${seconds.toString().padStart(2, "0")}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLockedOut, lockoutEnd])

  const onSubmit = async (data: LoginInput) => {
    if (isLockedOut) {
      setError(`Account temporär gesperrt. Bitte versuchen Sie es in ${remainingTime} erneut.`)
      return
    }

    // Check CAPTCHA if required
    if (showCaptcha && !captchaToken) {
      setError("Bitte lösen Sie das CAPTCHA")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        // Increment failed attempts
        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)
        localStorage.setItem("loginAttempts", newAttempts.toString())

        // Show CAPTCHA after 3 failed attempts
        if (newAttempts >= MAX_ATTEMPTS) {
          setShowCaptcha(true)

          // Check if CAPTCHA was solved
          if (!captchaToken) {
            setError("Zu viele fehlgeschlagene Versuche. Bitte lösen Sie das CAPTCHA.")
            setIsLoading(false)
            return
          }

          // Lock out after CAPTCHA failure
          const lockoutEndTime = Date.now() + LOCKOUT_DURATION
          setIsLockedOut(true)
          setLockoutEnd(lockoutEndTime)
          localStorage.setItem("lockoutEnd", lockoutEndTime.toString())
          setError("Zu viele fehlgeschlagene Versuche. Account für 30 Minuten gesperrt.")
          setIsLoading(false)
          return
        }

        // Check for specific error messages
        if (authError.message.includes("Email not confirmed")) {
          setError("Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Prüfen Sie Ihren Posteingang.")
          setIsLoading(false)
          return
        }

        setError("Ungültige E-Mail oder Passwort")
        setIsLoading(false)
        return
      }

      // Successful login - clear rate limit data
      localStorage.removeItem("loginAttempts")
      localStorage.removeItem("lockoutEnd")
      setFailedAttempts(0)
      setShowCaptcha(false)

      // Check if session exists before redirect
      if (authData.session) {
        // Hard redirect to ensure cookies are set properly
        window.location.href = "/"
      } else {
        setError("Login fehlgeschlagen. Bitte versuchen Sie es erneut.")
        setIsLoading(false)
      }
    } catch (err) {
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
              {isLoading ? "Wird angemeldet..." : isLockedOut ? `Gesperrt (${remainingTime})` : "Anmelden"}
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
