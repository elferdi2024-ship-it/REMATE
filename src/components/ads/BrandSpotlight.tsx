// filepath: src/components/ads/BrandSpotlight.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";

interface BrandSpotlightProps {
  brand: BrandConfig;
  asset: BrandAsset;
  /** Compact mode for inline grid placement */
  compact?: boolean;
}

/**
 * A product-card-sized spotlight showing a brand's image.
 * Styled to blend with the catalog grid but with a subtle premium feel.
 * NOT clickable — purely visual.
 */
export default function BrandSpotlight({ brand, asset, compact = false }: BrandSpotlightProps) {
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

  const tierStyle = TIER_COLORS[brand.tier];

  return (
    <div
      ref={ref}
      className="brand-spotlight"
      style={{
        background: "var(--white, #FFFFFF)",
        border: `1.5px solid ${tierStyle.border}`,
        borderRadius: "16px",
        padding: compact ? "8px" : "10px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        minHeight: compact ? "auto" : undefined,
      }}
      aria-label={`Publicidad: ${brand.name}`}
    >
      {/* Shimmer accent top border */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, transparent, ${brand.color}, transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Image area */}
      <div
        style={{
          background: "var(--bg2, #F5F0E8)",
          borderRadius: "12px",
          height: compact ? "100px" : "110px",
          marginBottom: "8px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isVisible && (
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        )}

        {/* Subtle overlay gradient */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(transparent, rgba(0,0,0,0.3))",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Brand badge */}
      <div style={{ padding: "0 4px 4px", flex: 1, display: "flex", flexDirection: "column" }}>
        <span
          style={{
            background: tierStyle.bg,
            color: tierStyle.text,
            fontSize: "8px",
            fontWeight: 800,
            textTransform: "uppercase",
            padding: "2px 6px",
            borderRadius: "4px",
            marginBottom: "6px",
            display: "inline-block",
            letterSpacing: "0.5px",
            width: "fit-content",
          }}
        >
          ⟐ {brand.name}
        </span>

        <span
          style={{
            fontSize: "9px",
            fontWeight: 600,
            color: "var(--muted, #9C8570)",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Marca destacada
        </span>
      </div>
    </div>
  );
}
