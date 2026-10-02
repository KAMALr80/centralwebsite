"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

export interface CartItem {
  product_id: number;
  name: string;
  sku: string | null;
  image: string | null;
  price: number;
  quantity: number;
  parent_id?: number | null;
  parent_name?: string | null;
  price_pending?: boolean;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, qty: number) => void;
  updateQty: (product_id: number, qty: number) => void;
  removeItem: (product_id: number) => void;
  clearCart: () => void;
  refreshPrices: () => Promise<void>;
}

interface ServerCartItem {
  product_id: number;
  name: string;
  sku: string | null;
  image: string | null;
  price: number | null;
  quantity: number;
  parent_id: number | null;
  parent_name: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

// The account's cart lives on the API so it follows the user across devices;
// localStorage is only a cache for instant rendering.
const STORAGE_KEY = "fastweb_cart";
// Set once a browser's pre-sync cart has been merged into the account.
const SYNCED_KEY = "fastweb_cart_synced";
const REFRESH_INTERVAL_MS = 30_000;
const EMPTY_CART: CartItem[] = [];
const cartListeners = new Set<() => void>();
let cachedRawCart: string | null | undefined;
let cachedCartItems: CartItem[] = EMPTY_CART;

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    Number.isInteger(item.product_id) &&
    typeof item.name === "string" &&
    (typeof item.sku === "string" || item.sku === null) &&
    (typeof item.image === "string" || item.image === null) &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    Number.isInteger(item.quantity) &&
    Number(item.quantity) > 0
  );
}

function getCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === cachedRawCart) return cachedCartItems;

    cachedRawCart = stored;
    if (!stored) {
      cachedCartItems = EMPTY_CART;
      return cachedCartItems;
    }

    const parsed: unknown = JSON.parse(stored);
    cachedCartItems = Array.isArray(parsed) ? parsed.filter(isCartItem) : EMPTY_CART;
    return cachedCartItems;
  } catch {
    return cachedCartItems;
  }
}

function getServerCartSnapshot() {
  return EMPTY_CART;
}

function subscribeToCart(listener: () => void) {
  cartListeners.add(listener);

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      cachedRawCart = undefined;
      listener();
    }
  }

  window.addEventListener("storage", handleStorage);
  return () => {
    cartListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function writeCartItems(items: CartItem[]) {
  const serialized = JSON.stringify(items);
  cachedRawCart = serialized;
  cachedCartItems = items;

  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Keep the in-memory cart usable when browser storage is unavailable.
  }

  cartListeners.forEach((listener) => listener());
}

// Clears this browser's copy only — the account cart stays on the server.
export function clearStoredCart() {
  cachedRawCart = null;
  cachedCartItems = EMPTY_CART;

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SYNCED_KEY);
  } catch {
    // The in-memory cart is still cleared when browser storage is unavailable.
  }

  cartListeners.forEach((listener) => listener());
}

function updateCartItems(updater: (items: CartItem[]) => CartItem[]) {
  writeCartItems(updater(getCartSnapshot()));
}

function hasSession() {
  try {
    return !!localStorage.getItem("auth_token");
  } catch {
    return false;
  }
}

function fromServer(items: ServerCartItem[]): CartItem[] {
  return items.map((item) => {
    const hasPrice =
      item.price !== null && Number.isFinite(item.price) && item.price >= 0;
    return {
      product_id: item.product_id,
      name: item.name,
      sku: item.sku,
      image: item.image,
      price: hasPrice ? (item.price as number) : 0,
      quantity: item.quantity,
      parent_id: item.parent_id,
      parent_name: item.parent_name,
      price_pending: !hasPrice,
    };
  });
}

// Mutations run one at a time so the server sees them in the order the user
// made them; only the last response in a burst replaces the local cart.
let queue: Promise<void> = Promise.resolve();
let queuedCount = 0;
let mutationVersion = 0;
let syncInFlight: Promise<void> | null = null;

function applyServerCart(items: ServerCartItem[]) {
  if (queuedCount === 0) writeCartItems(fromServer(items));
}

function syncFromServer(): Promise<void> {
  if (!hasSession()) return Promise.resolve();
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    let needsMerge = false;
    try {
      needsMerge = localStorage.getItem(SYNCED_KEY) !== "1";
    } catch {
      // Without storage there is no browser cart to merge.
    }

    const startedAt = mutationVersion;
    const local = getCartSnapshot();
    const res =
      needsMerge && local.length > 0
        ? await api.post<{ data: ServerCartItem[] }>("/cart/merge", {
            items: local.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          })
        : await api.get<{ data: ServerCartItem[] }>("/cart");

    try {
      localStorage.setItem(SYNCED_KEY, "1");
    } catch {
      // Ignore — the next sync simply merges again, which is idempotent.
    }
    // A cart change made while this request was out wins over its stale reply.
    if (startedAt === mutationVersion) applyServerCart(res.data.data);
  })()
    .catch(() => {
      // Keep the cached cart when the API is unreachable.
    })
    .finally(() => {
      syncInFlight = null;
    });

  return syncInFlight;
}

function sendMutation(request: () => Promise<{ data: { data: ServerCartItem[] } }>) {
  if (!hasSession()) return;

  queuedCount += 1;
  mutationVersion += 1;
  queue = queue
    .then(async () => {
      try {
        const res = await request();
        queuedCount -= 1;
        applyServerCart(res.data.data);
      } catch {
        queuedCount -= 1;
        if (queuedCount === 0) await syncFromServer();
      }
    });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  );

  // Load the account cart on sign-in and keep it fresh while the tab is in use,
  // so changes made on another device show up here.
  useEffect(() => {
    if (!userId) return;

    syncFromServer();

    function refreshIfVisible() {
      if (document.visibilityState === "visible") syncFromServer();
    }

    const interval = window.setInterval(refreshIfVisible, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
    };
  }, [userId]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, qty: number) => {
      const safeQty = Math.max(0, Math.trunc(qty));
      if (safeQty === 0 || !Number.isFinite(item.price) || item.price < 0) return;
      updateCartItems((prev) => {
        const existing = prev.find((i) => i.product_id === item.product_id);
        if (existing) {
          return prev.map((i) =>
            i.product_id === item.product_id
              ? { ...i, quantity: i.quantity + safeQty }
              : i
          );
        }
        return [...prev, { ...item, quantity: safeQty }];
      });
      sendMutation(() =>
        api.post("/cart/items", { product_id: item.product_id, quantity: safeQty })
      );
    },
    []
  );

  const updateQty = useCallback((product_id: number, qty: number) => {
    const safeQty = Math.max(0, Math.trunc(qty));
    if (safeQty <= 0) {
      updateCartItems((prev) => prev.filter((i) => i.product_id !== product_id));
    } else {
      updateCartItems((prev) =>
        prev.map((i) =>
          i.product_id === product_id ? { ...i, quantity: safeQty } : i
        )
      );
    }
    sendMutation(() => api.put(`/cart/items/${product_id}`, { quantity: safeQty }));
  }, []);

  const removeItem = useCallback((product_id: number) => {
    updateCartItems((prev) => prev.filter((i) => i.product_id !== product_id));
    sendMutation(() => api.delete(`/cart/items/${product_id}`));
  }, []);

  const clearCart = useCallback(() => {
    writeCartItems(EMPTY_CART);
    sendMutation(() => api.delete("/cart"));
  }, []);

  const refreshPrices = useCallback(() => syncFromServer(), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        refreshPrices,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
