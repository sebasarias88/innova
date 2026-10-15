"use client";

import { useSyncExternalStore } from "react";

/**
 * Shopping cart kept in the visitor's browser (localStorage).
 * Prices stored here are only for display: the server recalculates every
 * order from the database, so tampering with this data changes nothing.
 */
export type CartItem = { productId: string; slug: string; name: string; price: number; image: string | null; qty: number };

const KEY = "innova-cart-v1";
const MAX_QTY = 99;
const MAX_ITEMS = 30;
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isItem(x: unknown): x is CartItem {
  const i = x as CartItem;
  return !!i && typeof i.productId === "string" && typeof i.name === "string" && Number.isInteger(i.qty) && typeof i.price === "number";
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    items = Array.isArray(parsed) ? parsed.filter(isItem).slice(0, MAX_ITEMS) : EMPTY;
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
  ids() {
    load();
    return items.map((i) => i.productId);
  },
  add(product: Omit<CartItem, "qty">, qty = 1) {
    load();
    const existing = items.find((i) => i.productId === product.productId);
    if (existing) {
      commit(items.map((i) => (i.productId === product.productId ? { ...i, ...product, qty: Math.min(MAX_QTY, i.qty + qty) } : i)));
    } else if (items.length < MAX_ITEMS) {
      commit([...items, { ...product, qty: Math.min(MAX_QTY, Math.max(1, qty)) }]);
    }
  },
  setQty(productId: string, qty: number) {
    load();
    if (qty <= 0) return cart.remove(productId);
    commit(items.map((i) => (i.productId === productId ? { ...i, qty: Math.min(MAX_QTY, Math.floor(qty)) } : i)));
  },
  remove(productId: string) {
    load();
    commit(items.filter((i) => i.productId !== productId));
  },
  /** Applies current names/prices from the server; drops products no longer sold. */
  sync(fresh: { id: string; name: string; slug: string; price: number; image: string | null }[]) {
    load();
    const byId = new Map(fresh.map((p) => [p.id, p]));
    commit(
      items
        .filter((i) => byId.has(i.productId))
        .map((i) => {
          const p = byId.get(i.productId)!;
          return { ...i, name: p.name, slug: p.slug, price: p.price, image: p.image };
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
