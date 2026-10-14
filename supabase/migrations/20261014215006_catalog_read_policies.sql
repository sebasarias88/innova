-- ═══════════════════════════════════════════════════════════════════════
-- 02b · Split read policies by role: anon never evaluates private.is_admin()
-- (ALTER instead of DROP/CREATE: same result, non-destructive)
-- ═══════════════════════════════════════════════════════════════════════
alter policy "categories: public read active" on public.categories to anon using (is_active);
alter policy "categories: public read active" on public.categories rename to "categories: anon read active";
create policy "categories: auth read active or admin" on public.categories
  for select to authenticated using (is_active or (select private.is_admin()));

alter policy "products: public read published" on public.products to anon using (is_published);
alter policy "products: public read published" on public.products rename to "products: anon read published";
create policy "products: auth read published or admin" on public.products
  for select to authenticated using (is_published or (select private.is_admin()));

alter policy "product_images: public read of published products" on public.product_images to anon using (
  exists (select 1 from public.products p where p.id = product_id and p.is_published)
);
alter policy "product_images: public read of published products" on public.product_images rename to "product_images: anon read published";
create policy "product_images: auth read published or admin" on public.product_images
  for select to authenticated using (
    exists (select 1 from public.products p where p.id = product_id and (p.is_published or (select private.is_admin())))
  );
