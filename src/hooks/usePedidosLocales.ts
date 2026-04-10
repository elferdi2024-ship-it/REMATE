import { useCallback } from "react";
import type { CartItem } from "@/types";
import * as ls from "@/lib/ls";

interface PedidoRecord {
  fecha: string; // ISO date string
  items: { codigo: string; nombre: string; cantidad: number; precioUnitario: number }[];
  total: number;
  notas?: string;
}

interface UsePedidosLocalesReturn {
  pedidos: PedidoRecord[];
  savePedido: (items: CartItem[], total: number, notas?: string) => void;
  clearHistory: () => void;
}

export function usePedidosLocales(): UsePedidosLocalesReturn {
  const pedidos = ls.getHistory() as PedidoRecord[];

  const savePedido = useCallback(
    (items: CartItem[], total: number, notas?: string) => {
      const current = ls.getHistory() as PedidoRecord[];
      const nuevo: PedidoRecord = {
        fecha: new Date().toISOString(),
        items: items.map((i) => ({
          codigo: i.codigo,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precioUnitario: i.precio,
        })),
        total,
        notas,
      };
      ls.setHistory([nuevo, ...current]);
    },
    []
  );

  const clearHistory = useCallback(() => {
    ls.setHistory([]);
  }, []);

  return { pedidos, savePedido, clearHistory };
}
