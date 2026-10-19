// filepath: src/components/catalogo/FloatCartBtn.tsx
"use client";

import React from "react";
import { formatPrice } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";
import { useTiendaConfig } from "@/hooks/useTiendaConfig";
import { haptic } from "@/lib/haptic";
import { UMBRAL_ENVIO_GRATIS } from "@/lib/envio-config";

interface FloatCartBtnProps {
  totalQty: number;
  total: number;
  onClick: () => void;
}

export default function FloatCartBtn({
  totalQty,
  total,
  onClick,
}: FloatCartBtnProps) {
  const hasItems = totalQty > 0;
  const { config } = useTiendaConfig();

  const MIN_TICKET = config.minimoEnvioGratis || UMBRAL_ENVIO_GRATIS;
  const progressPercent = Math.min(100, (total / MIN_TICKET) * 100);
  const isEligible = total >= MIN_TICKET;
  const missingAmount = Math.max(0, MIN_TICKET - total);

  return (
    <AnimatePresence>
      {hasItems && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="fixed bottom-[calc(58px+env(safe-area-inset-bottom,8px))] md:bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-sm pointer-events-none"
        >
          {/* Botón Flotante Unificado y Delgado (Sin doble tarjeta amontonada) */}
          <div className="relative overflow-hidden rounded-2xl shadow-[0_12px_28px_-6px_rgba(239,35,60,0.45)] border border-[#EF233C]/40">
            {/* Barra delgada de progreso de envío gratis (2.5px en la parte superior) */}
            <div className="w-full h-[3px] bg-red-950/40">
              <div
                className={`h-full transition-all duration-300 ${
                  isEligible ? "bg-emerald-400" : "bg-amber-300"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                haptic.add();
                onClick();
              }}
              className="pointer-events-auto w-full bg-[#EF233C] hover:bg-[#C01730] text-white px-3.5 py-2.5 sm:py-3 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center h-6 min-w-[22px] px-1 rounded-full bg-white text-[#EF233C] text-xs font-black tabular-nums shadow-xs">
                  {totalQty}
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span
                    className="text-sm sm:text-base font-extrabold text-white tabular-nums tracking-tight"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatPrice(total)}
                  </span>
                  {!isEligible && (
                    <span className="text-[9.5px] text-white/80 font-medium mt-0.5">
                      Faltan ${missingAmount.toLocaleString("es-UY")} p/ envío gratis
                    </span>
                  )}
                  {isEligible && (
                    <span className="text-[9.5px] text-emerald-200 font-bold mt-0.5">
                      ✓ ¡Envío gratis alcanzado!
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-white">
                <span>Ver Pedido</span>
                <span className="text-sm font-black">→</span>
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
