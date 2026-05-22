import React, { useRef, useCallback } from "react";
import type { Producto } from "@/types";
import type { BrandConfig } from "@/types/brands";
import { EMOJI_POR_CATEGORIA } from "@/types";
import Image from "next/image";

interface ProductoCardProps {
  producto: Producto;
  qty: number;
  searchTerm?: string;
  onAdd: (producto: Producto, e?: React.MouseEvent) => void;
  onQtyChange: (codigo: string, qty: number) => void;
  sponsorBrand?: BrandConfig | null;
  onQuickView?: (producto: Producto) => void;
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
  sponsorBrand,
  onQuickView,
}: ProductoCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const isInCart = qty > 0;

  const handleAdd = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(producto);
    } else {
      onAdd(producto, e);
    }
  }, [onQuickView, onAdd, producto]);

  const handleDec = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onQtyChange(producto.codigo, Math.max(0, qty - 1));
  }, [onQtyChange, producto.codigo, qty]);

  const handleInc = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onQtyChange(producto.codigo, qty + 1);
  }, [onQtyChange, producto.codigo, qty]);

  const emoji = EMOJI_POR_CATEGORIA[producto.categoria] || "📦";
  const { bg: badgeBg, color: badgeColor } = getCatBadgeColors(producto.categoria);

  return (
    <div
      ref={cardRef}
      onClick={() => onQuickView?.(producto)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`card${isInCart ? " in-cart" : ""} group ${isAdding ? "adding-anim" : ""}`}
      style={{
        background: "var(--white)",
        border: isHovered 
          ? "1px solid rgba(232, 48, 42, 0.25)" 
          : isInCart
            ? "1.5px solid var(--verde)" 
            : "1px solid rgba(17,11,8,0.08)",
        borderRadius: "20px",
        padding: "12px",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: isHovered 
          ? "0 20px 35px rgba(17,11,8,0.12), 0 4px 12px rgba(17,11,8,0.04)"
          : isInCart
            ? "0 10px 24px rgba(46,125,50,0.06)"
            : "0 8px 24px rgba(17,11,8,0.04)",
        cursor: "pointer"
      } as React.CSSProperties}
    >
      {/* Tag 'Oportunidad' removido */}

      <div className="card-thumb" style={{ 
        background: "linear-gradient(180deg, #ffffff 0%, #f9f8f6 100%)", 
        borderRadius: "14px",
        aspectRatio: "1 / 1",
        height: "auto",
        marginBottom: "10px",
        border: "1px solid rgba(17,11,8,0.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {producto.imagen ? (
          <Image 
            src={producto.imagen} 
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="group-hover:scale-105"
            style={{ 
              objectFit: "contain", 
              padding: "8px",
              transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" 
            }} 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.fallback-emoji');
                if (fallback) (fallback as HTMLElement).style.display = "flex";
              }
            }}
          />
        ) : null}
        
        {(!producto.imagen) ? (
          <span role="img" aria-hidden="true" style={{ 
            fontSize: "3rem", 
            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }} className="group-hover:scale-105">
            {emoji}
          </span>
        ) : (
          <span role="img" aria-hidden="true" style={{ 
            fontSize: "3rem", 
            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            display: "none"
          }} className="group-hover:scale-105 fallback-emoji">
            {emoji}
          </span>
        )}
        
        <div className="card-floating-action" onClick={(e) => e.stopPropagation()} style={{ position: "absolute", bottom: "8px", right: "8px", zIndex: 10 }}>
          {isInCart ? (
            <div className="float-qty-ctrl" style={{ 
              display: "flex",
              alignItems: "center",
              background: "var(--white)",
              borderRadius: "24px",
              height: "42px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              border: "1.5px solid rgba(46,125,50,0.25)",
              padding: "0 4px"
            }}>
              <button className="float-qty-btn minus" onClick={handleDec} style={{ padding: "0 10px", fontSize: "1.2rem", fontWeight: "bold" }}>&#8722;</button>
              <input 
                type="number" 
                value={qty || ''} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    onQtyChange(producto.codigo, val);
                  } else if (e.target.value === '') {
                    onQtyChange(producto.codigo, 0);
                  }
                }}
                onFocus={(e) => e.target.select()}
                className="float-qty-val" 
                style={{ 
                  fontWeight: 800, 
                  width: "40px", 
                  textAlign: "center",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                  margin: 0,
                  fontSize: "1rem"
                }} 
              />
              <button className="float-qty-btn plus" onClick={handleInc} style={{ padding: "0 10px", fontSize: "1.2rem", fontWeight: "bold" }}>+</button>
            </div>
          ) : (
            <button 
              className="btn-float-add" 
              onClick={handleAdd} 
              style={{
                background: "linear-gradient(135deg, var(--oscuro), #4b5563)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: isHovered ? "scale(1.08)" : "scale(1)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = isHovered ? "scale(1.08)" : "scale(1)"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          )}
        </div>
        
        {sponsorBrand?.logoUrl && (
          <div style={{
            position: "absolute", bottom: 6, left: 6, zIndex: 3,
            background: "rgba(255,255,255,0.92)",
            borderRadius: "5px",
            padding: "2px 5px",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            backdropFilter: "blur(4px)",
            width: 50,
            height: 16,
          }}>
            <Image
              src={sponsorBrand.logoUrl}
              alt={sponsorBrand.name}
              fill
              sizes="50px"
              style={{ objectFit: "contain", opacity: 0.85, padding: "2px 5px" }}
            />
          </div>
        )}
      </div>

      <div className="card-body" style={{ padding: "0 4px 48px 4px", flex: 1, display: "flex", flexDirection: "column" }}>
        <span className="card-cat-badge" style={{ 
          background: badgeBg, 
          color: badgeColor, 
          fontSize: "8px", 
          fontWeight: 800, 
          textTransform: "uppercase", 
          padding: "2px 6px", 
          borderRadius: "4px", 
          marginBottom: "6px", 
          display: "inline-block",
          letterSpacing: "0.5px",
          width: "fit-content"
        }}>
          {producto.categoria}
        </span>

        <h3 className="card-name" style={{ 
          fontSize: "0.85rem", 
          fontWeight: 600, 
          color: "var(--oscuro)", 
          lineHeight: "1.2", 
          height: "2.4em",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          marginBottom: "12px", 
          letterSpacing: "-0.01em"
        }}>
          {highlightText(producto.nombre, searchTerm)}
        </h3>

        <div style={{ marginTop: "auto" }}>
          <div className="card-price" style={{ 
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem", 
            fontWeight: 700,
            color: "var(--rojo)", 
            lineHeight: "1",
            letterSpacing: "0.5px"
          }}>
            {formatPrice(producto.precio)}
          </div>
          <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginTop: "4px", letterSpacing: "0.5px" }}>
            Unidad IVA Incl.
          </div>
        </div>
      </div>
    </div>
  );
}
