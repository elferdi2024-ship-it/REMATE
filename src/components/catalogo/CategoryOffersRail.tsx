// filepath: src/components/catalogo/CategoryOffersRail.tsx
"use client";

import { useState } from "react";
import type { CategoryOffer } from "@/types/ofertas";
import type { Producto } from "@/types";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";

interface CategoryOffersRailProps {
  categoryOffers?: CategoryOffer[];
  catalogo: Producto[];
  qtyMap: Record<string, number>;
  onAddProduct: (producto: any, e: React.MouseEvent) => void;
  onQtyChange: (codigo: string, qty: number) => void;
}

export default function CategoryOffersRail({
  categoryOffers = [],
  catalogo,
  qtyMap,
  onAddProduct,
  onQtyChange,
}: CategoryOffersRailProps) {
  const toast = useToast();

  const activeOffers = categoryOffers
    .filter((co) => co.activa)
    .filter((co) => {
      const now = Date.now();
      if (co.fechaInicio && new Date(co.fechaInicio).getTime() > now) return false;
      if (co.fechaFin && new Date(co.fechaFin).getTime() < now) return false;
      return true;
    });

  if (activeOffers.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "16px", marginBottom: "24px" }}>
      {activeOffers.map((offer) => {
        // Resolve products from catalog matching the codes
        const matchedProducts = catalogo.filter((p) => offer.productos.includes(p.codigo));

        return (
          <div
            key={offer.id}
            style={{
              background: "#121212",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            {/* Header / Banner block */}
            <div
              style={{
                background: `linear-gradient(135deg, ${offer.colorAccent || "#e8302a"}20 0%, #161616 100%)`,
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                padding: "24px 32px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div style={{ flex: "1 1 300px" }}>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    color: offer.colorAccent || "#e8302a",
                    background: `${offer.colorAccent || "#e8302a"}15`,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    display: "inline-block",
                    marginBottom: "12px",
                  }}
                >
                  {offer.categoria}
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.4rem",
                    fontWeight: 900,
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {offer.titulo}
                </h3>
                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                  {offer.descripcion}
                </p>
              </div>

              {offer.imagen && (
                <div style={{ width: "120px", height: "80px", position: "relative", borderRadius: "10px", overflow: "hidden" }}>
                  <Image src={offer.imagen} alt={offer.titulo} fill sizes="120px" style={{ objectFit: "cover" }} />
                </div>
              )}
            </div>

            {/* Products Row */}
            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                gap: "16px",
                overflowX: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {matchedProducts.map((p) => {
                const inCartQty = qtyMap[p.codigo] || 0;
                // Calculate if it has a discount based on catalog price
                // Category offers might just display regular catalog items with special badges
                return (
                  <div
                    key={p.codigo}
                    style={{
                      minWidth: "150px",
                      maxWidth: "170px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "14px",
                      padding: "12px",
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <p style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", margin: "0 0 4px" }}>
                      {p.marca || "Marca"}
                    </p>
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
                      {p.nombre}
                    </h4>

                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "12px", marginTop: "auto" }}>
                      <span style={{ fontSize: "16px", fontWeight: 900, color: "#22C55E", fontFamily: "var(--font-display)" }}>
                        ${p.precio.toLocaleString("es-UY")}
                      </span>
                    </div>

                    {inCartQty > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          padding: "4px 8px",
                        }}
                      >
                        <button
                          onClick={() => onQtyChange(p.codigo, inCartQty - 1)}
                          style={{ background: "none", border: "none", color: "#EF4444", fontWeight: 900, cursor: "pointer", padding: "0 4px" }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "11px", fontWeight: 900, color: "#fff" }}>{inCartQty}</span>
                        <button
                          onClick={() => onQtyChange(p.codigo, inCartQty + 1)}
                          style={{ background: "none", border: "none", color: "#22C55E", fontWeight: 900, cursor: "pointer", padding: "0 4px" }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => onAddProduct(p, e)}
                        style={{
                          width: "100%",
                          padding: "6px",
                          borderRadius: "8px",
                          border: "none",
                          background: offer.colorAccent || "#e8302a",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Agregar
                      </button>
                    )}
                  </div>
                );
              })}
              {matchedProducts.length === 0 && (
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", padding: "12px 0" }}>
                  No hay productos disponibles actualmente en esta categoría promocional.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
