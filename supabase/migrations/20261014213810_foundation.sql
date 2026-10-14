-- ═══════════════════════════════════════════════════════════════════════
-- 01 · Foundation: extensions, private schema, enums, admins, audit log
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists btree_gist with schema extensions;

-- Internal helpers live in "private": it is NOT exposed through the Data API.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

-- New functions in public are not executable by anon/authenticated unless granted explicitly.
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ── Shared trigger: keep updated_at fresh ──────────────────────────────
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── Admins ─────────────────────────────────────────────────────────────
-- One row per back-office user. Users cannot add themselves: only service_role writes here.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- Admin = listed, active AND signed in with MFA (aal2). Enforced in every write policy.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1 from public.admins a
      where a.user_id = (select auth.uid()) and a.is_active
    )
    and coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2';
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;

-- A signed-in admin may read their own row (needed before MFA to know they must enroll/verify).
create policy "admins: read own row"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ── Audit log ──────────────────────────────────────────────────────────
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  table_name text not null,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_created_at_idx on public.audit_log (created_at desc);
alter table public.audit_log enable row level security;

create policy "audit_log: admins read"
  on public.audit_log for select
  to authenticated
  using ((select private.is_admin()));

create or replace function private.audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec_id text;
begin
  rec_id := coalesce(
    (case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'id',
    null
  );
  insert into public.audit_log (actor_id, action, table_name, record_id, old_data, new_data)
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    rec_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;
revoke all on function private.audit() from public, anon, authenticated;

-- ── Table privileges: deny by default, grant explicitly per table later ──
revoke all on public.admins, public.audit_log from anon, authenticated;
grant select on public.admins to authenticated;
grant select on public.audit_log to authenticated;
