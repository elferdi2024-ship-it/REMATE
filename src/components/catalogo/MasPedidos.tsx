"use client";

import React, { useMemo } from "react";
import type { Producto } from "@/types";
import { EMOJI_POR_CATEGORIA } from "@/types";

interface MasPedidosProps {
  /** All products; component computes top 5 by frequency in the cart stats */
  productos: Producto[];
  /** Optional: explicit ordering of product codigos by popularity (most ordered first).
   *  If not provided, falls back to first N products. */
  topCodigos?: string[];
  onAdd?: (producto: Producto) => void;
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function MasPedidos({ productos, topCodigos, onAdd }: MasPedidosProps) {
  const topProducts = useMemo(() => {
    if (!productos || productos.length === 0) return [];

    if (topCodigos && topCodigos.length > 0) {
      // Build a map for quick lookup
      const byCodigo = new Map<string, Producto>();
      productos.forEach((p) => byCodigo.set(p.codigo, p));
      return topCodigos
        .slice(0, 5)
        .map((codigo) => byCodigo.get(codigo))
        .filter((p): p is Producto => !!p);
    }

    // Fallback: first 5 products
    return productos.slice(0, 5);
  }, [productos, topCodigos]);

  if (topProducts.length === 0) return null;

  return (
    <section className="mas-pedidos">
      <div className="mas-pedidos-header">
        <span className="fire">&#128293;</span>
        <h2 className="mas-pedidos-title">
          LO M\u00c1S PEDIDO
          <span className="mas-pedidos-badge">TOP 5</span>
        </h2>
      </div>

      <div className="mas-pedidos-scroll">
        {topProducts.map((producto, idx) => {
          const emoji = EMOJI_POR_CATEGORIA[producto.categoria] || "\ud83d\udce6";
          return (
            <button
              key={producto.codigo}
              className="mas-pedido-card"
              onClick={() => onAdd?.(producto)}
              style={{ animationDelay: `${idx * 60}ms` }}
              aria-label={`Agregar ${producto.nombre}`}
            >
              <div className="mas-pedido-thumb">
                <span className="mas-pedido-rank">{idx + 1}</span>
                <span role="img" aria-hidden="true">{emoji}</span>
              </div>
              <div className="mas-pedido-body">
                <div className="mas-pedido-name">{producto.nombre}</div>
                <div className="mas-pedido-price">{formatPrice(producto.precio)}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
