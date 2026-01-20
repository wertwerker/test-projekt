"use client"

import { useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Mail } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const verified = searchParams.get("verified") === "true"
  const error = searchParams.get("error")

  // Success State: Email verified
  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">
              Email verifiziert!
            </CardTitle>
            <CardDescription className="text-center">
              Deine Email-Adresse wurde erfolgreich bestätigt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-900">
                Du kannst dich jetzt mit deinem Account einloggen und alle Features nutzen.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button className="w-full">
                Zum Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Error State: Expired or invalid token
  if (error === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">
              Verifizierungs-Link abgelaufen
            </CardTitle>
            <CardDescription className="text-center">
              Der Link ist nicht mehr gültig
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Der Verifizierungs-Link ist abgelaufen oder wurde bereits verwendet.
                Bitte fordere eine neue Verifizierungs-Email an.
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-medium">So gehts weiter:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Gehe zur Login-Seite</li>
                <li>Versuche dich mit deiner Email einzuloggen</li>
                <li>Falls deine Email noch nicht verifiziert ist, erhältst du einen Hinweis</li>
                <li>Fordere dort eine neue Verifizierungs-Email an</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Zum Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Default State: User navigated here directly
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-slate-600" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-center">
            Email-Verifizierung
          </CardTitle>
          <CardDescription className="text-center">
            Bitte prüfe deine Email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Wir haben dir eine Verifizierungs-Email gesendet. Bitte öffne deinen Posteingang
              und klicke auf den Bestätigungslink, um dein Konto zu aktivieren.
            </AlertDescription>
          </Alert>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-medium">Email nicht erhalten?</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Überprüfe deinen Spam-Ordner</li>
              <li>Stelle sicher, dass die Email-Adresse korrekt ist</li>
              <li>Warte einige Minuten</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Zum Login
            </Button>
          </Link>
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
