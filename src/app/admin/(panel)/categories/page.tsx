import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, CornerDownRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "./CategoryForm";
import { saveCategory } from "./actions";

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, parent_id, is_active, sort_order").order("sort_order").order("name"),
    supabase.from("products").select("category_id"),
  ]);

  const all = categories ?? [];
  const counts = new Map<string, number>();
  for (const p of products ?? []) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  const roots = all.filter((c) => !c.parent_id);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Categorías" description="Organiza el catálogo. Cada categoría puede tener subcategorías (un nivel)." />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {roots.length === 0 ? (
          <EmptyState title="Aún no hay categorías" description="Crea la primera con el formulario." />
        ) : (
          <ul className="space-y-3">
            {roots.map((root) => {
              const children = all.filter((c) => c.parent_id === root.id);
              return (
                <li key={root.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <Row category={root} count={counts.get(root.id) ?? 0} />
                  {children.length > 0 && (
                    <ul className="border-t border-white/5">
                      {children.map((c) => (
                        <li key={c.id} className="border-b border-white/5 last:border-0">
                          <Row category={c} count={counts.get(c.id) ?? 0} child />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <Card title="Nueva categoría" className="lg:sticky lg:top-6">
          <CategoryForm action={saveCategory.bind(null, null)} parents={roots.map(({ id, name }) => ({ id, name }))} submitLabel="Crear categoría" />
        </Card>
      </div>
    </div>
  );
}

function Row({ category, count, child }: { category: { id: string; name: string; slug: string; is_active: boolean }; count: number; child?: boolean }) {
  return (
    <Link href={`/admin/categories/${category.id}`} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/5">
      {child && <CornerDownRight className="ml-2 size-4 shrink-0 text-white/30" />}
      <div className="min-w-0 flex-1">
        <p className={child ? "text-sm font-medium" : "font-semibold"}>{category.name}</p>
        <p className="truncate font-mono text-[11px] text-white/40">/{category.slug}</p>
      </div>
      <span className="text-xs text-white/50">{count} prod.</span>
      {!category.is_active && <Badge>Oculta</Badge>}
      <ChevronRight className="size-4 text-white/30" />
    </Link>
  );
}
