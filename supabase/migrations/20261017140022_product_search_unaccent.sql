-- ═══════════════════════════════════════════════════════════════════════
-- 13 · Accent-insensitive product search ("camara" finds "Cámara")
--   products.search_text = name + brand + short description + SKU, lowercase
--   and without accents, with a trigram index for fast "contains" searches.
-- ═══════════════════════════════════════════════════════════════════════
create extension if not exists unaccent with schema extensions;

-- unaccent() is STABLE; this wrapper pins the dictionary so it can be IMMUTABLE
-- and used in a generated column.
create or replace function private.search_normalize(p text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$ select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(p, ''))) $$;
revoke all on function private.search_normalize(text) from public;
grant execute on function private.search_normalize(text) to anon, authenticated, service_role;

alter table public.products
  add column search_text text generated always as (
    private.search_normalize(name || ' ' || coalesce(brand, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(sku, ''))
  ) stored;

create extension if not exists pg_trgm with schema extensions;
create index if not exists products_search_text_trgm_idx on public.products using gin (search_text extensions.gin_trgm_ops);
