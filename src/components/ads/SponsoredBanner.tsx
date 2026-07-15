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
    ? (brand.ctaTextA || "VER CATÁLOGO")
    : (brand.ctaTextB || "ABRIR PROMOCIONES");
  
  const chips = brand.chips && brand.chips.length > 0
    ? brand.chips
    : ["Stock Activo", "Precio Mayorista"];

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
    ? (isCompact ? "130px" : "150px")
    : (isCompact ? "140px" : "180px");
    
  const accentColor = brand.color || "#00E5FF";

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Publicidad: ${brand.name}`}
      onClick={handleCtaClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCtaClick(); }}
      className="group relative w-full overflow-hidden rounded-[20px] bg-[#0A0D14] cursor-pointer transition-all duration-500 ease-out flex flex-row items-stretch"
      style={{
        height: bannerHeight,
        margin: isMobile ? "16px 0" : "28px 0",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
        ...AD_TOKENS.fadeIn(isVisible),
      }}
      onMouseEnter={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.borderColor = `color-mix(in srgb, ${accentColor} 30%, transparent)`;
          e.currentTarget.style.boxShadow = `0 20px 40px -15px color-mix(in srgb, ${accentColor} 20%, rgba(0,0,0,0.5))`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
          e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(0,0,0,0.5)";
        }
      }}
    >
      {/* BACKGROUND IMAGE (Right Side) */}
      <div className="absolute top-0 right-0 bottom-0 z-0" style={{ width: isMobile ? "70%" : "60%" }}>
        {asset?.src ? (
          <Image
            src={asset.src}
            alt={asset.alt || brand.name}
            fill
            sizes={isMobile ? "70vw" : "60vw"}
            className="object-cover object-center transition-transform duration-[10s] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full opacity-80" style={{ 
            background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 60%, black) 0%, #1A1410 100%)`, 
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
          }} />
        )}
      </div>

      {/* GRADIENT OVERLAY (Blending Left to Right) */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: isMobile 
            ? `linear-gradient(90deg, #0A0D14 0%, #0A0D14 40%, color-mix(in srgb, #0A0D14 90%, transparent) 55%, transparent 100%)`
            : `linear-gradient(90deg, #0A0D14 0%, #0A0D14 45%, color-mix(in srgb, #0A0D14 85%, transparent) 60%, transparent 100%)`
        }}
      />
      
      {/* SUBTLE GLOW OVERLAY */}
      <div 
        className="absolute top-0 left-0 bottom-0 w-1/2 z-[2] pointer-events-none opacity-30 mix-blend-screen transition-opacity duration-500 group-hover:opacity-50"
        style={{
          background: `radial-gradient(circle at 0% 50%, ${accentColor}, transparent 70%)`
        }}
      />

      {/* DISCLOSURE BADGE (Top Right, modern glass style) */}
      <div className="absolute top-3 right-3 lg:top-4 lg:right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-[8px] lg:text-[9px] font-bold text-white/80 uppercase tracking-widest">
        <span>PUBLICIDAD</span>
      </div>

      {/* CONTENT PANEL (Left Side) */}
      <div className="relative z-10 h-full flex flex-col justify-center px-5 md:px-10 py-4 w-full md:w-3/5">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <div 
            className="flex-shrink-0 flex items-center justify-center bg-white rounded-lg p-1 overflow-hidden shadow-lg"
            style={{ 
              width: isMobile ? 32 : 44, 
              height: isMobile ? 32 : 44,
              border: `1px solid color-mix(in srgb, ${accentColor} 30%, rgba(255,255,255,0.2))`
            }}
          >
            {brand.logoUrl ? (
              <div className="relative w-full h-full">
                <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain" />
              </div>
            ) : (
              <span className="font-bebas text-lg" style={{ color: accentColor }}>{brandInitial}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-white font-bebas tracking-wide text-xl md:text-3xl leading-none">
              {brand.headline || brand.name}
            </h3>
            {brand.tagline && (
              <p className="text-white/60 text-[10px] md:text-xs font-medium tracking-wide mt-0.5 max-w-[200px] md:max-w-xs truncate">
                {brand.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Action Row: CTA + Chips */}
        <div className="flex items-center gap-3 md:gap-4 mt-auto md:mt-2">
          {/* CTA Button */}
          <button
            className="flex-shrink-0 text-black font-bold text-[9px] md:text-xs uppercase tracking-[0.1em] px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] group-hover:scale-105 bg-white"
          >
            {ctaText}
          </button>

          {/* Feature Chips (hidden on very small mobile) */}
          <div className="hidden sm:flex items-center gap-2 overflow-hidden">
            {chips.slice(0, 2).map(chip => (
              <div 
                key={chip} 
                className="whitespace-nowrap px-2.5 py-1 text-[8px] md:text-[9px] font-bold uppercase tracking-widest rounded-md border backdrop-blur-sm"
                style={{
                  color: `color-mix(in srgb, ${accentColor} 80%, white)`,
                  borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
