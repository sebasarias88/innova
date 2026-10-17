import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { mediaUrl } from "@/lib/admin/storage";
import { getService } from "@/lib/services";
import { projects as demoProjects, type Project } from "@/lib/projects";

/** Cache tag of the public portfolio; the admin panel invalidates it after each change. */
export const PROJECTS_TAG = "public-projects";

type ProjectRow = {
  slug: string;
  title: string;
  location: string | null;
  category: string | null;
  service_slug: string | null;
  summary: string | null;
  cover_path: string | null;
  metrics: unknown;
  project_images: { path: string; sort_order: number }[] | null;
};

const fetchPublished = unstable_cache(
  async (): Promise<Project[]> => {
    const { data, error } = await createPublicClient()
      .from("projects")
      .select("slug, title, location, category, service_slug, summary, cover_path, metrics, project_images(path, sort_order)")
      .order("is_featured", { ascending: false })
      .order("sort_order")
      .order("completed_on", { ascending: false, nullsFirst: false })
      .order("sort_order", { referencedTable: "project_images" })
      .limit(1, { referencedTable: "project_images" })
      .limit(60);
    if (error) console.error("[projects] public query failed:", error.message);
    return ((data ?? []) as unknown as ProjectRow[]).map((p) => {
      const metrics = Array.isArray(p.metrics) ? (p.metrics as { label?: string; value?: string }[]) : [];
      return {
        slug: p.slug,
        title: p.title,
        place: p.location ?? "Eje Cafetero",
        category: p.category ?? getService(p.service_slug ?? "")?.name ?? "Proyecto",
        service: p.service_slug ?? "",
        image: mediaUrl(p.cover_path ?? p.project_images?.[0]?.path) ?? "/img/tecnico-campo.webp",
        metrics: metrics.filter((m) => m.label && m.value).map((m) => ({ k: m.label!, v: m.value! })).slice(0, 3),
        summary: p.summary ?? "",
      };
    });
  },
  ["public-projects"],
  { revalidate: 300, tags: [PROJECTS_TAG] },
);

/**
 * Projects for /proyectos: the ones published from the admin panel. While the
 * owners have not published any yet, the sample projects keep the page full.
 */
export async function getPublicProjects(): Promise<{ projects: Project[]; isSample: boolean }> {
  const published = await fetchPublished().catch(() => []);
  return published.length ? { projects: published, isSample: false } : { projects: demoProjects, isSample: true };
}
