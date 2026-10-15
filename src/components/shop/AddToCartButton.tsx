"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { cart } from "@/lib/shop/cart";

type Product = { productId: string; slug: string; name: string; price: number; image: string | null };

/** Full control on the product page: quantity + add. */
export function AddToCart({ product, available }: { product: Product; available: boolean }) {
  const [qty, setQty] = useState(1);
  const router = useRouter();

  if (!available) {
    return (
      <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
        Este producto está <b>agotado</b> por ahora. Escríbenos por WhatsApp y te avisamos cuando llegue.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-full border border-white/15 bg-white/5">
        <button type="button" aria-label="Quitar uno" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-12 place-items-center text-white/70 hover:text-white">
          <Minus className="size-4" />
        </button>
        <span className="w-8 text-center font-mono text-lg font-semibold" aria-live="polite">
          {qty}
        </span>
        <button type="button" aria-label="Agregar uno" onClick={() => setQty((q) => Math.min(99, q + 1))} className="grid size-12 place-items-center text-white/70 hover:text-white">
          <Plus className="size-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          cart.add(product, qty);
          toast.success("Agregado al carrito", {
            description: `${qty} × ${product.name}`,
            action: { label: "Ver carrito", onClick: () => router.push("/carrito") },
          });
        }}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-lime-400 px-8 py-4 font-semibold text-navy-900 transition-colors hover:bg-white sm:flex-none"
      >
        <ShoppingCart className="size-5" /> Agregar al carrito
      </button>
    </div>
  );
}

/** Compact round button used on product cards. */
export function QuickAdd({ product, available, className }: { product: Product; available: boolean; className?: string }) {
  const router = useRouter();
  if (!available) return null;
  return (
    <button
      type="button"
      aria-label={`Agregar ${product.name} al carrito`}
      onClick={(e) => {
        e.preventDefault();
        cart.add(product, 1);
        toast.success("Agregado al carrito", {
          description: product.name,
          action: { label: "Ver carrito", onClick: () => router.push("/carrito") },
        });
      }}
      className={clsx(
        "grid size-11 place-items-center rounded-full bg-lime-400 text-navy-900 shadow-lg shadow-black/30 transition-transform hover:scale-105 active:scale-95",
        className,
      )}
    >
      <Plus className="size-5" />
    </button>
  );
}
