"use client";

import { useSyncExternalStore } from "react";

/**
 * Shopping cart kept in the visitor's browser (localStorage).
 * Prices stored here are only for display: the server recalculates every
 * order from the database, so tampering with this data changes nothing.
 */
export type CartItem = {
  /** productId, or productId:variantId when a variant was chosen. */
  key: string;
  productId: string;
  variantId: string | null;
  variantName: string | null;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
};
export type CartProduct = Omit<CartItem, "qty" | "key">;
export type CartLine = { productId: string; variantId: string | null };

export const cartKey = (productId: string, variantId: string | null) => (variantId ? `${productId}:${variantId}` : productId);
/** "Cámara Ranger (5 MP)" */
export const cartItemName = (i: Pick<CartItem, "name" | "variantName">) => (i.variantName ? `${i.name} (${i.variantName})` : i.name);

const KEY = "innova-cart-v1";
const MAX_QTY = 99;
const MAX_ITEMS = 30;
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function toItem(x: unknown): CartItem | null {
  const i = x as Partial<CartItem>;
  if (!i || typeof i.productId !== "string" || typeof i.name !== "string" || !Number.isInteger(i.qty) || typeof i.price !== "number") return null;
  // Carts saved before variants existed have no variant fields.
  const variantId = typeof i.variantId === "string" ? i.variantId : null;
  return {
    ...(i as CartItem),
    variantId,
    variantName: variantId && typeof i.variantName === "string" ? i.variantName : null,
    key: cartKey(i.productId, variantId),
  };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    items = Array.isArray(parsed) ? parsed.map(toItem).filter((i): i is CartItem => i !== null).slice(0, MAX_ITEMS) : EMPTY;
  } catch {
    items = EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage full: the cart still works for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage); // keeps several tabs in sync
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  load();
  return items;
};

export const cart = {
  lines(): CartLine[] {
    load();
    return items.map((i) => ({ productId: i.productId, variantId: i.variantId }));
  },
  add(product: CartProduct, qty = 1) {
    load();
    const key = cartKey(product.productId, product.variantId);
    const existing = items.find((i) => i.key === key);
    if (existing) {
      commit(items.map((i) => (i.key === key ? { ...i, ...product, key, qty: Math.min(MAX_QTY, i.qty + qty) } : i)));
    } else if (items.length < MAX_ITEMS) {
      commit([...items, { ...product, key, qty: Math.min(MAX_QTY, Math.max(1, qty)) }]);
    }
  },
  setQty(key: string, qty: number) {
    load();
    if (qty <= 0) return cart.remove(key);
    commit(items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, Math.floor(qty)) } : i)));
  },
  remove(key: string) {
    load();
    commit(items.filter((i) => i.key !== key));
  },
  /** Applies current names/prices from the server; drops lines no longer sold. */
  sync(fresh: { key: string; name: string; variantName: string | null; slug: string; price: number; image: string | null }[]) {
    load();
    const byKey = new Map(fresh.map((p) => [p.key, p]));
    commit(
      items
        .filter((i) => byKey.has(i.key))
        .map((i) => {
          const p = byKey.get(i.key)!;
          return { ...i, name: p.name, variantName: p.variantName, slug: p.slug, price: p.price, image: p.image };
        }),
    );
  },
  clear() {
    commit(EMPTY);
  },
};

/** Cart contents; empty during server rendering. */
export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function useCartCount() {
  return useCart().reduce((n, i) => n + i.qty, 0);
}

// ── Paid online orders ──────────────────────────────────────────────────
// Remembers the last online order whose approved payment this browser already
// handled, so the cart is emptied once and never again for the same order.
const PAID_KEY = "innova-paid-order";

export const paidOrder = {
  isHandled(reference: string) {
    try {
      return window.localStorage.getItem(PAID_KEY) === reference;
    } catch {
      return false;
    }
  },
  markHandled(reference: string) {
    try {
      window.localStorage.setItem(PAID_KEY, reference);
    } catch {
      // Storage blocked: at worst the "payment approved" notice shows again.
    }
  },
};
