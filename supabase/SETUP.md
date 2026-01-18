# Supabase Backend Setup für PROJ-1: User Authentication

## Übersicht

Dieses Setup erweitert Supabase Auth mit einer `profiles` Tabelle für zusätzliche User-Daten.

### Was wird erstellt?

1. **`profiles` Tabelle** - Speichert: Name, Avatar, Bio
2. **RLS Policies** - Nur eigene Profile sichtbar/editierbar
3. **Auto-Trigger** - Erstellt Profile automatisch bei Signup
4. **Indexes** - Performance-Optimierung für Email-Lookups

---

## Schritt 1: Migration ausführen

### Option A: Supabase Dashboard (Empfohlen)

1. Öffne dein Supabase Project Dashboard: https://supabase.com/dashboard
2. Navigiere zu **SQL Editor** (linke Sidebar)
3. Klicke auf **"New Query"**
4. Kopiere den Inhalt von `/supabase/migrations/001_create_profiles_table.sql`
5. Füge ihn in den SQL Editor ein
6. Klicke auf **"Run"** (oder `Cmd/Ctrl + Enter`)
7. Warte auf Success-Message: "Success. No rows returned"

### Option B: Supabase CLI (für Fortgeschrittene)

```bash
# Installiere Supabase CLI (falls noch nicht vorhanden)
npm install -g supabase

# Login
supabase login

# Link dein Projekt
supabase link --project-ref <your-project-ref>

# Migration ausführen
supabase db push
```

---

## Schritt 2: Migration verifizieren

### 1. Table Check

Im **SQL Editor** ausführen:

```sql
-- Prüfe ob profiles Tabelle existiert
SELECT * FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'profiles';
```

✅ **Erwartet:** 1 Row mit table_name = 'profiles'

### 2. RLS Policies Check

```sql
-- Prüfe RLS Policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';
```

✅ **Erwartet:** 4 Policies (SELECT, INSERT, UPDATE, DELETE)

### 3. Trigger Check

```sql
-- Prüfe Trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

✅ **Erwartet:** 1 Row mit event_object_table = 'users'

---

## Schritt 3: Funktionalität testen

### Test 1: Automatische Profile-Erstellung

1. Registriere einen neuen Test-User über die App: http://localhost:3000/signup
2. Bestätige die Email (prüfe Supabase Dashboard → Authentication → Users)
3. Im **SQL Editor** ausführen:

```sql
-- Zeige alle Profile
SELECT * FROM public.profiles;
```

✅ **Erwartet:** Du siehst ein neues Profile mit der Email des Test-Users

### Test 2: RLS Policies

1. Logge dich als Test-User ein: http://localhost:3000/login
2. Im **SQL Editor** (als authenticated user):

```sql
-- Versuche eigenes Profile abzurufen
SELECT * FROM public.profiles WHERE id = auth.uid();
```

✅ **Erwartet:** Dein Profile wird angezeigt

```sql
-- Versuche fremdes Profile abzurufen (sollte leer sein)
SELECT * FROM public.profiles WHERE id != auth.uid();
```

✅ **Erwartet:** Leeres Result (RLS blockiert fremde Profile)

---

## Schritt 4: Integration im Code

### Profile abrufen

```typescript
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/types/database'

const supabase = createClient()

// Get current user's profile
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .single()

if (error) console.error('Error fetching profile:', error)
else console.log('Profile:', profile)
```

### Profile aktualisieren

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'Max Mustermann',
    bio: 'Software Developer',
  })
  .eq('id', user.id)

if (error) console.error('Error updating profile:', error)
```

---

## Troubleshooting

### Problem: "relation \"public.profiles\" does not exist"

**Lösung:** Migration noch nicht ausgeführt. Siehe Schritt 1.

### Problem: "permission denied for table profiles"

**Lösung:** RLS Policies fehlen. Migration erneut ausführen.

### Problem: "new row violates row-level security policy"

**Lösung:** User ist nicht eingeloggt. Stelle sicher, dass `auth.uid()` einen Wert hat.

### Problem: Profile wird nicht automatisch erstellt

**Lösung:**
1. Prüfe ob Trigger existiert (siehe Schritt 2, Check 3)
2. Prüfe Supabase Logs: Dashboard → Logs → Postgres Logs
3. Trigger manuell neu erstellen

---

## Optional: Profile beim Signup erweitern

Falls du beim Signup bereits Name o.ä. abfragen willst:

```typescript
// signup/page.tsx
const { data, error } = await supabase.auth.signUp({
  email: data.email,
  password: data.password,
  options: {
    data: {
      full_name: data.fullName, // Wird automatisch in profiles.full_name gespeichert
    },
  },
})
```

---

## Nächste Schritte

- [ ] Migration in Supabase ausgeführt
- [ ] Verification Tests erfolgreich
- [ ] Integration im Frontend getestet
- [ ] Bereit für QA Testing

Bei Fragen: Supabase Docs → https://supabase.com/docs/guides/auth
