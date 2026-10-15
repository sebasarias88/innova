import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductCard } from "@/components/shop/ProductCard";
import { getFeaturedProducts } from "@/lib/shop/queries";

/** "Productos destacados" on the home page. Hidden while there are none. */
export async function FeaturedProducts() {
  const products = await getFeaturedProducts(8).catch(() => []);
  if (!products.length) return null;

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>Tienda en línea</Eyebrow>
            <h2 className="mt-5 text-balance text-4xl font-bold leading-[1] tracking-tight text-white sm:text-6xl">
              Productos <span className="text-lime-400">destacados.</span>
            </h2>
          </div>
          <Link href="/tienda" className="group inline-flex items-center gap-2 font-semibold text-white hover:text-lime-400">
            Ver toda la tienda <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
