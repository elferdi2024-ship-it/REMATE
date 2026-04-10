"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import {
  guardarPedidoGlobal,
  guardarPedidoUsuario,
  getPedidosUsuario,
  incrementarStats,
} from "@/lib/pedidos";
import type { CartItem } from "@/types";

interface UsePedidosCloudReturn {
  pedidos: any[];
  loading: boolean;
  savePedido: (notas?: string, mensajeWA?: string) => Promise<void>;
}

/**
 * Cloud orders hook.
 * - Fetches user orders from Firestore when authenticated.
 * - savePedido saves to both /pedidos_globales AND /usuarios/{uid}/pedidos.
 * - Also increments /stats/productos counters.
 */
export function usePedidosCloud(): UsePedidosCloudReturn {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch orders when user is authenticated
  useEffect(() => {
    if (!user) {
      setPedidos([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getPedidosUsuario(user.uid)
      .then((result) => {
        if (!cancelled) {
          setPedidos(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Error fetching pedidos:", err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const savePedido = useCallback(
    async (notas?: string, mensajeWA?: string) => {
      if (items.length === 0) return;

      const pedidoItems = items.map((i: CartItem) => ({
        codigo: i.codigo,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precioUnitario: i.precio,
      }));

      // 1. Save to /pedidos_globales (always, for admin visibility)
      const codigos = items.map((i: CartItem) => i.codigo);

      await guardarPedidoGlobal({
        uid: user?.uid ?? null,
        clienteNombre:
          user?.displayName ||
          (typeof window !== "undefined"
            ? localStorage.getItem("elremate_alias") || ""
            : "") ||
          "Cliente",
        items: pedidoItems,
        total,
        notas,
      });

      // 2. If authenticated, also save to user's private orders
      if (user) {
        await guardarPedidoUsuario(user.uid, {
          items: pedidoItems,
          total,
          notas,
          mensajeWA: mensajeWA || "",
        });
      }

      // 3. Increment product stats (non-blocking)
      incrementarStats(codigos).catch((err) => {
        console.warn("Failed to increment stats:", err);
      });

      // 4. Clear cart
      clearCart();
    },
    [items, total, user, clearCart]
  );

  return { pedidos, loading, savePedido };
}
