"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@supabase/supabase-js"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Laden...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Willkommen zu Ihrem Next.js Projekt
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Mit Supabase Authentication und TypeScript
          </p>
        </div>

        {/* Main Card */}
        <Card className="mx-auto w-full max-w-2xl">
          {user ? (
            // Authenticated User View
            <>
              <CardHeader>
                <CardTitle>Angemeldet</CardTitle>
                <CardDescription>
                  Sie sind erfolgreich angemeldet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">E-Mail</p>
                  <p className="text-slate-600">{user.email}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">User ID</p>
                  <p className="text-xs text-slate-600 font-mono">{user.id}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">
                    Email bestätigt
                  </p>
                  <p className="text-slate-600">
                    {user.email_confirmed_at ? "Ja" : "Nein"}
                  </p>
                </div>
                <div className="pt-4">
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    Abmelden
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            // Unauthenticated View
            <>
              <CardHeader>
                <CardTitle>Authentifizierung</CardTitle>
                <CardDescription>
                  Melden Sie sich an oder erstellen Sie ein neues Konto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Dieses Projekt enthält eine vollständige Authentifizierungslösung mit:
                </p>
                <ul className="list-inside list-disc space-y-2 text-sm text-slate-600 pl-4">
                  <li>E-Mail-Registrierung mit Passwort-Validierung</li>
                  <li>E-Mail-Verifizierung erforderlich vor Login</li>
                  <li>Sicherer Login mit Rate Limiting (3 Versuche + CAPTCHA)</li>
                  <li>Passwort-Reset-Funktion</li>
                  <li>30 Minuten Sperrzeit nach fehlgeschlagenen Versuchen</li>
                  <li>Session-Management mit 7-Tage-Dauer</li>
                </ul>
                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <Link href="/login" className="flex-1">
                    <Button className="w-full">Anmelden</Button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Registrieren
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next.js 16</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Latest version with App Router and Server Components
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">TypeScript</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Type-safe development with strict mode enabled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supabase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                PostgreSQL database with built-in authentication
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tailwind CSS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Utility-first CSS with custom configuration
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">shadcn/ui</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Beautiful components built with Radix UI
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rate Limiting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Protection against brute force with CAPTCHA
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
