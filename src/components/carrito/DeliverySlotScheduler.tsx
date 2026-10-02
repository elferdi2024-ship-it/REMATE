// filepath: src/components/carrito/DeliverySlotScheduler.tsx
"use client";

import React, { useState } from "react";

export interface DeliverySlot {
  id: string;
  date: string;       // YYYY-MM-DD
  dateLabel: string;  // Ej: "Hoy", "Mañana"
  timeRange: string;  // Ej: "10:00 - 12:00"
  available: boolean;
  capacityPercent: number; // 0 a 100
  isExpress?: boolean;
}

interface DeliverySlotSchedulerProps {
  slots: DeliverySlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: DeliverySlot) => void;
  tipoEntrega?: "envio" | "retiro";
}

export default function DeliverySlotScheduler({
  slots,
  selectedSlotId,
  onSelectSlot,
  tipoEntrega = "envio",
}: DeliverySlotSchedulerProps) {
  // Agrupar por fecha
  const dates = Array.from(new Set(slots.map((s) => s.date)));
  const [activeDate, setActiveDate] = useState<string>(dates[0] || "");

  const filteredSlots = slots.filter((s) => s.date === activeDate);

  const esEnvio = tipoEntrega === "envio";

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-3 sm:p-3.5 shadow-xs my-3 overflow-hidden box-border">
      {/* Encabezado */}
      <div className="flex flex-col gap-0.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base shrink-0">⏰</span>
          <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider truncate">
            {esEnvio ? "Horario preferido de entrega" : "Horario estimado de retiro"}
          </h4>
        </div>
        <p className="text-[11px] text-slate-500 font-medium pl-6 leading-tight">
          {esEnvio
            ? "Indicanos tu franja de preferencia para coordinar el despacho."
            : "Seleccioná la franja aproximada en la que pasarás por el local."}
        </p>
      </div>

      {/* Selector de Días (Tabs) */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
        {dates.map((d) => {
          const sample = slots.find((s) => s.date === d);
          const isActive = d === activeDate;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDate(d)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all active:scale-95 ${
                isActive
                  ? "bg-[#EF233C] text-white shadow-sm shadow-[#EF233C]/30 ring-2 ring-[#EF233C]/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950"
              }`}
            >
              {sample?.dateLabel || d}
            </button>
          );
        })}
      </div>

      {/* Lista Vertical de Franjas Horarias (1 Columna Responsiva para evitar desbordes) */}
      <div className="flex flex-col gap-2 w-full">
        {filteredSlots.map((slot) => {
          const isSelected = slot.id === selectedSlotId;
          const isFull = !slot.available || slot.capacityPercent >= 100;
          const isAlmostFull = slot.capacityPercent >= 75 && !isFull;

          return (
            <button
              key={slot.id}
              type="button"
              disabled={isFull}
              onClick={() => onSelectSlot(slot)}
              className={`group w-full relative flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-left transition-all active:scale-[0.99] ${
                isFull
                  ? "bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                  : isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-[#EF233C]/30"
                  : "bg-white border-slate-200/90 hover:border-slate-300 text-slate-800 hover:bg-slate-50/60"
              }`}
            >
              {/* Información Horaria y Etiquetas */}
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono font-extrabold text-xs sm:text-sm tracking-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {slot.timeRange} hs
                  </span>

                  {slot.isExpress && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-md">
                      ⚡ Preferencial
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-semibold mt-0.5 truncate">
                  {isFull ? (
                    <span className="text-slate-400">Cupo completo</span>
                  ) : isAlmostFull ? (
                    <span className={isSelected ? "text-amber-300" : "text-orange-600"}>
                      🔥 Alta demanda
                    </span>
                  ) : (
                    <span className={isSelected ? "text-emerald-300" : "text-emerald-700"}>
                      ✓ Disponible
                    </span>
                  )}
                </div>
              </div>

              {/* Botón / Indicador de Selección */}
              <div className="shrink-0">
                {isFull ? (
                  <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Agotado
                  </span>
                ) : isSelected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-white bg-[#EF233C] px-3 py-1 rounded-lg shadow-xs">
                    <span>✓</span>
                    <span>Elegido</span>
                  </span>
                ) : (
                  <span className="inline-block text-[11px] font-bold text-slate-700 bg-slate-100 group-hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors">
                    Seleccionar
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
