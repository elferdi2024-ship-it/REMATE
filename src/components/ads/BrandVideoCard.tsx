// filepath: src/components/ads/BrandVideoCard.tsx
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";

interface BrandVideoCardProps {
  brand: BrandConfig;
  asset: BrandAsset;
  /** Full-width mode (for landing page) */
  fullWidth?: boolean;
}

/**
 * Autoplay muted video card for brand advertising.
 * - Plays only when visible (IntersectionObserver)
 * - Pauses when out of viewport
 * - preload="none" for performance
 * - NOT clickable
 */
export default function BrandVideoCard({ brand, asset, fullWidth = false }: BrandVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

  // IntersectionObserver to play/pause video
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && video && !hasError) {
          video.play().catch(() => {
            // Autoplay blocked, silently ignore
          });
        } else if (!entry.isIntersecting && video) {
          video.pause();
        }
      },
      { threshold: 0.3, rootMargin: "100px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [hasError]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const tierStyle = TIER_COLORS[brand.tier];

  if (hasError) {
    // Fallback: show nothing if video fails
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="brand-video-card"
      style={{
        background: "var(--oscuro, #1A1410)",
        border: `1.5px solid ${tierStyle.border}`,
        borderRadius: fullWidth ? "20px" : "16px",
        overflow: "hidden",
        position: "relative",
        cursor: "default",
        width: "100%",
      }}
      aria-label={`Video publicitario: ${brand.name}`}
    >
      {/* Video */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: fullWidth ? "45%" : "56.25%",
          background: "#0A0A0A",
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
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Gradient overlay at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
            pointerEvents: "none",
          }}
        />

        {/* Brand badge */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 2,
          }}
        >
          <span
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "6px",
              letterSpacing: "1px",
              border: `1px solid ${tierStyle.border}`,
            }}
          >
            ⟐ {brand.name}
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Publicidad
          </span>
        </div>
      </div>
    </div>
  );
}
