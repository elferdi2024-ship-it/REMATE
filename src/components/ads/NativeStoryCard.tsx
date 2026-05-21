// filepath: src/components/ads/NativeStoryCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { BrandConfig } from "@/types/brands";
import { AD_TOKENS } from "./adStyles";
import { useAdEntrance } from "@/hooks/useAdEntrance";
import { markAsSeen, hasSeenEnough } from "@/hooks/useFrequencyCap";

interface NativeStoryCardProps {
  brand: BrandConfig;
  onBrandFilter?: (brandName: string) => void;
}

export default function NativeStoryCard({ brand, onBrandFilter }: NativeStoryCardProps) {
  const { ref, isVisible } = useAdEntrance<HTMLDivElement>();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (hasSeenEnough("nativeStory", brand.id)) {
      setHidden(true);
      return;
    }
    markAsSeen("nativeStory", brand.id);
  }, [brand.id]);

  if (hidden || !brand.story) return null;

  return (
    <div
      ref={ref}
      onClick={() => onBrandFilter?.(brand.name)}
      style={{
        ...AD_TOKENS.fadeIn(isVisible),
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        margin: "24px 0",
        border: "1px solid rgba(0,0,0,0.05)",
        cursor: onBrandFilter ? "pointer" : "default",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "220px", background: "#f0f0f0" }}>
        <Image src={brand.story.imageUrl} alt={brand.story.title} fill sizes="100vw" style={{ objectFit: "cover" }} />

        <div style={{ position: "absolute", top: 12, left: 12, ...AD_TOKENS.adLabel, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          HISTORIA DE MARCA
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          {brand.logoUrl && (
            <span style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", position: "relative", border: "1px solid #eee" }}>
              <Image src={brand.logoUrl} alt={brand.name} fill sizes="32px" style={{ objectFit: "contain" }} />
            </span>
          )}
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--texto, #1a1410)" }}>{brand.name}</span>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#8b8b8b" }}>SPONSORED</span>
        </div>

        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--texto, #1a1410)", margin: "0 0 8px 0", lineHeight: 1.2 }}>
          {brand.story.title}
        </h3>

        <p style={{ fontSize: "14px", color: "var(--muted, #5c5550)", margin: "0 0 16px 0", lineHeight: 1.5 }}>
          {brand.story.body}
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {["Novedades", "Top ventas", "Beneficio mayorista"].map((chip) => (
            <span
              key={chip}
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                borderRadius: 999,
                padding: "4px 8px",
                border: "1px solid rgba(0,0,0,0.12)",
                color: "#2c2c2a",
                background: "#faf7f2",
              }}
            >
              {chip}
            </span>
          ))}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBrandFilter?.(brand.name);
          }}
          style={{
            background: "transparent",
            color: brand.color || "var(--rojo, #e8302a)",
            border: "none",
            padding: 0,
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Ver seleccion destacada
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
