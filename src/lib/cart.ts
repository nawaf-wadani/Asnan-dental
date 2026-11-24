import { useCallback, useSyncExternalStore } from "react";

/**
 * "Order list" shared between the Inventory page and the Order page.
 * Lives in localStorage so it survives navigation and a tablet reload;
 * the Order page merges it into the current order and clears it.
 */

const KEY = "asnan:cart";
export type Cart = Record<string, number>;

const EMPTY: Cart = Object.freeze({}) as Cart;
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedCart: Cart = EMPTY;

function read(): Cart {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cachedCart;
  }
  if (raw === cachedRaw) return cachedCart;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as Cart) : EMPTY;
    const clean: Cart = {};
    for (const [sku, qty] of Object.entries(parsed)) {
      if (typeof qty === "number" && qty > 0) clean[sku] = Math.min(9999, Math.floor(qty));
    }
    cachedCart = Object.keys(clean).length ? clean : EMPTY;
  } catch {
    cachedCart = EMPTY;
  }
  return cachedCart;
}

function write(next: Cart) {
  try {
    if (Object.keys(next).length === 0) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked — ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function readCart(): Cart {
  return read();
}

export function clearCart(): void {
  write({});
}

export function useCart() {
  const cart = useSyncExternalStore(subscribe, read, () => EMPTY);

  const setQty = useCallback((sku: string, qty: number) => {
    const next = { ...read() };
    if (qty <= 0) delete next[sku];
    else next[sku] = Math.min(9999, Math.floor(qty));
    write(next);
  }, []);

  const addMany = useCallback((skus: string[], qty = 1) => {
    const next = { ...read() };
    for (const sku of skus) if (!next[sku]) next[sku] = qty;
    write(next);
  }, []);

  const lines = Object.keys(cart).length;
  const units = Object.values(cart).reduce((s, n) => s + n, 0);

  return { cart, lines, units, setQty, addMany, clear: clearCart };
}
