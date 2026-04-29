// filepath: src/components/catalogo/ProductoGrid.tsx
"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { Producto, Vista } from "@/types";
import ProductoCard from "./ProductoCard";
import ProductoRow from "./ProductoRow";
import { BrandSpotlight, BrandVideoCard, SponsoredBanner } from "@/components/ads";
import { useBrands } from "@/hooks/useBrands";
import { getActiveBrands, getBrandForCategory, getRandomImage, getRandomVideo, buildAdSequence } from "@/lib/brands";
import type { BrandConfig } from "@/types/brands";

interface ProductoGridProps {
  productos: Producto[];
  vista: Vista;
  qtyMap: Record<string, number>;
  searchTerm?: string;
  onAdd: (producto: Producto) => void;
  onQtyChange: (codigo: string, qty: number) => void;
}

/** How often to insert a BrandSpotlight inside carousels (every N products) */
const AD_EVERY_N_PRODUCTS = 10;
/** How often to insert a SponsoredBanner between categories */
const BANNER_EVERY_N_CATEGORIES = 3;
/** How often to insert a BrandVideoCard between categories */
const VIDEO_EVERY_N_CATEGORIES = 5;

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
  adBrand,
}: {
  cat: string;
  catProds: Producto[];
  columns: number;
  qtyMap: Record<string, number>;
  searchTerm?: string;
  vista: Vista;
  onAdd: (p: Producto) => void;
  onQtyChange: (codigo: string, qty: number) => void;
  adBrand?: BrandConfig | null;
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
          {catProds.map((p, pIdx) => (
            <React.Fragment key={p.codigo}>
              <ProductoCard
                producto={p}
                qty={qtyMap[p.codigo] || 0}
                searchTerm={searchTerm}
                onAdd={onAdd}
                onQtyChange={onQtyChange}
              />
              {/* Intercalamos banner al final de cada fila completa */}
              {(pIdx + 1) % columns === 0 && pIdx < catProds.length - 1 && (
                <div className="grid-banner-row">
                  <CategoryBanner index={pIdx + 1} />
                </div>
              )}
            </React.Fragment>
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
  // Optimización: No renderizar miles de cards si no se van a ver.
  // En modo carrusel, limitamos a 24 productos iniciales si no hay scroll/showAll.
  const displayProds = showAll ? catProds : catProds.slice(0, 24);

  return (
    <>
      <div className="cat-carousel-wrap">
        <div
          ref={scrollRef}
          className="cat-carousel-track"
        >
          {displayProds.map((p, pIdx) => (
            <React.Fragment key={p.codigo}>
              <div className="cat-carousel-item">
                <ProductoCard
                  producto={p}
                  qty={qtyMap[p.codigo] || 0}
                  searchTerm={searchTerm}
                  onAdd={onAdd}
                  onQtyChange={onQtyChange}
                />
              </div>
              {/* Intercalar BrandSpotlight cada N productos */}
              {adBrand && (pIdx + 1) % AD_EVERY_N_PRODUCTS === 0 && pIdx < displayProds.length - 1 && (() => {
                const img = adBrand.assets.filter(a => a.type === "image")[pIdx % adBrand.assets.filter(a => a.type === "image").length];
                return img ? (
                  <div className="cat-carousel-item">
                    <BrandSpotlight brand={adBrand} asset={img} compact />
                  </div>
                ) : null;
              })()}
            </React.Fragment>
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
  const { brands } = useBrands();

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
      const cat = p.categoria;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {} as Record<string, Producto[]>);
  }, [productos]);

  const categories = Object.keys(grouped).sort();

  // Pre-compute ad sequence for banner slots between categories
  const adSequence = useMemo(() => {
    const totalSlots = Math.ceil(categories.length / BANNER_EVERY_N_CATEGORIES);
    return buildAdSequence(brands, totalSlots);
  }, [brands, categories.length]);

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
        // Find matching brand for this category, or use round-robin
        const matchingBrand = getBrandForCategory(brands, cat);
        const adBrand = matchingBrand || (getActiveBrands(brands)[catIdx % getActiveBrands(brands).length] || null);
        const slotIdx = Math.floor(catIdx / BANNER_EVERY_N_CATEGORIES);
        const bannerBrand = adSequence[slotIdx] || null;

        return (
          <LazySection key={cat} index={catIdx} vista={vista} bannerBrand={bannerBrand} adBrand={adBrand}>
            <section className="cat-section">
              <div className="cat-section-header">
                <h2 className="cat-section-title">{cat}</h2>
                <div className="cat-section-divider" />
                <span className="cat-section-count">{catProds.length} items</span>
              </div>
              <CategoryCarousel
                cat={cat}
                catProds={catProds}
                columns={columns}
                qtyMap={qtyMap}
                searchTerm={searchTerm}
                vista={vista}
                onAdd={onAdd}
                onQtyChange={onQtyChange}
                adBrand={adBrand}
              />
            </section>
          </LazySection>
        );
      })}
    </div>
  );
}

function LazySection({
  children,
  index,
  vista,
  bannerBrand,
  adBrand,
}: {
  children: React.ReactNode;
  index: number;
  vista: Vista;
  bannerBrand?: BrandConfig | null;
  adBrand?: BrandConfig | null;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" } // Cargar un poco antes de que sea visible
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Determine what ad to show between categories
  const showSponsoredBanner = index > 0 && index % BANNER_EVERY_N_CATEGORIES === 0 && bannerBrand;
  const showVideoAd = index > 0 && index % VIDEO_EVERY_N_CATEGORIES === 0 && adBrand;

  return (
    <div ref={ref} className="lazy-section-wrapper" style={{ minHeight: isVisible ? "auto" : "300px" }}>
      {isVisible ? (
        <>
          {/* Sponsored banner between categories */}
          {showSponsoredBanner && (() => {
            const img = getRandomImage(bannerBrand!);
            return img ? <SponsoredBanner brand={bannerBrand!} asset={img} variant="full" /> : null;
          })()}

          {/* Video ad between categories (less frequent) */}
          {showVideoAd && !showSponsoredBanner && (() => {
            const vid = getRandomVideo(adBrand!);
            return vid ? <BrandVideoCard brand={adBrand!} asset={vid} /> : null;
          })()}

          {vista === "grilla" && <CategoryBanner index={index} />}
          {children}
        </>
      ) : (
        <div className="section-placeholder animate-pulse bg-gray-100 rounded-xl h-[300px] mb-8" />
      )}
    </div>
  );
}
