// filepath: src/components/ads/BrandVideoCard.tsx
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

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
  }, [hasError]);

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
        background: "#0a0a0a",
        borderRadius: isWide ? "20px" : "16px",
        overflow: "hidden",
        position: "relative",
        cursor: "default",
        width: "100%",
        height: isTall ? "100%" : "auto",
        minHeight: isTall ? "340px" : isInline ? "200px" : undefined,
      }}
      aria-label={`Video publicitario: ${brand.name}`}
    >
      {/* Video wrapper — uses contain so video is never cropped */}
      <div
        style={{
          position: "relative",
          width: "100%",
          ...(isWide
            ? { paddingTop: "0", height: "auto", aspectRatio: "16/9", maxHeight: "360px" }
            : isTall
              ? { height: "100%", minHeight: "340px" }
              : { aspectRatio: "4/5", maxHeight: "280px" }
          ),
          background: "#0a0a0a",
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
            preload="none"
            onError={handleError}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              position: "absolute",
              top: 0,
              left: 0,
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
          <span
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              color: "#fff",
              fontSize: "9px",
              fontWeight: 700,
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: "5px",
              letterSpacing: "0.8px",
              border: `1px solid ${tierStyle.border}`,
            }}
          >
            ▶ {brand.name}
          </span>
        </div>

        {/* "Publicidad" micro label */}
        <span
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            fontSize: "7px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
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
