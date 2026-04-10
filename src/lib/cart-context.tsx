"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types";
import { useToast } from "./toast-context";

const SESSION_KEY = "elremate_cart";

function loadCartFromSession(): CartItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CartItem[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveCartToSession(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  if (items.length === 0) {
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(items));
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (producto: { codigo: string; nombre: string; precio: number }) => void;
  removeItem: (codigo: string) => void;
  updateQty: (codigo: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  totalQty: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromSession() || []);

  // Persist to sessionStorage on every change
  useEffect(() => {
    saveCartToSession(items);
  }, [items]);

  const addItem = useCallback(
    (producto: { codigo: string; nombre: string; precio: number }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.codigo === producto.codigo);
        if (existing) {
          return prev.map((i) =>
            i.codigo === producto.codigo ? { ...i, cantidad: i.cantidad + 1 } : i
          );
        }
        return [...prev, { codigo: producto.codigo, nombre: producto.nombre, precio: producto.precio, cantidad: 1 }];
      });
    },
    []
  );

  const removeItem = useCallback((codigo: string) => {
    setItems((prev) => prev.filter((i) => i.codigo !== codigo));
  }, []);

  const updateQty = useCallback((codigo: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((i) =>
          i.codigo === codigo ? { ...i, cantidad: i.cantidad + delta } : i
        )
        .filter((i) => i.cantidad > 0);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const totalQty = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, total, totalQty }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
