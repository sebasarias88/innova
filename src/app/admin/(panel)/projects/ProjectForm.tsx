"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ActionForm, FormFeedback, SaveButton, SelectField, TextArea, TextField, Toggle } from "@/components/admin/fields";
import { Card } from "@/components/admin/ui";
import type { ActionResult } from "@/lib/admin/actions";

export type ProjectFormValues = {
  title: string;
  slug: string;
  location: string | null;
  category: string | null;
  service_slug: string | null;
  summary: string | null;
  description: string | null;
  completed_on: string | null;
  sort_order: number;
  is_published: boolean;
  is_featured: boolean;
  metrics: { label: string; value: string }[];
};

const CATEGORY_SUGGESTIONS = ["Residencial", "Comercial", "Industrial", "Turismo", "Institucional", "Agro"];

export function ProjectForm({
  action,
  project,
  services,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  project?: ProjectFormValues;
  services: { slug: string; name: string }[];
}) {
  const [metrics, setMetrics] = useState(() => (project?.metrics.length ? project.metrics : [{ label: "", value: "" }]).map((m, i) => ({ ...m, key: i })));
  const [nextKey, setNextKey] = useState(metrics.length);

  return (
    <ActionForm action={action} inlineFeedback className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card title="Información">
          <div className="space-y-4">
            <TextField label="Título" name="title" required minLength={2} maxLength={120} defaultValue={project?.title} placeholder="Ej: Conjunto residencial Los Robles" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Ubicación" name="location" maxLength={120} defaultValue={project?.location ?? ""} placeholder="Armenia, Quindío" />
              <TextField label="Tipo de cliente" name="category" maxLength={60} list="project-categories" defaultValue={project?.category ?? ""} placeholder="Residencial" />
              <datalist id="project-categories">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <TextArea label="Resumen" name="summary" rows={3} maxLength={400} defaultValue={project?.summary ?? ""} hint="Aparece en la tarjeta del proyecto (máx. 400)." />
            <TextArea label="Descripción completa" name="description" rows={6} maxLength={5000} defaultValue={project?.description ?? ""} />
          </div>
        </Card>

        <Card title="Cifras del proyecto" description="Datos destacados, por ejemplo: Cámaras IP · 32, Ahorro · 85%. Máximo 6.">
          <ul className="space-y-2">
            {metrics.map((m) => (
              <li key={m.key} className="grid grid-cols-[1.3fr_1fr_auto] items-end gap-2">
                <TextField label="Dato" name="metric_label" maxLength={40} defaultValue={m.label} placeholder="Cámaras IP" />
                <TextField label="Valor" name="metric_value" maxLength={40} defaultValue={m.value} placeholder="32" />
                <button
                  type="button"
                  aria-label="Quitar"
                  onClick={() => setMetrics((list) => list.filter((x) => x.key !== m.key))}
                  className="mb-0.5 grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:border-red-400/40 hover:text-red-300"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          {metrics.length < 6 && (
            <button
              type="button"
              onClick={() => {
                setMetrics((list) => [...list, { label: "", value: "", key: nextKey }]);
                setNextKey((k) => k + 1);
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-400 hover:text-white"
            >
              <Plus className="size-4" /> Agregar dato
            </button>
          )}
        </Card>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6">
        <Card title="Publicación">
          <div className="space-y-4">
            <Toggle label="Publicado" description="Visible en la página de proyectos." name="is_published" defaultChecked={project?.is_published ?? false} />
            <Toggle label="Destacado" description="Aparece en el inicio." name="is_featured" defaultChecked={project?.is_featured ?? false} />
          </div>
        </Card>
        <Card title="Organización">
          <div className="space-y-4">
            <SelectField
              label="Servicio relacionado"
              name="service_slug"
              defaultValue={project?.service_slug ?? ""}
              options={[{ value: "", label: "— Ninguno —" }, ...services.map((s) => ({ value: s.slug, label: s.name }))]}
            />
            <TextField label="Fecha de entrega" name="completed_on" type="date" defaultValue={project?.completed_on ?? ""} />
            <TextField label="Slug (URL)" name="slug" maxLength={140} defaultValue={project?.slug} placeholder="Se genera del título" />
            <TextField label="Orden" name="sort_order" type="number" min={-9999} max={9999} defaultValue={project?.sort_order ?? 0} />
          </div>
        </Card>
        <SaveButton className="w-full">{project ? "Guardar cambios" : "Crear proyecto"}</SaveButton>
        <FormFeedback />
      </div>
    </ActionForm>
  );
}
