"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { Producto, Vista } from "@/types";
import ProductoCard from "./ProductoCard";
import ProductoRow from "./ProductoRow";
import AdBanner from "../ui/AdBanner";

interface ProductoGridProps {
  productos: Producto[];
  vista: Vista;
  qtyMap: Record<string, number>;
  searchTerm?: string;
  onAdd: (producto: Producto) => void;
  onQtyChange: (codigo: string, qty: number) => void;
}

const PAGE_SIZE = 40;

export default function ProductoGrid({
  productos,
  vista,
  qtyMap,
  searchTerm,
  onAdd,
  onQtyChange,
}: ProductoGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  const handleReset = useCallback(() => {
    setVisibleCount(PAGE_SIZE);
  }, []);

  // Reset visible count when products change (e.g., new filter/search)
  useEffect(() => {
    handleReset();
  }, [productos.length, handleReset]);

  const visible = productos.slice(0, visibleCount);
  const hasMore = visibleCount < productos.length;

  if (productos.length === 0) {
    return (
      <div className="no-results">
        <span className="no-results-icon">&#128269;</span>
        <p>No encontramos nada con eso — probá con otro término.</p>
      </div>
    );
  }

  return (
    <>
      {vista === "grilla" ? (
        <div className="grid">
          {visible.map((producto, index) => {
            const isBannerSlot = index > 0 && index % 12 === 0;
            const bannerIndex = Math.floor(index / 12);
            
            // Alternar entre estilos de banners
            const banners = [
              {
                id: `banner-${bannerIndex}-a`,
                type: "html" as const,
                backgroundColor: "var(--amber-pale, #FEF3C7)",
                htmlContent: (
                  <div style={{ textAlign: "center", width: "100%" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--amber, #D97706)", margin: 0, lineHeight: 1 }}>LOS ROMPE DEL FINDE</h3>
                    <p style={{ margin: "4px 0 0", color: "var(--tierra, #5C4A35)", fontWeight: 500, fontSize: "0.9rem" }}>Aprovechá estas ofertas exclusivas hasta el domingo.</p>
                  </div>
                )
              },
              {
                id: `banner-${bannerIndex}-b`,
                type: "html" as const,
                backgroundColor: "var(--rojo-pale, #FEE2E2)",
                htmlContent: (
                  <div style={{ textAlign: "center", width: "100%" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--rojo, #E8302A)", margin: 0, lineHeight: 1 }}>¡HASTA 25% OFF EN LIMPIEZA!</h3>
                    <p style={{ margin: "4px 0 0", color: "var(--tierra, #5C4A35)", fontWeight: 500, fontSize: "0.9rem" }}>Stockeate con los mejores precios mayoristas.</p>
                  </div>
                )
              }
            ];
            
            const banner = banners[bannerIndex % banners.length];

            return (
              <React.Fragment key={producto.codigo}>
                {isBannerSlot && (
                  <div className="banner-full-width">
                    <AdBanner {...banner} />
                  </div>
                )}
                <ProductoCard
                  producto={producto}
                  qty={qtyMap[producto.codigo] || 0}
                  searchTerm={searchTerm}
                  onAdd={onAdd}
                  onQtyChange={onQtyChange}
                />
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="product-list">
          {visible.map((producto) => (
            <ProductoRow
              key={producto.codigo}
              producto={producto}
              qty={qtyMap[producto.codigo] || 0}
              onAdd={onAdd}
              onQtyChange={onQtyChange}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="load-more-wrap">
          <button className="btn-load-more" onClick={handleLoadMore}>
            VER MÁS PRODUCTOS &#8595;
          </button>
        </div>
      )}
    </>
  );
}
