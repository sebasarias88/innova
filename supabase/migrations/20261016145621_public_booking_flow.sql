-- ═══════════════════════════════════════════════════════════════════════
-- 10 · Public booking flow
--   · bookings.reference: code shown to customers (the sequential number
--     stays internal, like orders)
--   · booking_settings.auto_confirm: bookings made on the web are confirmed
--     right away (the slot is free by construction); owners can turn it off
--   · create_booking() returns the reference and applies auto_confirm
-- ═══════════════════════════════════════════════════════════════════════
alter table public.bookings
  add column reference text not null unique
    default ('AGD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)))
    check (char_length(reference) <= 40);

alter table public.booking_settings
  add column auto_confirm boolean not null default true;

create or replace function public.create_booking(p_customer jsonb, p_service_slug text, p_starts_at timestamptz)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day date;
  v_end timestamptz;
  v_auto boolean;
  v_booking public.bookings%rowtype;
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

  select auto_confirm into v_auto from public.booking_settings where id = 1;

  begin
    insert into public.bookings (service_slug, starts_at, ends_at, status, customer_name, customer_phone,
                                 customer_email, city, address, notes)
    values (
      p_service_slug, p_starts_at, v_end,
      case when coalesce(v_auto, true) then 'confirmed' else 'pending' end,
      btrim(p_customer ->> 'name'),
      regexp_replace(coalesce(p_customer ->> 'phone', ''), '[\s\-()]', '', 'g'),
      nullif(lower(btrim(p_customer ->> 'email')), ''),
      btrim(p_customer ->> 'city'),
      nullif(btrim(p_customer ->> 'address'), ''),
      nullif(btrim(p_customer ->> 'notes'), '')
    )
    returning * into v_booking;
  exception when exclusion_violation then
    raise exception 'slot_unavailable';
  end;

  return jsonb_build_object(
    'id', v_booking.id,
    'reference', v_booking.reference,
    'status', v_booking.status,
    'starts_at', v_booking.starts_at,
    'ends_at', v_booking.ends_at,
    'service_slug', v_booking.service_slug
  );
end;
$$;
revoke all on function public.create_booking(jsonb, text, timestamptz) from public, anon, authenticated;
grant execute on function public.create_booking(jsonb, text, timestamptz) to service_role;
