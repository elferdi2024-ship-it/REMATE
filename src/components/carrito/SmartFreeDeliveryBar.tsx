// filepath: src/components/carrito/SmartFreeDeliveryBar.tsx
"use client";

import React from "react";
import { formatPrice } from "@/lib/format";
import { UMBRAL_ENVIO_GRATIS, COSTOS_ENVIO } from "@/lib/envio-config";

interface SmartFreeDeliveryBarProps {
  currentSubtotal: number;
  freeDeliveryThreshold?: number; // Default $2500
}

export default function SmartFreeDeliveryBar({
  currentSubtotal,
  freeDeliveryThreshold = UMBRAL_ENVIO_GRATIS,
}: SmartFreeDeliveryBarProps) {
  const diff = freeDeliveryThreshold - currentSubtotal;
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentSubtotal / freeDeliveryThreshold) * 100)
  );

  const isFree = diff <= 0;

  return (
    <div className="w-full bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 mb-3 text-xs shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 font-bold text-stone-800">
          <span>{isFree ? "🎉" : "🚚"}</span>
          <span>
            {isFree ? (
              <strong className="text-emerald-700 font-extrabold">
                ¡Felicidades! Tenés envío GRATIS
              </strong>
            ) : (
              <>
                Te faltan{" "}
                <strong className="text-[#E8302A] font-black">
                  {formatPrice(diff)}
                </strong>{" "}
                para Envío Gratis
              </>
            )}
          </span>
        </div>
        <span className="text-[10px] font-black text-emerald-800 shrink-0 bg-emerald-100 px-2 py-0.5 rounded-full">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-stone-200/80 h-2 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Tarifas de envío por zona */}
      {!isFree && (
        <div className="mt-2 text-[11px] text-stone-600 flex items-center justify-between border-t border-emerald-100 pt-1.5 font-medium">
          <span>Envío por zona:</span>
          <span className="font-bold text-stone-800">
            Canelones ${COSTOS_ENVIO.canelones.costo} · Montevideo ${COSTOS_ENVIO.montevideo.costo}
          </span>
        </div>
      )}
    </div>
  );
}
