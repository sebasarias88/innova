"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ActionForm, FormFeedback, MoneyField, SaveButton, SelectField, TextArea, TextField, Toggle } from "@/components/admin/fields";
import { Card } from "@/components/admin/ui";
import type { ActionResult } from "@/lib/admin/actions";

export type ProductFormValues = {
  name: string;
  slug: string;
  category_id: string;
  brand: string | null;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sort_order: number;
  is_available: boolean;
  is_published: boolean;
  is_featured: boolean;
  specs: { label: string; value: string }[];
};

type CategoryOption = { id: string; name: string; parent: string | null };

export function ProductForm({
  action,
  product,
  categories,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  product?: ProductFormValues;
  categories: CategoryOption[];
}) {
  const [specs, setSpecs] = useState(() => (product?.specs.length ? product.specs : [{ label: "", value: "" }]).map((s, i) => ({ ...s, key: i })));
  const [nextKey, setNextKey] = useState(specs.length);

  return (
    <ActionForm action={action} inlineFeedback className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card title="Información">
          <div className="space-y-4">
            <TextField label="Nombre del producto" name="name" required minLength={2} maxLength={140} defaultValue={product?.name} placeholder="Ej: Cámara IP Domo 4MP Hikvision" />
            <TextArea label="Descripción corta" name="short_description" rows={2} maxLength={280} defaultValue={product?.short_description ?? ""} hint="Aparece en la tarjeta del catálogo (máx. 280)." />
            <TextArea label="Descripción completa" name="description" rows={7} maxLength={5000} defaultValue={product?.description ?? ""} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Marca" name="brand" maxLength={60} defaultValue={product?.brand ?? ""} placeholder="Hikvision, Dahua…" />
              <TextField label="Referencia / SKU" name="sku" maxLength={60} defaultValue={product?.sku ?? ""} hint="Opcional, debe ser única." />
            </div>
          </div>
        </Card>

        <Card title="Especificaciones" description="Ficha técnica que se muestra en el detalle del producto.">
          <ul className="space-y-2">
            {specs.map((s) => (
              <li key={s.key} className="grid grid-cols-[1fr_1.4fr_auto] items-end gap-2">
                <TextField label="Característica" name="spec_label" maxLength={60} defaultValue={s.label} placeholder="Resolución" />
                <TextField label="Valor" name="spec_value" maxLength={160} defaultValue={s.value} placeholder="4 MP (2560×1440)" />
                <button
                  type="button"
                  aria-label="Quitar"
                  onClick={() => setSpecs((list) => list.filter((x) => x.key !== s.key))}
                  className="mb-0.5 grid size-10 place-items-center rounded-xl border border-white/10 text-white/50 hover:border-red-400/40 hover:text-red-300"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setSpecs((list) => [...list, { label: "", value: "", key: nextKey }]);
              setNextKey((k) => k + 1);
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-400 hover:text-white"
          >
            <Plus className="size-4" /> Agregar característica
          </button>
        </Card>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6">
        <Card title="Precio y estado">
          <div className="space-y-4">
            <MoneyField label="Precio (COP)" name="price" required defaultValue={product?.price} placeholder="0" />
            <MoneyField label="Precio anterior" name="compare_at_price" defaultValue={product?.compare_at_price} hint="Opcional: se muestra tachado como oferta." />
            <Toggle label="Disponible" description="Apágalo para mostrarlo como agotado." name="is_available" defaultChecked={product?.is_available ?? true} />
            <Toggle label="Publicado" description="Visible en la tienda." name="is_published" defaultChecked={product?.is_published ?? false} />
            <Toggle label="Destacado" description="Aparece en el inicio." name="is_featured" defaultChecked={product?.is_featured ?? false} />
          </div>
        </Card>
        <Card title="Organización">
          <div className="space-y-4">
            <SelectField label="Categoría" name="category_id" required defaultValue={product?.category_id ?? ""}>
              <option value="" disabled>
                Elige una categoría
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parent ? `${c.parent} › ${c.name}` : c.name}
                </option>
              ))}
            </SelectField>
            <TextField label="Slug (URL)" name="slug" maxLength={160} defaultValue={product?.slug} placeholder="Se genera del nombre" />
            <TextField label="Orden" name="sort_order" type="number" min={-9999} max={9999} defaultValue={product?.sort_order ?? 0} hint="Menor número aparece primero." />
          </div>
        </Card>
        <SaveButton className="w-full">{product ? "Guardar cambios" : "Crear producto"}</SaveButton>
        <FormFeedback />
      </div>
    </ActionForm>
  );
}
