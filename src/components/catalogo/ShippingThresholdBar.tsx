// filepath: src/components/catalogo/ShippingThresholdBar.tsx
"use client";

import React, { memo } from "react";
import { formatPrice } from "@/lib/format";

interface ShippingThresholdBarProps {
  currentTotal: number;
  threshold?: number;
  sucursalName?: string | null;
  onOpenCart?: () => void;
}

export const ShippingThresholdBar = memo(function ShippingThresholdBar({
  currentTotal,
  threshold = 3500,
  sucursalName,
  onOpenCart,
}: ShippingThresholdBarProps) {
  const percent = Math.min(100, Math.round((currentTotal / threshold) * 100));
  const remaining = Math.max(0, threshold - currentTotal);
  const isReached = currentTotal >= threshold;
  const estimatedSavings = Math.round(currentTotal * 0.18); // ~18% estimated wholesale saving

  return (
    <div className="w-full bg-slate-900 border-y border-slate-800 text-white px-3 sm:px-6 py-2.5 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs">
        {/* Main Status & Progress */}
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold">
              {isReached ? (
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <span>🎉</span>
                  <span>¡Despacho Bonificado Desbloqueado!</span>
                </span>
              ) : (
                <span className="text-slate-200 flex items-center gap-1.5">
                  <span className="text-amber-400">🚚</span>
                  <span>
                    Te faltan <strong className="text-white font-mono font-black text-sm">{formatPrice(remaining)}</strong> para Despacho Bonificado {sucursalName ? `en ${sucursalName}` : "en Canelones"}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentTotal > 0 && (
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span>💰 Ahorro mayorista est.:</span>
                  <span className="font-mono">{formatPrice(estimatedSavings)}</span>
                </span>
              )}

              <span className="text-[11px] font-mono font-extrabold text-slate-400">
                {percent}%
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 relative">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                isReached
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  : "bg-gradient-to-r from-amber-500 via-[#EF233C] to-red-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Quick Cart Trigger */}
        {currentTotal > 0 && onOpenCart && (
          <button
            type="button"
            onClick={onOpenCart}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl transition-all active:scale-95 shrink-0"
          >
            <span>Ver Carrito</span>
            <span className="text-[#EF233C] font-mono font-black">
              ({formatPrice(currentTotal)})
            </span>
          </button>
        )}
      </div>
    </div>
  );
});

export default ShippingThresholdBar;
