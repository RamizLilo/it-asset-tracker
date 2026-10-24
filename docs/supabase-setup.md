# Supabase setup (live mode)

Without any setup the app runs in **demo mode**: the data stays in the browser. With Supabase it runs in **live mode**: a login, a real database, and roles that the database itself enforces.

## 1. Create the project
1. Go to supabase.com, sign in, **New project**. Choose a name, a strong database password (save it) and the region closest to you (for example Frankfurt).
2. Wait until the project is ready (about 2 minutes).

## 2. Create the tables
1. Open **SQL Editor**, then **New query**.
2. Paste the whole content of `supabase/schema.sql` and press **Run**. It should end with "Success". It can be run again without harm.

## 3. Turn off e-mail confirmation (for a portfolio demo)
**Authentication**, then **Sign In / Providers**, then **Email**: switch off "Confirm email". Otherwise every new account has to click a link first.

## 4. Connect the app
1. **Project Settings**, then **API**. Copy the **Project URL** and the **anon public** key.
2. Copy `.env.local.example` to `.env.local` and paste both values. Never paste the `service_role` key anywhere in this project.
3. Restart `npm run dev`. The login screen appears.

## 5. First use
1. Click "Create account". **The first account becomes administrator**, all later accounts start as viewers.
2. Go to Settings, then "Restore demo data" to fill the database with the demo company (or start empty with "Delete all data").
3. As admin you can change the role of other accounts in Settings, "Users and roles".

## 6. Vercel
In the Vercel project: **Settings**, then **Environment Variables**. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then redeploy. In Supabase, **Authentication**, then **URL Configuration**: set the Site URL to your Vercel address.

## How the data is stored
- One table per kind of thing: `assets`, `employees`, `locations`, `vendors`, `maintenance`, `licenses`, `consumables`, `activity`, plus `license_seats` (who has a seat of which license), `settings` (one row) and `profiles` (name and role of each login).
- Tables point to each other with foreign keys (an asset has a `location_id`, an `assignee_id` and a `vendor_id`). Deleting an asset also deletes its maintenance rows.
- Rules in the database (checks and unique indexes) stop wrong data: negative prices, unknown statuses, two assets with the same tag.
- **Row Level Security** decides who may do what, inside the database: viewers can only read, technicians can add and change, only admins can delete and change settings or roles. Logged-out visitors get nothing.
- The app keeps a copy of the data in memory and, after every change, sends only the difference to the database (`lib/db.js`).
