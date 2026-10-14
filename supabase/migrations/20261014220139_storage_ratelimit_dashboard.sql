-- ═══════════════════════════════════════════════════════════════════════
-- 06 · Storage bucket, rate limiting, admin dashboard stats
-- ═══════════════════════════════════════════════════════════════════════

-- ── Storage: public "media" bucket (images only, 5 MB, no SVG = no XSS) ──
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public files are served by URL without any policy. Listing / writing is admin only,
-- and only inside the known folders.
create policy "media: admin list" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select private.is_admin()));
create policy "media: admin upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select private.is_admin())
              and (storage.foldername(name))[1] in ('products', 'projects', 'site'));
create policy "media: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select private.is_admin()))
  with check (bucket_id = 'media' and (select private.is_admin())
              and (storage.foldername(name))[1] in ('products', 'projects', 'site'));
create policy "media: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select private.is_admin()));

-- ── Rate limiting (fixed window, stored in the non-exposed private schema) ──
create table private.rate_limits (
  key text not null check (char_length(key) <= 200),
  window_start timestamptz not null,
  hits int not null default 1,
  primary key (key, window_start)
);
alter table private.rate_limits enable row level security;  -- no policies: nobody but definer functions

-- Returns true when the call is allowed. Key example: 'checkout:ip:1.2.3.4'
create or replace function public.check_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_hits int;
begin
  if p_key is null or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid_input';
  end if;
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into private.rate_limits as rl (key, window_start) values (left(p_key, 200), v_window)
  on conflict (key, window_start) do update set hits = rl.hits + 1
  returning hits into v_hits;

  -- opportunistic cleanup of old windows
  if random() < 0.02 then
    delete from private.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;
revoke all on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;

-- ── Admin dashboard stats ──────────────────────────────────────────────
create or replace function public.admin_dashboard_stats()
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
revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;

-- ── Reset counters consumed by the verification tests ──────────────────
alter table public.orders alter column order_number restart with 1001;
alter table public.bookings alter column booking_number restart with 1001;
