// filepath: src/components/catalogo/SponsoredProductsRail.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import Image from "next/image";
import type { SponsoredProduct } from "@/types/ofertas";

interface SponsoredProductsRailProps {
  products?: SponsoredProduct[];
}

export default function SponsoredProductsRail({ products = [] }: SponsoredProductsRailProps) {
  const { addItem } = useCart();
  const toast = useToast();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const activeProducts = products
    .filter((p) => p.activo)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const handleAddToCart = (p: SponsoredProduct) => {
    const finalPrice = p.precioPromo || p.precioOriginal || 0;
    addItem({
      codigo: p.codigoProducto || `SP-MANUAL-${p.id}`,
      nombre: p.nombreProducto,
      precio: finalPrice,
    });
    toast.success(`${p.nombreProducto} agregado al pedido`);
    setAddedMap((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [p.id]: false }));
    }, 1200);
  };

  if (activeProducts.length === 0) return null;

  return (
    <div
      style={{
        width: "100%",
        marginTop: "16px",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <span style={{ fontSize: "20px" }}>🎯</span>
        <h3
          style={{
            margin: 0,
            fontSize: "1.15rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "var(--texto, #111)",
            fontFamily: "var(--font-display)",
          }}
        >
          Destacados de Marcas
        </h3>
      </div>

      <div
        style={{
          display: "flex",
          gap: "14px",
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: "8px",
        }}
      >
        {activeProducts.map((p) => {
          const hasPrice = p.precioOriginal !== undefined && p.precioOriginal !== null && p.precioOriginal > 0;
          const finalPrice = p.precioPromo || p.precioOriginal || 0;
          const hasDiscount = p.precioPromo && p.precioOriginal && p.precioPromo < p.precioOriginal;

          return (
            <div
              key={p.id}
              className="card hover-lift"
              style={{
                minWidth: "170px",
                maxWidth: "190px",
                background: "var(--white, #ffffff)",
                borderRadius: "var(--r-lg, 14px)",
                border: "1.5px solid rgba(34, 197, 94, 0.25)",
                padding: "14px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: "0 4px 12px rgba(34, 197, 94, 0.04), 0 2px 4px rgba(17, 11, 8, 0.02)",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Sponsor Badge */}
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "#1A7A42",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  fontSize: "8px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  zIndex: 10,
                }}
              >
                {p.badgeTexto || "Patrocinado"}
              </div>

              {/* Brand Name */}
              <p
                style={{
                  fontSize: "8px",
                  fontWeight: 800,
                  color: "var(--muted, #888078)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  margin: "0 0 6px",
                  fontFamily: "var(--font-body), sans-serif",
                }}
              >
                {p.marcaNombre}
              </p>

              {/* Product Image if available */}
              {p.imagen ? (
                 <div style={{ 
                   width: "100%", 
                   height: "100px", 
                   position: "relative", 
                   marginBottom: "10px",
                   background: "linear-gradient(180deg, #ffffff 0%, #f9f8f6 100%)",
                   borderRadius: "10px",
                   border: "1px solid rgba(17,11,8,0.03)",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center",
                   overflow: "hidden"
                 }}>
                   <Image src={p.imagen} alt={p.nombreProducto} fill sizes="(max-width: 768px) 150px, 200px" style={{ objectFit: "contain", padding: "6px" }} />
                 </div>
              ) : (
                 <div style={{ 
                   width: "100%", 
                   height: "100px", 
                   marginBottom: "10px",
                   background: "linear-gradient(180deg, #ffffff 0%, #f9f8f6 100%)",
                   borderRadius: "10px",
                   border: "1px solid rgba(17,11,8,0.03)",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center"
                 }}>
                   <span style={{ fontSize: "2rem" }}>📦</span>
                 </div>
              )}

              {/* Product Name */}
              <h4
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--oscuro, #111)",
                  margin: "0 0 10px",
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  height: "2.6em",
                  fontFamily: "var(--font-body), sans-serif",
                }}
              >
                {p.nombreProducto}
              </h4>

              {/* Price */}
              {hasPrice && (
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "12px", marginTop: "auto" }}>
                  <span
                    style={{
                      fontSize: "1.45rem",
                      fontWeight: 800,
                      color: "var(--rojo, #E8302A)",
                      fontFamily: "var(--font-display)",
                      letterSpacing: "0.2px"
                    }}
                  >
                    ${finalPrice.toLocaleString("es-UY")}
                  </span>
                  {hasDiscount && (
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: "var(--faint, #888078)",
                        textDecoration: "line-through",
                      }}
                    >
                      ${p.precioOriginal!.toLocaleString("es-UY")}
                    </span>
                  )}
                </div>
              )}

              {/* Add button */}
              {hasPrice ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(p);
                  }}
                  disabled={addedMap[p.id]}
                  style={{
                    width: "100%",
                    padding: "9px",
                    borderRadius: "12px",
                    border: "none",
                    background: addedMap[p.id] ? "var(--verde, #1A7A42)" : "var(--oscuro, #1A1410)",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  }}
                >
                  {addedMap[p.id] ? "✓ Agregado" : "Agregar"}
                </button>
              ) : (
                <div style={{ marginTop: "auto" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
