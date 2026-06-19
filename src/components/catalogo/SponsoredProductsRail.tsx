// filepath: src/components/catalogo/SponsoredProductsRail.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
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
    const finalPrice = p.precioPromo || p.precioOriginal;
    addItem({
      codigo: p.codigoProducto,
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
            fontSize: "1.2rem",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: "var(--oscuro, #ffffff)",
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
          const finalPrice = p.precioPromo || p.precioOriginal;
          const hasDiscount = p.precioPromo && p.precioPromo < p.precioOriginal;

          return (
            <div
              key={p.id}
              style={{
                minWidth: "170px",
                maxWidth: "190px",
                background: "linear-gradient(135deg, rgba(34,197,94,0.03), #1a1a1a)",
                borderRadius: "14px",
                border: "1px solid rgba(34,197,94,0.2)",
                padding: "14px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Sponsor Badge */}
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  color: "#22c55e",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  fontSize: "9px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {p.badgeTexto || "Patrocinado"}
              </div>

              {/* Brand Name */}
              <p
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  margin: "0 0 4px",
                }}
              >
                {p.marcaNombre}
              </p>

              {/* Product Image if available */}
              {p.imagen && (
                <div style={{ width: "100%", height: "90px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "8px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imagen} alt={p.nombreProducto} style={{ maxHeight: "90px", maxWidth: "100%", objectFit: "contain", borderRadius: "6px" }} />
                </div>
              )}

              {/* Product Name */}
              <h4
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 10px",
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  height: "32px",
                }}
              >
                {p.nombreProducto}
              </h4>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "12px", marginTop: "auto" }}>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 900,
                    color: "#22C55E",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  ${finalPrice.toLocaleString("es-UY")}
                </span>
                {hasDiscount && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.25)",
                      textDecoration: "line-through",
                    }}
                  >
                    ${p.precioOriginal.toLocaleString("es-UY")}
                  </span>
                )}
              </div>

              {/* Add button */}
              <button
                onClick={() => handleAddToCart(p)}
                disabled={addedMap[p.id]}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "10px",
                  border: "none",
                  background: addedMap[p.id] ? "#22C55E" : "rgba(255,255,255,0.06)",
                  borderStyle: addedMap[p.id] ? "none" : "solid",
                  borderWidth: addedMap[p.id] ? 0 : "1px",
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                {addedMap[p.id] ? "✓ Agregado" : "Agregar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
