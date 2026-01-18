"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { signupSchema, type SignupInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState<string>("")

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        // Check for specific error messages
        if (authError.message.includes("already registered")) {
          setError(
            "Diese E-Mail-Adresse ist bereits registriert. Möchten Sie sich anmelden?"
          )
          setIsLoading(false)
          return
        }

        setError(authError.message || "Registrierung fehlgeschlagen")
        setIsLoading(false)
        return
      }

      // Check if user was created successfully
      if (authData.user) {
        setEmail(data.email)
        setSuccess(true)
      } else {
        setError("Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.")
        setIsLoading(false)
      }
    } catch (err) {
      setError("Ein unerwarteter Fehler ist aufgetreten")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">
              Bestätigen Sie Ihre E-Mail
            </CardTitle>
            <CardDescription className="text-center">
              Wir haben eine Bestätigungs-E-Mail an
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center font-medium text-slate-900">{email}</p>
            <Alert>
              <AlertDescription>
                Bitte öffnen Sie Ihren Posteingang und klicken Sie auf den
                Bestätigungslink, um Ihr Konto zu aktivieren. Die E-Mail kann
                einige Minuten dauern.
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-medium">E-Mail nicht erhalten?</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Überprüfen Sie Ihren Spam-Ordner</li>
                <li>Stellen Sie sicher, dass die E-Mail-Adresse korrekt ist</li>
                <li>Warten Sie einige Minuten und laden Sie die Seite neu</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Zurück zur Anmeldung
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Account erstellen
          </CardTitle>
          <CardDescription>
            Erstellen Sie ein neues Konto mit Ihrer E-Mail-Adresse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                  {error.includes("bereits registriert") && (
                    <>
                      {" "}
                      <Link href="/login" className="underline font-medium">
                        Zur Anmeldung
                      </Link>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@beispiel.de"
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
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
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Wird erstellt..." : "Account erstellen"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-slate-600 text-center">
            Bereits ein Account?{" "}
            <Link href="/login" className="text-slate-900 hover:underline font-medium">
              Jetzt anmelden
            </Link>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Durch die Registrierung stimmen Sie unseren{" "}
            <Link href="/terms" className="underline">
              Nutzungsbedingungen
            </Link>{" "}
            und{" "}
            <Link href="/privacy" className="underline">
              Datenschutzrichtlinien
            </Link>{" "}
            zu.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
