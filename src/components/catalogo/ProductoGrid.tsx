// filepath: src/components/catalogo/ProductoGrid.tsx
"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { Producto, Vista } from "@/types";
import ProductoCard from "./ProductoCard";
import ProductoRow from "./ProductoRow";
import { BrandSpotlight, BrandVideoCard, SponsoredBanner, SponsoredProduct, NativeStoryCard, FlashDealCard } from "@/components/ads";
import { useBrands } from "@/hooks/useBrands";
import { getActiveBrands, getBrandForCategory, getImageAtIndex, getVideoAtIndex, buildAdSequence, buildAdSequenceWithCooldown } from "@/lib/brands";
import { canShowAd } from "@/lib/adFrequency";
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
type AdSlotType = "banner" | "video-wide" | "inline-cards" | "native-story" | null;

// Pattern cycle for between-category ad slots — spread out, varied
const AD_PATTERN: AdSlotType[] = [
  null,              // 1st category: no ad above
  null,              // 2nd: no ad — let user see products first
  "inline-cards",    // 3rd: subtle image cards mixed in the carousel
  "native-story",    // 4th: native story card
  "banner",          // 5th: horizontal banner
  null,              // 6th: rest
  null,              // 7th: rest
  "video-wide",      // 8th: video between categories
  null,              // 9th: rest
  "inline-cards",    // 10th: image cards again
  null,              // 11th: rest
  "native-story",    // 12th: native story
  "banner",          // 13th: banner
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

// Deleted CategoryBanner

// ─── Componente carrusel horizontal por categoría ───────────────────────────
function CategoryCarousel({
  cat,
  catProds,
  allProds,
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
  allProds: Producto[];
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

  const displayProds = useMemo(() => catProds.slice(0, 24), [catProds]);
  const adIndices = useMemo(() => {
    const result: number[] = [];
    let adIdx = 0;
    displayProds.forEach((_, pIdx) => {
      if ((pIdx + 1) % INLINE_AD_EVERY === 0) {
        result.push(adIdx++);
      } else {
        result.push(-1);
      }
    });
    return result;
  }, [displayProds]);

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
                sponsorBrand={adBrand}
              />,
            ];

            // Every 2 full rows (2 × columns), inject ONE image or video ad as a grid cell
            if (showInlineAds && adBrand && (images.length > 0 || adBrand.assets.some(a => a.type === "video")) && (pIdx + 1) % (columns * 2) === 0 && pIdx < catProds.length - 1) {
              if (images.length > 0) {
                const img = getImageAtIndex(adBrand, pIdx);
                if (img) items.push(
                  <div key={`ad-grid-${pIdx}`} className="brand-grid-slot">
                    <BrandSpotlight brand={adBrand} asset={img} layout="card" />
                  </div>
                );
              } else {
                const vid = adBrand.assets.find(a => a.type === "video");
                if (vid) items.push(
                  <div key={`ad-grid-${pIdx}`} className="brand-grid-slot" style={{ gridColumn: "1 / -1", margin: "24px 0" }}>
                    <BrandVideoCard brand={adBrand} asset={vid} layout="inline" />
                  </div>
                );
              }
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
                  sponsorBrand={adBrand}
                />
              </div>,
            ];

            // Inject inline ad card every INLINE_AD_EVERY products
            if (showInlineAds && adBrand && adBrand.assets.length > 0 && (pIdx + 1) % INLINE_AD_EVERY === 0 && pIdx < displayProds.length - 1) {
              const adIdx = adIndices[pIdx];
              
              const adAsset = (() => {
                const sponsored = adBrand.assets.find(a => a.type === "sponsored_product");
                if (sponsored) return { asset: sponsored, type: "sponsored" as const };
                const img = getImageAtIndex(adBrand, adIdx);
                if (img) return { asset: img, type: "spotlight" as const };
                const vid = getVideoAtIndex(adBrand, adIdx);
                if (vid) return { asset: vid, type: "video" as const };
                return null;
              })();

              if (adAsset) {
                items.push(
                  <div key={`ad-carousel-${pIdx}`} className="cat-carousel-item" style={{ 
                    display: "flex",
                    flexShrink: 0,
                    width: `calc((100vw - 48px) / ${columns})`,
                    minWidth: "140px",
                    maxWidth: "220px",
                  }}>
                    {adAsset.type === "sponsored" ? (
                      <SponsoredProduct 
                        brand={adBrand} 
                        asset={adAsset.asset} 
                        onAdd={() => {
                          if (adAsset.asset.productCodigo) {
                            const prod = allProds.find(p => p.codigo === adAsset.asset.productCodigo);
                            if (prod) onAdd(prod);
                          }
                        }}
                      />
                    ) : adAsset.type === "video" ? (
                      <BrandVideoCard brand={adBrand} asset={adAsset.asset} layout="inline" />
                    ) : (
                      <BrandSpotlight brand={adBrand} asset={adAsset.asset} layout="card" />
                    )}
                  </div>
                );
              }
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
      const correction = Object.entries(CATEGORY_CORRECTIONS).find(([keyword]) =>
        p.nombre.toUpperCase().includes(keyword)
      );
      const cat = correction ? correction[1] : p.categoria;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {} as Record<string, Producto[]>);
  }, [productos]);

  const categories = Object.keys(grouped).sort();

  // Build ad sequence — weighted by tier
  const adSequence = useMemo(() => {
    return buildAdSequenceWithCooldown(brands, categories.length, 2);
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
        
        // Show inline ads in every category by default
        const showInlineAds = true;

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
              <div className="cat-section-header" style={
                adBrand?.sponsoredCategories?.includes(cat) ? {
                  background: `linear-gradient(90deg, ${adBrand.color || 'var(--primary-color)'}18 0%, transparent 60%)`,
                  borderLeft: `4px solid ${adBrand.color || 'var(--primary-color)'}`,
                  padding: "12px 16px",
                  borderRadius: "0 8px 8px 0",
                  display: "flex",
                  alignItems: "center"
                } : {}
              }>
                <h2 className="cat-section-title">{cat}</h2>
                <div className="cat-section-divider" style={{ display: adBrand?.sponsoredCategories?.includes(cat) ? "none" : "block" }} />
                {adBrand?.sponsoredCategories?.includes(cat) ? (
                  <span style={{ fontSize: "11px", color: "var(--muted)", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, marginLeft: "auto" }}>
                    PRESENTADO POR
                    {adBrand.logoUrl ? <img src={adBrand.logoUrl} style={{ height: 20, objectFit: "contain" }} alt={adBrand.name} /> : adBrand.name}
                  </span>
                ) : (
                  <span className="cat-section-count">{catProds.length} items</span>
                )}
              </div>
              <CategoryCarousel
                cat={cat}
                catProds={catProds}
                allProds={productos}
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
            const canShow = canShowAd(adBrand.id, 4); // 4 veces por sesión
            if (!canShow) return null;

            if (slotType === "banner") {
              const img = getImageAtIndex(adBrand, index);
              return img ? <SponsoredBanner brand={adBrand} asset={img} variant="full" /> : null;
            }
            if (slotType === "video-wide") {
              const vid = getVideoAtIndex(adBrand, index);
              return vid ? <BrandVideoCard brand={adBrand} asset={vid} layout="wide" /> : null;
            }
            if (slotType === "native-story" && adBrand.story) {
              return <NativeStoryCard brand={adBrand} />;
            }
            // "inline-cards" are handled inside the carousel, not between sections
            return null;
          })()}

          {/* FlashDealCard — aparece cuando la marca tiene oferta activa en <24hs */}
          {index > 0 && adBrand?.flashDeal && (
            <FlashDealCard brand={adBrand} />
          )}

          {/* Removed static CategoryBanner */}
          {children}
        </>
      ) : (
        <div className="section-placeholder animate-pulse bg-gray-100 rounded-xl h-[300px] mb-8" />
      )}
    </div>
  );
}
