// filepath: src/components/ads/SponsoredProduct.tsx
"use client";

import React from "react";
import Image from "next/image";
import type { BrandConfig, BrandAsset } from "@/types/brands";
import { useAdImpression, trackModalCta } from "@/hooks/useAdImpression";

interface SponsoredProductProps {
  brand: BrandConfig;
  asset: BrandAsset; // type: "sponsored_product"
  onAdd?: () => void;
  onQuickView?: () => void;
}

export default function SponsoredProduct({ brand, asset, onAdd, onQuickView }: SponsoredProductProps) {
  const ref = useAdImpression<HTMLDivElement>(brand.id, asset.id);
  
  if (asset.type !== "sponsored_product") return null;

  return (
    <div
      ref={ref}
      className="sponsored-conic-glow-border"
      onClick={() => onQuickView?.()}
      style={{
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        height: "100%",
        minHeight: "260px",
        cursor: onQuickView ? "pointer" : "default"
      }}
    >
      {/* Efecto de destello de luz metálica */}
      <div className="sponsored-metallic-glint-overlay" />

      {/* Badge "Patrocinado" — discreta pero visible */}
      <div style={{
        position: "absolute",
        top: "8px",
        left: "8px",
        zIndex: 2,
        background: "rgba(232,48,42,0.08)",
        border: "1px solid rgba(232,48,42,0.15)",
        borderRadius: "4px",
        padding: "2px 6px",
        fontSize: "7px",
        fontWeight: 700,
        color: "var(--rojo)",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
      }}>
        Patrocinado
      </div>

      {/* Imagen del producto */}
      <div style={{
        background: `${brand.color}10`,
        borderRadius: "12px",
        height: "110px",
        marginBottom: "8px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Image
          src={asset.src}
          alt={asset.alt}
          fill
          sizes="(max-width: 768px) 50vw, 16vw"
          style={{ objectFit: "contain", padding: "8px" }}
          loading="lazy"
        />
      </div>

      {/* Info del producto */}
      <div style={{ padding: "0 4px 4px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Marca */}
        <span style={{
          fontSize: "8px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: brand.color,
          marginBottom: "4px",
        }}>
          {brand.name}
        </span>

        {/* Nombre */}
        <h3 style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "var(--oscuro)",
          lineHeight: 1.2,
          height: "2.4em",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          marginBottom: "12px",
        }}>
          {asset.productName || asset.alt}
        </h3>

        {/* Precio */}
        <div style={{ marginTop: "auto" }}>
          {asset.productPrice && (
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--rojo)",
              lineHeight: 1,
              letterSpacing: "0.5px",
            }}>
              ${asset.productPrice.toLocaleString("es-UY")}
            </div>
          )}
          <div style={{
            fontSize: "10px",
            color: "var(--muted)",
            fontWeight: 700,
            textTransform: "uppercase",
            marginTop: "4px",
            letterSpacing: "0.5px",
          }}>
            Unidad IVA Incl.
          </div>
        </div>
      </div>

      {/* Botón agregar */}
      <div style={{ position: "absolute", bottom: "8px", right: "8px", zIndex: 10 }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Disparar track de click CTA
            trackModalCta(brand.id);
            if (onQuickView) {
              onQuickView();
            } else {
              onAdd?.();
            }
          }}
          style={{
            background: "var(--oscuro)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
