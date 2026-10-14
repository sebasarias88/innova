-- ═══════════════════════════════════════════════════════════════════════
-- 05 · Bookings (service scheduling)
--   · availability_rules      weekly schedule managed by the admin
--   · availability_exceptions closed days / special hours for a date
--   · booking_settings        lead time, max days ahead (single row)
--   · bookings                customer requests; overlap blocked by an
--                             exclusion constraint (no double booking)
--   · get_available_slots()   public, returns ONLY free time slots (no PII)
--   · create_booking()        server-only (service_role), re-validates slot
-- All times are interpreted in America/Bogota.
-- ═══════════════════════════════════════════════════════════════════════

-- ── Weekly availability ────────────────────────────────────────────────
create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),  -- 0 = domingo … 6 = sábado
  start_time time not null,
  end_time time not null,
  slot_minutes int not null default 60 check (slot_minutes between 15 and 480),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index availability_rules_weekday_idx on public.availability_rules (weekday) where is_active;

-- ── Date exceptions (holidays, closed days, special hours) ─────────────
create table public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  is_closed boolean not null default true,
  start_time time,
  end_time time,
  slot_minutes int not null default 60 check (slot_minutes between 15 and 480),
  note text check (char_length(note) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (is_closed or (start_time is not null and end_time is not null and end_time > start_time))
);
create index availability_exceptions_date_idx on public.availability_exceptions (date);

-- ── Booking settings (single row) ──────────────────────────────────────
create table public.booking_settings (
  id smallint primary key default 1 check (id = 1),
  is_enabled boolean not null default true,
  lead_time_hours int not null default 12 check (lead_time_hours between 0 and 336),
  max_days_ahead int not null default 45 check (max_days_ahead between 1 and 180),
  updated_at timestamptz not null default now()
);
insert into public.booking_settings (id) values (1);

-- ── Bookings ───────────────────────────────────────────────────────────
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number int generated always as identity (start with 1001) unique,
  service_slug text not null check (service_slug in
    ('cctv', 'energia-solar', 'automatizacion-de-puertas', 'domotica', 'ups', 'servicios-informaticos')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_phone text not null check (customer_phone ~ '^\+?[0-9]{7,15}$'),
  customer_email text check (customer_email is null or (char_length(customer_email) <= 160 and customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  city text not null check (char_length(city) between 2 and 80),
  address text check (char_length(address) <= 200),
  notes text check (char_length(notes) <= 500),
  internal_notes text check (char_length(internal_notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  constraint bookings_no_overlap exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending', 'confirmed'))
);
create index bookings_starts_idx on public.bookings (starts_at);
create index bookings_status_idx on public.bookings (status, starts_at);

-- Default schedule: Mon–Fri 8:00–12:00 and 14:00–18:00, Sat 8:00–12:00 (editable in the admin)
insert into public.availability_rules (weekday, start_time, end_time, slot_minutes)
select d, t.s, t.e, 60
from generate_series(1, 5) d
cross join (values (time '08:00', time '12:00'), (time '14:00', time '18:00')) t(s, e)
union all
select 6, time '08:00', time '12:00', 60;

-- ── Triggers ───────────────────────────────────────────────────────────
create trigger availability_rules_updated_at before update on public.availability_rules for each row execute function private.set_updated_at();
create trigger availability_exceptions_updated_at before update on public.availability_exceptions for each row execute function private.set_updated_at();
create trigger booking_settings_updated_at before update on public.booking_settings for each row execute function private.set_updated_at();
create trigger bookings_updated_at before update on public.bookings for each row execute function private.set_updated_at();
create trigger availability_rules_audit after insert or update or delete on public.availability_rules for each row execute function private.audit();
create trigger availability_exceptions_audit after insert or update or delete on public.availability_exceptions for each row execute function private.audit();
create trigger booking_settings_audit after update on public.booking_settings for each row execute function private.audit();
create trigger bookings_audit after update or delete on public.bookings for each row execute function private.audit();

-- ── RLS: admin only (the public reads free slots through the function) ──
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.booking_settings enable row level security;
alter table public.bookings enable row level security;

create policy "availability_rules: admin all" on public.availability_rules for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "availability_exceptions: admin all" on public.availability_exceptions for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "booking_settings: admin read" on public.booking_settings for select to authenticated
  using ((select private.is_admin()));
create policy "booking_settings: admin update" on public.booking_settings for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "bookings: admin read" on public.bookings for select to authenticated
  using ((select private.is_admin()));
create policy "bookings: admin update" on public.bookings for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

grant select, insert, update, delete on public.availability_rules, public.availability_exceptions to authenticated;
grant select, update on public.booking_settings to authenticated;
grant select on public.bookings to authenticated;
-- the admin can only change workflow columns, never the customer data or the time slot
grant update (status, internal_notes) on public.bookings to authenticated;

-- ── Free slots (public, no personal data) ──────────────────────────────
create or replace function public.get_available_slots(p_from date, p_to date)
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
    -- special hours for that date replace the weekly rules
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
revoke all on function public.get_available_slots(date, date) from public;
grant execute on function public.get_available_slots(date, date) to anon, authenticated, service_role;

-- ── Create booking (server only) ───────────────────────────────────────
create or replace function public.create_booking(p_customer jsonb, p_service_slug text, p_starts_at timestamptz)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day date;
  v_end timestamptz;
  v_id uuid;
  v_number int;
begin
  if p_customer is null or jsonb_typeof(p_customer) <> 'object' or p_starts_at is null then
    raise exception 'invalid_input';
  end if;

  v_day := (p_starts_at at time zone 'America/Bogota')::date;
  select s.ends_at into v_end
  from public.get_available_slots(v_day, v_day) s
  where s.starts_at = p_starts_at;
  if v_end is null then
    raise exception 'slot_unavailable';
  end if;

  begin
    insert into public.bookings (service_slug, starts_at, ends_at, customer_name, customer_phone,
                                 customer_email, city, address, notes)
    values (
      p_service_slug, p_starts_at, v_end,
      btrim(p_customer ->> 'name'),
      regexp_replace(coalesce(p_customer ->> 'phone', ''), '[\s\-()]', '', 'g'),
      nullif(lower(btrim(p_customer ->> 'email')), ''),
      btrim(p_customer ->> 'city'),
      nullif(btrim(p_customer ->> 'address'), ''),
      nullif(btrim(p_customer ->> 'notes'), '')
    )
    returning id, booking_number into v_id, v_number;
  exception when exclusion_violation then
    raise exception 'slot_unavailable';
  end;

  return jsonb_build_object('id', v_id, 'booking_number', v_number,
                            'starts_at', p_starts_at, 'ends_at', v_end, 'service_slug', p_service_slug);
end;
$$;
revoke all on function public.create_booking(jsonb, text, timestamptz) from public, anon, authenticated;
grant execute on function public.create_booking(jsonb, text, timestamptz) to service_role;
