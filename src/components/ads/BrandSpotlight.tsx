// filepath: src/components/ads/BrandSpotlight.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";

interface BrandSpotlightProps {
  brand: BrandConfig;
  asset: BrandAsset;
  /** "card" = product card slot, "tall" = 2-row tall slot */
  layout?: "card" | "tall";
}

/**
 * An image ad that fits inside the product grid — either as a normal card
 * or as a tall card spanning 2 rows.  NOT clickable — purely visual.
 */
export default function BrandSpotlight({ brand, asset, layout = "card" }: BrandSpotlightProps) {
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
  const isTall = layout === "tall";

  return (
    <div
      ref={ref}
      className={`brand-spotlight-v2 ${isTall ? "brand-spotlight-tall" : ""}`}
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        cursor: "default",
        background: "#0a0a0a",
        height: "100%",
        minHeight: isTall ? "340px" : "auto",
      }}
      aria-label={`Publicidad: ${brand.name}`}
    >
      {/* Full-bleed image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: isTall ? "340px" : "200px",
        }}
      >
        {isVisible && (
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes={isTall ? "(max-width: 768px) 50vw, 20vw" : "(max-width: 768px) 50vw, 16vw"}
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isTall
              ? "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)"
              : "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 40%)",
            pointerEvents: "none",
          }}
        />

        {/* Brand tag — pill bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            zIndex: 2,
          }}
        >
          <span
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              color: "#fff",
              fontSize: "8px",
              fontWeight: 800,
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: "5px",
              letterSpacing: "0.8px",
              border: `1px solid ${tierStyle.border}`,
            }}
          >
            ⟐ {brand.name}
          </span>
        </div>

        {/* "Publicidad" micro label — top right */}
        <span
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            fontSize: "7px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.45)",
            textTransform: "uppercase",
            letterSpacing: "1.2px",
            zIndex: 2,
          }}
        >
          Publicidad
        </span>
      </div>
    </div>
  );
}
