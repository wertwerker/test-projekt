# PROJ-1: User Authentication

## Status: 🔵 Planned

## Übersicht
User-Authentifizierung mit Email/Passwort und Google OAuth, inklusive Email-Verifizierung. User müssen ihre Email bestätigen, bevor sie sich einloggen können.

## User Stories

### Registration
- Als **neuer User** möchte ich mich mit Email und Passwort registrieren, um einen Account zu erstellen
- Als **neuer User** möchte ich mich mit Google OAuth registrieren, um schneller einen Account zu erstellen (1-Click)
- Als **neuer User** möchte ich eine Bestätigungs-Email erhalten, um meine Email-Adresse zu verifizieren
- Als **neuer User** muss ich meine Email verifizieren, bevor ich mich einloggen kann

### Login
- Als **registrierter User** möchte ich mich mit Email und Passwort einloggen
- Als **registrierter User** möchte ich mich mit Google OAuth einloggen
- Als **eingeloggter User** möchte ich 7 Tage eingeloggt bleiben, ohne mich täglich neu anmelden zu müssen
- Als **eingeloggter User** möchte ich nach erfolgreichem Login zur Dashboard/Home-Seite weitergeleitet werden

### Passwort-Reset
- Als **User, der sein Passwort vergessen hat** möchte ich einen Reset-Link per Email erhalten
- Als **User** möchte ich ein neues Passwort über den Reset-Link setzen können

### Logout
- Als **eingeloggter User** möchte ich mich ausloggen können, um meine Session zu beenden

### Security
- Als **User** möchte ich vor Brute-Force-Angriffen geschützt sein (Rate Limiting + CAPTCHA)
- Als **User** möchte ich sicher sein, dass nur verifizierte Email-Adressen sich einloggen können

## Acceptance Criteria

### Registration Flow (Email/Passwort)
- [ ] Registration-Formular hat Felder: Email, Passwort, Passwort wiederholen
- [ ] Passwort-Validierung: Mindestens 8 Zeichen, 1 Großbuchstabe, 1 Ziffer
- [ ] Email-Validierung: Gültiges Email-Format
- [ ] Bei erfolgreicher Registration: Bestätigungs-Email versenden
- [ ] Success-Message: "Bitte bestätige deine Email. Wir haben dir einen Link geschickt."
- [ ] User wird in Supabase Auth Tabelle angelegt
- [ ] User-Status: `email_confirmed = false` bis Verifizierung

### Registration Flow (Google OAuth)
- [ ] "Sign up with Google" Button vorhanden
- [ ] OAuth Flow öffnet Google-Login in Popup/Redirect
- [ ] Nach erfolgreicher OAuth: User wird automatisch angelegt
- [ ] Google-User überspringt Email-Verifizierung (Google hat bereits verifiziert)
- [ ] Nach Success: Redirect zu Dashboard/Home

### Email-Verifizierung
- [ ] Bestätigungs-Email enthält klickbaren Link mit Token
- [ ] Link-Klick setzt `email_confirmed = true` in Supabase
- [ ] Success-Page: "Email verifiziert! Du kannst dich jetzt einloggen."
- [ ] Expired-Link-Handling: Falls Token abgelaufen, neuen Link anfordern können

### Login Flow (Email/Passwort)
- [ ] Login-Formular hat Felder: Email, Passwort
- [ ] Bei unverifizierter Email: Error "Bitte verifiziere erst deine Email"
- [ ] Bei falschen Credentials: Error "Email oder Passwort falsch"
- [ ] Nach erfolgreichem Login: Session wird erstellt (7 Tage Dauer)
- [ ] Redirect zu Dashboard/Home nach Login

### Login Flow (Google OAuth)
- [ ] "Sign in with Google" Button vorhanden
- [ ] OAuth Flow identisch zu Registration
- [ ] Bei existierendem Google-Account: Automatischer Login
- [ ] Session wird erstellt (7 Tage Dauer)
- [ ] Redirect zu Dashboard/Home nach Login

### Rate Limiting & CAPTCHA
- [ ] Nach 3 fehlgeschlagenen Login-Versuchen: CAPTCHA anzeigen
- [ ] CAPTCHA muss gelöst werden, bevor weiterer Login-Versuch möglich
- [ ] Counter resettet nach 30 Minuten oder erfolgreichem Login
- [ ] Clear Error Message: "Zu viele Versuche. Bitte löse das CAPTCHA."

### Passwort-Reset Flow
- [ ] "Passwort vergessen?" Link auf Login-Seite
- [ ] Reset-Formular: Email eingeben
- [ ] Bei gültiger Email: Reset-Link per Email versenden
- [ ] Reset-Link öffnet Formular: Neues Passwort + Wiederholen
- [ ] Passwort-Validierung identisch zu Registration
- [ ] Nach erfolgreichem Reset: Automatisch einloggen + Redirect zu Dashboard
- [ ] Success-Message: "Passwort erfolgreich geändert"

### Session Management
- [ ] Session-Dauer: 7 Tage (168 Stunden)
- [ ] Session bleibt nach Browser-Reload erhalten (Cookie/localStorage)
- [ ] Nach Session-Ablauf: Redirect zu Login mit Message "Session abgelaufen"
- [ ] Logout-Button löscht Session sofort

### Logout Flow
- [ ] Logout-Button in Header/Navigation sichtbar (nur für eingeloggte User)
- [ ] Klick auf Logout: Session wird gelöscht (Supabase + Client)
- [ ] Redirect zu Login-Seite nach Logout
- [ ] Success-Message: "Du wurdest ausgeloggt"

### UI/UX
- [ ] Loading-States während API-Calls (Spinner/Disabled Buttons)
- [ ] Error-Messages sind klar und hilfreich
- [ ] Success-Messages sind sichtbar (Toast/Banner)
- [ ] Responsive Design: Mobile + Desktop optimiert
- [ ] Accessibility: Keyboard-Navigation, ARIA-Labels

## Edge Cases

### Duplicate Email Registration
- **Szenario:** User versucht sich mit existierender Email zu registrieren
- **Verhalten:** Error-Message: "Email bereits registriert. Passwort vergessen?" mit Link zu Passwort-Reset
- **Rationale:** Hilft User, statt nur "Email existiert" zu zeigen

### Unverifizierte Email + Login-Versuch
- **Szenario:** User hat Email nicht bestätigt und versucht Login
- **Verhalten:** Error-Message: "Bitte verifiziere erst deine Email. Neue Email senden?" mit Button
- **Rationale:** Kein Login ohne Verifizierung (Security + Spam-Schutz)

### Expired Email-Verification-Link
- **Szenario:** User klickt auf alten Verification-Link (> 24h)
- **Verhalten:** Error-Page: "Link abgelaufen. Neue Verifizierungs-Email senden?" mit Button
- **Rationale:** Token-Expiry aus Security-Gründen

### Expired Password-Reset-Link
- **Szenario:** User klickt auf alten Reset-Link (> 1h)
- **Verhalten:** Error-Page: "Link abgelaufen. Neuen Reset-Link anfordern?" mit Formular
- **Rationale:** Kurze Expiry (1h) für Passwort-Reset aus Security-Gründen

### Google OAuth User ändert Google-Email
- **Szenario:** User loggt sich mit Google ein, ändert später seine Google-Email
- **Verhalten:** User kann sich mit neuer Email einloggen, Account bleibt bestehen (über Google-ID verknüpft)
- **Rationale:** Google-ID ist Identifier, nicht die Email

### Multiple OAuth Providers mit gleicher Email
- **Szenario:** User registriert sich mit Google (email@gmail.com), versucht später Login mit Email/Passwort (gleiche Email)
- **Verhalten:** Error: "Account existiert mit Google. Bitte 'Sign in with Google' verwenden."
- **Rationale:** Verhindert Account-Confusion, macht Provider-Verknüpfung klar

### Session während aktiver Nutzung abgelaufen
- **Szenario:** User ist aktiv in App, Session läuft nach 7 Tagen ab
- **Verhalten:** Beim nächsten API-Call: Redirect zu Login mit Message "Session abgelaufen, bitte neu einloggen"
- **Rationale:** Graceful Handling ohne Datenverlust (falls möglich)

### Browser-Cookies blockiert
- **Szenario:** User hat Cookies deaktiviert oder benutzt Private-Browsing
- **Verhalten:** Warning-Message: "Bitte aktiviere Cookies für diese Seite. Ohne Cookies funktioniert Login nicht."
- **Rationale:** Transparente Kommunikation statt unerklärlicher Fehler

### Rate Limiting während Passwort-Reset
- **Szenario:** Angreifer versucht massenhaft Passwort-Reset-Emails zu versenden
- **Verhalten:** Nach 3 Reset-Anfragen in 30 Minuten: CAPTCHA + Delay (30 Sekunden)
- **Rationale:** Schutz vor Email-Spam und DoS-Angriffen

### CAPTCHA-Service nicht erreichbar
- **Szenario:** CAPTCHA-Provider (z.B. hCaptcha) ist down
- **Verhalten:** Fallback: Login nach 3 Versuchen für 30 Minuten sperren (ohne CAPTCHA)
- **Rationale:** User nicht komplett aussperren, aber Rate Limiting bleibt aktiv

## Technische Anforderungen

### Backend (Supabase)
- **Auth Provider:** Supabase Auth mit Email + Google OAuth konfiguriert
- **Email Service:** Supabase Email Templates für Verification + Reset
- **Database:**
  - Supabase Auth Tabelle (`auth.users`)
  - Felder: `id`, `email`, `email_confirmed`, `created_at`, `last_sign_in_at`
  - Optional: `public.profiles` Tabelle für User-Metadaten (Name, Avatar, etc.)

### Frontend (Next.js + React)
- **Pages/Routes:**
  - `/signup` - Registration-Formular
  - `/login` - Login-Formular
  - `/verify-email` - Email-Verifizierung Success/Error
  - `/reset-password` - Passwort-Reset-Formular
  - `/auth/callback` - OAuth Callback-Handler
- **State Management:** Supabase Auth State (via Context API)
- **Protected Routes:** Middleware checkt Session, redirect zu `/login` falls nicht eingeloggt

### UI Components (shadcn/ui)
- Form (Input, Label, Button)
- Card (für Auth-Formulare)
- Toast (für Success/Error Messages)
- Spinner (für Loading States)

### Security
- **Password Hashing:** Supabase Auth (bcrypt)
- **HTTPS only:** Alle Auth-Requests über HTTPS
- **CSRF Protection:** Next.js CSRF-Token
- **Rate Limiting:** 3 Versuche pro IP + CAPTCHA
- **CAPTCHA:** hCaptcha oder reCAPTCHA v3

### Performance
- **Email Delivery:** < 30 Sekunden
- **Login Response:** < 500ms
- **OAuth Redirect:** < 2 Sekunden
- **Session Check:** < 100ms (cached)

## Abhängigkeiten
- **Supabase Auth:** Muss konfiguriert sein (Email + Google OAuth Provider)
- **Email Service:** Supabase Email oder externes Service (SendGrid, etc.)
- **CAPTCHA Service:** hCaptcha oder reCAPTCHA Account benötigt

## Out of Scope (für spätere Features)
- ❌ Multi-Factor Authentication (2FA)
- ❌ Magic Link Login (passwordless)
- ❌ Weitere OAuth Providers (GitHub, Facebook, etc.)
- ❌ User-Profil bearbeiten (Name, Avatar, etc.) → Separates Feature
- ❌ Account löschen → Separates Feature
- ❌ Admin-Panel für User-Management → Separates Feature

## Definition of Done
- [ ] Alle Acceptance Criteria erfüllt
- [ ] Alle Edge Cases behandelt
- [ ] UI ist responsive (Mobile + Desktop)
- [ ] Error Handling ist vollständig
- [ ] QA-Tests bestanden (siehe QA Engineer Agent)
- [ ] Code reviewed und gemerged
- [ ] Deployed auf Staging/Production

---

## Tech-Design (Solution Architect)

### Component-Struktur

**Authentication System**
```
App
├── Public Routes (nicht eingeloggt)
│   ├── /signup - Registrierungs-Seite
│   │   ├── Email/Passwort Formular
│   │   │   ├── Email Input
│   │   │   ├── Passwort Input
│   │   │   ├── Passwort wiederholen Input
│   │   │   └── "Registrieren" Button
│   │   ├── Divider ("oder")
│   │   └── "Sign up with Google" Button
│   │
│   ├── /login - Login-Seite
│   │   ├── Email/Passwort Formular
│   │   │   ├── Email Input
│   │   │   ├── Passwort Input
│   │   │   └── "Anmelden" Button
│   │   ├── "Passwort vergessen?" Link
│   │   ├── Divider ("oder")
│   │   └── "Sign in with Google" Button
│   │
│   ├── /verify-email - Email-Verifizierung Success/Error Page
│   │   ├── Success-Nachricht (wenn Token gültig)
│   │   ├── Error-Nachricht (wenn Token abgelaufen)
│   │   └── "Neue Email senden" Button (bei Fehler)
│   │
│   ├── /reset-password - Passwort-Reset-Seite
│   │   ├── Schritt 1: Email eingeben
│   │   │   └── "Reset-Link senden" Button
│   │   └── Schritt 2: Neues Passwort setzen (via Token-Link)
│   │       ├── Neues Passwort Input
│   │       ├── Passwort wiederholen Input
│   │       └── "Passwort ändern" Button
│   │
│   └── /auth/callback - OAuth Callback Handler
│       └── Loading Spinner + Redirect-Logik
│
└── Protected Routes (nur für eingeloggte User)
    ├── / (Dashboard/Home) - Nach Login
    └── Alle anderen App-Seiten

Globale Components (überall verfügbar):
├── Toast Notifications (Success/Error Messages)
├── Loading Spinner (während API-Calls)
└── CAPTCHA Widget (nach 3 fehlgeschlagenen Versuchen)
```

**Header/Navigation (für eingeloggte User)**
```
Header
├── Logo/App-Name (links)
├── Navigation-Links (Mitte)
└── User-Bereich (rechts)
    ├── User-Avatar/Email
    └── Dropdown-Menü
        ├── "Profil" (später)
        └── "Logout" Button
```

### Daten-Model

**User-Daten (in Supabase Auth gespeichert):**
- Eindeutige User-ID (UUID, automatisch generiert)
- Email-Adresse
- Passwort (verschlüsselt, nur bei Email/Passwort-Auth)
- Email-Verifizierungs-Status (verifiziert ja/nein)
- Login-Provider (Email oder Google)
- Letzter Login-Zeitpunkt
- Erstellungsdatum des Accounts

**Session-Daten (im Browser gespeichert):**
- Session-Token (verschlüsselt im Cookie)
- Ablaufdatum (7 Tage nach Login)
- User-ID

**Temporäre Daten:**
- Email-Verifizierungs-Token (gültig 24 Stunden)
- Passwort-Reset-Token (gültig 1 Stunde)
- Login-Versuchs-Counter (für Rate Limiting, im Browser)

**KEINE zusätzlichen Datenbank-Tabellen nötig!**
- Supabase Auth verwaltet alles intern
- Optional: Später eine `profiles` Tabelle für User-Metadaten (Name, Avatar, etc.)

### User-Flows (Schritt-für-Schritt)

**1. Registration Flow (Email/Passwort):**
1. User öffnet `/signup`
2. Gibt Email + Passwort ein
3. Klickt "Registrieren"
4. System prüft: Email-Format, Passwort-Stärke
5. Falls OK: Account wird in Supabase erstellt
6. Bestätigungs-Email wird versendet
7. Success-Nachricht: "Bitte bestätige deine Email"
8. User öffnet Email und klickt Link
9. Link führt zu `/verify-email?token=xxx`
10. System verifiziert Token → Email bestätigt
11. Success-Nachricht: "Email verifiziert! Bitte einloggen"

**2. Registration Flow (Google OAuth):**
1. User öffnet `/signup`
2. Klickt "Sign up with Google"
3. Google-Login öffnet sich (Popup oder Redirect)
4. User wählt Google-Account
5. Google gibt Zustimmung
6. System erhält User-Daten von Google
7. Account wird automatisch erstellt
8. Email ist bereits verifiziert (Google hat das gemacht)
9. Redirect zu Dashboard/Home → User ist eingeloggt

**3. Login Flow (Email/Passwort):**
1. User öffnet `/login`
2. Gibt Email + Passwort ein
3. Klickt "Anmelden"
4. System prüft: Email verifiziert? Passwort korrekt?
5. Falls Email nicht verifiziert: Error + "Neue Email senden" Button
6. Falls Passwort falsch: Error + Counter erhöhen
7. Nach 3 Fehlversuchen: CAPTCHA anzeigen
8. Falls OK: Session erstellen (7 Tage)
9. Redirect zu Dashboard/Home

**4. Passwort-Reset Flow:**
1. User öffnet `/login` und klickt "Passwort vergessen?"
2. Wird zu `/reset-password` weitergeleitet
3. Gibt Email ein
4. Klickt "Reset-Link senden"
5. System sendet Reset-Email mit Token-Link
6. User öffnet Email und klickt Link
7. Link führt zu `/reset-password?token=xxx`
8. Formular: Neues Passwort eingeben
9. Klickt "Passwort ändern"
10. System setzt neues Passwort
11. Automatischer Login + Redirect zu Dashboard

**5. Logout Flow:**
1. User klickt "Logout" im Header
2. System löscht Session
3. Redirect zu `/login`
4. Success-Nachricht: "Du wurdest ausgeloggt"

### Tech-Entscheidungen

**Warum Supabase Auth?**
- Fertige Lösung für Email + OAuth (kein eigenes Auth-System bauen)
- Email-Verifizierung + Reset-Flows out-of-the-box
- Row Level Security (RLS) für Datenbank-Zugriff
- JWT-basierte Sessions (sicher und skalierbar)
- Google OAuth bereits integriert

**Warum React Hook Form + Zod?**
- React Hook Form: Performantes Form-Handling (weniger Re-Renders)
- Zod: Type-safe Schema-Validierung (Passwort-Stärke, Email-Format)
- Beide arbeiten perfekt zusammen
- shadcn/ui Form-Components nutzen diese bereits

**Warum hCaptcha/reCAPTCHA?**
- Schutz vor Brute-Force-Angriffen
- Benutzerfreundlicher als alte CAPTCHAs
- GDPR-konform (hCaptcha) oder weit verbreitet (reCAPTCHA)
- Nur nach 3 Fehlversuchen → User Experience bleibt gut

**Warum 7 Tage Session-Dauer?**
- Balance zwischen Security (nicht zu lang) und UX (nicht täglich neu einloggen)
- Standard in vielen Apps (Gmail, GitHub, etc.)
- User kann sich ausloggen, falls gewünscht

**Warum kein "Remember Me" Checkbox?**
- Simplicity: Weniger Optionen = bessere UX
- 7 Tage ist für die meisten User ausreichend
- Kann später als Feature ergänzt werden (PROJ-X)

**Warum shadcn/ui Components?**
- Bereits im Projekt installiert (30+ Components)
- Form, Input, Button, Card, Toast sind perfekt für Auth-Pages
- Accessible (Keyboard-Navigation, ARIA-Labels)
- Customizable mit Tailwind CSS

### Dependencies

**Bereits installiert:**
- @supabase/supabase-js (Supabase Client)
- react-hook-form (Form-Handling)
- zod (Schema-Validierung)
- shadcn/ui Components (Button, Form, Input, Card, Toast)
- next-themes (für Dark Mode Support)

**Neu zu installieren:**
- @supabase/auth-helpers-nextjs (Supabase Auth für Next.js App Router)
- @hcaptcha/react-hcaptcha ODER react-google-recaptcha (CAPTCHA)

**Optional (je nach Bedarf):**
- @hookform/resolvers (Zod Resolver für React Hook Form - eventuell schon da)

### Supabase-Konfiguration (Backend)

**Benötigte Setups in Supabase Dashboard:**

1. **Email Auth aktivieren:**
   - Settings → Authentication → Email Provider
   - Email Confirmation: Aktiviert
   - Email Change Confirmation: Aktiviert
   - Secure Email Change: Aktiviert

2. **Google OAuth aktivieren:**
   - Settings → Authentication → Google Provider
   - Client ID + Secret eintragen (von Google Cloud Console)
   - Redirect URL konfigurieren

3. **Email Templates anpassen:**
   - Settings → Authentication → Email Templates
   - "Confirm Signup" Template
   - "Reset Password" Template
   - Eigene Texte + Branding (optional)

4. **Rate Limiting (Supabase-seitig):**
   - Bereits aktiv (Standard: 30 Requests/Hour pro IP)
   - Bei Bedarf anpassen

5. **Session-Einstellungen:**
   - JWT Expiry: 7 Tage (604800 Sekunden)
   - Refresh Token Rotation: Aktiviert (Security)

**Environment Variables (in .env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=xxx (für CAPTCHA)
```

### Protected Routes Strategy

**Middleware-basierter Schutz:**
- Next.js Middleware prüft bei jedem Request: Session gültig?
- Falls nein: Redirect zu `/login`
- Falls ja: Request durchlassen

**Public Routes (erlaubt ohne Login):**
- `/login`
- `/signup`
- `/verify-email`
- `/reset-password`
- `/auth/callback`

**Protected Routes (Login erforderlich):**
- `/` (Dashboard/Home)
- Alle anderen Seiten (später)

**Implementierung:**
- `middleware.ts` im Root-Verzeichnis
- Prüft Supabase Session
- Redirect-Logik

### Error Handling Strategy

**User-freundliche Error Messages:**
- "Email bereits registriert. Passwort vergessen?" (statt "Error 409")
- "Bitte verifiziere erst deine Email" (statt "Access Denied")
- "Zu viele Versuche. Bitte löse das CAPTCHA" (statt "Rate Limit")

**Error-Typen:**
- Validation Errors (Frontend, via Zod)
- Auth Errors (Supabase, z.B. falsche Credentials)
- Network Errors (API down)
- Token Errors (abgelaufen, ungültig)

**Error-Display:**
- Toast Notifications (für kurzlebige Messages)
- Inline Error Messages (unter Form-Feldern)
- Error Pages (für kritische Fehler wie 404, 500)

### Performance & Security

**Performance:**
- Server Components für statische Teile (Layout, Navigation)
- Client Components nur für interaktive Forms
- Lazy Loading für CAPTCHA (nur bei Bedarf nachladen)
- Optimistic UI Updates (z.B. Logout sofort, API-Call im Hintergrund)

**Security:**
- HTTPS only (automatisch via Vercel/Netlify)
- CSRF Protection (Next.js built-in)
- XSS Protection (React escaping)
- Rate Limiting (Supabase + Frontend)
- JWT-basierte Sessions (keine unsicheren Cookies)
- Passwort-Hashing (Supabase bcrypt)

---

## Nächste Schritte
1. ✅ **Solution Architect:** Database-Schema + Component-Architecture designen (FERTIG)
2. **Backend Dev:** Supabase Auth konfigurieren (Dashboard-Setup)
3. **Frontend Dev:** Auth-Pages + Forms + Protected Routes bauen
4. **QA Engineer:** Feature gegen diese Spec testen
5. **DevOps:** Environment Variables + Deployment
