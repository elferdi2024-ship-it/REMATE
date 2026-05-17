// filepath: src/components/ads/BrandVideoCard.tsx
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { useAdImpression } from "@/hooks/useAdImpression";
import { AD_TOKENS } from "./adStyles";
import { markAsSeen, hasSeenEnough } from "@/hooks/useFrequencyCap";

interface BrandVideoCardProps {
  brand: BrandConfig;
  asset: BrandAsset;
  layout?: "inline" | "tall" | "wide";
}

export default function BrandVideoCard({ brand, asset, layout = "wide" }: BrandVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const containerRef = useAdImpression<HTMLDivElement>(brand.id, asset.id);

  // Frequency cap check
  useEffect(() => {
    if (hasSeenEnough("videoCard", brand.id)) {
      setHasError(true); // Hide it by simulating an error
    } else {
      markAsSeen("videoCard", brand.id);
    }
  }, [brand.id]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleError = useCallback(() => setHasError(true), []);
  const layoutStyles =
    layout === "inline"
      ? {
          aspectRatio: "4/5",
          margin: "0",
          borderRadius: isMobile ? "10px" : "12px",
        }
      : layout === "tall"
        ? {
            aspectRatio: isMobile ? "3/4" : "4/5",
            margin: isMobile ? "20px 0" : "24px 0",
            borderRadius: isMobile ? "12px" : "16px",
          }
        : {
            aspectRatio: isMobile ? "16/9" : "21/9",
            margin: isMobile ? "20px 0" : "32px 0",
            borderRadius: isMobile ? "12px" : "18px",
          };

  if (hasError) return null;

  return (
    <div
      ref={containerRef}
      onClick={togglePlay}
      onMouseEnter={() => {
        if (!isMobile && !isPlaying && videoRef.current) {
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: layoutStyles.aspectRatio,
        borderRadius: layoutStyles.borderRadius,
        overflow: "hidden",
        background: "#000",
        cursor: "pointer",
        margin: layoutStyles.margin,
        ...AD_TOKENS.fadeIn(isVisible)
      }}
      aria-label={`Video publicitario: ${brand.name}`}
    >
      <video
        ref={videoRef}
        src={asset.src}
        muted
        loop
        playsInline
        preload="metadata"
        onError={handleError}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Overlay izquierdo para que el texto sea legible */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)", pointerEvents: "none" }} />

      {/* Play button central con glassmorphism */}
      {!isPlaying && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none"
        }}>
          <div style={{
            width: isMobile ? 56 : 64, height: isMobile ? 56 : 64, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "2px solid rgba(255,255,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* triángulo de play */}
            <div style={{ width: 0, height: 0, borderTop: "12px solid transparent", borderBottom: "12px solid transparent", borderLeft: "20px solid rgba(255,255,255,0.9)", marginLeft: 4 }} />
          </div>
        </div>
      )}

      {/* Info de marca — inferior izquierdo */}
      <div style={{ position: "absolute", bottom: isMobile ? 16 : 24, left: isMobile ? 16 : 32, pointerEvents: "none" }}>
        <div style={AD_TOKENS.adLabel}>EXCLUSIVO</div>
        <p style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: "6px 0 2px" }}>{brand.name}</p>
        {brand.tagline && <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", margin: 0 }}>{brand.tagline}</p>}
      </div>
    </div>
  );
}
