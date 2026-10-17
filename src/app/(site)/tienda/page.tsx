import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChipRail } from "./ChipRail";
import { ChevronLeft, ChevronRight, PackageSearch, Search, Truck, X } from "lucide-react";
import clsx from "clsx";
import { PageHero } from "@/components/layout/PageHero";
import { ProductCard } from "@/components/shop/ProductCard";
import { PAGE_SIZE, getProductPage, getShopCategories } from "@/lib/shop/queries";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tienda de cámaras de seguridad, alarmas y UPS en Armenia",
  alternates: { canonical: "/tienda" },
  description: "Compra cámaras de seguridad, alarmas, UPS, grabadores, reflectores y motores para puertas. Envío gratis en Armenia y a todo Colombia.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ categoria?: string; q?: string; pagina?: string }> }) {
  const { categoria, q: rawQ, pagina } = await searchParams;
  const q = (rawQ ?? "").trim().slice(0, 60);
  const requestedPage = Math.min(Math.max(1, Number.parseInt(pagina ?? "1", 10) || 1), 1000);
  const categories = await getShopCategories();

  const roots = categories.filter((c) => !c.parentId);
  const active = categories.find((c) => c.slug === categoria);
  const activeRoot = active ? (active.parentId ? categories.find((c) => c.id === active.parentId) : active) : undefined;
  const subcategories = activeRoot ? categories.filter((c) => c.parentId === activeRoot.id) : [];
  // A main category also shows the products of its subcategories.
  const categoryIds = active ? [active.id, ...categories.filter((c) => c.parentId === active.id).map((c) => c.id)] : undefined;

  const { products, total, page, pages } = await getProductPage({ categoryIds, q: q || undefined, page: requestedPage });
  const href = (slug?: string, toPage = 1) => {
    const params = new URLSearchParams({ ...(slug && { categoria: slug }), ...(q && { q }), ...(toPage > 1 && { pagina: String(toPage) }) });
    return `/tienda${params.size ? `?${params}` : ""}`;
  };
  // A page past the end (old link, fewer products now) goes to the last page.
  if (requestedPage > pages) redirect(href(active?.slug, pages));
  const first = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const last = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <PageHero
        eyebrow="Tienda en línea"
        title={
          <>
            Equipos de seguridad <span className="text-lime-400">listos para llevar.</span>
          </>
        }
        text="Cámaras, alarmas, UPS, grabadores y más. Elige, paga como prefieras y te lo enviamos. En Armenia el envío es gratis."
      >
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
          <Truck className="size-4 text-lime-400" /> Envío gratis en Armenia · Resto del país a convenir
        </p>
      </PageHero>

      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <form action="/tienda" role="search" className="relative mx-auto max-w-2xl">
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              maxLength={60}
              enterKeyHint="search"
              placeholder="Buscar: cámara, alarma, UPS…"
              aria-label="Buscar productos"
              className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-28 text-white placeholder:text-white/40 focus:border-lime-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <Link
                href={active ? `/tienda?categoria=${active.slug}` : "/tienda"}
                scroll={false}
                aria-label="Borrar búsqueda"
                className="absolute right-[5.5rem] top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </Link>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-white"
            >
              Buscar
            </button>
          </form>

          <ChipRail label="Categorías" className="mt-6">
            <Chip href={href()} active={!active}>
              Todo
            </Chip>
            {roots.map((c) => (
              <Chip key={c.id} href={href(c.slug)} active={activeRoot?.id === c.id}>
                {c.name}
              </Chip>
            ))}
          </ChipRail>

          {subcategories.length > 0 && (
            <ChipRail label="Subcategorías" className="mt-2">
              <Chip small href={href(activeRoot!.slug)} active={active?.id === activeRoot!.id}>
                Todas en {activeRoot!.name}
              </Chip>
              {subcategories.map((c) => (
                <Chip small key={c.id} href={href(c.slug)} active={active?.id === c.id}>
                  {c.name}
                </Chip>
              ))}
            </ChipRail>
          )}

          <p id="productos" className="mt-8 scroll-mt-28 text-sm text-white/50">
            {total} producto{total === 1 ? "" : "s"}
            {active && ` en ${active.name}`}
            {q && ` para “${q}”`}
            {pages > 1 && ` · mostrando ${first}–${last}`}
          </p>

          {products.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
              <PackageSearch className="mx-auto size-10 text-white/30" />
              <p className="mt-4 text-lg font-semibold text-white">No encontramos productos aquí</p>
              <p className="mx-auto mt-2 max-w-md text-white/60">
                Pronto agregaremos más referencias. Si buscas algo en particular, escríbenos y te cotizamos.
              </p>
              <a
                href={waLink(`Hola, INNOVA. Estoy buscando ${q ? `"${q}"` : "un producto"} en la tienda en línea. ¿Lo tienen disponible?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex rounded-full bg-lime-400 px-6 py-3 text-sm font-semibold text-navy-900 hover:bg-white"
              >
                Preguntar por WhatsApp
              </a>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={page === 1 && i < 4} />
              ))}
            </div>
          )}

          {pages > 1 && <Pagination page={page} pages={pages} hrefFor={(n) => `${href(active?.slug, n)}#productos`} />}
        </div>
      </section>
    </>
  );
}

function Chip({ href, active, children, small }: { href: string; active?: boolean; children: React.ReactNode; small?: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "shrink-0 whitespace-nowrap rounded-full border font-semibold transition-colors",
        small ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm",
        active ? "border-lime-400 bg-lime-400 text-navy-900" : "border-white/15 text-white/75 hover:border-white/40 hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}

/** Page numbers to show: always the first, the last and the ones around the current page. */
function pageList(page: number, pages: number): (number | "…")[] {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...wanted].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ["…" as const, n] : [n]));
}

function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (n: number) => string }) {
  const arrow = "grid size-11 place-items-center rounded-full border transition-colors";
  return (
    <nav aria-label="Páginas" className="mt-10 flex items-center justify-center gap-1.5 sm:gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} aria-label="Página anterior" className={clsx(arrow, "border-white/15 text-white hover:border-lime-400 hover:text-lime-400")}>
          <ChevronLeft className="size-5" />
        </Link>
      ) : (
        <span aria-hidden className={clsx(arrow, "border-white/5 text-white/20")}>
          <ChevronLeft className="size-5" />
        </span>
      )}
      {pageList(page, pages).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-white/40">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={hrefFor(n)}
            aria-current={n === page ? "page" : undefined}
            className={clsx(
              "grid h-11 min-w-11 place-items-center rounded-full border px-3 font-mono text-sm font-semibold transition-colors",
              n === page ? "border-lime-400 bg-lime-400 text-navy-900" : "border-white/15 text-white/75 hover:border-white/40 hover:text-white",
            )}
          >
            {n}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link href={hrefFor(page + 1)} aria-label="Página siguiente" className={clsx(arrow, "border-white/15 text-white hover:border-lime-400 hover:text-lime-400")}>
          <ChevronRight className="size-5" />
        </Link>
      ) : (
        <span aria-hidden className={clsx(arrow, "border-white/5 text-white/20")}>
          <ChevronRight className="size-5" />
        </span>
      )}
    </nav>
  );
}
