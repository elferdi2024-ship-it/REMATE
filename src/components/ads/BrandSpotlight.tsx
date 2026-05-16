// filepath: src/components/ads/BrandSpotlight.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import BrandMediaModal from "./BrandMediaModal";
import { AD_TOKENS } from "./adStyles";
import { useAdImpression } from "@/hooks/useAdImpression";

interface BrandSpotlightProps {
  brand: BrandConfig;
  asset: BrandAsset;
  layout?: "hero" | "card" | "wide"; // visual hint — actualmente no cambia el layout, reservado para V5
}

export default function BrandSpotlight({ brand, asset, layout = "wide" }: BrandSpotlightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Usamos el hook the tracking que también usa IntersectionObserver
  const ref = useAdImpression<HTMLDivElement>(brand.id, asset.id);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  if (imgError) return null;

  const tierConfig = AD_TOKENS.tier[brand.tier];
  const layoutStyles =
    layout === "card"
      ? {
          height: isMobile ? "220px" : "280px",
          radius: isMobile ? "12px" : "14px",
          margin: "0",
        }
      : layout === "hero"
        ? {
            height: isMobile ? "300px" : "520px",
            radius: isMobile ? "16px" : "22px",
            margin: isMobile ? "20px 0" : "34px 0",
          }
        : {
            height: isMobile ? AD_TOKENS.size.spotlight.mobile.height : AD_TOKENS.size.spotlight.desktop.height,
            radius: isMobile ? AD_TOKENS.size.spotlight.mobile.borderRadius : AD_TOKENS.size.spotlight.desktop.borderRadius,
            margin: isMobile ? "20px 0" : "32px 0",
          };

  return (
    <>
      <div
        ref={ref}
        aria-label={`Publicidad: ${brand.name}`}
        onClick={() => setModalOpen(true)}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = AD_TOKENS.hover.spotlight;
            e.currentTarget.style.boxShadow = `0 24px 60px ${tierConfig.glow}`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
        style={{
          position: "relative",
          width: "100%",
          height: layoutStyles.height,
          borderRadius: layoutStyles.radius,
          overflow: "hidden",
          cursor: "pointer",
          margin: layoutStyles.margin,
          ...AD_TOKENS.fadeIn(isVisible)
        }}
      >
        {isVisible && !imgError && (
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {/* Overlay en 3 capas */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${brand.color}55 0%, transparent 60%)` }} />
        <div style={{ position: "absolute", inset: 0, background: isMobile ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%)" : "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)" }} />

        {/* Label publicidad */}
        <div style={{ position: "absolute", top: 20, left: 20, zIndex: 2, ...AD_TOKENS.adLabel }}>
          PUBLICIDAD
        </div>

        {/* Contenido */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isMobile ? "20px" : "32px 40px", textAlign: isMobile ? "center" : "left", zIndex: 2 }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px" }}>
            {brand.name}
          </p>
          <h2 style={{ color: "#fff", fontSize: isMobile ? "24px" : "36px", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            {brand.headline || brand.name}
          </h2>
          {brand.tagline && (
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", margin: "0 0 20px" }}>
              {brand.tagline}
            </p>
          )}
          <button style={{ 
            width: isMobile ? "100%" : "auto",
            background: "rgba(255,255,255,0.15)", 
            backdropFilter: "blur(8px)", 
            border: "1px solid rgba(255,255,255,0.35)", 
            color: "#fff", 
            fontSize: "13px", 
            fontWeight: 600, 
            padding: "10px 24px", 
            borderRadius: "24px", 
            cursor: "pointer", 
            letterSpacing: "0.3px",
            marginTop: "12px"
          }}>
            Ver en catálogo →
          </button>
        </div>
      </div>
      
      {modalOpen && (
        <BrandMediaModal brand={brand} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
