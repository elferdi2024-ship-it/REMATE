// filepath: src/components/catalogo/BulkSavingsCallout.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BulkPriceTier } from "@/types";
import { haptic } from "@/lib/haptic";

interface BulkSavingsCalloutProps {
  precioBase: number;
  cantidad: number;
  escalaPrecios?: BulkPriceTier[];
  onApplyTier?: (minQty: number) => void;
  compact?: boolean;
}

export default function BulkSavingsCallout({
  precioBase,
  cantidad,
  escalaPrecios,
  onApplyTier,
  compact = false,
}: BulkSavingsCalloutProps) {
  if (!escalaPrecios || escalaPrecios.length === 0) return null;

  const tier = escalaPrecios[0];
  const minQty = tier.minCantidad;
  const precioCaja = tier.precioUnitario;
  const ahorroPorUnidad = Math.max(0, precioBase - precioCaja);
  const ahorroCajaTotal = ahorroPorUnidad * minQty;
  const isTierActive = cantidad >= minQty;
  const missingQty = Math.max(0, minQty - cantidad);
  const progressPercent = Math.min(100, Math.round((cantidad / minQty) * 100));

  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500/10 via-amber-500/15 to-emerald-500/10 border border-emerald-500/30 p-2 text-xs">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 font-extrabold text-emerald-900">
            <span className="animate-bounce text-sm">🔥</span>
            <span>Llevá {minQty} u. a ${precioCaja} c/u</span>
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
            Ahorrás ${ahorroCajaTotal}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-emerald-50/60 to-amber-50/80 border border-emerald-200/90 p-3.5 sm:p-4 shadow-sm mb-4">
      {/* Shimmer line effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] animate-[shimmer_2.5s_infinite] pointer-events-none" />

      <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-white text-sm font-black shadow-xs">
            ⚡
          </span>
          <div>
            <div className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
              <span>Super Ahorro por Caja</span>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-md">
                ${precioCaja} c/u
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              Precio individual: <span className="line-through text-slate-400">${precioBase}</span> ➔ Ahorrás <strong className="text-emerald-700 font-bold">${ahorroPorUnidad} por unidad</strong>
            </div>
          </div>
        </div>

        {/* Badge de estado */}
        <AnimatePresence mode="wait">
          {isTierActive ? (
            <motion.span
              key="active"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 shrink-0"
            >
              <span>✨</span> Descuento Activo
            </motion.span>
          ) : (
            <motion.span
              key="inactive"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 shrink-0"
            >
              Ahorrás ${ahorroCajaTotal}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar interactiva */}
      <div className="mt-2.5 relative z-10">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 mb-1">
          <span>
            {isTierActive ? (
              <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                🎉 ¡Caja de {minQty} u. completada! (Ahorro de ${ahorroPorUnidad * cantidad} aplicado)
              </span>
            ) : (
              <span>
                {cantidad > 0 ? (
                  <>Tenés <strong>{cantidad}</strong> de <strong>{minQty}</strong> u. (Faltan {missingQty})</>
                ) : (
                  <>Llevando la caja de {minQty} u. ahorrás <strong>${ahorroCajaTotal}</strong></>
                )}
              </span>
            )}
          </span>
          <span className="font-mono text-emerald-800 font-extrabold">{progressPercent}%</span>
        </div>

        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden relative">
          <motion.div
            className={`h-full rounded-full transition-all duration-500 ${
              isTierActive
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                : "bg-gradient-to-r from-amber-400 to-emerald-500"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
        </div>
      </div>

      {/* Botón de 1-clic para autocompletar la caja si aún no está activa */}
      {!isTierActive && onApplyTier && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            haptic.add();
            onApplyTier(minQty);
          }}
          className="mt-3 w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-xs flex items-center justify-between transition-all"
        >
          <span className="flex items-center gap-1.5">
            <span>📦</span>
            <span>Llevar Caja Completa ({minQty} unidades)</span>
          </span>
          <span className="bg-emerald-900/40 px-2 py-0.5 rounded-md font-mono text-[11px]">
            ${precioCaja * minQty} (${precioCaja} c/u)
          </span>
        </motion.button>
      )}
    </div>
  );
}
