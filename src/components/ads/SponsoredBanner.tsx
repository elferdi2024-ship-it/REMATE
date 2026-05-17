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

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Publicidad: ${brand.name}`}
      onClick={handleCtaClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCtaClick(); }}
      onMouseEnter={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = AD_TOKENS.hover.banner;
          e.currentTarget.style.boxShadow = `0 16px 40px ${brand.color}44`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
      style={{
        width: "100%",
        height: isMobile ? "auto" : isCompact ? "128px" : AD_TOKENS.size.banner.desktop.height,
        minHeight: isMobile ? (isCompact ? "120px" : "170px") : undefined,
        borderRadius: isMobile
          ? AD_TOKENS.size.banner.mobile.borderRadius
          : AD_TOKENS.size.banner.desktop.borderRadius,
        overflow: "hidden",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        padding: isMobile ? (isCompact ? "12px" : "16px") : isCompact ? "0 14px 0 20px" : "0 20px 0 30px",
        gap: isMobile ? "12px" : "24px",
        position: "relative",
        background: brand.color || "#1a1a1a",
        cursor: "pointer",
        margin: isMobile ? "20px 0" : "32px 0",
        ...AD_TOKENS.fadeIn(isVisible),
      }}
    >
      {asset?.src ? (
        <Image
          src={asset.src}
          alt={asset.alt || brand.name}
          fill
          sizes="100vw"
          style={{ objectFit: "cover", opacity: 0.42 }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(8,9,12,0.88) 0%, rgba(8,9,12,0.72) 45%, rgba(8,9,12,0.45) 75%, rgba(8,9,12,0.35) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.16) 0, transparent 24%), radial-gradient(circle at 85% 70%, rgba(255,255,255,0.12) 0, transparent 30%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 12,
          zIndex: 3,
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 1.3,
          color: "#fff",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: 999,
          padding: "5px 10px",
          textTransform: "uppercase",
        }}
      >
        {badgeText}
      </div>

      {brand.logoUrl ? (
        <div
          style={{
            height: isCompact ? 46 : 60,
            width: isCompact ? 46 : 60,
            borderRadius: 12,
            flexShrink: 0,
            position: "relative",
            background: "rgba(255,255,255,0.9)",
            padding: 8,
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          <Image src={brand.logoUrl} alt={brand.name} fill sizes="60px" style={{ objectFit: "contain", padding: 8 }} />
        </div>
      ) : (
        <div
          style={{
            width: isCompact ? 46 : 60,
            height: isCompact ? 46 : 60,
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))",
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "20px",
            fontWeight: 900,
          }}
        >
          {brandInitial}
        </div>
      )}

      <div style={{ flex: 1, position: "relative", zIndex: 2 }}>
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: "10px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            margin: "0 0 4px",
            fontWeight: 700,
          }}
        >
          Publicidad
        </p>
        <h3
          style={{
            color: "#fff",
            fontSize: isCompact ? "16px" : "20px",
            fontWeight: 800,
            margin: "0 0 4px",
            letterSpacing: "-0.2px",
          }}
        >
          {brand.headline || brand.name}
        </h3>
        {brand.tagline && (
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: isCompact ? "11px" : "13px", margin: 0 }}>
            {brand.tagline}
          </p>
        )}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {chips.map((chip) => (
            <span
              key={chip}
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 999,
                padding: "3px 8px",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={handleCtaClick}
        style={{
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
          width: isMobile ? "100%" : "auto",
          textAlign: "center",
          background: ctaBg,
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.35)",
          color: "#fff",
          fontSize: isCompact ? "11px" : "12px",
          fontWeight: 900,
          letterSpacing: 0.6,
          padding: isCompact ? "7px 14px" : "10px 22px",
          borderRadius: "24px",
          cursor: "pointer",
        }}
      >
        {ctaText}
      </button>
    </div>
  );
}
