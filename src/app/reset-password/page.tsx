"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import {
  resetPasswordRequestSchema,
  resetPasswordSchema,
  type ResetPasswordRequestInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const searchParams = useSearchParams()

  const supabase = createClient()

  // Check if we have an access token (from email link)
  useEffect(() => {
    const checkToken = async () => {
      const accessToken = searchParams.get("access_token")
      if (accessToken) {
        setIsResetMode(true)
      }
    }
    checkToken()
  }, [searchParams])

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest },
  } = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
  })

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmitRequest = async (data: ResetPasswordRequestInput) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (resetError) {
        setError(resetError.message || "Fehler beim Senden der E-Mail")
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setIsLoading(false)
    } catch (err) {
      setError("Ein unerwarteter Fehler ist aufgetreten")
      setIsLoading(false)
    }
  }

  const onSubmitReset = async (data: ResetPasswordInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        setError(updateError.message || "Fehler beim Zurücksetzen des Passworts")
        setIsLoading(false)
        return
      }

      // Password updated successfully - redirect to login
      window.location.href = "/login"
    } catch (err) {
      setError("Ein unerwarteter Fehler ist aufgetreten")
      setIsLoading(false)
    }
  }

  // Success screen for password reset request
  if (success && !isResetMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">
              E-Mail gesendet
            </CardTitle>
            <CardDescription className="text-center">
              Prüfen Sie Ihren Posteingang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Wir haben Ihnen einen Link zum Zurücksetzen Ihres Passworts
                gesendet. Bitte öffnen Sie Ihren Posteingang und folgen Sie den
                Anweisungen.
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-medium">E-Mail nicht erhalten?</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Überprüfen Sie Ihren Spam-Ordner</li>
                <li>Stellen Sie sicher, dass die E-Mail-Adresse korrekt ist</li>
                <li>Warten Sie einige Minuten</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Anmeldung
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Reset password form (when user clicks email link)
  if (isResetMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Neues Passwort festlegen
            </CardTitle>
            <CardDescription>
              Geben Sie Ihr neues Passwort ein
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReset(onSubmitReset)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...registerReset("password")}
                />
                {errorsReset.password && (
                  <p className="text-sm text-red-600">
                    {errorsReset.password.message}
                  </p>
                )}
                <p className="text-xs text-slate-600">
                  Mindestens 8 Zeichen, mit Groß- und Kleinbuchstaben sowie Zahlen
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...registerReset("confirmPassword")}
                />
                {errorsReset.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errorsReset.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Wird gespeichert..." : "Passwort zurücksetzen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Request password reset form (initial form)
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Passwort zurücksetzen
          </CardTitle>
          <CardDescription>
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum
            Zurücksetzen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRequest(onSubmitRequest)} className="space-y-4">
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
                disabled={isLoading}
                {...registerRequest("email")}
              />
              {errorsRequest.email && (
                <p className="text-sm text-red-600">
                  {errorsRequest.email.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Wird gesendet..." : "Link senden"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Anmeldung
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
