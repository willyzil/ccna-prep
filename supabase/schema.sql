-- Per-user storage for signed-in visitors of the CCNA Exam Sim.
-- Applied to the self-hosted Supabase on aiserver; safe to re-run.
--
-- Every table is keyed by the owner's auth user id, and row-level security
-- lets a signed-in user read and write only their own rows. Visitors who are
-- not signed in (the "anon" role) get no access at all. Deleting the auth
-- user deletes everything they saved.

-- ---------------------------------------------------------------- tables

create table if not exists public.ccna_attempts (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id         text not null check (id ~ '^[A-Za-z0-9]{6,40}$'),
  status     text not null default 'active' check (length(status) <= 20),
  data       jsonb not null check (pg_column_size(data) <= 2097152),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.ccna_flags (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  qid        text not null check (length(qid) between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, qid)
);

create table if not exists public.ccna_study (
  user_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  progress   jsonb not null default '{}'::jsonb check (pg_column_size(progress) <= 65536),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- triggers

create or replace function public.ccna_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists ccna_attempts_touch on public.ccna_attempts;
create trigger ccna_attempts_touch before update on public.ccna_attempts
  for each row execute function public.ccna_touch_updated_at();

drop trigger if exists ccna_study_touch on public.ccna_study;
create trigger ccna_study_touch before update on public.ccna_study
  for each row execute function public.ccna_touch_updated_at();

-- Caps per user, so one account cannot fill the disk.
create or replace function public.ccna_row_cap()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  cap int := tg_argv[0]::int;
  n int;
begin
  execute format('select count(*) from %I.%I where user_id = $1', tg_table_schema, tg_table_name)
    into n using new.user_id;
  if n >= cap then
    raise exception 'limit of % rows reached', cap using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists ccna_attempts_cap on public.ccna_attempts;
create trigger ccna_attempts_cap before insert on public.ccna_attempts
  for each row execute function public.ccna_row_cap('1000');

drop trigger if exists ccna_flags_cap on public.ccna_flags;
create trigger ccna_flags_cap before insert on public.ccna_flags
  for each row execute function public.ccna_row_cap('5000');

-- ---------------------------------------------------------------- access

alter table public.ccna_attempts enable row level security;
alter table public.ccna_flags enable row level security;
alter table public.ccna_study enable row level security;

-- Supabase's default grants give every API role everything (TRUNCATE ignores
-- row-level security); keep only the four verbs, and only for signed-in users.
revoke all on public.ccna_attempts, public.ccna_flags, public.ccna_study from anon, authenticated;
grant select, insert, update, delete on public.ccna_attempts, public.ccna_flags, public.ccna_study to authenticated;

drop policy if exists "owner only" on public.ccna_attempts;
create policy "owner only" on public.ccna_attempts for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.ccna_flags;
create policy "owner only" on public.ccna_flags for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "owner only" on public.ccna_study;
create policy "owner only" on public.ccna_study for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------- account deletion

-- Lets a signed-in user delete their own account; the cascades above remove
-- their saved data with it.
create or replace function public.ccna_delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not signed in' using errcode = 'insufficient_privilege';
  end if;
  delete from auth.users where id = me;
end;
$$;

revoke all on function public.ccna_delete_account() from public, anon;
grant execute on function public.ccna_delete_account() to authenticated;

-- Internal helpers are not callable through the API.
revoke all on function public.ccna_touch_updated_at() from public, anon, authenticated;
revoke all on function public.ccna_row_cap() from public, anon, authenticated;
