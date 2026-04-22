// filepath: src/components/catalogo/ProductoGrid.tsx
"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
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

const CATEGORY_CORRECTIONS: Record<string, string> = {
  "ALFAJOR": "Golosinas y Dulces",
  "PILAS": "Otros",
  "LAMPARA": "Otros",
  "SHAMPOO": "Higiene Personal",
  "ACONDICIONADOR": "Higiene Personal",
  "JABON TOCADOR": "Higiene Personal",
  "DENTAL": "Higiene Personal",
  "AFEITADORA": "Higiene Personal",
  "ACEITUNAS": "Conservas y Enlatados",
  "CHOCLO": "Conservas y Enlatados",
  "ARVEJAS": "Conservas y Enlatados",
  "POROTOS": "Conservas y Enlatados",
  "LENTEJAS": "Conservas y Enlatados",
  "PAN DULCE": "Panadería",
  "BUDIN": "Panadería",
};

// Banners responsive
const BANNERS = [
  { desktop: "/banners/banner1-desktop.jpg", mobile: "/banners/banner1-mobile.jpg", alt: "Oferta especial" },
  { desktop: "/banners/banner2-desktop.jpg", mobile: "/banners/banner2-mobile.jpg", alt: "Promoción" },
  { desktop: "/banners/banner3-desktop.jpg", mobile: "/banners/banner3-mobile.jpg", alt: "Descuentos" },
  { desktop: "/banners/banner4-desktop.jpg", mobile: "/banners/banner4-mobile.jpg", alt: "Oferta exclusiva" },
];

function CategoryBanner({ index }: { index: number }) {
  const banner = BANNERS[index % BANNERS.length];
  return (
    <div className="cat-banner-between">
      <picture>
        <source media="(max-width: 600px)" srcSet={banner.mobile} />
        <source media="(min-width: 601px)" srcSet={banner.desktop} />
        <img
          src={banner.desktop}
          alt={banner.alt}
          className="cat-banner-img"
          loading="lazy"
        />
      </picture>
    </div>
  );
}

// ─── Componente carrusel horizontal por categoría ───────────────────────────
function CategoryCarousel({
  cat,
  catProds,
  columns,
  qtyMap,
  searchTerm,
  vista,
  onAdd,
  onQtyChange,
}: {
  cat: string;
  catProds: Producto[];
  columns: number;
  qtyMap: Record<string, number>;
  searchTerm?: string;
  vista: Vista;
  onAdd: (p: Producto) => void;
  onQtyChange: (codigo: string, qty: number) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset cuando cambia la categoría
  useEffect(() => {
    setShowAll(false);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [cat]);

  const total = catProds.length;
  // Cuántos caben en 1 "página" del carrusel (1 fila = columns cards)
  const pageSize = columns;
  const hasMore = total > pageSize;

  const handleArrow = useCallback(() => {
    if (!scrollRef.current) return;
    // Calcular ancho de una "página" (columns × card width + gap)
    const container = scrollRef.current;
    const cardWidth = container.scrollWidth / total;
    const pageWidth = cardWidth * pageSize;
    container.scrollBy({ left: pageWidth, behavior: "smooth" });
  }, [total, pageSize]);

  const handleShowAll = () => setShowAll(true);
  const handleShowLess = () => {
    setShowAll(false);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  };

  if (vista === "lista") {
    return (
      <div className="product-list">
        {catProds.map((p) => (
          <ProductoRow
            key={p.codigo}
            producto={p}
            qty={qtyMap[p.codigo] || 0}
            onAdd={onAdd}
            onQtyChange={onQtyChange}
          />
        ))}
      </div>
    );
  }

  if (showAll) {
    return (
      <>
        <div className="grid">
          {catProds.map((p) => (
            <ProductoCard
              key={p.codigo}
              producto={p}
              qty={qtyMap[p.codigo] || 0}
              searchTerm={searchTerm}
              onAdd={onAdd}
              onQtyChange={onQtyChange}
            />
          ))}
        </div>
        <div className="cat-section-controls">
          <button className="btn-show-less" onClick={handleShowLess}>
            MOSTRAR MENOS ↑
          </button>
        </div>
      </>
    );
  }

  // MODO CARRUSEL HORIZONTAL
  return (
    <>
      <div className="cat-carousel-wrap">
        <div
          ref={scrollRef}
          className="cat-carousel-track"
        >
          {catProds.map((p) => (
            <div key={p.codigo} className="cat-carousel-item">
              <ProductoCard
                producto={p}
                qty={qtyMap[p.codigo] || 0}
                searchTerm={searchTerm}
                onAdd={onAdd}
                onQtyChange={onQtyChange}
              />
            </div>
          ))}
        </div>

        {/* Flecha → solo si hay más productos */}
        {hasMore && (
          <button
            className="cat-expand-arrow"
            onClick={handleArrow}
            title="Ver más"
            aria-label="Ver más productos"
          >
            ›
          </button>
        )}
      </div>

      {/* MOSTRAR TODO */}
      {hasMore && (
        <div className="cat-section-controls">
          <button className="btn-show-all" onClick={handleShowAll}>
            MOSTRAR TODO ({total})
          </button>
        </div>
      )}
    </>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function ProductoGrid({
  productos,
  vista,
  qtyMap,
  searchTerm,
  onAdd,
  onQtyChange,
}: ProductoGridProps) {
  const [columns, setColumns] = useState(2);

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w >= 1300) setColumns(6);
      else if (w >= 1060) setColumns(5);
      else if (w >= 780) setColumns(4);
      else if (w >= 520) setColumns(3);
      else setColumns(2);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const grouped = useMemo(() => {
    return productos.reduce((acc, p) => {
      let categoria = p.categoria;
      const nombreUpper = p.nombre.toUpperCase();
      for (const [key, corrected] of Object.entries(CATEGORY_CORRECTIONS)) {
        if (nombreUpper.includes(key)) {
          categoria = corrected;
          break;
        }
      }
      if (!acc[categoria]) acc[categoria] = [];
      acc[categoria].push(p);
      return acc;
    }, {} as Record<string, Producto[]>);
  }, [productos]);

  const categories = Object.keys(grouped).sort();

  if (productos.length === 0) {
    return (
      <div className="no-results">
        <span className="no-results-icon">&#128269;</span>
        <p>No encontramos nada con eso — probá con otro término.</p>
      </div>
    );
  }

  return (
    <div className="catalogo-container">
      {categories.map((cat, catIdx) => {
        const catProds = grouped[cat];
        const total = catProds.length;

        return (
          <React.Fragment key={cat}>
            {/* Banner entre secciones (no antes de la primera) */}
            {catIdx > 0 && vista === "grilla" && (
              <CategoryBanner index={catIdx - 1} />
            )}

            <section className="cat-section">
              {/* Header */}
              <div className="cat-section-header">
                <h2 className="cat-section-title">{cat}</h2>
                <div className="cat-section-divider" />
                <span className="cat-section-count">{total} items</span>
              </div>

              {/* Carrusel o lista */}
              <CategoryCarousel
                cat={cat}
                catProds={catProds}
                columns={columns}
                qtyMap={qtyMap}
                searchTerm={searchTerm}
                vista={vista}
                onAdd={onAdd}
                onQtyChange={onQtyChange}
              />
            </section>
          </React.Fragment>
        );
      })}
    </div>
  );
}
