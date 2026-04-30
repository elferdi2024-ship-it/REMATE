// filepath: src/components/ads/FlashDealCard.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { BrandConfig } from "@/types/brands";
import { AD_TOKENS } from "./adStyles";
import { useAdEntrance } from "@/hooks/useAdEntrance";
import { markAsSeen, hasSeenEnough } from "@/hooks/useFrequencyCap";

interface FlashDealCardProps {
  brand: BrandConfig;
}

function useCountdown(expiresAt: string) {
  const [remaining, setRemaining] = useState(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      const secs = Math.max(0, Math.floor(diff / 1000));
      setRemaining(secs);
      if (secs <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  return {
    expired: remaining <= 0,
    formatted: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
    isUrgent: remaining < 3600, // último 1 hora
  };
}

export default function FlashDealCard({ brand }: FlashDealCardProps) {
  const { ref, isVisible } = useAdEntrance<HTMLDivElement>();
  const [hidden, setHidden] = useState(false);

  const deal = brand.flashDeal;

  // Frequency cap + validación
  useEffect(() => {
    if (!deal) { setHidden(true); return; }
    const expiresIn = new Date(deal.expiresAt).getTime() - Date.now();
    const within24h = expiresIn > 0 && expiresIn < 24 * 60 * 60 * 1000;
    if (!within24h) { setHidden(true); return; }
    if (hasSeenEnough("flashDeal", brand.id)) { setHidden(true); return; }
    markAsSeen("flashDeal", brand.id);
  }, [brand.id, deal]);

  const { expired, formatted, isUrgent } = useCountdown(deal?.expiresAt ?? new Date(Date.now() + 1000).toISOString());

  const handleDismiss = useCallback(() => setHidden(true), []);

  if (hidden || !deal || expired) return null;

  return (
    <div
      ref={ref}
      style={{
        ...AD_TOKENS.fadeIn(isVisible),
        width: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#fff",
        border: "2px solid #EF4444",
        boxShadow: "0 8px 32px rgba(239,68,68,0.15)",
        margin: "24px 0",
        position: "relative",
      }}
    >
      {/* Barra superior de urgencia */}
      <div style={{
        background: isUrgent
          ? "linear-gradient(90deg, #DC2626, #EF4444)"
          : "linear-gradient(90deg, #B91C1C, #DC2626)",
        padding: "8px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "14px" }}>⚡</span>
          <span style={{
            color: "#fff",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}>
            OFERTA LIMITADA
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", fontWeight: 600 }}>
            Vence en
          </span>
          <span style={{
            color: "#fff",
            fontSize: "18px",
            fontWeight: 900,
            fontFamily: "var(--font-display, monospace)",
            letterSpacing: "2px",
          }}>
            {formatted}
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      <div style={{
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
      }}>
        {/* Logo marca */}
        <div style={{ flexShrink: 0 }}>
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name} style={{ width: 56, height: 56, objectFit: "contain" }} />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: brand.color || "#EF4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: "20px",
            }}>
              {brand.name[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>
            {brand.name}
          </div>
          <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--oscuro, #1a1410)", margin: "0 0 6px 0", lineHeight: 1.2 }}>
            {deal.description}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              background: "#FEE2E2", color: "#DC2626",
              padding: "3px 10px", borderRadius: "6px",
              fontSize: "15px", fontWeight: 900,
            }}>
              {deal.discount}% OFF
            </span>
            <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>
              Hoy solamente
            </span>
          </div>
        </div>

        {/* CTA */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ ...AD_TOKENS.adLabel }}>PUBLICIDAD</div>
        </div>
      </div>

      {/* Botón cerrar */}
      <button
        onClick={handleDismiss}
        aria-label="Cerrar oferta"
        style={{
          position: "absolute", top: 48, right: 12,
          background: "rgba(0,0,0,0.1)",
          border: "none", borderRadius: "50%",
          width: 28, height: 28, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", color: "#666",
        }}
      >
        ✕
      </button>
    </div>
  );
}
