// filepath: src/components/ads/SponsoredBanner.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";
import { useAdImpression } from "@/hooks/useAdImpression";
import { AD_TOKENS } from "./adStyles";

interface SponsoredBannerProps {
  brand: BrandConfig;
  asset: BrandAsset;
  /** "full" = full-width between sections, "compact" = smaller inline */
  variant?: "full" | "compact";
}

/**
 * Horizontal banner between categories.
 * Full-bleed image, NOT clickable. Maintains aspect ratio with object-fit cover
 * but at a more restrained height so it doesn't dominate.
 */
export default function SponsoredBanner({ brand, asset, variant = "full" }: SponsoredBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Usamos el hook de tracking que usa IntersectionObserver
  const ref = useAdImpression<HTMLDivElement>(brand.id, asset.id);

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

  const tierStyle = TIER_COLORS[brand.tier];
  const isCompact = variant === "compact";

  return (
      <div
      ref={ref}
      className="sponsored-banner-v2"
      style={{
        borderRadius: isCompact ? "8px" : AD_TOKENS.borderRadius.banner,
        overflow: "hidden",
        position: "relative",
        width: "100%",
        cursor: "default",
        margin: isCompact ? "6px 0" : "12px 0",
        background: "#0a0a0a",
      }}
      aria-label={`Publicidad: ${brand.name}`}
    >
      {/* Image — constrained aspect ratio */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: isCompact ? "4/1" : "3/1",
          maxHeight: isCompact ? "120px" : "220px",
          minHeight: isCompact ? "60px" : "100px",
        }}
      >
        {isVisible && (
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 90vw, 1200px"
            style={{ 
              objectFit: "cover",
              ...AD_TOKENS.fadeIn(isVisible)
            }}
            loading="lazy"
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: AD_TOKENS.overlay.banner,
            pointerEvents: "none",
          }}
        />

        {/* Brand pill */}
        <div
          style={{
            position: "absolute",
            top: isCompact ? "6px" : "10px",
            right: isCompact ? "6px" : "10px",
            zIndex: 2,
          }}
        >
          <span style={AD_TOKENS.brandPill(tierStyle.border)}>
            ⟐ {brand.name} · Publicidad
          </span>
        </div>
      </div>
    </div>
  );
}
