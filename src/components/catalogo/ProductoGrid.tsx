"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { Producto, Vista } from "@/types";
import ProductoCard from "./ProductoCard";
import ProductoRow from "./ProductoRow";

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
          {visible.map((producto) => (
            <ProductoCard
              key={producto.codigo}
              producto={producto}
              qty={qtyMap[producto.codigo] || 0}
              searchTerm={searchTerm}
              onAdd={onAdd}
              onQtyChange={onQtyChange}
            />
          ))}
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
