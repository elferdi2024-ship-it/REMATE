"use client";

import React, { useRef, useCallback } from "react";
import type { Producto } from "@/types";
import { EMOJI_POR_CATEGORIA } from "@/types";

interface ProductoCardProps {
  producto: Producto;
  qty: number;
  searchTerm?: string;
  onAdd: (producto: Producto) => void;
  onQtyChange: (codigo: string, qty: number) => void;
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* ── Colores por categoría — borde superior ─────────────── */
function getCatColorVar(cat: string): string {
  const map: Record<string, string> = {
    "Aceites y Aderezos":             "var(--cat-aceites,  #92400E)",
    "Bebidas":                         "var(--cat-bebidas,  #1D4ED8)",
    "Café, Té y Yerba":               "var(--cat-cafe,     #5C3317)",
    "Cereales y Granola":             "var(--cat-cereales, #C26A00)",
    "Congelados":                      "var(--cat-congelados,#0369A1)",
    "Conservas de Pescado":           "var(--cat-pescado,  #0F766E)",
    "Conservas y Enlatados":          "var(--cat-pescado,  #0F766E)",
    "Descartables y Embalaje":        "var(--cat-descart,  #4B5563)",
    "Especias y Condimentos":         "var(--cat-especias, #065F46)",
    "Fiambres y Carnes":              "var(--cat-fiambres, #991B1B)",
    "Golosinas y Dulces":             "var(--cat-golosinas,#6D28D9)",
    "Harinas, Pastas y Legumbres":    "var(--cat-harinas,  #78350F)",
    "Higiene Personal":               "var(--cat-higiene,  #0369A1)",
    "Lácteos":                         "var(--cat-lacteos,  #9A3412)",
    "Limpieza":                        "var(--cat-limpieza, #0E7490)",
    "Mermeladas y Conservas Dulces":  "var(--cat-mermeladas,#9D174D)",
    "Otros":                           "var(--cat-otros,    #374151)",
    "Panadería":                       "var(--cat-panaderia,#2A6B3E)",
    "Papel e Higiene":                "var(--cat-papel,    #374151)",
  };
  return map[cat] || "var(--border, #DDD8D0)";
}

/*
 * Badge de categoría:
 * Texto oscuro (800–900) sobre tint claro (50–100) = ratio WCAG AA garantizado.
 * Pares [tintFondo, colorTexto]
 */
function getCatBadgeColors(cat: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    "Aceites y Aderezos":            { bg: "#FEF3C7", color: "#78350F" },
    "Bebidas":                        { bg: "#DBEAFE", color: "#1E3A8A" },
    "Café, Té y Yerba":              { bg: "#FEF3C7", color: "#5C3317" },
    "Cereales y Granola":            { bg: "#FEF3C7", color: "#92400E" },
    "Congelados":                     { bg: "#E0F2FE", color: "#075985" },
    "Conservas de Pescado":          { bg: "#CCFBF1", color: "#134E4A" },
    "Conservas y Enlatados":         { bg: "#CCFBF1", color: "#134E4A" },
    "Descartables y Embalaje":       { bg: "#F3F4F6", color: "#374151" },
    "Especias y Condimentos":        { bg: "#D1FAE5", color: "#064E3B" },
    "Fiambres y Carnes":             { bg: "#FEE2E2", color: "#7F1D1D" },
    "Golosinas y Dulces":            { bg: "#EDE9FE", color: "#4C1D95" },
    "Harinas, Pastas y Legumbres":   { bg: "#FEF3C7", color: "#78350F" },
    "Higiene Personal":              { bg: "#CFFAFE", color: "#164E63" },
    "Lácteos":                        { bg: "#FEF3C7", color: "#9A3412" },
    "Limpieza":                       { bg: "#CFFAFE", color: "#164E63" },
    "Mermeladas y Conservas Dulces": { bg: "#FCE7F3", color: "#831843" },
    "Otros":                          { bg: "#F3F4F6", color: "#374151" },
    "Panadería":                      { bg: "#DCFCE7", color: "#14532D" },
    "Papel e Higiene":               { bg: "#F8FAFC", color: "#374151" },
  };
  return map[cat] || { bg: "#F3F4F6", color: "#374151" };
}

function highlightText(text: string, searchTerm: string | undefined): React.ReactNode {
  if (!searchTerm || !searchTerm.trim()) return text;
  const regex = new RegExp(
    `(${searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        style={{
          background: "var(--ambar-pale, rgba(217,119,6,0.18))",
          color: "var(--texto, #111111)",
          borderRadius: "2px",
          padding: "0 1px",
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function ProductoCard({
  producto,
  qty,
  searchTerm,
  onAdd,
  onQtyChange,
}: ProductoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInCart = qty > 0;

  const handleAdd = useCallback(() => {
    onAdd(producto);
    const el = cardRef.current;
    if (el) {
      el.classList.remove("popped");
      void el.offsetWidth;
      el.classList.add("popped");
    }
  }, [onAdd, producto]);

  const handleDec = useCallback(() => {
    onQtyChange(producto.codigo, Math.max(0, qty - 1));
  }, [onQtyChange, producto.codigo, qty]);

  const handleInc = useCallback(() => {
    onQtyChange(producto.codigo, qty + 1);
  }, [onQtyChange, producto.codigo, qty]);

  const emoji = EMOJI_POR_CATEGORIA[producto.categoria] || "📦";
  const catColor = getCatColorVar(producto.categoria);
  const { bg: badgeBg, color: badgeColor } = getCatBadgeColors(producto.categoria);

  return (
    <div
      ref={cardRef}
      className={`card${isInCart ? " in-cart" : ""}`}
      style={{ "--cat-color": catColor } as React.CSSProperties}
    >
      {/* Thumbnail */}
      <div className="card-thumb">
        <span role="img" aria-hidden="true" style={{ fontSize: "1.9rem" }}>
          {emoji}
        </span>
      </div>

      {/* Body */}
      <div className="card-body">
        {/* Badge categoría — contraste garantizado */}
        <span
          className="card-cat-badge"
          style={{ background: badgeBg, color: badgeColor }}
        >
          {producto.categoria}
        </span>

        {/* Nombre: sentence case, 13px, weight 600 — legible */}
        <div className="card-name">
          {highlightText(producto.nombre, searchTerm)}
        </div>

        {/* Precio — domina la jerarquía (24px Bebas, negro) */}
        <div className="card-price">{formatPrice(producto.precio)}</div>

        {/* Label secundario — 11px, --muted (ratio 7:1) */}
        <div className="card-price-label">precio por unidad</div>

        {/* Actions */}
        <div className="card-actions">
          {isInCart ? (
            <div className="qty-ctrl">
              <button
                className="qty-btn"
                onClick={handleDec}
                aria-label="Reducir cantidad"
              >
                &#8722;
              </button>
              <span className="qty-val">{qty}</span>
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
            <button className="btn-add" onClick={handleAdd}>
              + Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
