-- ═══════════════════════════════════════════════════════════════════════
-- 12 · Proof of consent (Ley 1581 de 2012 / Decreto 1377 de 2013)
--   Every order and booking stores which version of the privacy policy the
--   customer accepted and when. The server actions (the only callers of these
--   service-role RPCs) refuse to continue without the consent checkbox.
-- ═══════════════════════════════════════════════════════════════════════
alter table public.orders
  add column privacy_version text check (char_length(privacy_version) <= 20),
  add column privacy_accepted_at timestamptz;
alter table public.bookings
  add column privacy_version text check (char_length(privacy_version) <= 20),
  add column privacy_accepted_at timestamptz;

create or replace function public.create_order(p_customer jsonb, p_items jsonb, p_shipping_zone_id uuid, p_payment_method text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_zone public.shipping_zones%rowtype;
  v_order public.orders%rowtype;
  v_item record;
  v_subtotal bigint := 0;
  v_count int;
  v_name text := btrim(p_customer ->> 'name');
  v_phone text := regexp_replace(coalesce(p_customer ->> 'phone', ''), '[\s\-()]', '', 'g');
  v_email text := nullif(btrim(lower(p_customer ->> 'email')), '');
  v_city text := btrim(p_customer ->> 'city');
  v_address text := nullif(btrim(p_customer ->> 'address'), '');
  v_privacy text := nullif(btrim(p_customer ->> 'privacy_version'), '');
begin
  if p_payment_method not in ('wompi', 'whatsapp') then
    raise exception 'invalid_payment_method' using errcode = '22023';
  end if;
  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'invalid_items' using errcode = '22023';
  end if;
  select count(*) into v_count from jsonb_array_elements(p_items);
  if v_count = 0 or v_count > 50 then
    raise exception 'invalid_items_count' using errcode = '22023';
  end if;

  select * into v_zone from public.shipping_zones where id = p_shipping_zone_id and is_active;
  if not found then
    raise exception 'invalid_shipping_zone' using errcode = '22023';
  end if;
  if not v_zone.is_pickup and v_address is null then
    raise exception 'address_required' using errcode = '22023';
  end if;

  insert into public.orders (
    reference, status, payment_method, payment_status,
    customer_name, customer_phone, customer_email, customer_document, city, address, notes,
    shipping_zone_id, shipping_zone_name, shipping_cost, subtotal, total,
    privacy_version, privacy_accepted_at
  ) values (
    'INN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
    case when p_payment_method = 'wompi' then 'awaiting_payment' else 'pending' end,
    p_payment_method,
    case when p_payment_method = 'wompi' then 'pending' else 'not_applicable' end,
    v_name, v_phone, v_email, nullif(btrim(p_customer ->> 'document'), ''), v_city, v_address,
    nullif(btrim(p_customer ->> 'notes'), ''),
    v_zone.id, v_zone.name, v_zone.price, 0, 0,
    v_privacy, case when v_privacy is not null then now() end
  )
  returning * into v_order;

  for v_item in
    select p.id, p.name, p.slug, p.price, sum((i ->> 'quantity')::int) as qty
    from jsonb_array_elements(p_items) as i
    join public.products p on p.id = (i ->> 'product_id')::uuid
    where p.is_published and p.is_available
    group by p.id, p.name, p.slug, p.price
  loop
    if v_item.qty < 1 or v_item.qty > 99 then
      raise exception 'invalid_quantity' using errcode = '22023';
    end if;
    insert into public.order_items (order_id, product_id, product_name, product_slug, unit_price, quantity, line_total)
    values (v_order.id, v_item.id, v_item.name, v_item.slug, v_item.price, v_item.qty, v_item.price * v_item.qty);
    v_subtotal := v_subtotal + v_item.price * v_item.qty;
  end loop;

  if (select count(distinct (i ->> 'product_id')) from jsonb_array_elements(p_items) i)
     <> (select count(*) from public.order_items where order_id = v_order.id) then
    raise exception 'product_unavailable' using errcode = '22023';
  end if;

  update public.orders
     set subtotal = v_subtotal,
         total = v_subtotal + coalesce(v_zone.price, 0)
   where id = v_order.id
  returning * into v_order;

  return jsonb_build_object(
    'id', v_order.id,
    'order_number', v_order.order_number,
    'reference', v_order.reference,
    'subtotal', v_order.subtotal,
    'shipping_cost', v_order.shipping_cost,
    'total', v_order.total,
    'amount_in_cents', v_order.total * 100,
    'currency', v_order.currency
  );
end;
$$;
revoke all on function public.create_order(jsonb, jsonb, uuid, text) from public, anon, authenticated;
grant execute on function public.create_order(jsonb, jsonb, uuid, text) to service_role;

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
  v_privacy text := nullif(btrim(p_customer ->> 'privacy_version'), '');
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
                                 customer_email, city, address, notes, privacy_version, privacy_accepted_at)
    values (
      p_service_slug, p_starts_at, v_end,
      case when coalesce(v_auto, false) then 'confirmed' else 'pending' end,
      btrim(p_customer ->> 'name'),
      regexp_replace(coalesce(p_customer ->> 'phone', ''), '[\s\-()]', '', 'g'),
      nullif(lower(btrim(p_customer ->> 'email')), ''),
      btrim(p_customer ->> 'city'),
      nullif(btrim(p_customer ->> 'address'), ''),
      nullif(btrim(p_customer ->> 'notes'), ''),
      v_privacy, case when v_privacy is not null then now() end
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
