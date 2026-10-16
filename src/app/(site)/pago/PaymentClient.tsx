"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cart, paidOrder } from "@/lib/shop/cart";

/** The purchase is done: empty the cart in this browser. */
export function ClearCart({ reference }: { reference: string }) {
  useEffect(() => {
    cart.clear();
    paidOrder.markHandled(reference);
  }, [reference]);
  return null;
}

/** Re-checks the payment every few seconds while the bank confirms it (≈2 minutes max). */
export function RefreshWhilePending() {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (tries > 24) return clearInterval(timer);
      router.refresh();
    }, 5000);
    return () => clearInterval(timer);
  }, [router]);
  return null;
}
