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

function getCatColorVar(cat: string): string {
  const map: Record<string, string> = {
    "Aceites y Aderezos":             "var(--cat-aceites,  #92400E)",
    "Bebidas":                         "var(--cat-bebidas,  #1D4ED8)",
    "Café, Té y Yerba":               "var(--cat-cafe,     #5C3317)",
    "Cereales y Granola":             "var(--cat-cereales, #C26A00)",
    "Congelados":                      "var(--cat-congelados,#0369A1)",
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

function getCatBadgeColors(cat: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    "Aceites y Aderezos":            { bg: "#FEF3C7", color: "#92400E" },
    "Bebidas":                        { bg: "#DBEAFE", color: "#1D4ED8" },
    "Café, Té y Yerba":              { bg: "#FEF3C7", color: "#5C3317" },
    "Cereales y Granola":            { bg: "#FEF3C7", color: "#C26A00" },
    "Congelados":                     { bg: "#E0F2FE", color: "#0369A1" },
    "Conservas de Pescado":          { bg: "#CCFBF1", color: "#0F766E" },
    "Conservas y Enlatados":         { bg: "#CCFBF1", color: "#0F766E" },
    "Descartables y Embalaje":       { bg: "#F3F4F6", color: "#4B5563" },
    "Especias y Condimentos":        { bg: "#D1FAE5", color: "#065F46" },
    "Fiambres y Carnes":             { bg: "#FEE2E2", color: "#991B1B" },
    "Golosinas y Dulces":            { bg: "#EDE9FE", color: "#6D28D9" },
    "Harinas, Pastas y Legumbres":   { bg: "#FEF3C7", color: "#78350F" },
    "Higiene Personal":              { bg: "#CFFAFE", color: "#0369A1" },
    "Lácteos":                        { bg: "#FEF3C7", color: "#9A3412" },
    "Limpieza":                       { bg: "#CFFAFE", color: "#0E7490" },
    "Mermeladas y Conservas Dulces": { bg: "#FCE7F3", color: "#9D174D" },
    "Otros":                          { bg: "#F3F4F6", color: "#374151" },
    "Panadería":                      { bg: "#DCFCE7", color: "#2A6B3E" },
    "Papel e Higiene":               { bg: "#F8FAFC", color: "#374151" },
  };
  return map[cat] || { bg: "#F3F4F6", color: "#374151" };
}

function highlightText(text: string, searchTerm: string | undefined): React.ReactNode {
  if (!searchTerm || !searchTerm.trim()) return text;
  const regex = new RegExp(`(${searchTerm.trim().replace(/[.*+?^${}()|[\\]\\]/g, "\\\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: "#FEF3C7", color: "#D97706", borderRadius: "2px", padding: "0 1px" }}>{part}</mark>
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

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(producto);
  }, [onAdd, producto]);

  const handleDec = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onQtyChange(producto.codigo, Math.max(0, qty - 1));
  }, [onQtyChange, producto.codigo, qty]);

  const handleInc = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onQtyChange(producto.codigo, qty + 1);
  }, [onQtyChange, producto.codigo, qty]);

  const emoji = EMOJI_POR_CATEGORIA[producto.categoria] || "📦";
  const { bg: badgeBg, color: badgeColor } = getCatBadgeColors(producto.categoria);

  return (
    <div
      ref={cardRef}
      className={`card${isInCart ? " in-cart" : ""} group`}
      style={{
        background: "var(--white)",
        border: "1px solid var(--border)",
        borderRadius: "24px",
        padding: "16px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      } as React.CSSProperties}
    >
      <div className="card-thumb" style={{ 
        background: "var(--bg2)", 
        borderRadius: "18px",
        height: "150px",
        marginBottom: "16px",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}>
        <span role="img" aria-hidden="true" style={{ 
          fontSize: "3rem", 
          transition: "transform 0.5s ease",
        }} className="group-hover:scale-110">
          {emoji}
        </span>
        
        <div className="card-floating-action" style={{ position: "absolute", bottom: "-14px", right: "8px", zIndex: 10 }}>
          {isInCart ? (
            <div className="float-qty-ctrl" style={{ 
              display: "flex",
              alignItems: "center",
              background: "var(--white)",
              borderRadius: "22px",
              height: "44px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
              border: "1px solid var(--border-2)",
              padding: "0 4px"
            }}>
              <button className="float-qty-btn minus" onClick={handleDec} style={{ padding: "0 10px", fontSize: "1.2rem", fontWeight: "bold" }}>&#8722;</button>
              <span className="float-qty-val" style={{ fontWeight: 800, minWidth: "24px", textAlign: "center" }}>{qty}</span>
              <button className="float-qty-btn plus" onClick={handleInc} style={{ padding: "0 10px", fontSize: "1.2rem", fontWeight: "bold" }}>+</button>
            </div>
          ) : (
            <button className="btn-float-add" onClick={handleAdd} style={{
              background: "var(--oscuro)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
              cursor: "pointer"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="card-body" style={{ padding: "4px 2px 8px", flex: 1, display: "flex", flexDirection: "column" }}>
        <span className="card-cat-badge" style={{ 
          background: badgeBg, 
          color: badgeColor, 
          fontSize: "9px", 
          fontWeight: 800, 
          textTransform: "uppercase", 
          padding: "2px 8px", 
          borderRadius: "6px", 
          marginBottom: "6px", 
          display: "inline-block",
          letterSpacing: "0.5px",
          width: "fit-content"
        }}>
          {producto.categoria}
        </span>

        <h3 className="card-name" style={{ 
          fontSize: "var(--text-base)", 
          fontWeight: 700, 
          color: "var(--oscuro)", 
          lineHeight: "1.3", 
          marginBottom: "12px", 
          height: "2.6em", 
          overflow: "hidden", 
          display: "-webkit-box", 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: "vertical",
          letterSpacing: "-0.01em"
        }}>
          {highlightText(producto.nombre, searchTerm)}
        </h3>

        <div style={{ marginTop: "auto" }}>
          <div className="card-price" style={{ 
            fontFamily: "var(--font-display)",
            fontSize: "2.1rem", 
            fontWeight: 400,
            color: "var(--rojo)", 
            lineHeight: "1",
            letterSpacing: "0.5px"
          }}>
            {formatPrice(producto.precio)}
          </div>
          <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginTop: "4px", letterSpacing: "0.5px" }}>
            Unidad IVA Incl.
          </div>
        </div>
      </div>
    </div>
  );
}
