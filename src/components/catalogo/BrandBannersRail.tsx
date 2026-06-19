// filepath: src/components/catalogo/BrandBannersRail.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BrandBanner } from "@/types/ofertas";

interface BrandBannersRailProps {
  banners?: BrandBanner[];
}

export default function BrandBannersRail({ banners = [] }: BrandBannersRailProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter active and within date range banners
  const activeBanners = banners
    .filter((b) => b.activo)
    .filter((b) => {
      const now = Date.now();
      if (b.fechaInicio && new Date(b.fechaInicio).getTime() > now) return false;
      if (b.fechaFin && new Date(b.fechaFin).getTime() < now) return false;
      return true;
    })
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[activeIndex];

  return (
    <div
      style={{
        width: "100%",
        marginTop: "16px",
        marginBottom: "20px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        position: "relative",
      }}
    >
      <div
        style={{
          background: currentBanner.colorFondo || "#1e1b4b",
          color: currentBanner.colorTexto || "#ffffff",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "180px",
          padding: "24px 32px",
          transition: "background 0.5s ease, color 0.5s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Accent */}
        <div
          style={{
            position: "absolute",
            top: "-50%",
            right: "-10%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            pointerEvents: "none",
          }}
        />

        {/* Content Side */}
        <div
          style={{
            flex: "1 1 55%",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "2.5px",
              opacity: 0.8,
              fontFamily: "var(--font-display, sans-serif)",
            }}
          >
            📢 {currentBanner.marcaNombre}
          </span>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
            }}
          >
            {currentBanner.titulo}
          </h2>
          <p
            style={{
              fontSize: "clamp(12px, 1.8vw, 15px)",
              opacity: 0.85,
              margin: 0,
              lineHeight: 1.4,
              maxWidth: "450px",
            }}
          >
            {currentBanner.subtitulo}
          </p>

          <div style={{ marginTop: "8px" }}>
            <Link
              href={currentBanner.ctaLink || "#"}
              style={{
                display: "inline-block",
                background: currentBanner.colorTexto || "#ffffff",
                color: currentBanner.colorFondo || "#1e1b4b",
                padding: "10px 24px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 800,
                textDecoration: "none",
                transition: "transform 0.15s, opacity 0.15s",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.opacity = "0.95";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.opacity = "1";
              }}
            >
              {currentBanner.ctaTexto || "Ver más"}
            </Link>
          </div>
        </div>

        {/* Image Side */}
        {currentBanner.imagen && (
          <div
            style={{
              flex: "1 1 35%",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              zIndex: 2,
              height: "140px",
              position: "relative",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentBanner.imagen}
              alt={currentBanner.marcaNombre}
              style={{
                maxHeight: "140px",
                maxWidth: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.2))",
              }}
            />
          </div>
        )}
      </div>

      {/* Dots Indicator */}
      {activeBanners.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "32px",
            display: "flex",
            gap: "6px",
            zIndex: 3,
          }}
        >
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                width: idx === activeIndex ? "24px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: currentBanner.colorTexto || "#ffffff",
                opacity: idx === activeIndex ? 0.9 : 0.35,
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.25s ease, opacity 0.25s ease",
              }}
              aria-label={`Ir al banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
