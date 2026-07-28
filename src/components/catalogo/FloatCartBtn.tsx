// filepath: src/components/catalogo/FloatCartBtn.tsx
"use client";

import React from "react";
import { formatPrice } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";
import { useTiendaConfig } from "@/hooks/useTiendaConfig";
import { haptic } from "@/lib/haptic";

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

  const MIN_TICKET = config.minimoEnvioGratis || 2500;
  const progressPercent = Math.min(100, (total / MIN_TICKET) * 100);
  const isEligible = total >= MIN_TICKET;
  const missingAmount = Math.max(0, MIN_TICKET - total);

  return (
    <AnimatePresence>
      {hasItems && (
        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="fixed bottom-[74px] md:bottom-6 left-1/2 -translate-x-1/2 z-[95] w-[94%] max-w-sm flex flex-col gap-1.5 pointer-events-none"
        >
          {/* Barra de Envio Gratis Flotante (Instacart / Amazon Fresh Standard) */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.12)] rounded-2xl p-2.5 flex flex-col gap-1.5 transition-all">
            <div className="flex justify-between items-center text-[11px] font-extrabold text-stone-800 px-0.5">
              {isEligible ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="text-sm">🚚</span>
                  <span>¡Envío gratis alcanzado!</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-stone-700">
                  <span className="text-sm">🚚</span>
                  <span>
                    Faltan{" "}
                    <strong className="text-[#E8302A] font-black">
                      ${missingAmount.toLocaleString("es-UY")}
                    </strong>{" "}
                    para envío gratis
                  </span>
                </span>
              )}
              <span className="text-stone-400 font-mono text-[10px] font-bold">
                {Math.round(progressPercent)}%
              </span>
            </div>

            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200/60">
              <motion.div
                className={`h-full rounded-full transition-all ${
                  isEligible
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    : "bg-gradient-to-r from-[#E8302A] to-amber-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>

          {/* Botón Principal de Ver Pedido */}
          <button
            type="button"
            onClick={() => {
              haptic.add();
              onClick();
            }}
            className="pointer-events-auto w-full bg-[#111111] hover:bg-stone-900 text-white rounded-2xl p-3.5 flex items-center justify-between shadow-[0_12px_32px_rgba(0,0,0,0.25)] active:scale-[0.97] transition-all cursor-pointer border border-stone-800"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 bg-white/10 rounded-xl">
                <span className="text-lg">🛒</span>
                <span className="absolute -top-1.5 -right-2 bg-[#E8302A] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-[#111111] shadow-sm">
                  {totalQty}
                </span>
              </div>
              <span className="font-black text-xs tracking-wider uppercase">VER PEDIDO</span>
            </div>
            <span className="font-black text-sm bg-white/15 px-3 py-1.5 rounded-xl tracking-wide font-price">
              {formatPrice(total)}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
