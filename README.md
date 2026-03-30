# VaultDesk

Ein einfacher clientseitiger Passwort-Manager zum Verwalten von Kundenkonten und freigegebenen Zugangsdaten.

## Funktionen

- Admin-Login
- Kundenkonten anlegen
- Einträge mit Passwort, Login und Info erstellen
- Einträge gezielt für bestimmte Kunden freigeben
- Kunden sehen nur ihre freigegebenen Einträge
- Zugangsdaten direkt kopierbar
- Daten werden lokal im Browser gespeichert

## Standard-Admin

- Benutzername: `admin`
- Passwort: `frederikerns720`

## Wichtiger Hinweis

Diese Version ist **nur eine lokale/clientseitige Demo**.
Für echte sichere Nutzung im Internet brauchst du:

- ein echtes Backend
- verschlüsselte Speicherung
- sichere Session-Logik
- Hashing für Passwörter
- Rechteprüfung serverseitig

## Deployment

Die App kann als statische Website deployed werden, speichert aber in dieser Version nur lokal im Browser (`localStorage`).
