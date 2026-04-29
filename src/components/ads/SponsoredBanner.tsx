// filepath: src/components/ads/SponsoredBanner.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";

interface SponsoredBannerProps {
  brand: BrandConfig;
  asset: BrandAsset;
  /** Compact variant for inline use */
  variant?: "full" | "compact";
}

/**
 * Horizontal banner between categories or sections.
 * Responsive with lazy loading. NOT clickable.
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
      className="sponsored-banner"
      style={{
        borderRadius: isCompact ? "14px" : "20px",
        overflow: "hidden",
        position: "relative",
        width: "100%",
        border: `1.5px solid ${tierStyle.border}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        cursor: "default",
        margin: isCompact ? "8px 0" : "16px 0",
        background: "var(--bg2, #F5F0E8)",
      }}
      aria-label={`Publicidad: ${brand.name}`}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: isCompact ? "20%" : "28%",
          minHeight: isCompact ? "80px" : "120px",
          background: "#f0ece4",
        }}
      >
        {isVisible && (
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 90vw, 1200px"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)`,
            pointerEvents: "none",
          }}
        />

        {/* Brand badge — top right */}
        <div
          style={{
            position: "absolute",
            top: isCompact ? "8px" : "12px",
            right: isCompact ? "8px" : "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            zIndex: 2,
          }}
        >
          <span
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(10px)",
              color: "#fff",
              fontSize: isCompact ? "8px" : "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              padding: isCompact ? "3px 7px" : "4px 10px",
              borderRadius: "6px",
              letterSpacing: "1px",
              border: `1px solid rgba(255,255,255,0.15)`,
            }}
          >
            ⟐ {brand.name} · Publicidad
          </span>
        </div>

        {/* Brand name — bottom left (full variant only) */}
        {!isCompact && (
          <div
            style={{
              position: "absolute",
              bottom: "14px",
              left: "18px",
              zIndex: 2,
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                fontSize: "clamp(1.2rem, 3vw, 2rem)",
                color: "#fff",
                letterSpacing: "2px",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {brand.name.toUpperCase()}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
