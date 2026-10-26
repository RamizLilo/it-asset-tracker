-- IT Asset Tracker: database schema for Supabase
-- Run this whole file once in the Supabase SQL editor (SQL Editor -> New query -> paste -> Run).
-- It is safe to read top to bottom: tables first, then roles, then security rules (RLS).

-- 1) Tables ------------------------------------------------------------------
create table if not exists public.locations (
  id   text primary key,
  name text not null,
  site text not null default ''
);
create unique index if not exists locations_name_uq on public.locations (lower(name));

create table if not exists public.vendors (
  id      text primary key,
  name    text not null,
  contact text not null default '',
  email   text not null default '',
  phone   text not null default '',
  website text not null default ''
);

create table if not exists public.employees (
  id          text primary key,
  name        text not null,
  email       text not null default '',
  department  text not null default '',
  title       text not null default '',
  location_id text references public.locations(id) on delete set null,
  active      boolean not null default true
);

create table if not exists public.assets (
  id                text primary key,
  tag               text not null,
  name              text not null,
  category          text not null check (category in ('laptop','desktop','monitor','phone','tablet','printer','network','server','peripheral','other')),
  manufacturer      text not null default '',
  model             text not null default '',
  serial            text not null default '',
  status            text not null check (status in ('in_use','in_stock','in_repair','retired','lost')),
  condition         text not null default 'good' check (condition in ('new','good','fair','poor')),
  location_id       text references public.locations(id) on delete set null,
  assignee_id       text references public.employees(id) on delete set null,
  vendor_id         text references public.vendors(id) on delete set null,
  purchase_date     date,
  price             numeric(12,2) check (price is null or price >= 0),
  warranty_end      date,
  invoice           text not null default '',
  notes             text not null default '',
  maintenance_every integer not null default 0 check (maintenance_every >= 0),
  created_at        timestamptz not null default now(),
  custom            jsonb not null default '{}'::jsonb,
  check (warranty_end is null or purchase_date is null or warranty_end >= purchase_date)
);
create unique index if not exists assets_tag_uq on public.assets (lower(tag));
create index if not exists assets_assignee_idx on public.assets (assignee_id);
create index if not exists assets_location_idx on public.assets (location_id);

create table if not exists public.maintenance (
  id         text primary key,
  asset_id   text not null references public.assets(id) on delete cascade,
  type       text not null check (type in ('repair','preventive','inspection','upgrade')),
  title      text not null,
  status     text not null check (status in ('scheduled','in_progress','done')),
  due        date not null,
  done_date  date,
  cost       numeric(12,2) not null default 0 check (cost >= 0),
  technician text not null default '',
  notes      text not null default ''
);
create index if not exists maintenance_asset_idx on public.maintenance (asset_id);

create table if not exists public.licenses (
  id            text primary key,
  name          text not null,
  vendor_id     text references public.vendors(id) on delete set null,
  kind          text not null default 'subscription' check (kind in ('subscription','perpetual')),
  seats         integer not null check (seats >= 1),
  cost          numeric(12,2) not null default 0 check (cost >= 0),
  key           text not null default '',
  purchase_date date,
  expiry        date,
  notes         text not null default ''
);

-- who holds a seat of a license (many people per license, many licenses per person)
create table if not exists public.license_seats (
  license_id  text not null references public.licenses(id) on delete cascade,
  employee_id text not null references public.employees(id) on delete cascade,
  primary key (license_id, employee_id)
);

create table if not exists public.consumables (
  id          text primary key,
  name        text not null,
  category    text not null default 'other',
  stock       integer not null default 0 check (stock >= 0),
  reorder_at  integer not null default 0 check (reorder_at >= 0),
  unit        text not null default 'pcs',
  cost        numeric(12,2) not null default 0 check (cost >= 0),
  location_id text references public.locations(id) on delete set null
);

-- the audit log: rows are only added, never changed
create table if not exists public.activity (
  id        text primary key,
  ts        timestamptz not null default now(),
  user_name text not null default '',
  role      text not null default '',
  action    text not null,
  entity    text not null,
  entity_id text not null default '',
  label     text not null default '',
  detail    text not null default ''
);
create index if not exists activity_ts_idx on public.activity (ts desc);

-- company wide settings: always exactly one row
create table if not exists public.settings (
  id                     integer primary key default 1 check (id = 1),
  company                text not null default 'My Company',
  currency               text not null default 'EUR',
  depreciation_years     integer not null default 4 check (depreciation_years >= 1),
  warranty_alert_days    integer not null default 60 check (warranty_alert_days >= 0),
  maintenance_alert_days integer not null default 14 check (maintenance_alert_days >= 0),
  custom_fields          jsonb not null default '[]'::jsonb
);
insert into public.settings (id) values (1) on conflict do nothing;

-- 2) Users and roles ---------------------------------------------------------
-- Supabase keeps logins in auth.users. profiles adds a name and a role to each login.
create table if not exists public.profiles (
  id   uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'viewer' check (role in ('admin','technician','viewer'))
);

-- the first person who signs up becomes admin, everyone after that starts as viewer
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id,
          coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1)),
          case when exists (select 1 from public.profiles) then 'viewer' else 'admin' end);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- role of the person who is logged in right now
create or replace function public.app_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- 3) Security rules (Row Level Security) -------------------------------------
-- Without these rules anybody with the public key could read the data.
-- viewer: read only. technician: read, add, change. admin: everything, including delete.
do $$
declare t text;
begin
  foreach t in array array['locations','vendors','employees','assets','maintenance','licenses','license_seats','consumables'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "read" on public.%I', t);
    execute format('drop policy if exists "add" on public.%I', t);
    execute format('drop policy if exists "change" on public.%I', t);
    execute format('drop policy if exists "remove" on public.%I', t);
    execute format('create policy "read" on public.%I for select to authenticated using (true)', t);
    execute format('create policy "add" on public.%I for insert to authenticated with check (public.app_role() in (''admin'',''technician''))', t);
    execute format('create policy "change" on public.%I for update to authenticated using (public.app_role() in (''admin'',''technician'')) with check (public.app_role() in (''admin'',''technician''))', t);
    execute format('create policy "remove" on public.%I for delete to authenticated using (public.app_role() = ''admin'')', t);
  end loop;
end $$;

alter table public.activity enable row level security;
drop policy if exists "read" on public.activity;  drop policy if exists "add" on public.activity;  drop policy if exists "remove" on public.activity;
create policy "read"   on public.activity for select to authenticated using (true);
create policy "add"    on public.activity for insert to authenticated with check (public.app_role() in ('admin','technician'));
create policy "remove" on public.activity for delete to authenticated using (public.app_role() = 'admin');

alter table public.settings enable row level security;
drop policy if exists "read" on public.settings;  drop policy if exists "change" on public.settings;
create policy "read"   on public.settings for select to authenticated using (true);
create policy "change" on public.settings for update to authenticated using (public.app_role() = 'admin') with check (public.app_role() = 'admin');

alter table public.profiles enable row level security;
drop policy if exists "read" on public.profiles;  drop policy if exists "change" on public.profiles;
create policy "read"   on public.profiles for select to authenticated using (true);
create policy "change" on public.profiles for update to authenticated using (public.app_role() = 'admin') with check (public.app_role() = 'admin');

-- logged-out visitors (anon) get nothing
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
