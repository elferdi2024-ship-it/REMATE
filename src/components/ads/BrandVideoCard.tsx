// filepath: src/components/ads/BrandVideoCard.tsx
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";

import { useAdImpression } from "@/hooks/useAdImpression";
import { AD_TOKENS } from "./adStyles";

interface BrandVideoCardProps {
  brand: BrandConfig;
  asset: BrandAsset;
  /** "inline" = fits in the product grid as a card slot,
   *  "tall" = vertical video spanning 2 rows in the grid,
   *  "wide" = full-width horizontal banner between categories */
  layout?: "inline" | "tall" | "wide";
}

/**
 * Autoplay muted video card for brand advertising.
 * - Plays only when visible (IntersectionObserver)
 * - Pauses when out of viewport
 * - preload="none" for performance
 * - Videos NEVER cropped — objectFit: "contain" with dark bg
 * - NOT clickable
 */
export default function BrandVideoCard({ brand, asset, layout = "wide" }: BrandVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Usamos el hook the tracking que también usa IntersectionObserver
  const containerRef = useAdImpression<HTMLDivElement>(brand.id, asset.id);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && video && !hasError) {
          video.play().catch(() => {});
        } else if (!entry.isIntersecting && video) {
          video.pause();
        }
      },
      { threshold: 0.2, rootMargin: "100px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [hasError, containerRef]);

  const handleError = useCallback(() => setHasError(true), []);

  const tierStyle = TIER_COLORS[brand.tier];

  if (hasError) return null;

  const isTall = layout === "tall";
  const isInline = layout === "inline";
  const isWide = layout === "wide";

  return (
    <div
      ref={containerRef}
      className={`brand-video-v2 ${isTall ? "brand-video-tall" : ""} ${isInline ? "brand-video-inline" : ""}`}
      style={{
        background: "transparent",
        borderRadius: isWide ? AD_TOKENS.borderRadius.banner : AD_TOKENS.borderRadius.card,
        overflow: "hidden",
        position: "relative",
        cursor: "default",
        width: "100%",
        height: "100%",
        minHeight: isTall ? "340px" : isWide ? "auto" : "100%",
      }}
      aria-label={`Video publicitario: ${brand.name}`}
    >
      {/* Video wrapper — uses contain so video is never cropped */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          ...(isWide && { aspectRatio: "16/9", maxHeight: "280px" }),
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isVisible && (
          <video
            ref={videoRef}
            src={asset.src}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            onError={handleError}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              position: "absolute",
              top: 0,
              left: 0,
              ...AD_TOKENS.fadeIn(isVisible)
            }}
          />
        )}

        {/* Subtle gradient overlay at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "35%",
            background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
            pointerEvents: "none",
          }}
        />

        {/* Brand badge */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            zIndex: 2,
          }}
        >
          <span style={AD_TOKENS.brandPill(tierStyle.border)}>
            ▶ {brand.name}
          </span>
        </div>

        {/* "Publicidad" micro label */}
        <span style={AD_TOKENS.publicidadLabel}>
          Publicidad
        </span>
      </div>
    </div>
  );
}
