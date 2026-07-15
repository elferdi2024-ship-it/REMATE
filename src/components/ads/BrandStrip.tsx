// filepath: src/components/ads/BrandStrip.tsx
"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { BrandConfig } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";
import { getActiveBrands } from "@/lib/brands";

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
  const router = useRouter();
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

  const brandImages = useMemo(() => {
    const now = new Date();
    const validBrands = brands.filter((b) => {
      if (!b.active) return false;
      if (b.startAt && new Date(b.startAt) > now) return false;
      if (b.expiresAt && new Date(b.expiresAt) < now) return false;
      return true;
    });

    return validBrands.map((brand) => {
      const images = (brand.assets || []).filter((a) => a.type === "image");
      const picked = images.slice(0, 3);
      return { brand, images: picked };
    });
  }, [brands]);

  if (brandImages.length === 0) return null;

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
                  onClick={() => router.push(`/catalogo?search=${encodeURIComponent(brand.name)}`)}
                  style={{
                    background: dark ? "rgba(255,255,255,0.05)" : "var(--bg2, #F5F0E8)",
                    border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "var(--border, #DDD8D0)"}`,
                    borderRadius: "16px",
                    padding: "16px",
                    width: "min(320px, 90vw)",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Brand images mini-grid OR Fallback */}
                  {images.length > 0 ? (
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
                  ) : (
                    <div
                      style={{
                        borderRadius: "10px",
                        marginBottom: "12px",
                        height: "120px",
                        background: `linear-gradient(135deg, ${brand.color || '#D62828'} 0%, #1A1410 100%)`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ position: "absolute", top: "-50%", left: "-20%", width: "70%", height: "200%", background: "rgba(255,255,255,0.05)", transform: "rotate(30deg)", pointerEvents: "none" }} />
                      
                      {brand.logo ? (
                         <div style={{ position: "relative", width: "48px", height: "48px", borderRadius: "12px", background: "#fff", padding: "4px", marginBottom: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                           <Image src={brand.logo} alt={brand.name} fill sizes="48px" style={{ objectFit: "contain", padding: "4px" }} />
                         </div>
                      ) : (
                         <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", fontWeight: "bold", marginBottom: "8px", border: "1px solid rgba(255,255,255,0.2)" }}>
                           {brand.name.charAt(0).toUpperCase()}
                         </div>
                      )}
                      
                      <div style={{ color: "#fff", fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif", fontSize: "1.4rem", letterSpacing: "1px", textShadow: "0 2px 4px rgba(0,0,0,0.5)", lineHeight: 1 }}>
                        {brand.headline || brand.name}
                      </div>
                      {brand.tagline && (
                        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: 600, marginTop: "4px" }}>
                          {brand.tagline}
                        </div>
                      )}
                    </div>
                  )}

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
                            color: tierStyle.text,
                            background: tierStyle.bg,
                            border: `1px solid ${tierStyle.border}`,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            marginTop: "4px",
                            display: "inline-block",
                          }}
                        >
                          Espacio Patrocinado
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
