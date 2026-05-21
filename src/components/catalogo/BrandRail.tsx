// filepath: src/components/catalogo/BrandRail.tsx
"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import type { BrandConfig } from "@/types/brands";
import { getActiveBrands } from "@/lib/brands";
import { useAdImpression } from "@/hooks/useAdImpression";
import { haptic } from "@/lib/haptic";

interface BrandRailProps {
  brands: BrandConfig[];
  activeBrandName?: string;
  onSelectBrand: (brandName: string) => void;
}

export default function BrandRail({ brands, activeBrandName = "", onSelectBrand }: BrandRailProps) {
  const activeBrands = useMemo(() => getActiveBrands(brands), [brands]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (activeBrands.length === 0) return null;

  return (
    <div
      style={{
        padding: "16px 4px",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        background: "transparent",
        marginTop: "8px",
        marginBottom: "8px",
      }}
    >
      {/* Label superior discreto */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 12px 10px",
        }}
      >
        <span
          style={{
            fontSize: "9px",
            fontWeight: 800,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(255, 255, 255, 0.4)",
          }}
        >
          Marcas Patrocinantes
        </span>
        <span
          style={{
            fontSize: "8px",
            fontWeight: 600,
            color: "#00E5FF",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Beneficios Exclusivos
        </span>
      </div>

      {/* Carrusel horizontal */}
      <div
        ref={containerRef}
        style={{
          display: "flex",
          gap: "14px",
          overflowX: "auto",
          padding: "4px 12px 12px",
          scrollbarWidth: "none", // Firefox
          WebkitOverflowScrolling: "touch",
        }}
        className="brand-rail-scroll"
      >
        {/* Opción "Todos" para deseleccionar filtro de marca */}
        <div
          onClick={() => {
            haptic.add();
            onSelectBrand("");
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isMobile) e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            if (!isMobile) e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: activeBrandName === "" 
                ? "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03))"
                : "rgba(255,255,255,0.03)",
              border: activeBrandName === "" 
                ? "2px solid #00E5FF" 
                : "1.5px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: activeBrandName === "" ? "0 0 15px rgba(0,229,255,0.25)" : "none",
              transition: "all 0.3s ease",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              TODAS
            </span>
          </div>
          <span
            style={{
              marginTop: "6px",
              fontSize: "10px",
              fontWeight: 700,
              color: activeBrandName === "" ? "#00E5FF" : "rgba(255,255,255,0.6)",
              transition: "color 0.3s",
            }}
          >
            Catálogo
          </span>
        </div>

        {/* Marcas Patrocinadoras */}
        {activeBrands.map((brand) => {
          return (
            <BrandBubble
              key={brand.id}
              brand={brand}
              isActive={activeBrandName.toLowerCase() === brand.name.toLowerCase()}
              onSelect={onSelectBrand}
              isMobile={isMobile}
            />
          );
        })}
      </div>
    </div>
  );
}

interface BrandBubbleProps {
  brand: BrandConfig;
  isActive: boolean;
  onSelect: (brandName: string) => void;
  isMobile: boolean;
}

function BrandBubble({ brand, isActive, onSelect, isMobile }: BrandBubbleProps) {
  // Registramos la impresión de esta burbuja patrocinadora en el rail
  const ref = useAdImpression<HTMLDivElement>(brand.id, "brand_rail_bubble", "brand_rail");

  const tierColors = {
    oro: { glow: "rgba(255,215,0,0.45)", border: "#FFD700" },
    plata: { glow: "rgba(192,192,192,0.3)", border: "#C0C0C0" },
    bronce: { glow: "rgba(205,127,50,0.25)", border: "#CD7F32" },
  };

  const currentTier = brand.tier || "bronce";
  const tierStyle = tierColors[currentTier];

  return (
    <div
      ref={ref}
      onClick={() => {
        haptic.add();
        // Si ya está activa, la quitamos al hacer clic de nuevo (ciclo inteligente)
        onSelect(isActive ? "" : brand.name);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "transform 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!isMobile) e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        if (!isMobile) e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {/* Burbuja con borde HSL animado y color de la marca */}
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          padding: "3px",
          background: isActive
            ? `linear-gradient(135deg, ${brand.color}, #00E5FF)`
            : `linear-gradient(135deg, ${brand.color}88, rgba(255,255,255,0.08))`,
          boxShadow: isActive
            ? `0 0 16px ${brand.color}aa`
            : `0 4px 10px rgba(0,0,0,0.12)`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
        }}
      >
        {/* Glow perimetral para Tier Oro */}
        {brand.tier === "oro" && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-15 pointer-events-none"
            style={{
              border: `2px solid ${tierStyle.border}`,
              animationDuration: "2.5s",
            }}
          />
        )}

        {/* Imagen del logo interna */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "#fff",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {brand.logo || brand.logoUrl ? (
            <Image
              src={brand.logo || brand.logoUrl || ""}
              alt={brand.name}
              fill
              sizes="60px"
              style={{ objectFit: "contain", padding: "6px" }}
            />
          ) : (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                fontWeight: 900,
                color: brand.color,
              }}
            >
              {brand.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
