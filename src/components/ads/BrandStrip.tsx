// filepath: src/components/ads/BrandStrip.tsx
"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import type { BrandConfig } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";
import { getActiveBrands, getRandomImage } from "@/lib/brands";

interface BrandStripProps {
  brands: BrandConfig[];
  /** Title above the strip */
  title?: string;
  /** Dark background mode */
  dark?: boolean;
}

/**
 * Horizontal strip showcasing all active brands.
 * Shows brand images in a scrollable/wrapping row.
 * Used in landing page between sections.
 */
export default function BrandStrip({ brands, title, dark = false }: BrandStripProps) {
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
      { rootMargin: "200px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const activeBrands = useMemo(() => getActiveBrands(brands), [brands]);

  // Pick 2 random image assets per brand for the strip
  const brandImages = useMemo(() => {
    return activeBrands.map((brand) => {
      const images = brand.assets.filter((a) => a.type === "image");
      const picked = images.slice(0, 3);
      return { brand, images: picked };
    });
  }, [activeBrands]);

  if (activeBrands.length === 0) return null;

  return (
    <div
      ref={ref}
      style={{
        padding: "40px 20px",
        background: dark ? "var(--oscuro, #1A1410)" : "var(--white, #FFFFFF)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80px",
          height: "3px",
          background: "var(--rojo, #D62828)",
          borderRadius: "2px",
          opacity: 0.5,
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {title && (
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: dark ? "rgba(255,255,255,0.4)" : "var(--muted, #9C8570)",
              }}
            >
              {title}
            </span>
          </div>
        )}

        {/* Brand cards row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {isVisible &&
            brandImages.map(({ brand, images }) => {
              const tierStyle = TIER_COLORS[brand.tier];
              return (
                <div
                  key={brand.id}
                  style={{
                    background: dark ? "rgba(255,255,255,0.05)" : "var(--bg2, #F5F0E8)",
                    border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "var(--border, #DDD8D0)"}`,
                    borderRadius: "16px",
                    padding: "16px",
                    width: "min(320px, 90vw)",
                    cursor: "default",
                    transition: "transform 0.2s",
                  }}
                >
                  {/* Brand images mini-grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: images.length > 1 ? "1fr 1fr" : "1fr",
                      gap: "6px",
                      marginBottom: "12px",
                    }}
                  >
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        style={{
                          position: "relative",
                          borderRadius: "10px",
                          overflow: "hidden",
                          height: idx === 0 && images.length > 1 ? "100%" : "80px",
                          gridRow: idx === 0 && images.length > 2 ? "span 2" : undefined,
                          background: "#e8e2d8",
                        }}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          sizes="160px"
                          style={{ objectFit: "cover" }}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Brand info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {brand.logo && (
                      <div
                        style={{
                          position: "relative",
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#fff",
                        }}
                      >
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          sizes="28px"
                          style={{ objectFit: "contain", padding: "2px" }}
                        />
                      </div>
                    )}
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                          fontSize: "1rem",
                          letterSpacing: "1px",
                          color: dark ? "#fff" : "var(--oscuro, #1A1410)",
                          lineHeight: 1,
                        }}
                      >
                        {brand.name.toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontSize: "8px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          color: "rgba(255,255,255,0.5)",
                          marginTop: "2px",
                          display: "inline-block",
                        }}
                      >
                        Marca Patrocinante
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
