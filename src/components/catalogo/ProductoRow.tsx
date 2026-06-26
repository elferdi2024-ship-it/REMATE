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
}

import { formatPrice, getCatColorVar } from "@/lib/format";


export default function ProductoRow({ producto, qty, onAdd, onQtyChange, onQuickView }: ProductoRowProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const isInCart = qty > 0;
  const emoji = EMOJI_POR_CATEGORIA[producto.categoria] || "📦";
  const catColor = getCatColorVar(producto.categoria);

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(producto, e);
  }, [onAdd, producto]);

  const handleDec = useCallback(() => {
    onQtyChange(producto.codigo, Math.max(0, qty - 1));
  }, [onQtyChange, producto.codigo, qty]);

  const handleInc = useCallback(() => {
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
        padding: "12px 16px",
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: isHovered 
          ? "0 6px 20px rgba(17,11,8,0.06)" 
          : "0 2px 8px rgba(17,11,8,0.02)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isHovered ? "translateX(4px)" : "translateX(0)",
        border: "1px solid rgba(17,11,8,0.06)",
      }}
    >
      {/* Thumb */}
      <div className="row-thumb" style={{
        background: "linear-gradient(135deg, #ffffff, #f5f3ef)",
        borderRadius: "10px",
        width: "50px",
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.8rem",
        marginRight: "16px",
        border: "1px solid rgba(17,11,8,0.04)"
      }}>
        {producto.imagen ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image 
              src={producto.imagen} 
              alt={producto.nombre}
              fill
              sizes="50px"
              style={{ objectFit: "contain", padding: "4px" }} 
            />
          </div>
        ) : (
          <span role="img" aria-hidden="true">{emoji}</span>
        )}
      </div>

      {/* Info */}
      <div className="row-info" style={{ flex: 1, marginRight: "16px" }}>
        <div className="row-name" style={{
          fontSize: "0.95rem",
          fontWeight: 600,
          color: "var(--oscuro)",
          marginBottom: "4px",
          letterSpacing: "-0.01em",
          lineHeight: "1.3"
        }}>{producto.nombre}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <div className="row-price" style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--rojo)"
          }}>{formatPrice(producto.precio)}</div>
          <div className="row-price-label" style={{
            fontSize: "9px",
            color: "var(--muted)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>unidad iva incl.</div>
        </div>
      </div>

      {/* Actions */}
      <div className="row-actions" onClick={(e) => e.stopPropagation()}>
        {isInCart ? (
          <div className="qty-ctrl" style={{
            display: "flex",
            alignItems: "center",
            background: "var(--white)",
            borderRadius: "20px",
            height: "38px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            border: "1.5px solid rgba(46,125,50,0.25)",
            padding: "0 2px"
          }}>
            <button className="qty-btn" onClick={handleDec} aria-label="Reducir cantidad" style={{ width: "30px", height: "30px", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                textAlign: "center", fontWeight: 800, fontSize: "0.9rem",
                color: "var(--texto, #111111)", width: "32px", padding: 0,
              }}
              aria-label="Cantidad"
            />
            <button
              className="qty-btn"
              onClick={handleInc}
              aria-label="Aumentar cantidad"
              style={{ background: "var(--verde)", color: "#fff", border: "none", width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              +
            </button>
          </div>
        ) : (
          <button 
            className="btn-add" 
            onClick={handleAdd} 
            style={{ 
              padding: "8px 16px",
              background: "linear-gradient(135deg, var(--oscuro), #4b5563)",
              color: "white",
              border: "none",
              borderRadius: "20px",
              fontWeight: 700,
              fontSize: "0.85rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            + Agregar
          </button>
        )}
      </div>
    </div>
  );
}
