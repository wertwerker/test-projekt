# BUG-5 Fix: Server-Side Rate Limiting Setup

## Übersicht

Diese Migration implementiert Server-Side Rate Limiting für Login-Versuche, um BUG-5 zu fixen.

### Was wird erstellt?

1. **`rate_limits` Tabelle** - Speichert IP-basierte Login-Versuche
2. **RLS Policies** - Kein Public Access (nur Server-Side)
3. **Helper Functions** - Check, Record, Reset Rate Limits
4. **Auto-Cleanup** - Alte Einträge (>24h) können entfernt werden
5. **Indexes** - Performance-Optimierung für IP-Lookups

---

## Schritt 1: Migration ausführen

### Option A: Supabase Dashboard (Empfohlen)

1. Öffne dein Supabase Project Dashboard: https://supabase.com/dashboard
2. Navigiere zu **SQL Editor** (linke Sidebar)
3. Klicke auf **"New Query"**
4. Kopiere den Inhalt von `/supabase/migrations/002_create_rate_limits_table.sql`
5. Füge ihn in den SQL Editor ein
6. Klicke auf **"Run"** (oder `Cmd/Ctrl + Enter`)
7. Warte auf Success-Message: "Success. No rows returned"

### Option B: Supabase CLI (für Fortgeschrittene)

```bash
# Migration ausführen
supabase db push
```

---

## Schritt 2: Migration verifizieren

### 1. Table Check

Im **SQL Editor** ausführen:

```sql
-- Prüfe ob rate_limits Tabelle existiert
SELECT * FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'rate_limits';
```

✅ **Erwartet:** 1 Row mit table_name = 'rate_limits'

### 2. RLS Policies Check

```sql
-- Prüfe RLS Policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'rate_limits';
```

✅ **Erwartet:** 1 Policy "No public access to rate_limits"

### 3. Functions Check

```sql
-- Prüfe ob Helper Functions existieren
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%rate_limit%';
```

✅ **Erwartet:** 3 Functions (check_rate_limit, record_failed_attempt, reset_rate_limit)

---

## Schritt 3: Funktionalität testen

### Test 1: Check Rate Limit (keine Einträge)

```sql
-- Sollte nicht locked zurückgeben
SELECT * FROM public.check_rate_limit('127.0.0.1');
```

✅ **Erwartet:** `is_locked = false, remaining_seconds = 0, attempts = 0`

### Test 2: Record Failed Attempts

```sql
-- 1. Versuch
SELECT * FROM public.record_failed_attempt('192.168.1.100');
-- Erwartet: attempts = 1, is_locked = false

-- 2. Versuch
SELECT * FROM public.record_failed_attempt('192.168.1.100');
-- Erwartet: attempts = 2, is_locked = false

-- 3. Versuch (sollte locken)
SELECT * FROM public.record_failed_attempt('192.168.1.100');
-- Erwartet: attempts = 3, is_locked = true, locked_until_ts = NOW() + 30 min
```

### Test 3: Check Lockout Status

```sql
-- Prüfe ob IP jetzt gelockt ist
SELECT * FROM public.check_rate_limit('192.168.1.100');
```

✅ **Erwartet:** `is_locked = true, remaining_seconds = ~1800 (30 min)`

### Test 4: Reset Rate Limit

```sql
-- Reset (simuliert erfolgreichen Login)
SELECT public.reset_rate_limit('192.168.1.100');

-- Prüfe ob zurückgesetzt
SELECT * FROM public.check_rate_limit('192.168.1.100');
```

✅ **Erwartet:** `is_locked = false, attempts = 0`

### Test 5: Cleanup alte Einträge

```sql
-- Manueller Cleanup (Einträge > 24h löschen)
SELECT public.cleanup_old_rate_limits();

-- Prüfe ob alte Einträge weg sind
SELECT COUNT(*) FROM public.rate_limits
WHERE created_at < NOW() - INTERVAL '24 hours';
```

✅ **Erwartet:** COUNT = 0

---

## Schritt 4: Middleware Integration

Die Middleware-Integration erfolgt im nächsten Schritt durch den Frontend Developer.

**Benötigt:**
- Middleware liest IP-Adresse aus Request
- Ruft `check_rate_limit(ip)` auf
- Bei `is_locked = true`: Blockiert Request
- Bei Login-Fehler: Ruft `record_failed_attempt(ip)` auf
- Bei Login-Erfolg: Ruft `reset_rate_limit(ip)` auf

---

## Troubleshooting

### Problem: "relation \"public.rate_limits\" does not exist"

**Lösung:** Migration noch nicht ausgeführt. Siehe Schritt 1.

### Problem: "permission denied for table rate_limits"

**Lösung:** Das ist KORREKT! RLS Policy blockiert Public Access. Server-Side Code nutzt Service Role Key.

### Problem: "function public.check_rate_limit does not exist"

**Lösung:** Functions wurden nicht erstellt. Migration erneut ausführen.

### Problem: Tabelle wächst unbegrenzt

**Lösung:** Cleanup-Function manuell aufrufen oder Cron Job einrichten:

```sql
-- Manueller Cleanup
SELECT public.cleanup_old_rate_limits();
```

**Für automatischen Cleanup (Optional):**
Erstelle einen Supabase Edge Function oder nutze pg_cron Extension.

---

## Performance Notes

- **Index auf `ip_address`**: Sehr schnelle Lookups (< 10ms)
- **Unique Constraint**: Verhindert Duplikate
- **Cleanup nach 24h**: Hält Tabelle klein (< 10k Rows bei normalem Traffic)

---

## Security Notes

- ✅ RLS Policy blockiert Client-Access komplett
- ✅ Nur Server-Side Code (Service Role) kann zugreifen
- ✅ Functions nutzen `SECURITY DEFINER` (ausgeführt mit Owner-Rechten)
- ✅ IP-Adressen sind nicht personenbezogen (DSGVO-konform)

---

## Nächste Schritte

- [ ] Migration in Supabase ausgeführt
- [ ] Verification Tests erfolgreich
- [ ] Middleware-Integration (Frontend Developer)
- [ ] End-to-End Testing
- [ ] Bereit für QA Testing

Bei Fragen: Supabase Docs → https://supabase.com/docs/guides/database

---

**Created:** 2026-01-19
**Migration:** 002_create_rate_limits_table.sql
**Bug Fix:** BUG-5 - Server-Side Rate Limiting
