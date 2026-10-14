-- ═══════════════════════════════════════════════════════════════════════
-- 02 · Catalog: categories (with sub-categories), products, product images
-- ═══════════════════════════════════════════════════════════════════════

-- Tables created from now on are not readable/writable by anon/authenticated unless granted.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
revoke execute on function private.set_updated_at() from public, anon, authenticated;

-- ── Categories ─────────────────────────────────────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete restrict,
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 90),
  description text check (char_length(description) <= 500),
  image_path text check (char_length(image_path) <= 300),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_not_own_parent check (parent_id is null or parent_id <> id)
);
create index categories_parent_idx on public.categories (parent_id);

-- ── Products ───────────────────────────────────────────────────────────
-- Prices are whole Colombian pesos (COP has no cents in practice). No stock: available / sold out.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null check (char_length(name) between 2 and 140),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 160),
  brand text check (char_length(brand) <= 60),
  sku text unique check (char_length(sku) <= 60),
  short_description text check (char_length(short_description) <= 280),
  description text check (char_length(description) <= 5000),
  specs jsonb not null default '[]'::jsonb check (jsonb_typeof(specs) = 'array' and pg_column_size(specs) <= 8000),
  price bigint not null check (price >= 0 and price <= 1000000000),
  compare_at_price bigint check (compare_at_price is null or compare_at_price > price),
  is_available boolean not null default true,   -- false = "Agotado"
  is_published boolean not null default false,  -- drafts are never public
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_public_idx on public.products (is_published, is_featured, sort_order);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  path text not null check (char_length(path) <= 300 and path like 'products/%'),
  alt text check (char_length(alt) <= 160),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

-- ── Triggers ───────────────────────────────────────────────────────────
create trigger categories_updated_at before update on public.categories for each row execute function private.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function private.set_updated_at();
create trigger categories_audit after insert or update or delete on public.categories for each row execute function private.audit();
create trigger products_audit after insert or update or delete on public.products for each row execute function private.audit();

-- ── RLS ────────────────────────────────────────────────────────────────
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- Public visitors only see active categories and published products.
create policy "categories: public read active" on public.categories
  for select to anon, authenticated using (is_active or (select private.is_admin()));
create policy "products: public read published" on public.products
  for select to anon, authenticated using (is_published or (select private.is_admin()));
create policy "product_images: public read of published products" on public.product_images
  for select to anon, authenticated using (
    exists (select 1 from public.products p where p.id = product_id and (p.is_published or (select private.is_admin())))
  );

-- Only admins (with MFA) write.
create policy "categories: admin insert" on public.categories for insert to authenticated with check ((select private.is_admin()));
create policy "categories: admin update" on public.categories for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "categories: admin delete" on public.categories for delete to authenticated using ((select private.is_admin()));
create policy "products: admin insert" on public.products for insert to authenticated with check ((select private.is_admin()));
create policy "products: admin update" on public.products for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "products: admin delete" on public.products for delete to authenticated using ((select private.is_admin()));
create policy "product_images: admin insert" on public.product_images for insert to authenticated with check ((select private.is_admin()));
create policy "product_images: admin update" on public.product_images for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "product_images: admin delete" on public.product_images for delete to authenticated using ((select private.is_admin()));

-- ── Grants (RLS still applies on top) ──────────────────────────────────
grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images to authenticated;

-- ── Seed: categories requested by the client ───────────────────────────
insert into public.categories (name, slug, sort_order) values
  ('Cámaras', 'camaras', 10),
  ('Alarmas de seguridad', 'alarmas-de-seguridad', 20),
  ('UPS', 'ups', 30),
  ('Grabadores', 'grabadores', 40),
  ('Reflectores', 'reflectores', 50),
  ('Motores para puertas', 'motores-para-puertas', 60);

insert into public.categories (parent_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.sort_order
from public.categories c
cross join (values
  ('Cámaras IP', 'camaras-ip', 11),
  ('Cámaras WiFi', 'camaras-wifi', 12),
  ('Cámaras análogas', 'camaras-analogas', 13)
) as s(name, slug, sort_order)
where c.slug = 'camaras';
