# VaultDesk

VaultDesk ist jetzt keine reine `localStorage`-Demo mehr, sondern eine einfache Vercel-taugliche App mit:

- statischem Frontend (`index.html`)
- Vercel Serverless Functions unter `api/*`
- PostgreSQL (empfohlen: **Neon Free Tier** oder **Vercel Postgres Free**)
- serverseitigem Passwort-Hashing mit `bcryptjs`
- serverseitigen Session-Cookies
- serverseitiger Verschlüsselung sensibler Vault-Felder per `VAULT_ENCRYPTION_KEY`

## Verwendete kostenlose Dienste

Empfohlen und getestet vorbereitet für:

1. **Vercel Hobby** – Hosting + Serverless Functions
2. **Neon Postgres Free Tier** – kostenlose PostgreSQL-Datenbank

Alternativ ist auch **Vercel Postgres Free** möglich, solange du eine normale `DATABASE_URL` erhältst.

## Sicherheitsrahmen (ehrlich, ohne Marketing)

Diese App ist deutlich besser als die alte reine Browser-Demo, aber sie ist **kein Zero-Knowledge-Passwortmanager**.

Was hier sicherheitsseitig passiert:

- Benutzerpasswörter werden **nur gehasht**, nicht im Klartext gespeichert.
- Sessions laufen über **HttpOnly Secure Cookies**.
- Vault-Felder wie Login, Passwort und Info werden **serverseitig verschlüsselt** in der DB gespeichert.
- Rechteprüfung passiert **serverseitig** in den API-Routen.

Grenzen dieser Architektur:

- Der Server kann Vault-Daten entschlüsseln, weil er den Schlüssel aus `VAULT_ENCRYPTION_KEY` besitzt.
- Wer Vercel-ENV + Datenbankzugriff zugleich kompromittiert, kann Daten potenziell wiederherstellen.
- Für ein echtes Ende-zu-Ende-/Zero-Knowledge-Modell bräuchte man eine andere Architektur.

Für ein kleines, kostenloses, einfach deploybares Tool ist das ein vernünftiger Mittelweg – aber eben kein Hochsicherheitsprodukt.

## ENV-Variablen für Vercel

Diese **exakten ENV-Namen** müssen gesetzt werden:

- `DATABASE_URL`
- `VAULT_ENCRYPTION_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_DISPLAY_NAME` *(optional, aber empfohlen)*

### Beispielwerte

```env
DATABASE_URL=postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
VAULT_ENCRYPTION_KEY=ein-langes-zufaelliges-geheimes-secret-mit-viel-entropie
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ein-sehr-starkes-admin-passwort
ADMIN_DISPLAY_NAME=Frederik Admin
```

## DB initialisieren

1. Erstelle eine Neon- oder Vercel-Postgres-Datenbank.
2. Kopiere deine `DATABASE_URL`.
3. Führe den Inhalt aus `schema.sql` gegen die Datenbank aus.

### Mit psql

```bash
psql "$DATABASE_URL" -f schema.sql
```

### Oder im Neon SQL Editor

Einfach den Inhalt von `schema.sql` in den SQL Editor kopieren und ausführen.

## Wie der Admin-Login gesetzt wird

Es gibt **keinen hartcodierten Demo-Admin** mehr.

Stattdessen gilt:

- Beim ersten API-Zugriff prüft die App, ob bereits ein Admin existiert.
- Falls nicht, wird automatisch ein Admin aus diesen ENV-Variablen erzeugt:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
  - `ADMIN_DISPLAY_NAME`

Wichtig:

- Der Admin wird nur **einmal initial angelegt**.
- Änderst du später `ADMIN_PASSWORD`, wird ein bereits existierender Admin **nicht automatisch überschrieben**.
- Wenn du den ersten Admin ändern willst, musst du ihn in der DB direkt aktualisieren oder neu initialisieren.

## Lokal entwickeln

```bash
npm install
npm run dev
```

Dann lokal z. B. mit Vercel Dev starten.

## Deployment auf Vercel

### Variante A: über GitHub + Vercel Dashboard

1. Repo zu GitHub pushen
2. In Vercel ein neues Projekt aus dem Repo anlegen
3. ENV-Variablen setzen
4. `schema.sql` in der Datenbank ausführen
5. Deploy starten

### Variante B: mit Vercel CLI

Falls `vercel` lokal installiert und eingeloggt ist:

```bash
vercel
vercel --prod
```

## API-Routen

Vorhandene Routen:

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

## Projektstruktur

```text
api/
  login.js
  logout.js
  session.js
  customers.js
  customers/[id].js
  entries.js
  entries/[id].js
  entries/[id]/shares.js
lib/
  auth.js
  crypto.js
  db.js
  entries.js
  utils.js
schema.sql
vercel.json
index.html
```

## Hinweise für Betrieb

- `VAULT_ENCRYPTION_KEY` nach erstem Produktiveinsatz nicht leichtfertig ändern, sonst werden vorhandene verschlüsselte Vault-Felder unlesbar.
- Nutze ein starkes `ADMIN_PASSWORD`.
- Für Produktion sollten Neon/Vercel-Logs und Zugriffsrechte sauber abgesichert sein.
