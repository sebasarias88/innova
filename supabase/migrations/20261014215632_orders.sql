-- ═══════════════════════════════════════════════════════════════════════
-- 04 · Orders, order items, payment events + server-only RPCs
-- Orders are NEVER inserted directly by clients. The Next.js server (after captcha +
-- rate limit) calls public.create_order() with the secret key; prices come from the DB.
-- ═══════════════════════════════════════════════════════════════════════

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity (start with 1001) unique,
  reference text not null unique check (char_length(reference) <= 40),
  status text not null default 'pending'
    check (status in ('pending', 'awaiting_payment', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null check (payment_method in ('wompi', 'whatsapp')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'approved', 'declined', 'voided', 'error', 'not_applicable')),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_phone text not null check (customer_phone ~ '^\+?[0-9]{7,15}$'),
  customer_email text check (customer_email is null or (char_length(customer_email) <= 160 and customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  customer_document text check (char_length(customer_document) <= 20),
  city text not null check (char_length(city) between 2 and 80),
  address text check (char_length(address) <= 200),
  notes text check (char_length(notes) <= 500),
  shipping_zone_id uuid references public.shipping_zones (id) on delete set null,
  shipping_zone_name text not null check (char_length(shipping_zone_name) <= 80),
  shipping_cost bigint check (shipping_cost is null or shipping_cost >= 0),  -- NULL = a convenir
  subtotal bigint not null check (subtotal >= 0),
  total bigint not null check (total >= 0),
  currency text not null default 'COP' check (currency = 'COP'),
  wompi_transaction_id text check (char_length(wompi_transaction_id) <= 80),
  paid_at timestamptz,
  internal_notes text check (char_length(internal_notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null check (char_length(product_name) <= 140),
  product_slug text check (char_length(product_slug) <= 160),
  unit_price bigint not null check (unit_price >= 0),
  quantity int not null check (quantity between 1 and 99),
  line_total bigint not null check (line_total >= 0)
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- Raw log of every payment notification (idempotent: same transaction+status only once).
create table public.payment_events (
  id bigint generated always as identity primary key,
  provider text not null default 'wompi',
  event text not null check (char_length(event) <= 60),
  transaction_id text not null check (char_length(transaction_id) <= 80),
  reference text check (char_length(reference) <= 40),
  status text not null check (char_length(status) <= 30),
  amount_in_cents bigint,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  unique (provider, transaction_id, status)
);
create index payment_events_reference_idx on public.payment_events (reference);

create trigger orders_updated_at before update on public.orders for each row execute function private.set_updated_at();
create trigger orders_audit after update or delete on public.orders for each row execute function private.audit();

-- ── RLS: admins read/manage; nobody inserts directly ───────────────────
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;

create policy "orders: admin read" on public.orders for select to authenticated using ((select private.is_admin()));
create policy "orders: admin update" on public.orders for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "order_items: admin read" on public.order_items for select to authenticated using ((select private.is_admin()));
create policy "payment_events: admin read" on public.payment_events for select to authenticated using ((select private.is_admin()));

grant select on public.orders, public.order_items, public.payment_events to authenticated;
-- Admins may only change workflow fields, never amounts, customer data or payment results.
grant update (status, internal_notes, shipping_cost) on public.orders to authenticated;

-- ── create_order: validates everything, prices from the DB ─────────────
create or replace function public.create_order(
  p_customer jsonb,
  p_items jsonb,
  p_shipping_zone_id uuid,
  p_payment_method text
)
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
    shipping_zone_id, shipping_zone_name, shipping_cost, subtotal, total
  ) values (
    'INN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
    case when p_payment_method = 'wompi' then 'awaiting_payment' else 'pending' end,
    p_payment_method,
    case when p_payment_method = 'wompi' then 'pending' else 'not_applicable' end,
    v_name, v_phone, v_email, nullif(btrim(p_customer ->> 'document'), ''), v_city, v_address,
    nullif(btrim(p_customer ->> 'notes'), ''),
    v_zone.id, v_zone.name, v_zone.price, 0, 0
  )
  returning * into v_order;

  -- Merge duplicated products; only published + available products are accepted.
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

  -- Every requested product must exist and be sellable.
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

-- ── apply_payment_event: called by the webhook AFTER the signature is verified ──
create or replace function public.apply_payment_event(
  p_event text,
  p_transaction_id text,
  p_reference text,
  p_status text,
  p_amount_in_cents bigint,
  p_payload jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_inserted int;
  v_payment_status text;
begin
  insert into public.payment_events (event, transaction_id, reference, status, amount_in_cents, payload)
  values (p_event, p_transaction_id, p_reference, p_status, p_amount_in_cents, p_payload)
  on conflict (provider, transaction_id, status) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return 'duplicate';
  end if;

  select * into v_order from public.orders where reference = p_reference for update;
  if not found then
    return 'order_not_found';
  end if;

  -- The amount paid must match exactly what the DB says the order costs.
  if p_amount_in_cents is distinct from v_order.total * 100 then
    update public.orders set payment_status = 'error',
           internal_notes = left(coalesce(internal_notes || E'\n', '') || 'Monto pagado no coincide: ' || p_amount_in_cents, 1000)
     where id = v_order.id;
    return 'amount_mismatch';
  end if;

  v_payment_status := case upper(p_status)
    when 'APPROVED' then 'approved'
    when 'DECLINED' then 'declined'
    when 'VOIDED' then 'voided'
    when 'ERROR' then 'error'
    else 'pending'
  end;

  -- Never downgrade an order that is already paid.
  if v_order.payment_status = 'approved' and v_payment_status <> 'voided' then
    return 'already_paid';
  end if;

  update public.orders
     set payment_status = v_payment_status,
         wompi_transaction_id = p_transaction_id,
         status = case
                    when v_payment_status = 'approved' then 'paid'
                    when v_payment_status = 'voided' then 'cancelled'
                    else status
                  end,
         paid_at = case when v_payment_status = 'approved' then now() else paid_at end
   where id = v_order.id;

  return 'ok';
end;
$$;
revoke all on function public.apply_payment_event(text, text, text, text, bigint, jsonb) from public, anon, authenticated;
grant execute on function public.apply_payment_event(text, text, text, text, bigint, jsonb) to service_role;

-- ── Public order lookup for the confirmation page (server-only) ────────
create or replace function public.get_order_by_reference(p_reference text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'order_number', o.order_number,
    'reference', o.reference,
    'status', o.status,
    'payment_method', o.payment_method,
    'payment_status', o.payment_status,
    'customer_name', o.customer_name,
    'shipping_zone_name', o.shipping_zone_name,
    'shipping_cost', o.shipping_cost,
    'subtotal', o.subtotal,
    'total', o.total,
    'created_at', o.created_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object('name', i.product_name, 'quantity', i.quantity, 'unit_price', i.unit_price, 'line_total', i.line_total))
      from public.order_items i where i.order_id = o.id
    ), '[]'::jsonb)
  )
  from public.orders o
  where o.reference = p_reference;
$$;
revoke all on function public.get_order_by_reference(text) from public, anon, authenticated;
grant execute on function public.get_order_by_reference(text) to service_role;
