// filepath: src/components/ads/SponsoredBanner.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { useAdImpression } from "@/hooks/useAdImpression";
import { AD_TOKENS } from "./adStyles";

interface SponsoredBannerProps {
  brand: BrandConfig;
  asset: BrandAsset;
  variant?: "full" | "compact";
  slot?: string;
  onBrandFilter?: (brandName: string) => void;
}

export default function SponsoredBanner({
  brand,
  asset,
  variant = "full",
  slot = "results",
  onBrandFilter,
}: SponsoredBannerProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [abVariant, setAbVariant] = useState<"A" | "B">("A");

  useEffect(() => {
    try {
      const key = `ad_ab_${brand.id}_${slot}`;
      const existing = sessionStorage.getItem(key) as "A" | "B" | null;
      if (existing === "A" || existing === "B") {
        setAbVariant(existing);
        return;
      }
      const next = Math.random() < 0.5 ? "A" : "B";
      sessionStorage.setItem(key, next);
      setAbVariant(next);
    } catch {
      setAbVariant(Math.random() < 0.5 ? "A" : "B");
    }
  }, [brand.id, slot]);

  const ref = useAdImpression<HTMLDivElement>(brand.id, asset.id, slot, abVariant);

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

  const isCompact = variant === "compact";
  const ctaText = abVariant === "A"
    ? (brand.ctaTextA || "ABRIR OFERTAS")
    : (brand.ctaTextB || "VER PROMOCIONES");
  const ctaBg = abVariant === "A" ? "rgba(255,255,255,0.2)" : "rgba(232,48,42,0.35)";
  const chips = brand.chips && brand.chips.length > 0
    ? brand.chips
    : ["Precio mayorista", "Stock activo", "Entrega rapida"];
  const badgeText = brand.badgeText || "Promo activa hoy";

  const handleCtaClick = useCallback(() => {
    const searchTerm = brand.name || brand.headline || "";
    if (onBrandFilter && searchTerm) {
      onBrandFilter(searchTerm);
    } else if (searchTerm) {
      router.push(`/catalogo?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push("/catalogo");
    }
  }, [brand.name, brand.headline, router, onBrandFilter]);
  const brandInitial = brand.name?.slice(0, 1).toUpperCase() || "M";

  const bannerHeight = isMobile
    ? (isCompact ? "120px" : "140px")
    : (isCompact ? "136px" : "170px");

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Publicidad: ${brand.name}`}
      onClick={handleCtaClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCtaClick(); }}
      style={{
        width: "100%",
        height: bannerHeight,
        borderRadius: "20px",
        overflow: "hidden",
        position: "relative",
        background: "#070B19",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.08)",
        cursor: "pointer",
        margin: isMobile ? "16px 0" : "28px 0",
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        ...AD_TOKENS.fadeIn(isVisible),
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease, transform 0.5s ease",
      }}
      onMouseEnter={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.borderColor = brand.color ? `${brand.color}40` : "rgba(0, 229, 255, 0.35)";
          e.currentTarget.style.boxShadow = `0 15px 35px ${brand.color ? `${brand.color}20` : "rgba(0, 229, 255, 0.12)"}, inset 0 1px 2px rgba(255,255,255,0.15)`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.08)";
        }
      }}
    >
      <style>{`
        @keyframes glowPulse {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.6; transform: scale(1); }
        }
      `}</style>
      
      {/* ── TOP-LEFT PATROCINADO DISCLOSURE ── */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "14px",
          zIndex: 4,
          fontSize: "8px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: "rgba(255,255,255,0.6)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "rgba(0,0,0,0.3)",
          padding: "3px 8px",
          borderRadius: "6px",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <span style={{ fontSize: "10px" }}>📢</span> PUBLICIDAD
      </div>

      {/* ── BACKGROUND BRAND COMMERCIAL IMAGE (Layer 1) ── */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: isMobile ? "68%" : "58%",
          zIndex: 1,
        }}
      >
        {asset?.src ? (
          <Image
            src={asset.src}
            alt={asset.alt || brand.name}
            fill
            sizes={isMobile ? "60vw" : "50vw"}
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        ) : (
          <div style={{ 
            width: "100%", 
            height: "100%", 
            background: `linear-gradient(135deg, ${brand.color || '#D62828'} 0%, #1A1410 100%)`, 
            opacity: 0.8,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
          }} />
        )}
      </div>

      {/* ── CINEMATIC SMOOTH GRADIENT OVERLAY (Layer 2) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isMobile
            ? "linear-gradient(90deg, #070B19 0%, #070B19 32%, rgba(7,11,25,0.92) 52%, rgba(7,11,25,0.2) 80%, rgba(7,11,25,0) 100%)"
            : "linear-gradient(90deg, #070B19 0%, #070B19 38%, rgba(7,11,25,0.9) 58%, rgba(7,11,25,0.15) 85%, rgba(7,11,25,0) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* ── DYNAMIC BRAND COLOR GLOW (Layer 2.5) ── */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-20%",
          width: "70%",
          height: "200%",
          background: `radial-gradient(circle, ${brand.color || "#00E5FF"}25 0%, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 2,
          animation: "glowPulse 4s infinite ease-in-out"
        }}
      />

      {/* ── LEFT PANEL CONTENT: TEXT & CTA (Layer 3) ── */}
      <div
        style={{
          width: isMobile ? "55%" : "52%",
          height: "100%",
          padding: isMobile ? "12px 14px" : "18px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 3,
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {brand.logoUrl ? (
            <div
              style={{
                height: isMobile ? 26 : 34,
                width: isMobile ? 26 : 34,
                borderRadius: "50%",
                border: `2px solid ${brand.color || "#00E5FF"}`,
                boxShadow: `0 0 10px ${brand.color || "#00E5FF"}40`,
                background: "#fff",
                padding: "3px",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <Image src={brand.logoUrl} alt={brand.name} fill sizes="34px" style={{ objectFit: "contain", padding: "2px" }} />
            </div>
          ) : (
            <div
              style={{
                width: isMobile ? 26 : 34,
                height: isMobile ? 26 : 34,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${brand.color || "#00E5FF"} 0%, #070B19 100%)`,
                border: `2px solid ${brand.color || "#00E5FF"}`,
                boxShadow: `0 0 10px ${brand.color || "#00E5FF"}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: isMobile ? "11px" : "13px",
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              {brandInitial}
            </div>
          )}
          
          <div>
            <span style={{ fontSize: isMobile ? "11px" : "12.5px", fontWeight: 800, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.2px" }}>
              {brand.name}
            </span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ margin: isMobile ? "4px 0" : "8px 0" }}>
          <h3
            style={{
              color: "#fff",
              fontSize: isMobile ? "15px" : isCompact ? "17px" : "20px",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.3px",
              lineHeight: 1.1,
              fontFamily: "var(--font-display, 'Plus Jakarta Sans'), sans-serif",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {brand.headline || brand.name}
          </h3>
          {!isMobile && brand.tagline && (
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "11px",
                lineHeight: 1.3,
                margin: "4px 0 0 0",
                fontWeight: 500,
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {brand.tagline}
            </p>
          )}
        </div>

        {/* Footer: CTA Button & Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCtaClick();
            }}
            style={{
              background: "#ffffff",
              color: "#070B19",
              border: "none",
              fontSize: isMobile ? "9.5px" : "11px",
              fontWeight: 900,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              padding: isMobile ? "6px 14px" : "8px 18px",
              borderRadius: "999px",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.2)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 6px 15px rgba(255,255,255,0.3), 0 3px 6px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.2)";
            }}
          >
            {ctaText}
          </button>

          {!isMobile && (
            <div style={{ display: "flex", gap: "4px" }}>
              {chips.slice(0, 2).map((chip) => (
                <span
                  key={chip}
                  style={{
                    fontSize: "8.5px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: brand.color || "#00E5FF",
                    border: `1px solid ${brand.color ? `${brand.color}35` : "rgba(0, 229, 255, 0.2)"}`,
                    borderRadius: "999px",
                    padding: "3px 8px",
                    background: brand.color ? `${brand.color}08` : "rgba(0, 229, 255, 0.05)",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL BADGE (Layer 4 - Placed absolute on top right of the whole card) ── */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? "8px" : "10px",
          right: isMobile ? "8px" : "12px",
          zIndex: 4,
          fontSize: isMobile ? "7.5px" : "8.5px",
          fontWeight: 900,
          letterSpacing: "0.8px",
          color: "#FFF5CC",
          background: "rgba(255, 179, 0, 0.12)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          border: "1px solid rgba(255, 179, 0, 0.35)",
          borderRadius: "999px",
          padding: isMobile ? "2px 7px" : "3.5px 10px",
          textTransform: "uppercase",
          boxShadow: "0 4px 12px rgba(255, 179, 0, 0.08)",
          textShadow: "0 0 4px rgba(255, 179, 0, 0.2)",
        }}
      >
        {badgeText}
      </div>
    </div>
  );
}
