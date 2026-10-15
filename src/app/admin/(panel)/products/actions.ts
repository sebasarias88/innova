"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET } from "@/lib/admin/storage";
import { checkbox, repeated, dbError, fail, firstIssue, formToObject, intField, money, ok, optionalText, requiredText, slugField, uuid, type ActionResult } from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/format";


const schema = z
  .object({
    name: requiredText("El nombre", 2, 140),
    slug: z.string().trim().optional(),
    category_id: uuid.refine(Boolean, "Elige una categoría."),
    brand: optionalText(60),
    sku: optionalText(60),
    short_description: optionalText(280),
    description: optionalText(5000),
    price: money.refine((v) => v !== null, "El precio es obligatorio."),
    compare_at_price: money,
    sort_order: intField(-9999, 9999),
    is_available: checkbox,
    is_published: checkbox,
    is_featured: checkbox,
    spec_label: repeated,
    spec_value: repeated,
  })
  .refine((d) => d.compare_at_price === null || d.compare_at_price > (d.price ?? 0), {
    message: "El precio anterior debe ser mayor que el precio actual.",
  });

export async function saveProduct(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { slug: rawSlug, spec_label, spec_value, ...data } = parsed.data;

  const slug = slugField.safeParse(rawSlug || slugify(data.name));
  if (!slug.success) return fail(firstIssue(slug.error));

  const specs = spec_label
    .map((label, i) => ({ label: String(label).trim().slice(0, 60), value: String(spec_value[i] ?? "").trim().slice(0, 160) }))
    .filter((s) => s.label && s.value)
    .slice(0, 30);

  const row = { ...data, price: data.price!, slug: slug.data, specs };
  const supabase = await createClient();
  const { data: saved, error } = id
    ? await supabase.from("products").update(row).eq("id", id).select("id").single()
    : await supabase.from("products").insert(row).select("id").single();
  if (error || !saved) return fail(dbError(error));

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
  if (images?.length) await supabase.storage.from(MEDIA_BUCKET).remove(images.map((i) => i.path));

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
