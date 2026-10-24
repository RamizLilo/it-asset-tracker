# IT Asset & Inventory Tracker

A web app for an IT team to keep track of company devices: who has what, where it is, how old it is, when the warranty ends and what maintenance is due. The demo data belongs to a made-up company, so it can be tried without any account.

## Features
- **Dashboard** with key numbers, charts and alerts (warranty ending, maintenance due, devices with people who left)
- **Assets:** search, filters, sorting, column picker, table and card view, bulk changes, CSV import and export, check out / check in, duplicate, history per device
- **Asset detail:** purchase price, book value (straight-line depreciation), warranty, maintenance, notes, QR label
- **Employees, locations, vendors** with the devices and spending linked to each
- **Maintenance:** open, overdue and done work with costs
- **Licenses:** seats, who uses a seat, expiry
- **Consumables:** stock with reorder level and quick +/-
- **QR labels:** pick devices and print an A4 sheet
- **Reports:** by department, cost by category, warranty, depreciation and replacement, maintenance cost, idle devices (CSV or print)
- **Activity log:** every change with user and time
- **Settings:** company, currency, depreciation years, alert days, JSON backup and restore
- **Roles** (Admin, Technician, Viewer), **English / German**, **light / dark**, command palette (Ctrl+K), keyboard jumps (g then a, d, e, m, l, r)

## Tech
Next.js (App Router), React, Tailwind CSS, Recharts, qrcode. Data is saved in the browser (localStorage). There is a single data layer (`lib/store.jsx` and `lib/reducer.js`), so a database such as Supabase can replace it later.

## Run locally
```
npm install
npm run dev
```
Open http://localhost:3000. To start again with the demo data: Settings, then "Restore demo data".

## Notes
- All names, companies and prices in the demo data are made up.
- Roles in this version only change what the interface allows; there is no login yet.
