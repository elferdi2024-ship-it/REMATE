// filepath: src/components/catalogo/StockScarcityBadge.tsx
"use client";

import React from "react";

interface StockScarcityBadgeProps {
  stockCount: number;
}

export default function StockScarcityBadge({ stockCount }: StockScarcityBadgeProps) {
  if (stockCount > 5) return null; // Solo mostrar si queda poco stock real

  return (
    <div className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
      <span className="animate-pulse text-red-500">⚠️</span>
      <span>
        {stockCount === 1 ? "¡Última unidad disponible!" : `¡Últimas ${stockCount} unidades!`}
      </span>
    </div>
  );
}
