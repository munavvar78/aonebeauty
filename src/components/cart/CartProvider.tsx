"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addToCart,
  cartTotalPaise,
  emptyCart,
  setCartLineQuantity,
  type Cart,
  type CartLine,
} from "@/domain/cart";

const STORAGE_KEY = "aonebeauty.cart.v1";

type CartContextValue = {
  cart: Cart;
  totalPaise: number;
  itemCount: number;
  addItem: (product: {
    productId: string;
    slug: string;
    name: string;
    unitPricePaise: number;
    availableQuantity: number;
  }, quantity?: number) => string | null;
  updateQuantity: (
    productId: string,
    quantity: number,
    availableQuantity: number,
  ) => string | null;
  removeItem: (productId: string) => void;
  clear: () => void;
  replaceCart: (cart: Cart) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): Cart {
  if (typeof window === "undefined") return emptyCart();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCart();
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed?.lines || !Array.isArray(parsed.lines)) return emptyCart();
    return parsed;
  } catch {
    return emptyCart();
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const addItem = useCallback(
    (
      product: {
        productId: string;
        slug: string;
        name: string;
        unitPricePaise: number;
        availableQuantity: number;
      },
      quantity = 1,
    ) => {
      let error: string | null = null;
      setCart((current) => {
        const result = addToCart(current, product, quantity);
        if (!result.ok) {
          error = result.error;
          return current;
        }
        return result.cart;
      });
      return error;
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, availableQuantity: number) => {
      let error: string | null = null;
      setCart((current) => {
        const result = setCartLineQuantity(
          current,
          productId,
          quantity,
          availableQuantity,
        );
        if (!result.ok) {
          error = result.error;
          return current;
        }
        return result.cart;
      });
      return error;
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setCart((current) => ({
      lines: current.lines.filter((line: CartLine) => line.productId !== productId),
    }));
  }, []);

  const clear = useCallback(() => setCart(emptyCart()), []);
  const replaceCart = useCallback((next: Cart) => setCart(next), []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      totalPaise: cartTotalPaise(cart),
      itemCount: cart.lines.reduce((sum, line) => sum + line.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clear,
      replaceCart,
    }),
    [cart, addItem, updateQuantity, removeItem, clear, replaceCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
