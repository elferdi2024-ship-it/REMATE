"use client";

import React, { useCallback } from "react";
import type { Producto } from "@/types";
import { EMOJI_POR_CATEGORIA } from "@/types";

interface ProductoRowProps {
  producto: Producto;
  qty: number;
  onAdd: (producto: Producto) => void;
  onQtyChange: (codigo: string, qty: number) => void;
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getCatColorVar(cat: string): string {
  const map: Record<string, string> = {
    "Aceites y Aderezos":            "var(--cat-aceites,  #92400E)",
    "Bebidas":                        "var(--cat-bebidas,  #1D4ED8)",
    "Café, Té y Yerba":              "var(--cat-cafe,     #5C3317)",
    "Cereales y Granola":            "var(--cat-cereales, #C26A00)",
    "Congelados":                     "var(--cat-congelados,#0369A1)",
    "Conservas de Pescado":          "var(--cat-pescado,  #0F766E)",
    "Conservas y Enlatados":         "var(--cat-pescado,  #0F766E)",
    "Descartables y Embalaje":       "var(--cat-descart,  #4B5563)",
    "Especias y Condimentos":        "var(--cat-especias, #065F46)",
    "Fiambres y Carnes":             "var(--cat-fiambres, #991B1B)",
    "Golosinas y Dulces":            "var(--cat-golosinas,#6D28D9)",
    "Harinas, Pastas y Legumbres":   "var(--cat-harinas,  #78350F)",
    "Higiene Personal":              "var(--cat-higiene,  #0369A1)",
    "Lácteos":                        "var(--cat-lacteos,  #9A3412)",
    "Limpieza":                       "var(--cat-limpieza, #0E7490)",
    "Mermeladas y Conservas Dulces": "var(--cat-mermeladas,#9D174D)",
    "Otros":                          "var(--cat-otros,    #374151)",
    "Panadería":                      "var(--cat-panaderia,#2A6B3E)",
    "Papel e Higiene":               "var(--cat-papel,    #374151)",
  };
  return map[cat] || "var(--border, #DDD8D0)";
}

export default function ProductoRow({ producto, qty, onAdd, onQtyChange }: ProductoRowProps) {
  const isInCart = qty > 0;
  const emoji = EMOJI_POR_CATEGORIA[producto.categoria] || "📦";
  const catColor = getCatColorVar(producto.categoria);

  const handleAdd = useCallback(() => { onAdd(producto); }, [onAdd, producto]);
  const handleDec = useCallback(() => { onQtyChange(producto.codigo, Math.max(0, qty - 1)); }, [onQtyChange, producto.codigo, qty]);
  const handleInc = useCallback(() => { onQtyChange(producto.codigo, qty + 1); }, [onQtyChange, producto.codigo, qty]);

  const handleQtyInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 0) onQtyChange(producto.codigo, val);
    },
    [onQtyChange, producto.codigo]
  );

  return (
    <div
      className={`product-row${isInCart ? " in-cart" : ""}`}
      style={{ borderLeft: `3px solid ${catColor}` }}
    >
      {/* Thumb */}
      <div className="row-thumb">
        <span role="img" aria-hidden="true">{emoji}</span>
      </div>

      {/* Info */}
      <div className="row-info">
        {/* Nombre: 15px sentence case weight 600 */}
        <div className="row-name">{producto.nombre}</div>
        {/* Precio: 20px Bebas, peso visual claro */}
        <div className="row-price">{formatPrice(producto.precio)}</div>
        {/* Label secundario legible */}
        <div className="row-price-label">precio por unidad</div>
      </div>

      {/* Actions */}
      <div className="row-actions">
        {isInCart ? (
          <div className="qty-ctrl">
            <button className="qty-btn" onClick={handleDec} aria-label="Reducir cantidad">
              &#8722;
            </button>
            <input
              className="qty-val"
              type="tel"
              inputMode="numeric"
              value={qty}
              onChange={handleQtyInput}
              style={{
                background: "transparent", border: "none", outline: "none",
                textAlign: "center", fontWeight: 800, fontSize: "0.88rem",
                color: "var(--texto, #111111)", width: "28px", padding: 0,
              }}
              aria-label="Cantidad"
            />
            <button
              className="qty-btn"
              onClick={handleInc}
              aria-label="Aumentar cantidad"
              style={{ background: "var(--verde)", color: "#fff", border: "none" }}
            >
              +
            </button>
          </div>
        ) : (
          <button className="btn-add" onClick={handleAdd} style={{ padding: "8px 16px" }}>
            + Agregar
          </button>
        )}
      </div>
    </div>
  );
}
