import React from "react";
import Image from "next/image";

interface SponsorBadgeProps {
  brandName: string;
  brandColor?: string;
  logoUrl?: string;
  size?: "sm" | "md";
}

export default function SponsorBadge({
  brandName,
  brandColor = "#00E5FF",
  logoUrl,
  size = "sm"
}: SponsorBadgeProps) {
  const isSm = size === "sm";
  const h = isSm ? "18px" : "22px";
  const p = isSm ? "0 6px" : "0 8px";
  const fz = isSm ? "8px" : "9px";
  
  return (
    <div
      className="sponsor-badge inline-flex items-center gap-1.5 rounded-full transition-all hover:scale-105 cursor-default group"
      style={{
        height: h,
        padding: p,
        background: `color-mix(in srgb, ${brandColor} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${brandColor} 25%, transparent)`,
      }}
    >
      {logoUrl ? (
        <div style={{ width: isSm ? 10 : 14, height: isSm ? 10 : 14, position: "relative" }}>
          <Image src={logoUrl} alt={brandName} fill className="object-contain" />
        </div>
      ) : (
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: brandColor }} />
      )}
      <span
        style={{
          fontSize: fz,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "rgba(255,255,255,0.9)",
          lineHeight: 1
        }}
      >
        <span className="text-[color-mix(in srgb, var(--admin-text-lo) 80%, transparent)] font-semibold mr-0.5">Patrocinado:</span> {brandName}
      </span>
      
      <style>{`
        .sponsor-badge:hover {
          box-shadow: 0 0 8px color-mix(in srgb, ${brandColor} 40%, transparent);
          border-color: color-mix(in srgb, ${brandColor} 50%, transparent) !important;
        }
      `}</style>
    </div>
  );
}
