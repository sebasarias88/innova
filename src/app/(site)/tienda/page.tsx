import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, Search, Truck } from "lucide-react";
import clsx from "clsx";
import { PageHero } from "@/components/layout/PageHero";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProducts, getShopCategories } from "@/lib/shop/queries";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tienda de cámaras de seguridad, alarmas y UPS en Armenia",
  alternates: { canonical: "/tienda" },
  description: "Compra cámaras de seguridad, alarmas, UPS, grabadores, reflectores y motores para puertas. Envío gratis en Armenia y a todo Colombia.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ categoria?: string; q?: string }> }) {
  const { categoria, q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim().slice(0, 60);
  const categories = await getShopCategories();

  const roots = categories.filter((c) => !c.parentId);
  const active = categories.find((c) => c.slug === categoria);
  const activeRoot = active ? (active.parentId ? categories.find((c) => c.id === active.parentId) : active) : undefined;
  const subcategories = activeRoot ? categories.filter((c) => c.parentId === activeRoot.id) : [];
  // A main category also shows the products of its subcategories.
  const categoryIds = active ? [active.id, ...categories.filter((c) => c.parentId === active.id).map((c) => c.id)] : undefined;

  const products = await getProducts({ categoryIds, q });
  const href = (slug?: string) => {
    const params = new URLSearchParams({ ...(slug && { categoria: slug }), ...(q && { q }) });
    return `/tienda${params.size ? `?${params}` : ""}`;
  };

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <nav aria-label="Categorías" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
              <Chip href={href()} active={!active}>
                Todo
              </Chip>
              {roots.map((c) => (
                <Chip key={c.id} href={href(c.slug)} active={activeRoot?.id === c.id}>
                  {c.name}
                </Chip>
              ))}
            </nav>
            <form action="/tienda" className="relative lg:w-80">
              {categoria && <input type="hidden" name="categoria" value={categoria} />}
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar productos"
                aria-label="Buscar productos"
                className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-white/40 focus:border-lime-400 focus:outline-none"
              />
            </form>
          </div>

          {subcategories.length > 0 && (
            <nav aria-label="Subcategorías" className="mt-3 flex flex-wrap gap-2">
              <Chip small href={href(activeRoot!.slug)} active={active?.id === activeRoot!.id}>
                Todas en {activeRoot!.name}
              </Chip>
              {subcategories.map((c) => (
                <Chip small key={c.id} href={href(c.slug)} active={active?.id === c.id}>
                  {c.name}
                </Chip>
              ))}
            </nav>
          )}

          <p className="mt-8 text-sm text-white/50">
            {products.length} producto{products.length === 1 ? "" : "s"}
            {active && ` en ${active.name}`}
            {q && ` para “${q}”`}
          </p>

          {products.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
              <PackageSearch className="mx-auto size-10 text-white/30" />
              <p className="mt-4 text-lg font-semibold text-white">No encontramos productos aquí</p>
              <p className="mx-auto mt-2 max-w-md text-white/60">
                Pronto agregaremos más referencias. Si buscas algo en particular, escríbenos y te cotizamos.
              </p>
              <a
                href={waLink(`Hola INNOVA 👋 Estoy buscando ${q ? `"${q}"` : "un producto"} en la tienda. ¿Lo tienen disponible?`)}
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
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          )}
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
