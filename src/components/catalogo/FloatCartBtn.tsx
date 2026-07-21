"use client";

import React from "react";
import { formatPrice } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";

interface FloatCartBtnProps {
  totalQty: number;
  total: number;
  onClick: () => void;
}

/**
 * Floating cart button & Progress Bar
 */
export default function FloatCartBtn({
  totalQty,
  total,
  onClick,
}: FloatCartBtnProps) {
  const hasItems = totalQty > 0;
  
  const MIN_TICKET = 3000;
  const progressPercent = Math.min(100, (total / MIN_TICKET) * 100);
  const isEligible = total >= MIN_TICKET;
  const missingAmount = Math.max(0, MIN_TICKET - total);

  return (
    <AnimatePresence>
      {hasItems && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-sm flex flex-col gap-2 pointer-events-none"
        >
          {/* Progress Bar Flotante */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-zinc-200/50 shadow-lg rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
              {isEligible ? (
                <span className="text-green-600 flex items-center gap-1">
                  🚚 ¡Envío gratis alcanzado!
                </span>
              ) : (
                <span>
                  Faltan <strong className="text-amber-600">${missingAmount.toLocaleString('es-UY')}</strong> para envío gratis
                </span>
              )}
              <span className="text-zinc-400 font-mono text-[10px]">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${isEligible ? 'bg-green-500' : 'bg-amber-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
          </div>

          {/* Botón de Carrito Principal */}
          <button
            onClick={onClick}
            className="pointer-events-auto w-full bg-zinc-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-xl active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="text-xl">🛒</span>
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-zinc-900">
                  {totalQty}
                </span>
              </div>
              <span className="font-bold text-sm tracking-wide uppercase">Ver Pedido</span>
            </div>
            <span className="font-black text-lg bg-white/10 px-3 py-1 rounded-lg">
              {formatPrice(total)}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
