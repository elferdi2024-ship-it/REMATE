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
    <div
      className={`w-full border-y transition-all duration-300 px-3 sm:px-6 py-2.5 shadow-2xs ${
        isReached
          ? "bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border-emerald-200/80 text-emerald-950"
          : "bg-white border-slate-200/90 text-slate-800"
      }`}
    >
      <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs">
        {/* Estado y Barra de Progreso */}
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold">
              {isReached ? (
                <span className="text-emerald-800 font-extrabold flex items-center gap-1.5">
                  <span className="text-sm">🎉</span>
                  <span>¡Despacho Bonificado Desbloqueado!</span>
                </span>
              ) : (
                <span className="text-slate-700 flex items-center gap-1.5 font-semibold">
                  <span className="text-sm">🚚</span>
                  <span>
                    Te faltan{" "}
                    <strong
                      className="text-[#EF233C] font-mono font-black text-sm"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatPrice(remaining)}
                    </strong>{" "}
                    para Despacho Bonificado {sucursalName ? `en ${sucursalName}` : "en Canelones"}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {currentTotal > 0 && (
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <span>💰 Ahorro mayorista est.:</span>
                  <span
                    className="font-mono font-black"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatPrice(estimatedSavings)}
                  </span>
                </span>
              )}

              <span
                className="text-[11px] font-mono font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {percent}%
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 relative">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                isReached
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]"
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
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-[#EF233C] px-3.5 py-1.5 rounded-xl transition-all active:scale-95 shrink-0 shadow-2xs"
          >
            <span>Ver Pedido</span>
            <span
              className="text-red-300 font-mono font-black"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ({formatPrice(currentTotal)})
            </span>
          </button>
        )}
      </div>
    </div>
  );
});

export default ShippingThresholdBar;
