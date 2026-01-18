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
- [ ] Counter resettet nach 10 Minuten oder erfolgreichem Login
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
- **Verhalten:** Nach 3 Reset-Anfragen in 10 Minuten: CAPTCHA + Delay (30 Sekunden)
- **Rationale:** Schutz vor Email-Spam und DoS-Angriffen

### CAPTCHA-Service nicht erreichbar
- **Szenario:** CAPTCHA-Provider (z.B. hCaptcha) ist down
- **Verhalten:** Fallback: Login nach 3 Versuchen für 10 Minuten sperren (ohne CAPTCHA)
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

## Nächste Schritte
1. **Solution Architect:** Database-Schema + Component-Architecture designen
2. **Backend Dev:** Supabase Auth konfigurieren + API Routes implementieren
3. **Frontend Dev:** Auth-Pages + Forms + Protected Routes bauen
4. **QA Engineer:** Feature gegen diese Spec testen
5. **DevOps:** Environment Variables + Deployment
