import Link from "next/link";
import { ImageOff } from "lucide-react";
import clsx from "clsx";
import type { ShopProduct } from "@/lib/shop/queries";
import { formatPrice } from "@/lib/shop/format";
import { QuickAdd } from "@/components/shop/AddToCartButton";
import { ThumbImg } from "@/components/ui/ThumbImg";

export function ProductCard({ product, priority }: { product: ShopProduct; priority?: boolean }) {
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  // Variants with different prices: the card shows the lowest one as "Desde".
  const fromPrice = product.hasVariants && (product.priceMax ?? product.price) > product.price;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/25">
      <div className="relative">
        <Link href={`/tienda/${product.slug}`} className="relative block aspect-square overflow-hidden bg-white">
          {product.image ? (
            <ThumbImg
              src={product.image}
              alt={product.name}
              loading={priority ? "eager" : "lazy"}
              className={clsx(
                "size-full object-contain p-4 transition-transform duration-500 group-hover:scale-105",
                !product.isAvailable && "opacity-50 grayscale",
              )}
            />
          ) : (
            <span className="grid size-full place-items-center bg-navy-900 text-white/25">
              <ImageOff className="size-8" />
            </span>
          )}
          <span className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {!product.isAvailable && <span className="rounded-full bg-navy-950/90 px-2.5 py-1 text-[11px] font-bold text-white">Agotado</span>}
            {product.isAvailable && discount > 0 && (
              <span className="rounded-full bg-lime-400 px-2.5 py-1 text-[11px] font-bold text-navy-900">-{discount}%</span>
            )}
          </span>
        </Link>
        {/* Phones: the add button sits on the photo so a long price never squeezes it. */}
        <div className="absolute bottom-2.5 right-2.5 z-10 sm:hidden">
          <QuickAdd
            available={product.isAvailable}
            hasVariants={product.hasVariants}
            product={{ productId: product.id, variantId: null, variantName: null, slug: product.slug, name: product.name, price: product.price, image: product.image }}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        {product.brand && <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-royal-300">{product.brand}</p>}
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-white">
          <Link href={`/tienda/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3 sm:pt-4">
          <div className="min-w-0">
            {product.compareAtPrice && <p className="truncate text-xs text-white/40 line-through">{formatPrice(product.compareAtPrice)}</p>}
            {fromPrice && <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">Desde</p>}
            <p className="whitespace-nowrap text-[15px] font-bold tracking-tight text-white min-[380px]:text-base sm:text-lg">{formatPrice(product.price)}</p>
          </div>
          <div className="relative z-10 hidden shrink-0 sm:block">
            <QuickAdd
              available={product.isAvailable}
              hasVariants={product.hasVariants}
            product={{ productId: product.id, variantId: null, variantName: null, slug: product.slug, name: product.name, price: product.price, image: product.image }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
