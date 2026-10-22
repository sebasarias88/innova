"use server";

import { revalidatePath } from "next/cache";
import { revalidateShop } from "@/lib/admin/revalidate";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createTypedClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET } from "@/lib/admin/storage";
import { thumbPath, withThumbs } from "@/lib/media/paths";

/**
 * Image handling for products and projects.
 * 1. `requestImageUpload` signs a one-time upload URL (RLS checks the admin).
 * 2. The browser optimizes the image (WebP within a weight budget + a 640 px
 *    thumbnail) and uploads both straight to Supabase Storage.
 * 3. `attachImage` stores the row, verifying the file really exists.
 */

const owners = {
  product: { table: "product_images", fk: "product_id", parent: "products", folder: "products", page: "/admin/products" },
  project: { table: "project_images", fk: "project_id", parent: "projects", folder: "projects", page: "/admin/projects" },
} as const;

const ownerSchema = z.object({ kind: z.enum(["product", "project"]), ownerId: z.uuid() });
const MAX_IMAGES = 12;
// Only optimized WebP is accepted: the browser converts every photo before uploading.
const ALLOWED = { "image/webp": "webp" } as const;

// Generic over two tables (product_images / project_images), so this file uses the untyped client.
const createClient = async () => (await createTypedClient()) as unknown as SupabaseClient;

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export async function requestImageUpload(input: { kind: string; ownerId: string; contentType: string }): Promise<
  Result<{ path: string; token: string; thumbPath: string; thumbToken: string }>
> {
  await requireAdmin();
  const parsed = ownerSchema.safeParse(input);
  const ext = ALLOWED[input.contentType as keyof typeof ALLOWED];
  if (!parsed.success || !ext) return { ok: false, error: "No se pudo optimizar la imagen. Actualiza el navegador e inténtalo de nuevo." };
  const owner = owners[parsed.data.kind];

  const supabase = await createClient();
  const { count } = await supabase.from(owner.table).select("id", { count: "exact", head: true }).eq(owner.fk, parsed.data.ownerId);
  if ((count ?? 0) >= MAX_IMAGES) return { ok: false, error: `Máximo ${MAX_IMAGES} imágenes.` };

  const path = `${owner.folder}/${parsed.data.ownerId}/${crypto.randomUUID()}.${ext}`;
  const bucket = supabase.storage.from(MEDIA_BUCKET);
  const [main, thumb] = await Promise.all([bucket.createSignedUploadUrl(path), bucket.createSignedUploadUrl(thumbPath(path))]);
  if (main.error || !main.data || thumb.error || !thumb.data) return { ok: false, error: "No se pudo preparar la subida. Inténtalo de nuevo." };
  return { ok: true, path: main.data.path, token: main.data.token, thumbPath: thumb.data.path, thumbToken: thumb.data.token };
}

export async function attachImage(input: { kind: string; ownerId: string; path: string; alt?: string }): Promise<Result> {
  await requireAdmin();
  const parsed = ownerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos no válidos." };
  const owner = owners[parsed.data.kind];
  const prefix = `${owner.folder}/${parsed.data.ownerId}/`;
  if (typeof input.path !== "string" || !input.path.startsWith(prefix) || input.path.includes("..")) {
    return { ok: false, error: "Ruta de imagen no válida." };
  }

  const supabase = await createClient();
  // The file must exist in storage (prevents attaching arbitrary paths).
  const name = input.path.slice(prefix.length);
  const { data: files } = await supabase.storage.from(MEDIA_BUCKET).list(prefix.slice(0, -1), { search: name.replace(/\.[a-z0-9]+$/i, "") });
  if (!files?.some((f) => f.name === name)) return { ok: false, error: "La imagen no terminó de subir." };

  const { data: last } = await supabase
    .from(owner.table)
    .select("sort_order")
    .eq(owner.fk, parsed.data.ownerId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = {
    [owner.fk]: parsed.data.ownerId,
    path: input.path,
    alt: input.alt?.slice(0, 160) || null,
    sort_order: (last?.sort_order ?? -1) + 1,
  };
  const { error } = await supabase.from(owner.table).insert(row);
  if (error) {
    await supabase.storage.from(MEDIA_BUCKET).remove(withThumbs([input.path]));
    return { ok: false, error: "No se pudo guardar la imagen." };
  }

  // A project's first image becomes its cover automatically.
  if (parsed.data.kind === "project") {
    await supabase.from("projects").update({ cover_path: input.path }).eq("id", parsed.data.ownerId).is("cover_path", null);
  }
  revalidateShop();
  revalidatePath(`${owner.page}/${parsed.data.ownerId}`);
  return { ok: true };
}

const imageSchema = z.object({ kind: z.enum(["product", "project"]), imageId: z.uuid() });

export async function deleteImage(input: { kind: string; imageId: string }): Promise<Result> {
  await requireAdmin();
  const parsed = imageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos no válidos." };
  const owner = owners[parsed.data.kind];
  const supabase = await createClient();

  const { data: image } = await supabase.from(owner.table).select("*").eq("id", parsed.data.imageId).maybeSingle();
  if (!image) return { ok: false, error: "La imagen ya no existe." };
  const img = image as unknown as { path: string } & Record<string, string>;
  const ownerId = img[owner.fk];

  const { error } = await supabase.from(owner.table).delete().eq("id", parsed.data.imageId);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  await supabase.storage.from(MEDIA_BUCKET).remove(withThumbs([img.path]));

  if (parsed.data.kind === "project") {
    // If it was the cover, use the next image (or none).
    const { data: project } = await supabase.from("projects").select("cover_path").eq("id", ownerId).maybeSingle();
    if (project?.cover_path === img.path) {
      const { data: next } = await supabase.from("project_images").select("path").eq("project_id", ownerId).order("sort_order").limit(1).maybeSingle();
      await supabase.from("projects").update({ cover_path: next?.path ?? null }).eq("id", ownerId);
    }
  }
  revalidateShop();
  revalidatePath(`${owner.page}/${ownerId}`);
  return { ok: true };
}

export async function moveImage(input: { kind: string; imageId: string; direction: "up" | "down" }): Promise<Result> {
  await requireAdmin();
  const parsed = imageSchema.safeParse(input);
  if (!parsed.success || !["up", "down"].includes(input.direction)) return { ok: false, error: "Datos no válidos." };
  const owner = owners[parsed.data.kind];
  const supabase = await createClient();

  const { data: image } = await supabase.from(owner.table).select("*").eq("id", parsed.data.imageId).maybeSingle();
  if (!image) return { ok: false, error: "La imagen ya no existe." };
  const ownerId = (image as unknown as Record<string, string>)[owner.fk];

  const { data: rows } = await supabase.from(owner.table).select("id, sort_order").eq(owner.fk, ownerId).order("sort_order").order("created_at");
  const list = (rows ?? []) as { id: string; sort_order: number }[];
  const i = list.findIndex((r) => r.id === parsed.data.imageId);
  const j = input.direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return { ok: true };
  [list[i], list[j]] = [list[j], list[i]];

  // Rewrite the whole order (few rows) so it stays consistent.
  await Promise.all(list.map((r, idx) => supabase.from(owner.table).update({ sort_order: idx }).eq("id", r.id)));
  revalidateShop();
  revalidatePath(`${owner.page}/${ownerId}`);
  return { ok: true };
}

export async function setProjectCover(input: { projectId: string; path: string }): Promise<Result> {
  await requireAdmin();
  const id = z.uuid().safeParse(input.projectId);
  if (!id.success || !input.path?.startsWith(`projects/${input.projectId}/`)) return { ok: false, error: "Datos no válidos." };
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ cover_path: input.path }).eq("id", id.data);
  if (error) return { ok: false, error: "No se pudo cambiar la portada." };
  revalidatePath(`/admin/projects/${id.data}`);
  return { ok: true };
}
