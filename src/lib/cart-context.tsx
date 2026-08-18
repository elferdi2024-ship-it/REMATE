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

import { calcularPrecioConEscala } from "./pricing";
import type { BulkPriceTier } from "@/types";

interface CartContextValue {
  items: CartItem[];
  addItem: (producto: {
    codigo: string;
    nombre: string;
    precio: number;
    escalaPrecios?: BulkPriceTier[];
  }) => void;
  setItemQty: (
    producto: {
      codigo: string;
      nombre: string;
      precio: number;
      escalaPrecios?: BulkPriceTier[];
    },
    cantidad: number
  ) => void;
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
    (producto: {
      codigo: string;
      nombre: string;
      precio: number;
      escalaPrecios?: BulkPriceTier[];
    }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.codigo === producto.codigo);
        if (existing) {
          const nextQty = existing.cantidad + 1;
          const escala = producto.escalaPrecios || existing.escalaPrecios;
          const precioBase = existing.precioBase ?? existing.precio;
          const { precioUnitario } = calcularPrecioConEscala(precioBase, nextQty, escala);

          return prev.map((i) =>
            i.codigo === producto.codigo
              ? {
                  ...i,
                  cantidad: nextQty,
                  precio: precioUnitario,
                  precioBase,
                  escalaPrecios: escala,
                }
              : i
          );
        }

        const { precioUnitario } = calcularPrecioConEscala(
          producto.precio,
          1,
          producto.escalaPrecios
        );

        return [
          ...prev,
          {
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: precioUnitario,
            precioBase: producto.precio,
            cantidad: 1,
            escalaPrecios: producto.escalaPrecios,
          },
        ];
      });
    },
    []
  );

  const setItemQty = useCallback(
    (
      producto: {
        codigo: string;
        nombre: string;
        precio: number;
        escalaPrecios?: BulkPriceTier[];
      },
      cantidad: number
    ) => {
      setItems((prev) => {
        if (cantidad <= 0) {
          return prev.filter((i) => i.codigo !== producto.codigo);
        }
        const existing = prev.find((i) => i.codigo === producto.codigo);
        const escala = producto.escalaPrecios || existing?.escalaPrecios;
        const precioBase = existing?.precioBase ?? producto.precio;
        const { precioUnitario } = calcularPrecioConEscala(precioBase, cantidad, escala);

        if (existing) {
          return prev.map((i) =>
            i.codigo === producto.codigo
              ? {
                  ...i,
                  cantidad,
                  precio: precioUnitario,
                  precioBase,
                  escalaPrecios: escala,
                }
              : i
          );
        }

        return [
          ...prev,
          {
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: precioUnitario,
            precioBase: producto.precio,
            cantidad,
            escalaPrecios: escala,
          },
        ];
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
        .map((i) => {
          if (i.codigo !== codigo) return i;
          const nextQty = i.cantidad + delta;
          if (nextQty <= 0) return null;
          const precioBase = i.precioBase ?? i.precio;
          const { precioUnitario } = calcularPrecioConEscala(
            precioBase,
            nextQty,
            i.escalaPrecios
          );
          return {
            ...i,
            cantidad: nextQty,
            precio: precioUnitario,
            precioBase,
          };
        })
        .filter((i): i is CartItem => i !== null);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => {
    const precioBase = i.precioBase ?? i.precio;
    const { subtotal } = calcularPrecioConEscala(precioBase, i.cantidad, i.escalaPrecios);
    return sum + subtotal;
  }, 0);
  const totalQty = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, setItemQty, removeItem, updateQty, clearCart, total, totalQty }}
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
