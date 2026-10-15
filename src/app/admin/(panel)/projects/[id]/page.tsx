import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { supabasePublishableKey } from "@/lib/supabase/env";
import { mediaUrl, storageUploadBase } from "@/lib/admin/storage";
import { services } from "@/lib/services";
import { uuid } from "@/lib/admin/actions";
import { Card, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/fields";
import { ImageManager } from "@/components/admin/ImageManager";
import { ProjectForm, type ProjectFormValues } from "../ProjectForm";
import { deleteProject, saveProject } from "../actions";

export const metadata: Metadata = { title: "Editar proyecto" };

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  if (!uuid.safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data: project }, { data: images }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("project_images").select("id, path, alt").eq("project_id", id).order("sort_order").order("created_at"),
  ]);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={project.title}
        back={{ href: "/admin/projects", label: "Proyectos" }}
        actions={<ConfirmButton action={deleteProject.bind(null, id)} confirmText={`¿Eliminar "${project.title}" y todas sus fotos? Esta acción no se puede deshacer.`} />}
      />
      {created && (
        <p className="mb-6 flex items-center gap-2 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-sm text-lime-200">
          <CheckCircle2 className="size-4" /> Proyecto creado. Sube las fotos y publícalo cuando esté listo.
        </p>
      )}
      <Card title="Fotos" description="La foto marcada como principal es la portada. Usa la estrella para cambiarla." className="mb-6">
        <ImageManager
          kind="project"
          ownerId={id}
          coverPath={project.cover_path}
          images={(images ?? []).map((img) => ({ ...img, url: mediaUrl(img.path)! }))}
          uploadBase={storageUploadBase()}
          apiKey={supabasePublishableKey()}
        />
      </Card>
      <ProjectForm action={saveProject.bind(null, id)} project={project as unknown as ProjectFormValues} services={services.map(({ slug, name }) => ({ slug, name }))} />
    </div>
  );
}
