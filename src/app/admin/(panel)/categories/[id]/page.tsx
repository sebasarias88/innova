import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/fields";
import { uuid } from "@/lib/admin/actions";
import { CategoryForm } from "../CategoryForm";
import { deleteCategory, saveCategory } from "../actions";

export const metadata: Metadata = { title: "Editar categoría" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data: category }, { data: roots }] = await Promise.all([
    supabase.from("categories").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name").is("parent_id", null).neq("id", id).order("sort_order").order("name"),
  ]);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={category.name}
        back={{ href: "/admin/categories", label: "Categorías" }}
        actions={<ConfirmButton action={deleteCategory.bind(null, id)} confirmText={`¿Eliminar la categoría "${category.name}"?`} />}
      />
      <Card>
        <CategoryForm action={saveCategory.bind(null, id)} category={category} parents={roots ?? []} submitLabel="Guardar cambios" />
      </Card>
    </div>
  );
}
