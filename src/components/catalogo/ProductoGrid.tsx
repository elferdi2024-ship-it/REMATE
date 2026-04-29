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

/**
 * Ad placement pattern — varied, creative, non-repetitive.
 * Each pattern type determines what kind of ad goes between categories.
 * null = no ad (just products), giving breathing room.
 */
type AdSlotType = "banner" | "video-wide" | "inline-cards" | null;

// Pattern cycle for between-category ad slots — spread out, varied
const AD_PATTERN: AdSlotType[] = [
  null,              // 1st category: no ad above
  null,              // 2nd: no ad — let user see products first
  "inline-cards",    // 3rd: subtle image cards mixed in the carousel
  null,              // 4th: breathing room
  "banner",          // 5th: horizontal banner
  null,              // 6th: rest
  null,              // 7th: rest
  "video-wide",      // 8th: video between categories
  null,              // 9th: rest
  "inline-cards",    // 10th: image cards again
  null,              // 11th: rest
  "banner",          // 12th: banner
  null,              // 13th: rest
  null,              // 14th: rest
  "video-wide",      // 15th: video
];

/** How often to insert ad cards in carousels (every N products) — only for inline-cards slots */
const INLINE_AD_EVERY = 8;

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

// Banners responsive (existing)
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
  showInlineAds,
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
  showInlineAds?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowAll(false);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [cat]);

  const total = catProds.length;
  const pageSize = columns;
  const hasMore = total > pageSize;

  const handleArrow = useCallback(() => {
    if (!scrollRef.current) return;
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
    // Grid expandido — intercalamos ads de imagen como casillas dentro del grid
    const images = adBrand?.assets.filter(a => a.type === "image") || [];
    let adImgIdx = 0;

    return (
      <>
        <div className="grid">
          {catProds.map((p, pIdx) => {
            const items: React.ReactNode[] = [
              <ProductoCard
                key={p.codigo}
                producto={p}
                qty={qtyMap[p.codigo] || 0}
                searchTerm={searchTerm}
                onAdd={onAdd}
                onQtyChange={onQtyChange}
              />,
            ];

            // Every 2 full rows (2 × columns), inject ONE image ad as a grid cell
            if (showInlineAds && adBrand && images.length > 0 && (pIdx + 1) % (columns * 2) === 0 && pIdx < catProds.length - 1) {
              const img = images[adImgIdx % images.length];
              adImgIdx++;
              items.push(
                <div key={`ad-grid-${pIdx}`} className="brand-grid-slot">
                  <BrandSpotlight brand={adBrand} asset={img} layout="card" />
                </div>
              );
            }

            return <React.Fragment key={p.codigo}>{items}</React.Fragment>;
          })}
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
  const displayProds = catProds.slice(0, 24);
  const images = adBrand?.assets.filter(a => a.type === "image") || [];
  let carouselAdIdx = 0;

  return (
    <>
      <div className="cat-carousel-wrap">
        <div ref={scrollRef} className="cat-carousel-track">
          {displayProds.map((p, pIdx) => {
            const items: React.ReactNode[] = [
              <div key={p.codigo} className="cat-carousel-item">
                <ProductoCard
                  producto={p}
                  qty={qtyMap[p.codigo] || 0}
                  searchTerm={searchTerm}
                  onAdd={onAdd}
                  onQtyChange={onQtyChange}
                />
              </div>,
            ];

            // Inject inline ad card every INLINE_AD_EVERY products
            if (showInlineAds && adBrand && images.length > 0 && (pIdx + 1) % INLINE_AD_EVERY === 0 && pIdx < displayProds.length - 1) {
              const img = images[carouselAdIdx % images.length];
              carouselAdIdx++;
              items.push(
                <div key={`ad-carousel-${pIdx}`} className="cat-carousel-item">
                  <BrandSpotlight brand={adBrand} asset={img} layout="card" />
                </div>
              );
            }

            return <React.Fragment key={`wrap-${p.codigo}`}>{items}</React.Fragment>;
          })}
        </div>

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

  // Build ad sequence — weighted by tier
  const adSequence = useMemo(() => {
    return buildAdSequence(brands, categories.length);
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

        // Get the ad slot type for this category position
        const slotType = AD_PATTERN[catIdx % AD_PATTERN.length];
        const showInlineAds = slotType === "inline-cards";

        // Pick the brand for this slot
        const matchingBrand = getBrandForCategory(brands, cat);
        const fallbackBrand = adSequence[catIdx % adSequence.length] || null;
        const adBrand = matchingBrand || fallbackBrand;

        return (
          <LazySection
            key={cat}
            index={catIdx}
            vista={vista}
            slotType={slotType}
            adBrand={adBrand}
          >
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
                showInlineAds={showInlineAds}
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
  slotType,
  adBrand,
}: {
  children: React.ReactNode;
  index: number;
  vista: Vista;
  slotType: AdSlotType;
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
      { rootMargin: "400px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="lazy-section-wrapper" style={{ minHeight: isVisible ? "auto" : "300px" }}>
      {isVisible ? (
        <>
          {/* Inter-category ad — only for specific slots with actual content */}
          {index > 0 && slotType && adBrand && (() => {
            if (slotType === "banner") {
              const img = getRandomImage(adBrand);
              return img ? <SponsoredBanner brand={adBrand} asset={img} variant="full" /> : null;
            }
            if (slotType === "video-wide") {
              const vid = getRandomVideo(adBrand);
              return vid ? <BrandVideoCard brand={adBrand} asset={vid} layout="wide" /> : null;
            }
            // "inline-cards" are handled inside the carousel, not between sections
            return null;
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
