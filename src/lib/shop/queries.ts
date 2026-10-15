import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { mediaUrl } from "@/lib/admin/storage";

export type ShopCategory = { id: string; name: string; slug: string; parentId: string | null; description: string | null };

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: string;
  image: string | null;
};

export type ShopProductDetail = ShopProduct & {
  sku: string | null;
  description: string | null;
  specs: { label: string; value: string }[];
  images: { url: string; alt: string | null }[];
  category: { name: string; slug: string } | null;
};

export type ShippingOption = { id: string; name: string; description: string | null; price: number | null; isPickup: boolean };

const PRODUCT_FIELDS =
  "id, name, slug, brand, short_description, price, compare_at_price, is_available, is_featured, category_id, product_images(path, sort_order)";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  is_available: boolean;
  is_featured: boolean;
  category_id: string;
  product_images: { path: string; sort_order: number }[] | null;
};

function toProduct(p: ProductRow): ShopProduct {
  const cover = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    shortDescription: p.short_description,
    price: p.price,
    compareAtPrice: p.compare_at_price,
    isAvailable: p.is_available,
    isFeatured: p.is_featured,
    categoryId: p.category_id,
    image: mediaUrl(cover?.path),
  };
}

/** Active categories (RLS hides inactive ones from the public). */
export const getShopCategories = cache(async (): Promise<ShopCategory[]> => {
  const { data } = await createPublicClient()
    .from("categories")
    .select("id, name, slug, parent_id, description")
    .order("sort_order")
    .order("name");
  return (data ?? []).map((c) => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parent_id, description: c.description }));
});

/** Published products, optionally filtered by category (includes its subcategories) and text. */
export async function getProducts({ categoryIds, q }: { categoryIds?: string[]; q?: string } = {}): Promise<ShopProduct[]> {
  let query = createPublicClient().from("products").select(PRODUCT_FIELDS).order("is_available", { ascending: false }).order("sort_order").order("name");
  if (categoryIds?.length) query = query.in("category_id", categoryIds);
  if (q) {
    const term = `%${q.replace(/[%_,()]/g, " ").slice(0, 60)}%`;
    query = query.or(`name.ilike.${term},brand.ilike.${term},short_description.ilike.${term}`);
  }
  const { data } = await query.limit(200);
  return ((data ?? []) as unknown as ProductRow[]).map(toProduct);
}

export async function getFeaturedProducts(limit = 8): Promise<ShopProduct[]> {
  const { data } = await createPublicClient()
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("is_featured", true)
    .order("is_available", { ascending: false })
    .order("sort_order")
    .limit(limit);
  return ((data ?? []) as unknown as ProductRow[]).map(toProduct);
}

export const getProductBySlug = cache(async (slug: string): Promise<ShopProductDetail | null> => {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const { data } = await createPublicClient()
    .from("products")
    .select(`${PRODUCT_FIELDS}, sku, description, specs, product_images(path, alt, sort_order), category:categories(name, slug)`)
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as ProductRow & {
    sku: string | null;
    description: string | null;
    specs: unknown;
    product_images: { path: string; alt: string | null; sort_order: number }[];
    category: { name: string; slug: string } | null;
  };
  return {
    ...toProduct(row),
    sku: row.sku,
    description: row.description,
    specs: Array.isArray(row.specs) ? (row.specs as { label: string; value: string }[]) : [],
    images: [...row.product_images].sort((a, b) => a.sort_order - b.sort_order).map((i) => ({ url: mediaUrl(i.path)!, alt: i.alt })),
    category: row.category,
  };
});

/** Current price/availability for products in a cart (published only). */
export async function getProductsByIds(ids: string[]): Promise<ShopProduct[]> {
  if (!ids.length) return [];
  const { data } = await createPublicClient().from("products").select(PRODUCT_FIELDS).in("id", ids.slice(0, 50));
  return ((data ?? []) as unknown as ProductRow[]).map(toProduct);
}

export async function getShippingOptions(): Promise<ShippingOption[]> {
  const { data } = await createPublicClient()
    .from("shipping_zones")
    .select("id, name, description, price, is_pickup")
    .order("sort_order")
    .order("name");
  return (data ?? []).map((z) => ({ id: z.id, name: z.name, description: z.description, price: z.price, isPickup: z.is_pickup }));
}

export const getSiteSettings = cache(async () => {
  const { data } = await createPublicClient().from("site_settings").select("company_name, whatsapp, phone_label, email, address, city, business_hours").eq("id", 1).maybeSingle();
  return data;
});
