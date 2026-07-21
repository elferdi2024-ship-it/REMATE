"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import type { Producto } from "@/types";
import { EMOJI_POR_CATEGORIA } from "@/types";

interface ProductoRowProps {
  producto: Producto;
  qty: number;
  onAdd: (producto: Producto, e?: React.MouseEvent) => void;
  onQtyChange: (codigo: string, qty: number) => void;
  onQuickView?: (producto: Producto) => void;
  isCompact?: boolean;
}

import { formatPrice, getCatColorVar } from "@/lib/format";
import { haptic } from "@/lib/haptic";
import { toast } from "sonner";


export default function ProductoRow({ producto, qty, onAdd, onQtyChange, onQuickView, isCompact = false }: ProductoRowProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const isInCart = qty > 0;
  const emoji = EMOJI_POR_CATEGORIA[producto.categoria] || "📦";
  const catColor = getCatColorVar(producto.categoria);

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.add();
    onAdd(producto, e);
    toast.success(`1x ${producto.nombre} agregado`, {
      position: 'top-center',
      duration: 1500,
      style: { background: 'var(--verde)', color: 'white', border: 'none', fontWeight: 'bold' }
    });
  }, [onAdd, producto]);

  const handleDec = useCallback(() => {
    haptic.remove();
    onQtyChange(producto.codigo, Math.max(0, qty - 1));
  }, [onQtyChange, producto.codigo, qty]);

  const handleInc = useCallback(() => {
    haptic.add();
    onQtyChange(producto.codigo, qty + 1);
  }, [onQtyChange, producto.codigo, qty]);

  const handleQtyInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value === '') {
        onQtyChange(producto.codigo, 0);
        return;
      }
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 0) onQtyChange(producto.codigo, val);
    },
    [onQtyChange, producto.codigo]
  );

  return (
    <div
      onClick={() => onQuickView?.(producto)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`product-row${isInCart ? " in-cart" : ""}`}
      style={{
        borderLeft: `4px solid ${isInCart ? "var(--verde)" : catColor}`,
        cursor: onQuickView ? 'pointer' : 'default',
        background: isHovered 
          ? "#FAF8F5" 
          : isInCart 
            ? "rgba(46,125,50,0.02)" 
            : "var(--white)",
        borderRadius: "12px",
        padding: isCompact ? "6px 12px" : "12px 16px",
        marginBottom: isCompact ? "4px" : "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: isHovered 
          ? "0 6px 20px rgba(17,11,8,0.06)" 
          : "0 2px 8px rgba(17,11,8,0.02)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isHovered ? "translateX(4px)" : "translateX(0)",
        border: "1px solid rgba(17,11,8,0.06)",
        gap: isCompact ? "8px" : "0",
      }}
    >
      {/* Thumb */}
      <div className="row-thumb" style={{
        background: "linear-gradient(135deg, #ffffff, #f5f3ef)",
        borderRadius: isCompact ? "6px" : "10px",
        width: isCompact ? "32px" : "50px",
        height: isCompact ? "32px" : "50px",
        display: "flex",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        fontSize: isCompact ? "1.2rem" : "1.8rem",
        marginRight: isCompact ? "4px" : "16px",
        border: "1px solid rgba(17,11,8,0.04)"
      }}>
        {producto.imagen ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image 
              src={producto.imagen} 
              alt={producto.nombre}
              fill
              sizes="50px"
              style={{ objectFit: "contain", padding: isCompact ? "2px" : "4px" }} 
            />
          </div>
        ) : (
          <span role="img" aria-hidden="true">{emoji}</span>
        )}
      </div>

      {/* Info */}
      <div className="row-info" style={{ flex: 1, minWidth: 0, marginRight: isCompact ? "4px" : "16px" }}>
        <div className="row-name" style={{
          fontSize: isCompact ? "0.85rem" : "0.95rem",
          fontWeight: 600,
          color: "var(--oscuro)",
          marginBottom: isCompact ? "0px" : "4px",
          letterSpacing: "-0.01em",
          lineHeight: "1.2",
          whiteSpace: isCompact ? "nowrap" : "normal",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }} title={producto.nombre}>{producto.nombre}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <div className="row-price" style={{
            fontFamily: "var(--font-display)",
            fontSize: isCompact ? "1.05rem" : "1.25rem",
            fontWeight: 700,
            color: "var(--rojo)"
          }}>{formatPrice(producto.precio)}</div>
          {!isCompact && (
            <div className="row-price-label" style={{
              fontSize: "9px",
              color: "var(--muted)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>unidad iva incl.</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="row-actions" onClick={(e) => e.stopPropagation()}>
        {isInCart ? (
          <div className="qty-ctrl" style={{
            display: "flex",
            alignItems: "center",
            background: "var(--white)",
            borderRadius: "24px",
            height: isCompact ? "38px" : "44px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            border: "1.5px solid rgba(46,125,50,0.25)",
            padding: "0 4px"
          }}>
            <button className="qty-btn active:scale-95 transition-transform" onClick={handleDec} aria-label="Reducir cantidad" style={{ width: isCompact ? "36px" : "44px", height: isCompact ? "36px" : "44px", fontSize: isCompact ? "1.2rem" : "1.4rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--oscuro)" }}>
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
                textAlign: "center", fontWeight: 800, fontSize: isCompact ? "0.85rem" : "0.9rem",
                color: "var(--texto, #111111)", width: isCompact ? "26px" : "32px", padding: 0,
              }}
              aria-label="Cantidad"
            />
            <button
              className="qty-btn active:scale-95 transition-transform"
              onClick={handleInc}
              aria-label="Aumentar cantidad"
              style={{ width: isCompact ? "36px" : "44px", height: isCompact ? "36px" : "44px", fontSize: isCompact ? "1.2rem" : "1.4rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--oscuro)" }}
            >
              &#43;
            </button>
          </div>
        ) : (
          <button
            className="row-add active:scale-95 transition-transform"
            onClick={handleAdd}
            aria-label="Agregar"
            style={{
              background: "var(--rojo)",
              color: "white",
              border: "none",
              borderRadius: "24px",
              height: isCompact ? "38px" : "44px",
              width: isCompact ? "38px" : "44px",
              fontSize: "1.4rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px var(--rojo-glow)",
              cursor: "pointer",
            }}
          >
            &#43;
          </button>
        )}
      </div>
    </div>
  );
}
