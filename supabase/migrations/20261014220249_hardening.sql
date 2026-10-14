-- ═══════════════════════════════════════════════════════════════════════
-- 07 · Hardening (Supabase advisors)
--   Privileged logic lives in the non-exposed `private` schema as SECURITY
--   DEFINER; the API only sees thin SECURITY INVOKER wrappers in `public`.
-- ═══════════════════════════════════════════════════════════════════════

-- ── Free slots ─────────────────────────────────────────────────────────
create or replace function private.available_slots(p_from date, p_to date)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  with cfg as (
    select s.is_enabled, s.lead_time_hours, s.max_days_ahead,
           (now() at time zone 'America/Bogota')::date as today
    from public.booking_settings s where s.id = 1
  ),
  days as (
    select d::date as day
    from cfg, generate_series(
      greatest(p_from, cfg.today),
      least(p_to, greatest(p_from, cfg.today) + 31, cfg.today + cfg.max_days_ahead),
      interval '1 day') d
    where cfg.is_enabled and p_from is not null and p_to is not null
  ),
  windows as (
    select dy.day, e.start_time, e.end_time, e.slot_minutes
    from days dy join public.availability_exceptions e on e.date = dy.day and not e.is_closed
    where not exists (select 1 from public.availability_exceptions c where c.date = dy.day and c.is_closed)
    union all
    select dy.day, r.start_time, r.end_time, r.slot_minutes
    from days dy join public.availability_rules r
      on r.is_active and r.weekday = extract(dow from dy.day)::int
    where not exists (select 1 from public.availability_exceptions x where x.date = dy.day)
  ),
  slots as (
    select (g at time zone 'America/Bogota') as s,
           ((g + make_interval(mins => w.slot_minutes)) at time zone 'America/Bogota') as e
    from windows w,
    generate_series(w.day + w.start_time,
                    w.day + w.end_time - make_interval(mins => w.slot_minutes),
                    make_interval(mins => w.slot_minutes)) g
  )
  select distinct sl.s, sl.e
  from slots sl, cfg
  where sl.s >= now() + make_interval(hours => cfg.lead_time_hours)
    and not exists (
      select 1 from public.bookings b
      where b.status in ('pending', 'confirmed')
        and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(sl.s, sl.e, '[)')
    )
  order by sl.s;
$$;

create or replace function public.get_available_slots(p_from date, p_to date)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$ select * from private.available_slots(p_from, p_to); $$;

-- ── Dashboard stats ────────────────────────────────────────────────────
create or replace function private.dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_month_start timestamptz := date_trunc('month', now() at time zone 'America/Bogota') at time zone 'America/Bogota';
begin
  if not private.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'database_bytes', pg_database_size(current_database()),
    'storage', (select jsonb_build_object(
                  'bytes', coalesce(sum((o.metadata ->> 'size')::bigint), 0),
                  'files', count(*))
                from storage.objects o where o.bucket_id = 'media'),
    'products', (select jsonb_build_object(
                  'total', count(*),
                  'published', count(*) filter (where p.is_published),
                  'sold_out', count(*) filter (where not p.is_available))
                from public.products p),
    'categories', (select count(*) from public.categories),
    'projects', (select count(*) from public.projects),
    'orders', (select jsonb_build_object(
                  'pending', count(*) filter (where o.status in ('pending', 'awaiting_payment')),
                  'to_fulfill', count(*) filter (where o.status in ('paid', 'confirmed')),
                  'month_count', count(*) filter (where o.created_at >= v_month_start and o.status <> 'cancelled'),
                  'month_paid_total', coalesce(sum(o.total) filter (where o.paid_at >= v_month_start), 0))
                from public.orders o),
    'bookings', (select jsonb_build_object(
                  'pending', count(*) filter (where b.status = 'pending' and b.starts_at >= now()),
                  'upcoming', count(*) filter (where b.status in ('pending', 'confirmed') and b.starts_at >= now()))
                from public.bookings b)
  );
end;
$$;

create or replace function public.admin_dashboard_stats()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$ select private.dashboard_stats(); $$;

-- ── Grants ─────────────────────────────────────────────────────────────
-- `private` is never exposed through the API; anon only gets the one function it needs.
grant usage on schema private to anon;
revoke all on function private.available_slots(date, date) from public;
grant execute on function private.available_slots(date, date) to anon, authenticated, service_role;
revoke all on function private.dashboard_stats() from public, anon;
grant execute on function private.dashboard_stats() to authenticated;

-- ── Performance ────────────────────────────────────────────────────────
create index if not exists orders_shipping_zone_idx on public.orders (shipping_zone_id);
