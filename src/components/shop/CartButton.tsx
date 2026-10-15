"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { useCartCount } from "@/lib/shop/cart";

export function CartButton({ className }: { className?: string }) {
  const count = useCartCount();
  return (
    <Link
      href="/carrito"
      aria-label={count ? `Carrito (${count} productos)` : "Carrito"}
      className={clsx("relative grid size-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-lime-400 hover:text-lime-400", className)}
    >
      <ShoppingCart className="size-5" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-lime-400 px-1 font-mono text-[11px] font-bold text-navy-900"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
