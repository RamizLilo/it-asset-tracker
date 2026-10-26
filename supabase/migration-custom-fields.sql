-- Run once in the Supabase SQL Editor if your database was created before custom fields existed.
-- New projects get these columns from schema.sql already. Safe to run more than once.
alter table public.assets   add column if not exists custom        jsonb not null default '{}'::jsonb;
alter table public.settings add column if not exists custom_fields jsonb not null default '[]'::jsonb;
