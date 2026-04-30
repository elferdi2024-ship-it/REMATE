// filepath: src/components/ads/BrandSpotlight.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";
import BrandMediaModal from "./BrandMediaModal";
import { AD_TOKENS } from "./adStyles";
import { useAdImpression } from "@/hooks/useAdImpression";

interface BrandSpotlightProps {
  brand: BrandConfig;
  asset: BrandAsset;
  layout?: "card" | "tall";
}

export default function BrandSpotlight({ brand, asset, layout = "card" }: BrandSpotlightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Usamos el hook the tracking que también usa IntersectionObserver
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

  if (imgError) return null;

  const tierStyle = TIER_COLORS[brand.tier];
  const isTall = layout === "tall";

  // Altura auto-contenida — no depende del padre
  const containerHeight = isTall ? "320px" : "180px";

  return (
    <>
      <div
        ref={ref}
        aria-label={`Publicidad: ${brand.name}`}
        onClick={() => setModalOpen(true)}
        style={{
          borderRadius: AD_TOKENS.borderRadius.card,
          overflow: "hidden",
          position: "relative",
          cursor: "pointer",
          width: "100%",
          height: containerHeight,       // ← altura fija, no depende del padre
          background: `${brand.color}18`,
          flexShrink: 0,
          ...AD_TOKENS.fadeIn(isVisible)
        }}
      >
        {isVisible && !imgError && (
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes={isTall ? "20vw" : "16vw"}
            style={{ objectFit: "contain", padding: "4px" }}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {/* Gradiente bottom */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: isTall ? AD_TOKENS.overlay.tall : AD_TOKENS.overlay.card,
          pointerEvents: "none",
        }} />

        {/* Brand pill — bottom left */}
        <div style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          <span style={AD_TOKENS.brandPill(tierStyle.border)}>
            ⟐ {brand.name}
          </span>
        </div>

        {/* Publicidad label — top right */}
        <span style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          zIndex: 2,
          ...AD_TOKENS.publicidadLabel
        }}>
          Publicidad
        </span>
      </div>
      
      {modalOpen && (
        <BrandMediaModal brand={brand} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
