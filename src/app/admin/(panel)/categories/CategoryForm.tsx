"use client";

import { ActionForm, SaveButton, SelectField, TextArea, TextField, Toggle } from "@/components/admin/fields";
import type { ActionResult } from "@/lib/admin/actions";

type Category = {
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export function CategoryForm({
  action,
  category,
  parents,
  submitLabel,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  category?: Category;
  parents: { id: string; name: string }[];
  submitLabel: string;
}) {
  return (
    <ActionForm action={action} resetOnSuccess={!category} className="space-y-4">
      <TextField label="Nombre" name="name" required minLength={2} maxLength={80} defaultValue={category?.name} placeholder="Ej: Cámaras IP" />
      <SelectField label="Categoría padre" name="parent_id" defaultValue={category?.parent_id ?? ""} hint="Déjalo vacío para que sea una categoría principal.">
        <option value="">— Categoría principal —</option>
        {parents.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </SelectField>
      <TextArea label="Descripción" name="description" rows={3} maxLength={500} defaultValue={category?.description ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Slug (URL)" name="slug" maxLength={90} defaultValue={category?.slug} placeholder="Se genera del nombre" hint="Solo minúsculas, números y guiones." />
        <TextField label="Orden" name="sort_order" type="number" min={-9999} max={9999} defaultValue={category?.sort_order ?? 0} hint="Menor número aparece primero." />
      </div>
      <Toggle label="Visible en la tienda" name="is_active" defaultChecked={category?.is_active ?? true} />
      <SaveButton>{submitLabel}</SaveButton>
    </ActionForm>
  );
}
