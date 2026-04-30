// filepath: src/components/ads/NativeStoryCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import type { BrandConfig } from "@/types/brands";
import { AD_TOKENS } from "./adStyles";
import { useAdEntrance } from "@/hooks/useAdEntrance";
import { markAsSeen, hasSeenEnough } from "@/hooks/useFrequencyCap";

interface NativeStoryCardProps {
  brand: BrandConfig;
}

export default function NativeStoryCard({ brand }: NativeStoryCardProps) {
  const { ref, isVisible } = useAdEntrance<HTMLDivElement>();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (hasSeenEnough("nativeStory", brand.id)) {
      setHasError(true);
    } else {
      markAsSeen("nativeStory", brand.id);
    }
  }, [brand.id]);

  if (hasError || !brand.story) return null;

  return (
    <div
      ref={ref}
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
        border: "1px solid rgba(0,0,0,0.05)"
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "220px", background: "#f0f0f0" }}>
        <img 
          src={brand.story.imageUrl} 
          alt={brand.story.title} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
        
        {/* Top-left subtle label */}
        <div style={{ position: "absolute", top: 12, left: 12, ...AD_TOKENS.adLabel, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          HISTORIA DE MARCA
        </div>
      </div>
      
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          {brand.logoUrl && (
            <img src={brand.logoUrl} alt={brand.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "contain", border: "1px solid #eee" }} />
          )}
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>{brand.name}</span>
        </div>
        
        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-main)", margin: "0 0 8px 0", lineHeight: 1.2 }}>
          {brand.story.title}
        </h3>
        
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 16px 0", lineHeight: 1.5 }}>
          {brand.story.body}
        </p>
        
        <button style={{
          background: "transparent",
          color: brand.color || "var(--primary-color)",
          border: "none",
          padding: 0,
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6
        }}>
          Conocer más
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
