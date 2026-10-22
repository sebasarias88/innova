-- ═══════════════════════════════════════════════════════════════════════
-- 14 · Product variants (e.g. "Cámara Ranger" → 3 MP / 5 MP)
--   One product, shared photos and description; each variant has its own
--   name, price, previous price, SKU and availability.
--   Additive only: products without variants keep working exactly as before.
--   products.price / compare_at_price / is_available become a summary of the
--   variants (cheapest available one), so listings, sorting and search need no
--   changes; price_max lets the cards say "Desde".
-- ═══════════════════════════════════════════════════════════════════════
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  highlight text check (char_length(highlight) <= 120),
  sku text unique check (char_length(sku) <= 60),
  price bigint not null check (price >= 0 and price <= 1000000000),
  compare_at_price bigint check (compare_at_price is null or compare_at_price > price),
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_variants_product_idx on public.product_variants (product_id, sort_order);

alter table public.products
  add column variant_count int not null default 0 check (variant_count >= 0),
  add column price_max bigint check (price_max is null or price_max >= 0);

-- Before any product update: when it has variants, its price and availability
-- are always recomputed from them (nobody can set an inconsistent price).
create or replace function private.products_apply_variants()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
  v_cheapest record;
begin
  select count(*) into v_count from public.product_variants where product_id = new.id;
  new.variant_count := v_count;
  if v_count = 0 then
    new.price_max := null;
    return new;
  end if;
  -- Cheapest available variant; when all are sold out, the cheapest one.
  select v.price, v.compare_at_price into v_cheapest
    from public.product_variants v
   where v.product_id = new.id
   order by v.is_available desc, v.price, v.sort_order
   limit 1;
  new.price := v_cheapest.price;
  new.compare_at_price := v_cheapest.compare_at_price;
  select max(price), bool_or(is_available) into new.price_max, new.is_available
    from public.product_variants where product_id = new.id;
  return new;
end;
$$;
create trigger products_apply_variants before update on public.products
  for each row execute function private.products_apply_variants();

-- After a variant changes: touch its product so the trigger above refreshes it.
create or replace function private.product_variants_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.products set variant_count = variant_count where id = coalesce(new.product_id, old.product_id);
  if tg_op = 'UPDATE' and new.product_id <> old.product_id then
    update public.products set variant_count = variant_count where id = old.product_id;
  end if;
  return null;
end;
$$;
create trigger product_variants_sync after insert or update or delete on public.product_variants
  for each row execute function private.product_variants_sync();
create trigger product_variants_updated_at before update on public.product_variants
  for each row execute function private.set_updated_at();
create trigger product_variants_audit after insert or update or delete on public.product_variants
  for each row execute function private.audit();

-- ── RLS (same rules as product_images) ────────────────────────────────
alter table public.product_variants enable row level security;
create policy "product_variants: anon read published" on public.product_variants
  for select to anon using (exists (select 1 from public.products p where p.id = product_id and p.is_published));
create policy "product_variants: auth read published or admin" on public.product_variants
  for select to authenticated using (
    exists (select 1 from public.products p where p.id = product_id and (p.is_published or (select private.is_admin())))
  );
create policy "product_variants: admin insert" on public.product_variants for insert to authenticated with check ((select private.is_admin()));
create policy "product_variants: admin update" on public.product_variants for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "product_variants: admin delete" on public.product_variants for delete to authenticated using ((select private.is_admin()));
grant select on public.product_variants to anon, authenticated;
grant insert, update, delete on public.product_variants to authenticated;

-- ── Admin: replace a product's variant list in one transaction ─────────
-- Security invoker: RLS above decides (only admins can write).
create or replace function public.save_product_variants(p_product_id uuid, p_variants jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v jsonb;
  v_index int := 0;
  v_keep uuid[] := '{}';
  v_id uuid;
begin
  if not (select private.is_admin()) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if jsonb_typeof(p_variants) <> 'array' or jsonb_array_length(p_variants) > 30 then
    raise exception 'invalid_variants' using errcode = '22023';
  end if;
  for v in select * from jsonb_array_elements(p_variants) loop
    v_id := nullif(v ->> 'id', '')::uuid;
    if v_id is not null and exists (select 1 from public.product_variants where id = v_id and product_id = p_product_id) then
      v_keep := v_keep || v_id;
    else
      v_id := null;
    end if;
  end loop;

  -- Removed ones first, and free their SKUs/names before updating the rest.
  delete from public.product_variants where product_id = p_product_id and not (id = any (v_keep));
  update public.product_variants set sku = null where product_id = p_product_id;

  for v in select * from jsonb_array_elements(p_variants) loop
    v_id := nullif(v ->> 'id', '')::uuid;
    if v_id is not null and v_id = any (v_keep) then
      update public.product_variants set
        name = btrim(v ->> 'name'),
        highlight = nullif(btrim(v ->> 'highlight'), ''),
        sku = nullif(btrim(v ->> 'sku'), ''),
        price = (v ->> 'price')::bigint,
        compare_at_price = nullif(v ->> 'compare_at_price', '')::bigint,
        is_available = coalesce((v ->> 'is_available')::boolean, true),
        sort_order = v_index
      where id = v_id;
    else
      insert into public.product_variants (product_id, name, highlight, sku, price, compare_at_price, is_available, sort_order)
      values (
        p_product_id,
        btrim(v ->> 'name'),
        nullif(btrim(v ->> 'highlight'), ''),
        nullif(btrim(v ->> 'sku'), ''),
        (v ->> 'price')::bigint,
        nullif(v ->> 'compare_at_price', '')::bigint,
        coalesce((v ->> 'is_available')::boolean, true),
        v_index
      );
    end if;
    v_index := v_index + 1;
  end loop;
end;
$$;
revoke all on function public.save_product_variants(uuid, jsonb) from public, anon;
grant execute on function public.save_product_variants(uuid, jsonb) to authenticated;

-- ── Orders remember the chosen variant ────────────────────────────────
alter table public.order_items
  add column variant_id uuid references public.product_variants (id) on delete set null,
  add column variant_name text check (char_length(variant_name) <= 60);
create index order_items_variant_idx on public.order_items (variant_id);

-- create_order: items are {product_id, variant_id?, quantity}. A product with
-- variants can only be bought through one of them; prices come from the DB.
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
    select p.id, p.slug, v.id as variant_id, v.name as variant_name,
           left(p.name || coalesce(' (' || v.name || ')', ''), 140) as name,
           coalesce(v.price, p.price) as price,
           sum((i ->> 'quantity')::int) as qty
      from jsonb_array_elements(p_items) as i
      join public.products p on p.id = (i ->> 'product_id')::uuid
      left join public.product_variants v on v.id = nullif(i ->> 'variant_id', '')::uuid and v.product_id = p.id
     where p.is_published
       and (
         (p.variant_count = 0 and nullif(i ->> 'variant_id', '') is null and p.is_available)
         or (v.id is not null and v.is_available)
       )
     group by p.id, p.name, p.slug, p.price, v.id, v.name, v.price
  loop
    if v_item.qty < 1 or v_item.qty > 99 then
      raise exception 'invalid_quantity' using errcode = '22023';
    end if;
    insert into public.order_items (order_id, product_id, product_name, product_slug, variant_id, variant_name, unit_price, quantity, line_total)
    values (v_order.id, v_item.id, v_item.name, v_item.slug, v_item.variant_id, v_item.variant_name, v_item.price, v_item.qty, v_item.price * v_item.qty);
    v_subtotal := v_subtotal + v_item.price * v_item.qty;
  end loop;

  if (select count(distinct (i ->> 'product_id') || ':' || coalesce(nullif(i ->> 'variant_id', ''), '-')) from jsonb_array_elements(p_items) i)
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
