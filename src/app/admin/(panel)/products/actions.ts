"use server";

import { revalidatePath } from "next/cache";
import { revalidateShop } from "@/lib/admin/revalidate";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET } from "@/lib/admin/storage";
import { withThumbs } from "@/lib/media/paths";
import { checkbox, repeated, dbError, fail, firstIssue, formToObject, intField, money, ok, optionalText, requiredText, slugField, uuid, type ActionResult } from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/format";


const schema = z
  .object({
    name: requiredText("El nombre", 2, 140),
    slug: z.string().trim().optional(),
    category_id: z.string().min(1, "Elige una categoría.").pipe(uuid),
    brand: optionalText(60),
    sku: optionalText(60),
    short_description: optionalText(280),
    description: optionalText(5000),
    price: money.optional(),
    compare_at_price: money.optional(),
    sort_order: intField(-9999, 9999),
    is_available: checkbox,
    is_published: checkbox,
    is_featured: checkbox,
    spec_label: repeated,
    spec_value: repeated,
    variants_json: z.string().max(40_000).optional(),
  });

const variantSchema = z
  .object({
    id: z.union([z.literal(""), uuid]),
    name: z.string().trim().min(1, "Cada opción necesita un nombre.").max(60, "El nombre de una opción es muy largo (máx. 60)."),
    highlight: z.string().trim().max(120, "El texto destacado de una opción es muy largo (máx. 120)."),
    sku: z.string().trim().max(60),
    price: money.refine((v) => v !== null, "Cada opción necesita un precio."),
    compare_at_price: money,
    is_available: z.boolean(),
  })
  .refine((v) => v.compare_at_price === null || v.compare_at_price > (v.price ?? 0), {
    message: "En las opciones, el precio anterior debe ser mayor que el precio.",
  });
const variantsSchema = z.array(variantSchema).max(30, "Máximo 30 opciones por producto.");

function parseVariants(json: string | undefined) {
  if (!json) return { ok: true as const, variants: [] };
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false as const, error: "Las opciones no son válidas." };
  }
  const parsed = variantsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: firstIssue(parsed.error) };
  const names = parsed.data.map((v) => v.name.toLocaleLowerCase("es"));
  if (new Set(names).size !== names.length) return { ok: false as const, error: "Hay dos opciones con el mismo nombre." };
  const skus = parsed.data.map((v) => v.sku.toLowerCase()).filter(Boolean);
  if (new Set(skus).size !== skus.length) return { ok: false as const, error: "Hay dos opciones con la misma referencia." };
  return { ok: true as const, variants: parsed.data.map((v) => ({ ...v, price: v.price! })) };
}

export async function saveProduct(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { slug: rawSlug, spec_label, spec_value, variants_json, price, compare_at_price, ...data } = parsed.data;

  const variantsResult = parseVariants(variants_json);
  if (!variantsResult.ok) return fail(variantsResult.error);
  const { variants } = variantsResult;

  // Without options the product keeps its own price; with options the database
  // recalculates price and availability from them (these values are a placeholder).
  let pricing: { price: number; compare_at_price: number | null; is_available?: boolean };
  if (variants.length) {
    const cheapest = [...variants].sort((a, b) => Number(b.is_available) - Number(a.is_available) || a.price - b.price)[0];
    pricing = { price: cheapest.price, compare_at_price: cheapest.compare_at_price, is_available: variants.some((v) => v.is_available) };
  } else {
    if (price == null) return fail("El precio es obligatorio.");
    if (compare_at_price != null && compare_at_price <= price) return fail("El precio anterior debe ser mayor que el precio actual.");
    pricing = { price, compare_at_price: compare_at_price ?? null };
  }

  const slug = slugField.safeParse(rawSlug || slugify(data.name));
  if (!slug.success) return fail(firstIssue(slug.error));

  const specs = spec_label
    .map((label, i) => ({ label: String(label).trim().slice(0, 60), value: String(spec_value[i] ?? "").trim().slice(0, 160) }))
    .filter((s) => s.label && s.value)
    .slice(0, 30);

  const row = { ...data, ...pricing, slug: slug.data, specs };
  const supabase = await createClient();
  const { data: saved, error } = id
    ? await supabase.from("products").update(row).eq("id", id).select("id").single()
    : await supabase.from("products").insert(row).select("id").single();
  if (error || !saved) return fail(dbError(error));

  // Also clears the options when all of them were removed (only if it had some).
  if (variants.length || id) {
    const { error: variantsError } = await supabase.rpc("save_product_variants", {
      p_product_id: saved.id,
      p_variants: variants.map((v) => ({ ...v, sku: v.sku || null, highlight: v.highlight || null })),
    });
    if (variantsError) {
      revalidatePath("/admin/products");
      return fail(variantsError.code === "23505" ? "Esa referencia ya la usa otro producto u opción." : dbError(variantsError));
    }
  }

  revalidateShop();
  revalidatePath("/admin/products");
  if (!id) redirect(`/admin/products/${saved.id}?created=1`);
  revalidatePath(`/admin/products/${id}`);
  return ok("Producto guardado.");
}

export async function setProductFlag(id: string, flag: "is_available" | "is_published", value: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success || !["is_available", "is_published"].includes(flag) || typeof value !== "boolean") return fail("Datos no válidos.");
  const supabase = await createClient();
  const { error } = await supabase.from("products").update(flag === "is_available" ? { is_available: value } : { is_published: value }).eq("id", id);
  if (error) return fail(dbError(error));
  revalidateShop();
  revalidatePath("/admin/products");
  return ok();
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Identificador no válido.");
  const supabase = await createClient();
  const { data: images } = await supabase.from("product_images").select("path").eq("product_id", id);

  // Past orders keep a snapshot of name and price, so deleting is safe.
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return fail(dbError(error, "No se pudo eliminar."));
  if (images?.length) await supabase.storage.from(MEDIA_BUCKET).remove(withThumbs(images.map((i) => i.path)));

  revalidateShop();
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
