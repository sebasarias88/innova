/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { ImageOff, Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/admin/storage";
import { formatCop } from "@/lib/admin/format";
import { Badge, EmptyState, LinkButton, PageHeader, Pagination, Table } from "@/components/admin/ui";
import { QuickToggle } from "./QuickToggle";

export const metadata: Metadata = { title: "Productos" };

const PAGE_SIZE = 20;
type Search = { q?: string; category?: string; status?: string; page?: string };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim().slice(0, 80);

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, slug, sku, brand, price, is_available, is_published, is_featured, category:categories(name), product_images(path, sort_order)", { count: "exact" })
    .order("sort_order")
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) {
    const term = `%${q.replace(/[%_,()]/g, " ")}%`;
    query = query.or(`name.ilike.${term},sku.ilike.${term},brand.ilike.${term}`);
  }
  if (sp.category) query = query.eq("category_id", sp.category);
  if (sp.status === "sold_out") query = query.eq("is_available", false);
  if (sp.status === "draft") query = query.eq("is_published", false);
  if (sp.status === "featured") query = query.eq("is_featured", true);

  const [{ data: products, count }, { data: categories }] = await Promise.all([
    query,
    supabase.from("categories").select("id, name, parent_id").order("sort_order").order("name"),
  ]);

  const hrefFor = (p: number) => {
    const params = new URLSearchParams({ ...(q && { q }), ...(sp.category && { category: sp.category }), ...(sp.status && { status: sp.status }), page: String(p) });
    return `/admin/products?${params}`;
  };
  const filtered = Boolean(q || sp.category || sp.status);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Productos"
        description="Crea, edita y marca productos como agotados."
        actions={<LinkButton href="/admin/products/new" icon={<Plus className="size-4" />}>Nuevo producto</LinkButton>}
      />

      <form className="mb-5 grid gap-2 sm:grid-cols-[1fr_200px_170px_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <input name="q" defaultValue={q} placeholder="Buscar por nombre, marca o referencia" className="w-full rounded-xl border border-white/10 bg-navy-950/60 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-lime-400/70" />
        </label>
        <select name="category" defaultValue={sp.category ?? ""} className="rounded-xl border border-white/10 bg-navy-950/60 px-3 py-2.5 text-sm outline-none">
          <option value="">Todas las categorías</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.parent_id ? `— ${c.name}` : c.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className="rounded-xl border border-white/10 bg-navy-950/60 px-3 py-2.5 text-sm outline-none">
          <option value="">Todos</option>
          <option value="sold_out">Agotados</option>
          <option value="draft">Borradores</option>
          <option value="featured">Destacados</option>
        </select>
        <button className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-white/40">Filtrar</button>
      </form>

      {!products?.length ? (
        <EmptyState
          title={filtered ? "Sin resultados" : "Aún no hay productos"}
          description={filtered ? "Prueba con otros filtros." : "Crea el primero para empezar el catálogo."}
          action={!filtered && <LinkButton href="/admin/products/new">Crear producto</LinkButton>}
        />
      ) : (
        <>
          <Table head={["Producto", "Categoría", "Precio", "Estado", "Tienda"]}>
            {products.map((p) => {
              const cover = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
              const url = mediaUrl(cover?.path);
              return (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/5">
                        {url ? <img src={url} alt="" className="size-full object-cover" loading="lazy" /> : <ImageOff className="size-4 text-white/30" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold hover:text-lime-300">{p.name}</span>
                        <span className="block truncate text-xs text-white/40">{[p.brand, p.sku].filter(Boolean).join(" · ") || "—"}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/70">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{formatCop(p.price)}</td>
                  <td className="px-4 py-3">
                    <QuickToggle id={p.id} flag="is_available" value={p.is_available} on="Disponible" off="Agotado" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <QuickToggle id={p.id} flag="is_published" value={p.is_published} on="Publicado" off="Borrador" />
                      {p.is_featured && <Badge tone="blue">Destacado</Badge>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} hrefFor={hrefFor} />
        </>
      )}
    </div>
  );
}
