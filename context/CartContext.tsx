"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import api from "@/lib/axios";

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

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "fastweb_cart";
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

export function clearStoredCart() {
  cachedRawCart = null;
  cachedCartItems = EMPTY_CART;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The in-memory cart is still cleared when browser storage is unavailable.
  }

  cartListeners.forEach((listener) => listener());
}

function updateCartItems(updater: (items: CartItem[]) => CartItem[]) {
  writeCartItems(updater(getCartSnapshot()));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  );

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
  }, []);

  const removeItem = useCallback((product_id: number) => {
    updateCartItems((prev) => prev.filter((i) => i.product_id !== product_id));
  }, []);

  const clearCart = useCallback(() => clearStoredCart(), []);

  const refreshPrices = useCallback(async () => {
    const currentItems = getCartSnapshot();
    if (currentItems.length === 0) return;

    const refreshed = await Promise.allSettled(
      currentItems.map((item) =>
        api.get<{
          id: number;
          name: string;
          sku: string | null;
          image: string | null;
          current_price: number | string | null;
          sale_price: number | string | null;
          regular_price: number | string | null;
          parent_id?: number | null;
        }>(`/products/${item.product_id}`)
      )
    );

    updateCartItems((items) =>
      items.map((item) => {
        const index = currentItems.findIndex(
          (current) => current.product_id === item.product_id
        );
        const result = refreshed[index];
        if (!result || result.status !== "fulfilled") return item;

        const product = result.value.data;
        const rawPrice =
          product.current_price ?? product.sale_price ?? product.regular_price;
        const price = rawPrice === null ? null : Number(rawPrice);
        const hasPrice =
          price !== null && Number.isFinite(price) && price >= 0;

        return {
          ...item,
          name: product.name || item.name,
          sku: product.sku ?? item.sku,
          image: product.image ?? item.image,
          parent_id: product.parent_id ?? item.parent_id,
          price: hasPrice ? price : item.price,
          price_pending: !hasPrice,
        };
      })
    );
  }, []);

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
