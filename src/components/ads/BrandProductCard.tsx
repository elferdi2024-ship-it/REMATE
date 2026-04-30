// filepath: src/components/ads/BrandProductCard.tsx
"use client";

import React from "react";
import type { BrandConfig } from "@/types/brands";
import type { Producto } from "@/types";
import { AD_TOKENS } from "./adStyles";
import { useAdEntrance } from "@/hooks/useAdEntrance";
import ProductoCard from "@/components/catalogo/ProductoCard";

interface BrandProductCardProps {
  brand: BrandConfig;
  product: Producto;
  onAdd: (producto: Producto) => void;
  onQtyChange: (codigo: string, qty: number) => void;
  qty?: number;
}

export default function BrandProductCard({ brand, product, onAdd, onQtyChange, qty = 0 }: BrandProductCardProps) {
  const { ref, isVisible } = useAdEntrance<HTMLDivElement>();

  const tierColors = AD_TOKENS.tier.oro;

  return (
    <div
      ref={ref}
      style={{
        ...AD_TOKENS.fadeIn(isVisible),
        border: `2px solid ${tierColors.border}`,
        borderRadius: "14px",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow: `0 4px 12px ${tierColors.glow}`,
      }}
    >
      {/* Label superior */}
      <div style={{
        position: "absolute", top: 8, left: 8, zIndex: 4,
        background: tierColors.border,
        color: "#fff", fontSize: "9px", fontWeight: 700,
        letterSpacing: "1px", textTransform: "uppercase",
        padding: "2px 7px", borderRadius: "4px",
      }}>
        DESTACADO
      </div>

      {/* Logo de marca pequeño — esquina superior derecha */}
      {brand.logoUrl && (
        <img
          src={brand.logoUrl}
          alt={brand.name}
          style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, objectFit: "contain", zIndex: 4, opacity: 0.9 }}
        />
      )}

      <ProductoCard
        producto={product}
        qty={qty}
        onAdd={onAdd}
        onQtyChange={onQtyChange}
        sponsorBrand={brand}
      />
    </div>
  );
}
