// filepath: src/components/ads/BrandSpotlight.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import BrandMediaModal from "./BrandMediaModal";
import { AD_TOKENS } from "./adStyles";
import { useAdImpression } from "@/hooks/useAdImpression";

interface BrandSpotlightProps {
  brand: BrandConfig;
  asset: BrandAsset;
  layout?: "hero" | "card" | "wide";
  onBrandFilter?: (brandName: string) => void;
}

export default function BrandSpotlight({ brand, asset, layout = "wide", onBrandFilter }: BrandSpotlightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Usamos el hook the tracking que también usa IntersectionObserver
  const ref = useAdImpression<HTMLDivElement>(brand.id, asset.id);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const tierConfig = AD_TOKENS.tier[brand.tier];
  const layoutStyles =
    layout === "card"
      ? {
          height: isMobile ? "220px" : "280px",
          radius: isMobile ? "12px" : "14px",
          margin: "0",
        }
      : layout === "hero"
        ? {
            height: isMobile ? "300px" : "520px",
            radius: isMobile ? "16px" : "22px",
            margin: isMobile ? "20px 0" : "34px 0",
          }
        : {
            height: isMobile ? AD_TOKENS.size.spotlight.mobile.height : AD_TOKENS.size.spotlight.desktop.height,
            radius: isMobile ? AD_TOKENS.size.spotlight.mobile.borderRadius : AD_TOKENS.size.spotlight.desktop.borderRadius,
            margin: isMobile ? "20px 0" : "32px 0",
          };

  return (
    <>
      <div
        ref={ref}
        aria-label={`Publicidad: ${brand.name}`}
        onClick={() => {
          if (onBrandFilter) {
            onBrandFilter(brand.name);
          } else {
            setModalOpen(true);
          }
        }}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = AD_TOKENS.hover.spotlight;
            e.currentTarget.style.boxShadow = `0 24px 60px ${tierConfig.glow}`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
        style={{
          position: "relative",
          width: "100%",
          height: layoutStyles.height,
          borderRadius: layoutStyles.radius,
          overflow: "hidden",
          cursor: "pointer",
          margin: layoutStyles.margin,
          ...AD_TOKENS.fadeIn(isVisible)
        }}
      >
        {isVisible && !imgError && (
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {/* Label publicidad */}
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2, ...AD_TOKENS.adLabel }}>
          DESTACADO
        </div>
      </div>
      
      {modalOpen && (
        <BrandMediaModal brand={brand} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
