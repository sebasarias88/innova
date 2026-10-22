-- ═══════════════════════════════════════════════════════════════════════
-- 15 · Visit analytics, sales reports and "export & clean" of old data
--   Additive only. Nothing here changes how the store, orders or payments work.
-- ═══════════════════════════════════════════════════════════════════════

-- ── Analytics: raw events (kept 30 days) ─────────────────────────────────
-- Anonymous: a random visitor id stored in the visitor's browser, no names,
-- phones or IPs. Only the Next.js server (secret key) inserts.
create table public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('pageview', 'click')),
  path text not null check (char_length(path) <= 200),
  target text check (char_length(target) <= 40),   -- click type: whatsapp, call, add_to_cart…
  label text check (char_length(label) <= 140),    -- product, link or button
  source text not null default 'direct' check (char_length(source) <= 40),
  medium text check (char_length(medium) <= 40),
  campaign text check (char_length(campaign) <= 80),
  referrer_host text check (char_length(referrer_host) <= 100),
  device text not null default 'desktop' check (device in ('mobile', 'tablet', 'desktop')),
  country text check (char_length(country) <= 2),
  region text check (char_length(region) <= 60),
  city text check (char_length(city) <= 60),
  visitor_id uuid not null,
  session_id uuid not null
);
create index analytics_events_created_idx on public.analytics_events (created_at);

-- ── Analytics: permanent daily summaries (small) ─────────────────────────
create table public.analytics_daily (
  day date not null,
  kind text not null,
  path text not null default '',
  target text not null default '',
  label text not null default '',
  source text not null default '',
  device text not null default '',
  city text not null default '',
  events int not null default 0,
  visitors int not null default 0,
  primary key (day, kind, path, target, label, source, device, city)
);
create table public.analytics_days (
  day date primary key,
  pageviews int not null default 0,
  clicks int not null default 0,
  visitors int not null default 0,
  sessions int not null default 0
);

alter table public.analytics_events enable row level security;
alter table public.analytics_daily enable row level security;
alter table public.analytics_days enable row level security;
create policy "analytics_events: admin read" on public.analytics_events for select to authenticated using ((select private.is_admin()));
create policy "analytics_daily: admin read" on public.analytics_daily for select to authenticated using ((select private.is_admin()));
create policy "analytics_days: admin read" on public.analytics_days for select to authenticated using ((select private.is_admin()));
grant select on public.analytics_events, public.analytics_daily, public.analytics_days to authenticated;

-- Summarizes every finished day (Colombia time) that is not summarized yet and
-- deletes raw events older than 30 days. Runs every night (pg_cron) and is
-- safe to run again.
create or replace function private.analytics_rollup()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Bogota')::date;
  v_day date;
begin
  for v_day in
    select distinct (e.created_at at time zone 'America/Bogota')::date
      from public.analytics_events e
     where (e.created_at at time zone 'America/Bogota')::date < v_today
       and not exists (select 1 from public.analytics_days d where d.day = (e.created_at at time zone 'America/Bogota')::date)
  loop
    insert into public.analytics_daily (day, kind, path, target, label, source, device, city, events, visitors)
    select v_day, kind, path, coalesce(target, ''), coalesce(label, ''), source, device, coalesce(city, ''),
           count(*), count(distinct visitor_id)
      from public.analytics_events
     where (created_at at time zone 'America/Bogota')::date = v_day
     group by kind, path, coalesce(target, ''), coalesce(label, ''), source, device, coalesce(city, '')
    on conflict do nothing;

    insert into public.analytics_days (day, pageviews, clicks, visitors, sessions)
    select v_day,
           count(*) filter (where kind = 'pageview'),
           count(*) filter (where kind = 'click'),
           count(distinct visitor_id),
           count(distinct session_id)
      from public.analytics_events
     where (created_at at time zone 'America/Bogota')::date = v_day
    on conflict (day) do nothing;
  end loop;

  delete from public.analytics_events where created_at < now() - interval '30 days';
end;
$$;

create extension if not exists pg_cron;
select cron.schedule('innova-analytics-rollup', '10 5 * * *', 'select private.analytics_rollup()');

-- ── Analytics for the admin panel ───────────────────────────────────────
-- Finished days come from the summaries; today comes live from the raw events.
create or replace function public.admin_analytics(p_from date, p_to date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Bogota')::date;
begin
  if not private.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 800 then
    raise exception 'invalid_range' using errcode = '22023';
  end if;

  return (
    with live as (
      select * from public.analytics_events
       where (created_at at time zone 'America/Bogota')::date = v_today and v_today between p_from and p_to
    ),
    rows as (
      select day, kind, path, target, label, source, device, city, events, visitors
        from public.analytics_daily where day between p_from and p_to and day < v_today
      union all
      select v_today, kind, path, coalesce(target, ''), coalesce(label, ''), source, device, coalesce(city, ''),
             count(*)::int, count(distinct visitor_id)::int
        from live group by kind, path, coalesce(target, ''), coalesce(label, ''), source, device, coalesce(city, '')
    ),
    days as (
      select day, pageviews, clicks, visitors, sessions from public.analytics_days where day between p_from and p_to and day < v_today
      union all
      select v_today,
             count(*) filter (where kind = 'pageview')::int, count(*) filter (where kind = 'click')::int,
             count(distinct visitor_id)::int, count(distinct session_id)::int
        from live having count(*) > 0
    )
    select jsonb_build_object(
      'totals', (select jsonb_build_object(
          'pageviews', coalesce(sum(pageviews), 0), 'clicks', coalesce(sum(clicks), 0),
          'visitors', coalesce(sum(visitors), 0), 'sessions', coalesce(sum(sessions), 0)) from days),
      'series', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'pageviews', pageviews, 'visitors', visitors, 'clicks', clicks) order by day) from days), '[]'),
      'sources', coalesce((select jsonb_agg(x order by x.events desc) from (
          select source, sum(events)::int as events, sum(visitors)::int as visitors from rows where kind = 'pageview' group by source order by 2 desc limit 12) x), '[]'),
      'pages', coalesce((select jsonb_agg(x order by x.events desc) from (
          select path, sum(events)::int as events, sum(visitors)::int as visitors from rows where kind = 'pageview' group by path order by 2 desc limit 15) x), '[]'),
      'products', coalesce((select jsonb_agg(x order by x.events desc) from (
          select path, max(nullif(label, '')) as label, sum(events)::int as events from rows
           where kind = 'pageview' and path like '/tienda/%' group by path order by 3 desc limit 10) x), '[]'),
      'devices', coalesce((select jsonb_agg(x order by x.events desc) from (
          select device, sum(events)::int as events from rows where kind = 'pageview' group by device) x), '[]'),
      'cities', coalesce((select jsonb_agg(x order by x.events desc) from (
          select coalesce(nullif(city, ''), 'Desconocida') as city, sum(events)::int as events from rows
           where kind = 'pageview' group by 1 order by 2 desc limit 12) x), '[]'),
      'clicks', coalesce((select jsonb_agg(x order by x.events desc) from (
          select target, sum(events)::int as events from rows where kind = 'click' group by target order by 2 desc) x), '[]'),
      'click_labels', coalesce((select jsonb_agg(x order by x.events desc) from (
          select target, label, sum(events)::int as events from rows where kind = 'click' and label <> '' group by target, label order by 3 desc limit 20) x), '[]'),
      'raw_from', (select min(created_at) from public.analytics_events)
    )
  );
end;
$$;
revoke all on function public.admin_analytics(date, date) from public, anon;
grant execute on function public.admin_analytics(date, date) to authenticated;

-- ── Sales report ─────────────────────────────────────────────────────────
-- A sale = an order that is paid, confirmed, shipped or delivered.
-- Dates in Colombia time; p_group = day | week | month for the chart.
create or replace function public.admin_sales_report(p_from date, p_to date, p_group text default 'day')
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 1500 or p_group not in ('day', 'week', 'month') then
    raise exception 'invalid_range' using errcode = '22023';
  end if;

  return (
    with o as (
      select o.*, (o.created_at at time zone 'America/Bogota')::date as day,
             o.status in ('paid', 'confirmed', 'shipped', 'delivered') as is_sale
        from public.orders o
       where (o.created_at at time zone 'America/Bogota')::date between p_from and p_to
    ),
    sales as (select * from o where is_sale),
    items as (
      select i.*, p.category_id from public.order_items i
        join sales s on s.id = i.order_id
        left join public.products p on p.id = i.product_id
    ),
    b as (
      select * from public.bookings
       where (starts_at at time zone 'America/Bogota')::date between p_from and p_to
    )
    select jsonb_build_object(
      'summary', jsonb_build_object(
        'orders', (select count(*) from o),
        'sales_count', (select count(*) from sales),
        'sales_total', (select coalesce(sum(total), 0) from sales),
        'products_total', (select coalesce(sum(subtotal), 0) from sales),
        'shipping_total', (select coalesce(sum(shipping_cost), 0) from sales),
        'avg_ticket', (select coalesce(round(avg(total)), 0) from sales),
        'units', (select coalesce(sum(quantity), 0) from items),
        'pending_count', (select count(*) from o where status in ('pending', 'awaiting_payment')),
        'pending_total', (select coalesce(sum(total), 0) from o where status in ('pending', 'awaiting_payment')),
        'cancelled_count', (select count(*) from o where status = 'cancelled'),
        'online_total', (select coalesce(sum(total), 0) from sales where payment_method = 'wompi'),
        'whatsapp_total', (select coalesce(sum(total), 0) from sales where payment_method = 'whatsapp')
      ),
      'series', coalesce((select jsonb_agg(x order by x.bucket) from (
          select date_trunc(p_group, day)::date as bucket, count(*) as orders,
                 count(*) filter (where is_sale) as sales, coalesce(sum(total) filter (where is_sale), 0) as total
            from o group by 1) x), '[]'),
      'products', coalesce((select jsonb_agg(x order by x.total desc) from (
          select product_name as name, sum(quantity)::int as units, sum(line_total) as total
            from items group by product_name order by 3 desc limit 20) x), '[]'),
      'categories', coalesce((select jsonb_agg(x order by x.total desc) from (
          select coalesce(c.name, 'Sin categoría') as name, sum(i.quantity)::int as units, sum(i.line_total) as total
            from items i left join public.categories c on c.id = i.category_id group by 1) x), '[]'),
      'payment_methods', coalesce((select jsonb_agg(x) from (
          select payment_method as method, count(*) as count, sum(total) as total from sales group by 1) x), '[]'),
      'zones', coalesce((select jsonb_agg(x order by x.total desc) from (
          select shipping_zone_name as name, count(*) as count, sum(total) as total from sales group by 1) x), '[]'),
      'cities', coalesce((select jsonb_agg(x order by x.total desc) from (
          select initcap(city) as name, count(*) as count, sum(total) as total from sales group by 1 order by 3 desc limit 12) x), '[]'),
      'statuses', coalesce((select jsonb_agg(x) from (select status, count(*) as count from o group by 1) x), '[]'),
      'bookings', jsonb_build_object(
        'total', (select count(*) from b),
        'confirmed', (select count(*) from b where status in ('confirmed', 'completed')),
        'pending', (select count(*) from b where status = 'pending'),
        'cancelled', (select count(*) from b where status = 'cancelled'),
        'services', coalesce((select jsonb_agg(x order by x.count desc) from (
            select service_slug as service, count(*) as count from b where status <> 'cancelled' group by 1) x), '[]')
      )
    )
  );
end;
$$;
revoke all on function public.admin_sales_report(date, date, text) from public, anon;
grant execute on function public.admin_sales_report(date, date, text) to authenticated;

-- ── Storage: what takes space ────────────────────────────────────────────
create or replace function public.admin_storage_usage()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'database_bytes', pg_database_size(current_database()),
    'media', (select jsonb_build_object('bytes', coalesce(sum((o.metadata ->> 'size')::bigint), 0), 'files', count(*))
                from storage.objects o where o.bucket_id = 'media'),
    'tables', (select jsonb_agg(jsonb_build_object('name', t.name, 'bytes', pg_total_relation_size(t.reg), 'rows', t.rows) order by pg_total_relation_size(t.reg) desc)
                 from (values
                   ('orders', 'public.orders'::regclass, (select count(*) from public.orders)),
                   ('order_items', 'public.order_items'::regclass, (select count(*) from public.order_items)),
                   ('payment_events', 'public.payment_events'::regclass, (select count(*) from public.payment_events)),
                   ('bookings', 'public.bookings'::regclass, (select count(*) from public.bookings)),
                   ('analytics_events', 'public.analytics_events'::regclass, (select count(*) from public.analytics_events)),
                   ('analytics_daily', 'public.analytics_daily'::regclass, (select count(*) from public.analytics_daily)),
                   ('audit_log', 'public.audit_log'::regclass, (select count(*) from public.audit_log)),
                   ('products', 'public.products'::regclass, (select count(*) from public.products))
                 ) as t(name, reg, rows)),
    'oldest', jsonb_build_object(
      'orders', (select min(created_at) from public.orders),
      'bookings', (select min(created_at) from public.bookings),
      'analytics', (select min(day) from public.analytics_days),
      'audit', (select min(created_at) from public.audit_log)
    )
  );
end;
$$;
revoke all on function public.admin_storage_usage() from public, anon;
grant execute on function public.admin_storage_usage() to authenticated;

-- ── Export & clean ──────────────────────────────────────────────────────
-- Cleaning is only allowed right after downloading the export (Excel/PDF) of
-- that same cut-off date: the server records the export, the purge checks it.
create table private.data_exports (
  id bigint generated always as identity primary key,
  cutoff date not null,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create or replace function public.admin_record_export(p_cutoff date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  insert into private.data_exports (cutoff, created_by) values (p_cutoff, (select auth.uid()));
end;
$$;
revoke all on function public.admin_record_export(date) from public, anon;
grant execute on function public.admin_record_export(date) to authenticated;

-- Deletes history older than the cut-off: finished orders (delivered or
-- cancelled) with their items and payment events, finished bookings, audit
-- log and analytics details. NEVER touches products, categories, projects,
-- settings, open orders or future bookings. Daily visit summaries are kept.
create or replace function public.admin_purge_before(p_cutoff date, p_confirm text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit timestamptz := (p_cutoff::timestamp at time zone 'America/Bogota');
  v_orders int; v_bookings int; v_events int; v_audit int; v_analytics int;
begin
  if not private.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_confirm is distinct from 'BORRAR' then
    raise exception 'confirmation_required' using errcode = '22023';
  end if;
  if p_cutoff > (now() at time zone 'America/Bogota')::date - 30 then
    raise exception 'cutoff_too_recent' using errcode = '22023';
  end if;
  if not exists (select 1 from private.data_exports where cutoff = p_cutoff and created_at > now() - interval '2 hours') then
    raise exception 'export_required' using errcode = '22023';
  end if;

  delete from public.payment_events pe
   where pe.received_at < v_limit
     and not exists (select 1 from public.orders o where o.reference = pe.reference and o.status not in ('delivered', 'cancelled'));
  get diagnostics v_events = row_count;

  delete from public.orders where created_at < v_limit and status in ('delivered', 'cancelled');
  get diagnostics v_orders = row_count;

  delete from public.bookings where starts_at < v_limit and status in ('completed', 'cancelled');
  get diagnostics v_bookings = row_count;

  delete from public.audit_log where created_at < v_limit;
  get diagnostics v_audit = row_count;
  -- The audit trigger copied every deleted order/booking into the log (same
  -- transaction, so same now()); keep one summary line instead of the copies.
  delete from public.audit_log
   where created_at = now() and action = 'delete' and table_name in ('orders', 'bookings');
  insert into public.audit_log (actor_id, action, table_name, record_id, new_data)
  values ((select auth.uid()), 'purge', 'history', p_cutoff::text,
          jsonb_build_object('cutoff', p_cutoff, 'orders', v_orders, 'bookings', v_bookings, 'payment_events', v_events, 'audit_log', v_audit));

  delete from public.analytics_events where created_at < v_limit;
  get diagnostics v_analytics = row_count;

  return jsonb_build_object('orders', v_orders, 'bookings', v_bookings, 'payment_events', v_events, 'audit_log', v_audit, 'analytics_events', v_analytics);
end;
$$;
revoke all on function public.admin_purge_before(date, text) from public, anon;
grant execute on function public.admin_purge_before(date, text) to authenticated;
