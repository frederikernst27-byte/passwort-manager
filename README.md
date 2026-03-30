# VaultDesk

VaultDesk ist eine einfache Vercel-App mit echtem Backend:

- statischem Frontend (`index.html`)
- Vercel Serverless Functions (`api/*`)
- PostgreSQL-Datenbank
- serverseitigem Passwort-Hashing mit `bcryptjs`
- Session-Cookies
- serverseitiger Verschlüsselung sensibler Vault-Felder

## Jetzt auch sauber für Supabase vorbereitet

Die App kann mit **Supabase Postgres** genutzt werden.

Wichtig:

- Das hier nutzt **Supabase als Datenbank**
- **nicht** Supabase Auth
- Login/Sessions laufen weiter über die eigene Vercel-API der App

Das ist für dieses Projekt der einfachste und ehrlichste Weg.

## Unterstützte DB-Setups

- **Supabase Postgres**
- **Neon Postgres**
- **Vercel Postgres**

Die App akzeptiert jetzt:

- `DATABASE_URL` *(empfohlen)*
- oder `SUPABASE_DB_URL` *(Fallback)*

## Dateien

- `schema.sql` – allgemeines PostgreSQL-Schema
- `supabase.sql` – gleiche Tabellen, direkt für Supabase nutzbar
- `.env.example` – Beispielwerte
- `lib/db.js` – akzeptiert jetzt auch `SUPABASE_DB_URL`

## Supabase einrichten

### 1) Supabase-Projekt erstellen

In Supabase ein neues Projekt anlegen.

### 2) Datenbank-Connection-String holen

In Supabase unter:

- **Project Settings**
- **Database**
- **Connection string**

nimm am besten die normale **URI / Transaction Pooler**-Verbindung mit SSL.

Beispiel:

```env
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORT@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### 3) SQL ausführen

Im **Supabase SQL Editor** den Inhalt aus `supabase.sql` ausführen.

### 4) Vercel ENV setzen

Diese ENV-Namen braucht die App:

- `DATABASE_URL` oder `SUPABASE_DB_URL`
- `VAULT_ENCRYPTION_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_DISPLAY_NAME` *(optional, aber empfohlen)*

Beispiel:

```env
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORT@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require
VAULT_ENCRYPTION_KEY=ein-langes-zufaelliges-geheimes-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ein-sehr-starkes-passwort
ADMIN_DISPLAY_NAME=Frederik Admin
```

### 5) Deploy auf Vercel

Danach das Projekt normal auf Vercel deployen.

## Sicherheitsrahmen

Diese App ist **deutlich besser als eine reine localStorage-Demo**, aber **kein Zero-Knowledge-Passwortmanager**.

Was passiert:

- Nutzerpasswörter werden gehasht gespeichert
- Session-Cookies sind HttpOnly/Secure
- Vault-Felder werden serverseitig verschlüsselt gespeichert
- Rechteprüfung passiert serverseitig

Grenze:

- Der Server kann Daten entschlüsseln, weil er den Schlüssel kennt

Also: brauchbar und ehrlich für ein kleines Projekt, aber nicht die Sicherheitsklasse von 1Password oder Bitwarden.

## Lokal entwickeln

```bash
npm install
npm run dev
```

## Deployment-Checkliste

1. Supabase-Projekt anlegen
2. `supabase.sql` ausführen
3. Vercel ENV setzen
4. deployen
5. einmal einloggen, damit der erste Admin angelegt wird

## API-Routen

- `POST /api/login`
- `GET /api/session`
- `POST /api/logout`
- `GET /api/customers`
- `POST /api/customers`
- `DELETE /api/customers/:id`
- `GET /api/entries`
- `POST /api/entries`
- `DELETE /api/entries/:id`
- `POST /api/entries/:id/shares`
