// filepath: src/components/ads/SponsoredBanner.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";

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
  const ref = useRef<HTMLDivElement>(null);

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
  }, []);

  const tierStyle = TIER_COLORS[brand.tier];
  const isCompact = variant === "compact";

  return (
      <div
      ref={ref}
      className="sponsored-banner-v2"
      style={{
        borderRadius: isCompact ? "8px" : "12px",
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
              opacity: 1,
              animation: "fadeIn 0.6s ease-in"
            }}
            loading="lazy"
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(0,0,0,0.35) 0%, transparent 60%)",
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
          <span
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              color: "#fff",
              fontSize: isCompact ? "7px" : "8px",
              fontWeight: 700,
              textTransform: "uppercase",
              padding: isCompact ? "2px 6px" : "3px 8px",
              borderRadius: "5px",
              letterSpacing: "0.8px",
              border: `1px solid ${tierStyle.border}`,
            }}
          >
            ⟐ {brand.name} · Publicidad
          </span>
        </div>
      </div>
    </div>
  );
}
