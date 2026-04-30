// filepath: src/components/ads/SponsoredBanner.tsx
"use client";

import React, { useEffect, useState } from "react";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { useAdImpression } from "@/hooks/useAdImpression";
import { AD_TOKENS } from "./adStyles";

interface SponsoredBannerProps {
  brand: BrandConfig;
  asset: BrandAsset;
  variant?: "full" | "compact";
}

export default function SponsoredBanner({ brand, asset, variant = "full" }: SponsoredBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
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

  return (
    <div
      ref={ref}
      aria-label={`Publicidad: ${brand.name}`}
      onMouseEnter={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = AD_TOKENS.hover.banner;
          e.currentTarget.style.boxShadow = `0 16px 40px ${brand.color}44`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
      style={{
        width: "100%",
        height: isMobile ? "auto" : AD_TOKENS.size.banner.desktop.height,
        minHeight: isMobile ? "140px" : undefined,
        borderRadius: isMobile ? AD_TOKENS.size.banner.mobile.borderRadius : AD_TOKENS.size.banner.desktop.borderRadius,
        overflow: "hidden",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        padding: isMobile ? "20px" : "0 40px",
        gap: isMobile ? "12px" : "24px",
        position: "relative",
        background: brand.color || "#1a1a1a",
        cursor: "pointer",
        margin: isMobile ? "20px 0" : "32px 0",
        ...AD_TOKENS.fadeIn(isVisible)
      }}
    >
      {/* Textura sutil de fondo */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />

      {/* Logo de la marca */}
      {brand.logoUrl ? (
        <img 
          src={brand.logoUrl} 
          alt={brand.name} 
          style={{ height: 64, width: 64, objectFit: "contain", borderRadius: 12, flexShrink: 0, position: "relative" }} 
        />
      ) : (
        <div style={{ width: 64, height: 64, borderRadius: 12, background: "rgba(255,255,255,0.15)", flexShrink: 0, position: "relative" }} />
      )}

      {/* Texto */}
      <div style={{ flex: 1, position: "relative" }}>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 4px", fontWeight: 600 }}>
          PUBLICIDAD
        </p>
        <h3 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.2px" }}>
          {brand.headline || brand.name}
        </h3>
        {brand.tagline && (
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", margin: 0 }}>
            {brand.tagline}
          </p>
        )}
      </div>

      {/* CTA */}
      <button style={{
        flexShrink: 0, 
        position: "relative",
        width: isMobile ? "100%" : "auto",
        textAlign: "center",
        background: "rgba(255,255,255,0.15)", 
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.35)",
        color: "#fff", 
        fontSize: "12px", 
        fontWeight: 600,
        padding: "10px 22px", 
        borderRadius: "24px", 
        cursor: "pointer",
      }}>
        Ver catálogo →
      </button>
    </div>
  );
}
