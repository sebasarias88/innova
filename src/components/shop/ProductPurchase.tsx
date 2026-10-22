"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { AddToCart } from "@/components/shop/AddToCartButton";
import { formatPrice } from "@/lib/shop/format";
import type { ShopVariant } from "@/lib/shop/queries";

type Props = {
  product: { id: string; slug: string; name: string; sku: string | null; price: number; compareAtPrice: number | null; isAvailable: boolean; image: string | null };
  variants: ShopVariant[];
};

/**
 * Price, variant picker and "add to cart" of the product page. Without
 * variants it behaves exactly as before; with variants (3 MP / 5 MP…) the
 * price, reference and availability follow the selected option.
 */
export function ProductPurchase({ product, variants }: Props) {
  const [selectedId, setSelectedId] = useState(() => (variants.find((v) => v.isAvailable) ?? variants[0])?.id ?? null);
  const variant = variants.find((v) => v.id === selectedId) ?? null;

  const price = variant?.price ?? product.price;
  const compareAt = variant ? variant.compareAtPrice : product.compareAtPrice;
  const available = variant ? variant.isAvailable : product.isAvailable;
  const sku = variant?.sku ?? product.sku;
  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : 0;

  return (
    <>
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <p className="text-4xl font-bold text-white" aria-live="polite">
          {formatPrice(price)}
        </p>
        {compareAt && (
          <>
            <p className="pb-1 text-lg text-white/40 line-through">{formatPrice(compareAt)}</p>
            <span className="mb-1.5 rounded-full bg-lime-400 px-2.5 py-1 text-xs font-bold text-navy-900">-{discount}%</span>
          </>
        )}
      </div>
      <p className="mt-1 text-sm text-white/50">
        Precio final.{sku && <span className="text-white/40"> · Ref. {sku}</span>}
      </p>

      {variants.length > 0 && (
        <fieldset className="mt-7">
          <legend className="text-sm font-semibold text-white">
            Elige tu opción{variant && <span className="font-normal text-white/50"> · {variant.name}</span>}
          </legend>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {variants.map((v) => {
              const active = v.id === selectedId;
              return (
                <label
                  key={v.id}
                  className={clsx(
                    "relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lime-400",
                    active ? "border-lime-400 bg-lime-400/[0.07]" : "border-white/15 hover:border-white/35",
                    !v.isAvailable && "opacity-60",
                  )}
                >
                  <input type="radio" name="variant" value={v.id} checked={active} onChange={() => setSelectedId(v.id)} className="sr-only" />
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-white">{v.name}</span>
                    {active && (
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-lime-400 text-navy-900">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  {v.highlight && <span className="mt-1 text-sm leading-snug text-white/60">{v.highlight}</span>}
                  <span className="mt-auto flex items-baseline gap-2 pt-3">
                    <span className="font-mono text-sm font-semibold text-white">{formatPrice(v.price)}</span>
                    {v.compareAtPrice && <span className="text-xs text-white/40 line-through">{formatPrice(v.compareAtPrice)}</span>}
                    {!v.isAvailable && <span className="ml-auto text-xs font-semibold text-red-300">Agotado</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-8">
        <AddToCart
          available={available}
          soldOutText={variant ? `La opción ${variant.name} está agotada por ahora. Elige otra o escríbenos por WhatsApp y te avisamos cuando llegue.` : undefined}
          product={{
            productId: product.id,
            variantId: variant?.id ?? null,
            variantName: variant?.name ?? null,
            slug: product.slug,
            name: product.name,
            price,
            image: product.image,
          }}
        />
      </div>
    </>
  );
}
