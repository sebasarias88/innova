/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { ImageOff, MapPin, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/admin/storage";
import { getService } from "@/lib/services";
import { Badge, EmptyState, LinkButton, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Proyectos" };

export default async function ProjectsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, location, category, service_slug, cover_path, is_published, is_featured, project_images(count)")
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Proyectos"
        description="Trabajos realizados que se muestran en la web, con sus fotos."
        actions={<LinkButton href="/admin/projects/new" icon={<Plus className="size-4" />}>Nuevo proyecto</LinkButton>}
      />
      {!projects?.length ? (
        <EmptyState title="Aún no hay proyectos" description="Sube los trabajos realizados para generar confianza." action={<LinkButton href="/admin/projects/new">Crear proyecto</LinkButton>} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const url = mediaUrl(p.cover_path);
            const photos = (p.project_images as unknown as { count: number }[])[0]?.count ?? 0;
            return (
              <li key={p.id}>
                <Link href={`/admin/projects/${p.id}`} className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/25">
                  <div className="relative grid aspect-[16/10] place-items-center bg-white/5">
                    {url ? <img src={url} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" /> : <ImageOff className="size-6 text-white/25" />}
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      {p.is_published ? <Badge tone="lime">Publicado</Badge> : <Badge>Borrador</Badge>}
                      {p.is_featured && <Badge tone="blue">Destacado</Badge>}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold group-hover:text-lime-300">{p.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-white/45">
                      <MapPin className="size-3" /> {p.location || "Sin ubicación"}
                    </p>
                    <p className="mt-3 text-xs text-white/45">
                      {[p.category, p.service_slug && getService(p.service_slug)?.name, `${photos} foto${photos === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
