"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { checkbox, dbError, fail, firstIssue, formToObject, intField, ok, optionalText, requiredText, slugField, uuid, type ActionResult } from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/format";

const schema = z.object({
  name: requiredText("El nombre", 2, 80),
  slug: z.string().trim().optional(),
  parent_id: z
    .string()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(uuid.nullable()),
  description: optionalText(500),
  sort_order: intField(-9999, 9999),
  is_active: checkbox,
});

export async function saveCategory(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { slug: rawSlug, ...data } = parsed.data;
  const slug = slugField.safeParse(rawSlug || slugify(data.name));
  if (!slug.success) return fail(firstIssue(slug.error));

  const supabase = await createClient();
  if (data.parent_id) {
    if (data.parent_id === id) return fail("Una categoría no puede ser su propia categoría padre.");
    // Only one level of subcategories keeps the catalog simple.
    const { data: parent } = await supabase.from("categories").select("parent_id").eq("id", data.parent_id).maybeSingle();
    if (!parent) return fail("La categoría padre no existe.");
    if (parent.parent_id) return fail("Solo se permite un nivel de subcategorías.");
    if (id) {
      const { count } = await supabase.from("categories").select("id", { count: "exact", head: true }).eq("parent_id", id);
      if (count) return fail("Esta categoría tiene subcategorías; no puede convertirse en subcategoría.");
    }
  }

  const row = { ...data, slug: slug.data };
  const { data: saved, error } = id
    ? await supabase.from("categories").update(row).eq("id", id).select("id").single()
    : await supabase.from("categories").insert(row).select("id").single();
  if (error || !saved) return fail(dbError(error));

  revalidatePath("/admin/categories");
  if (!id) redirect("/admin/categories");
  return ok("Categoría guardada.");
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Identificador no válido.");
  const supabase = await createClient();

  const [{ count: children }, { count: products }] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("parent_id", id),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id),
  ]);
  if (children) return fail("Primero elimina o mueve sus subcategorías.");
  if (products) return fail(`Tiene ${products} producto(s). Muévelos a otra categoría o desactívala.`);

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return fail(dbError(error, "No se pudo eliminar."));
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
