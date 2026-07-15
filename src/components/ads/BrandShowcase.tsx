// filepath: src/components/ads/BrandShowcase.tsx
"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import type { BrandConfig } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";
import { getActiveBrands } from "@/lib/brands";

interface BrandShowcaseProps {
  brands: BrandConfig[];
}

/**
 * Premium showcase section for the landing page.
 * Full-width carousel with brand images and videos.
 * Auto-rotates between brands every 5 seconds.
 */
export default function BrandShowcase({ brands }: BrandShowcaseProps) {
  const activeBrands = useMemo(() => {
    const now = new Date();
    return brands.filter((b) => {
      if (!b.active) return false;
      if (b.startAt && new Date(b.startAt) > now) return false;
      if (b.expiresAt && new Date(b.expiresAt) < now) return false;
      return true;
    });
  }, [brands]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Auto-rotate
  useEffect(() => {
    if (!isVisible || activeBrands.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeBrands.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isVisible, activeBrands.length]);

  if (activeBrands.length === 0) return null;

  const currentBrand = activeBrands[currentIdx];
  const images = currentBrand.assets.filter((a) => a.type === "image");
  const heroImage = images[0];
  const gridImages = images.slice(1, 5);
  const video = currentBrand.assets.find((a) => a.type === "video");
  const tierStyle = TIER_COLORS[currentBrand.tier];

  return (
    <section
      ref={ref}
      style={{
        padding: "60px 20px",
        background: "var(--oscuro, #1A1410)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${currentBrand.color}15 0%, transparent 60%)`,
          pointerEvents: "none",
          transition: "background 0.5s",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Marcas destacadas
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              color: "#fff",
              letterSpacing: "3px",
              margin: 0,
            }}
          >
            NUESTRAS{" "}
            <span style={{ color: "var(--rojo, #D62828)" }}>MARCAS</span>
          </h2>
        </div>

        {/* Brand selector tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {activeBrands.map((brand, idx) => {
            const isActive = idx === currentIdx;
            const ts = TIER_COLORS[brand.tier];
            return (
              <button
                key={brand.id}
                onClick={() => setCurrentIdx(idx)}
                style={{
                  background: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isActive ? ts.border : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "10px",
                  padding: "8px 18px",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "var(--font-body, 'DM Sans'), sans-serif",
                }}
              >
                {brand.name}
              </button>
            );
          })}
        </div>

        {/* Content grid */}
        {isVisible && (
          <div
            className="brand-showcase-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              animation: "fadeIn 0.4s ease",
            }}
          >
            {/* Hero image (large) */}
            <div
              style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                gridRow: gridImages.length > 0 ? "span 2" : undefined,
                minHeight: "280px",
                background: heroImage ? "#1a1714" : `linear-gradient(135deg, ${currentBrand.color || '#D62828'} 0%, #1A1410 100%)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {heroImage ? (
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
              ) : (
                <div style={{ textAlign: "center", padding: "40px", position: "relative", zIndex: 10 }}>
                   {currentBrand.logo ? (
                      <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "16px", background: "#fff", margin: "0 auto 16px", padding: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                        <Image src={currentBrand.logo} alt={currentBrand.name} fill style={{ objectFit: "contain", padding: "8px" }} />
                      </div>
                   ) : (
                      <div style={{ width: "80px", height: "80px", borderRadius: "16px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "40px", fontWeight: "bold", margin: "0 auto 16px", border: "1px solid rgba(255,255,255,0.2)" }}>
                        {currentBrand.name.charAt(0).toUpperCase()}
                      </div>
                   )}
                   <h3 style={{ fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif", fontSize: "2.5rem", color: "#fff", letterSpacing: "2px", margin: "0 0 8px 0", lineHeight: 1, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                     {currentBrand.headline || currentBrand.name}
                   </h3>
                   {currentBrand.tagline && (
                     <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1rem", margin: "0 0 24px 0", fontWeight: 500 }}>
                       {currentBrand.tagline}
                     </p>
                   )}
                   <a
                     href={`/catalogo?search=${encodeURIComponent(currentBrand.name)}`}
                     style={{
                       background: "#fff",
                       color: "#1A1410",
                       border: "none",
                       borderRadius: "30px",
                       padding: "10px 24px",
                       fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                       fontSize: "1.1rem",
                       letterSpacing: "1px",
                       cursor: "pointer",
                       transition: "transform 0.2s",
                       display: "inline-block",
                       textDecoration: "none",
                     }}
                   >
                     VER PRODUCTOS →
                   </a>
                </div>
              )}
              {/* Brand badge overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "16px",
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(10px)",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: `1px solid ${tierStyle.border}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                      fontSize: "1.4rem",
                      color: "#fff",
                      letterSpacing: "2px",
                      lineHeight: 1,
                    }}
                  >
                    {currentBrand.name.toUpperCase()}
                  </div>
                  <span
                    style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      color: tierStyle.text,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    ⟐ Marcas Destacadas
                  </span>
                </div>
              </div>

            {/* Grid of smaller images */}
            {gridImages.map((img) => (
              <div
                key={img.id}
                style={{
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                  minHeight: "130px",
                  background: "#1a1714",
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            ))}

            {/* Video (if available, replaces one grid slot) */}
            {video && (
              <div
                style={{
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                  minHeight: "130px",
                  background: "#0a0a0a",
                }}
              >
                <video
                  ref={videoRef}
                  src={video.src}
                  muted
                  loop
                  playsInline
                  preload="none"
                  autoPlay={isVisible}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
                {/* Play indicator */}
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "#fff" }}>▶</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress dots */}
        {activeBrands.length > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              marginTop: "20px",
            }}
          >
            {activeBrands.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: idx === currentIdx ? "24px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: idx === currentIdx ? "var(--rojo, #D62828)" : "rgba(255,255,255,0.15)",
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
                onClick={() => setCurrentIdx(idx)}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .brand-showcase-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
