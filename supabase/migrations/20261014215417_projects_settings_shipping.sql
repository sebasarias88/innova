-- ═══════════════════════════════════════════════════════════════════════
-- 03 · Projects (portfolio), site settings, admin-only settings, shipping zones
-- ═══════════════════════════════════════════════════════════════════════

-- ── Projects ───────────────────────────────────────────────────────────
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 140),
  location text check (char_length(location) <= 120),
  category text check (char_length(category) <= 60),          -- Residencial, Comercial, Industrial…
  service_slug text check (char_length(service_slug) <= 60),  -- links to a service page
  summary text check (char_length(summary) <= 400),
  description text check (char_length(description) <= 5000),
  cover_path text check (cover_path is null or (char_length(cover_path) <= 300 and cover_path like 'projects/%')),
  metrics jsonb not null default '[]'::jsonb check (jsonb_typeof(metrics) = 'array' and pg_column_size(metrics) <= 4000),
  completed_on date,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_public_idx on public.projects (is_published, sort_order);

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  path text not null check (char_length(path) <= 300 and path like 'projects/%'),
  alt text check (char_length(alt) <= 160),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index project_images_project_idx on public.project_images (project_id, sort_order);

-- ── Public site settings (single row) ──────────────────────────────────
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  company_name text not null default 'INNOVA Seguridad y Sistemas' check (char_length(company_name) <= 120),
  whatsapp text not null default '573218539336' check (whatsapp ~ '^[0-9]{10,15}$'),
  phone_label text not null default '321 853 9336' check (char_length(phone_label) <= 30),
  email text check (char_length(email) <= 160),
  address text check (char_length(address) <= 200),
  city text check (char_length(city) <= 80),
  business_hours text check (char_length(business_hours) <= 160),
  instagram_url text check (char_length(instagram_url) <= 200),
  tiktok_url text check (char_length(tiktok_url) <= 200),
  facebook_url text check (char_length(facebook_url) <= 200),
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id, email, address, city, business_hours, instagram_url, tiktok_url)
values (1, 'ventasinnovaseguridad@gmail.com', 'Carrera 19A # 9-06', 'Armenia, Quindío',
        'Lun – Sáb · 7:00 a. m. – 6:00 p. m.', 'https://instagram.com/innova_safesys',
        'https://www.tiktok.com/@innova.seguridad2');

-- ── Admin-only settings (never readable by visitors) ───────────────────
create table public.admin_settings (
  id smallint primary key default 1 check (id = 1),
  notification_email text check (char_length(notification_email) <= 160),
  notification_whatsapp text check (notification_whatsapp is null or notification_whatsapp ~ '^[0-9]{10,15}$'),
  notify_new_orders boolean not null default true,
  notify_new_bookings boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.admin_settings (id, notification_whatsapp) values (1, '573218539336');

-- ── Shipping zones (managed by the admin) ──────────────────────────────
-- price NULL = "precio a convenir" (agreed with the customer after the order).
create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  description text check (char_length(description) <= 280),
  price bigint check (price is null or (price >= 0 and price <= 10000000)),
  is_pickup boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.shipping_zones (name, description, price, is_pickup, sort_order) values
  ('Armenia', 'Envío gratis dentro de Armenia, Quindío.', 0, false, 10),
  ('Recoger en tienda', 'Carrera 19A # 9-06, Armenia.', 0, true, 20),
  ('Resto del país', 'El valor del envío se acuerda contigo por WhatsApp después de la compra.', null, false, 30);

-- ── Triggers ───────────────────────────────────────────────────────────
create trigger projects_updated_at before update on public.projects for each row execute function private.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings for each row execute function private.set_updated_at();
create trigger admin_settings_updated_at before update on public.admin_settings for each row execute function private.set_updated_at();
create trigger shipping_zones_updated_at before update on public.shipping_zones for each row execute function private.set_updated_at();
create trigger projects_audit after insert or update or delete on public.projects for each row execute function private.audit();
create trigger site_settings_audit after update on public.site_settings for each row execute function private.audit();
create trigger admin_settings_audit after update on public.admin_settings for each row execute function private.audit();
create trigger shipping_zones_audit after insert or update or delete on public.shipping_zones for each row execute function private.audit();

-- ── RLS ────────────────────────────────────────────────────────────────
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_settings enable row level security;
alter table public.shipping_zones enable row level security;

-- reads
create policy "projects: anon read published" on public.projects for select to anon using (is_published);
create policy "projects: auth read published or admin" on public.projects for select to authenticated using (is_published or (select private.is_admin()));
create policy "project_images: anon read published" on public.project_images for select to anon
  using (exists (select 1 from public.projects p where p.id = project_id and p.is_published));
create policy "project_images: auth read published or admin" on public.project_images for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and (p.is_published or (select private.is_admin()))));
create policy "site_settings: everyone reads" on public.site_settings for select to anon, authenticated using (true);
create policy "admin_settings: admin reads" on public.admin_settings for select to authenticated using ((select private.is_admin()));
create policy "shipping_zones: anon read active" on public.shipping_zones for select to anon using (is_active);
create policy "shipping_zones: auth read active or admin" on public.shipping_zones for select to authenticated using (is_active or (select private.is_admin()));

-- writes (admins with MFA only)
create policy "projects: admin insert" on public.projects for insert to authenticated with check ((select private.is_admin()));
create policy "projects: admin update" on public.projects for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "projects: admin delete" on public.projects for delete to authenticated using ((select private.is_admin()));
create policy "project_images: admin insert" on public.project_images for insert to authenticated with check ((select private.is_admin()));
create policy "project_images: admin update" on public.project_images for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "project_images: admin delete" on public.project_images for delete to authenticated using ((select private.is_admin()));
create policy "site_settings: admin update" on public.site_settings for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admin_settings: admin update" on public.admin_settings for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "shipping_zones: admin insert" on public.shipping_zones for insert to authenticated with check ((select private.is_admin()));
create policy "shipping_zones: admin update" on public.shipping_zones for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "shipping_zones: admin delete" on public.shipping_zones for delete to authenticated using ((select private.is_admin()));

-- ── Grants ─────────────────────────────────────────────────────────────
grant select on public.projects, public.project_images, public.site_settings, public.shipping_zones to anon, authenticated;
grant insert, update, delete on public.projects, public.project_images, public.shipping_zones to authenticated;
grant update on public.site_settings to authenticated;
grant select, update on public.admin_settings to authenticated;
