# IT Asset & Inventory Tracker

Eine Web-App für IT-Teams, um Firmengeräte im Blick zu behalten: wer was hat, wo es steht, wie alt es ist, wann die Garantie endet und welche Wartung fällig ist. Die Demodaten gehören zu einer erfundenen Firma, die App lässt sich also ohne Konto ausprobieren.

## Live
- **Demo (ohne Login, Daten bleiben im Browser):** https://it-asset-tracker-seven.vercel.app
- **Version mit Datenbank und Login (Supabase):** https://it-asset-tracker-pjz3.vercel.app
- Quellcode: https://github.com/RamizLilo/it-asset-tracker

![Übersicht](docs/screenshot-dashboard.png)

## Funktionen
- **Übersicht** mit Kennzahlen, Diagrammen und Hinweisen (Garantie läuft ab, Wartung fällig, Geräte bei ausgeschiedenen Personen)
- **Geräte:** Suche, Filter, Sortierung, Spaltenauswahl, Tabellen- und Kartenansicht, Sammeländerungen, CSV-Import und -Export, Ausgeben und Zurücknehmen, Duplizieren, Verlauf je Gerät
- **Gerätedetail:** Kaufpreis, Buchwert (lineare Abschreibung), Garantie, Wartung, Notizen, QR-Etikett
- **Mitarbeitende, Standorte, Lieferanten** mit den zugehörigen Geräten und Ausgaben
- **Wartung:** offene, überfällige und erledigte Arbeiten mit Kosten
- **Lizenzen:** Plätze, wer einen Platz nutzt, Ablaufdatum
- **Verbrauchsmaterial:** Bestand mit Meldebestand und schnellem +/-
- **QR-Etiketten:** Geräte wählen und einen A4-Bogen drucken
- **Berichte:** nach Abteilung, Kosten nach Kategorie, Garantie, Abschreibung und Ersatz, Wartungskosten, ungenutzte Geräte (CSV oder Druck)
- **Aktivitätsprotokoll:** jede Änderung mit Benutzer und Zeit
- **Einstellungen:** Firma, Währung, Abschreibungsjahre, Hinweistage, JSON-Sicherung und Wiederherstellung
- **Rollen** (Administrator, Techniker, Leser), **Deutsch / Englisch**, **hell / dunkel**, Befehlspalette (Strg+K), Tastatursprünge (g, dann a, d, e, m, l, r)

## Technik
Next.js (App Router), React, Tailwind CSS, Recharts, qrcode. Die Daten werden im Browser gespeichert (localStorage). Es gibt eine zentrale Datenschicht (`lib/store.jsx` und `lib/reducer.js`), sodass später eine Datenbank wie Supabase eingesetzt werden kann.

## Datenbank (optional)
Standardmäßig läuft die App im Demo-Modus (Daten im Browser). Für eine echte Datenbank mit Login und Rollen siehe `docs/supabase-setup.md`. Das Schema steht in `supabase/schema.sql`, die Sicherheitsregeln (Row Level Security) sind darin enthalten.

## Lokal starten
```
npm install
npm run dev
```
Dann http://localhost:3000 öffnen. Zurück zu den Demodaten: Einstellungen, dann „Demodaten wiederherstellen“.

## Hinweise
- Alle Namen, Firmen und Preise in den Demodaten sind erfunden.
- Demo-Modus: Die Rollen steuern nur, was die Oberfläche erlaubt. Live-Modus: Login über Supabase, die Rollen werden in der Datenbank erzwungen (Row Level Security).
