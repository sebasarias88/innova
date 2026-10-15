"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET } from "@/lib/admin/storage";
import { services } from "@/lib/services";
import { checkbox, dbError, fail, firstIssue, formToObject, intField, ok, optionalText, requiredText, slugField, uuid, type ActionResult } from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/format";

const asArray = (v: unknown) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const serviceSlugs = services.map((s) => s.slug) as [string, ...string[]];

const schema = z.object({
  title: requiredText("El título", 2, 120),
  slug: z.string().trim().optional(),
  location: optionalText(120),
  category: optionalText(60),
  service_slug: z
    .string()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.enum(serviceSlugs).nullable()),
  summary: optionalText(400),
  description: optionalText(5000),
  completed_on: z
    .string()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.iso.date("Fecha no válida.").nullable()),
  sort_order: intField(-9999, 9999),
  is_published: checkbox,
  is_featured: checkbox,
  metric_label: z.unknown().transform(asArray),
  metric_value: z.unknown().transform(asArray),
});

export async function saveProject(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(formToObject(formData));
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { slug: rawSlug, metric_label, metric_value, ...data } = parsed.data;

  const slug = slugField.safeParse(rawSlug || slugify(data.title));
  if (!slug.success) return fail(firstIssue(slug.error));

  const metrics = metric_label
    .map((label, i) => ({ label: String(label).trim().slice(0, 40), value: String(metric_value[i] ?? "").trim().slice(0, 40) }))
    .filter((m) => m.label && m.value)
    .slice(0, 6);

  const row = { ...data, slug: slug.data, metrics };
  const supabase = await createClient();
  const { data: saved, error } = id
    ? await supabase.from("projects").update(row).eq("id", id).select("id").single()
    : await supabase.from("projects").insert(row).select("id").single();
  if (error || !saved) return fail(dbError(error));

  revalidatePath("/admin/projects");
  revalidatePath("/proyectos");
  if (!id) redirect(`/admin/projects/${saved.id}?created=1`);
  revalidatePath(`/admin/projects/${id}`);
  return ok("Proyecto guardado.");
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Identificador no válido.");
  const supabase = await createClient();
  const { data: images } = await supabase.from("project_images").select("path").eq("project_id", id);

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return fail(dbError(error, "No se pudo eliminar."));
  if (images?.length) await supabase.storage.from(MEDIA_BUCKET).remove(images.map((i) => i.path));

  revalidatePath("/admin/projects");
  revalidatePath("/proyectos");
  redirect("/admin/projects");
}
