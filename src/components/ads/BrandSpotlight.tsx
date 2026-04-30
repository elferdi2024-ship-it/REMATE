// filepath: src/components/ads/BrandSpotlight.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";
import BrandMediaModal from "./BrandMediaModal";

interface BrandSpotlightProps {
  brand: BrandConfig;
  asset: BrandAsset;
  layout?: "card" | "tall";
}

export default function BrandSpotlight({ brand, asset, layout = "card" }: BrandSpotlightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
          borderRadius: "14px",
          overflow: "hidden",
          position: "relative",
          cursor: "pointer",
          width: "100%",
          height: containerHeight,       // ← altura fija, no depende del padre
          background: `${brand.color}18`,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          flexShrink: 0,
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
          background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 45%)",
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
          <span style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            color: "#fff",
            fontSize: "8px",
            fontWeight: 800,
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: "5px",
            letterSpacing: "0.8px",
            border: `1px solid ${tierStyle.border}`,
          }}>
            ⟐ {brand.name}
          </span>
        </div>

        {/* Publicidad label — top right */}
        <span style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          fontSize: "7px",
          fontWeight: 700,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: "1.2px",
          zIndex: 2,
          background: "rgba(0,0,0,0.3)",
          padding: "2px 6px",
          borderRadius: "4px",
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
