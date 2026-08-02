// filepath: src/components/carrito/DeliverySlotScheduler.tsx
"use client";

import React, { useState } from "react";

export interface DeliverySlot {
  id: string;
  date: string;       // YYYY-MM-DD
  dateLabel: string;  // Ej: "Hoy, 28 Jul"
  timeRange: string;  // Ej: "10:00 - 12:00 hs"
  available: boolean;
  capacityPercent: number; // 0 a 100
  isExpress?: boolean;
}

interface DeliverySlotSchedulerProps {
  slots: DeliverySlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: DeliverySlot) => void;
}

export default function DeliverySlotScheduler({
  slots,
  selectedSlotId,
  onSelectSlot,
}: DeliverySlotSchedulerProps) {
  // Agrupar por fecha
  const dates = Array.from(new Set(slots.map((s) => s.date)));
  const [activeDate, setActiveDate] = useState<string>(dates[0] || "");

  const filteredSlots = slots.filter((s) => s.date === activeDate);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs my-3">
      <div className="flex flex-col gap-0.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">⏰</span>
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
            Horario preferido de entrega (Referencia)
          </h4>
        </div>
        <p className="text-[10px] text-slate-500 font-medium pl-6">
          Indicanos tu franja de preferencia para coordinar la entrega.
        </p>
      </div>

      {/* Tabs de Días */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2.5 no-scrollbar">
        {dates.map((d) => {
          const sample = slots.find((s) => s.date === d);
          const isActive = d === activeDate;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDate(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? "bg-[#EF233C] text-white shadow-md shadow-[#EF233C]/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {sample?.dateLabel || d}
            </button>
          );
        })}
      </div>

      {/* Franjas Horarias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredSlots.map((slot) => {
          const isSelected = slot.id === selectedSlotId;
          const isFull = !slot.available || slot.capacityPercent >= 100;
          const isAlmostFull = slot.capacityPercent >= 75 && !isFull;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={`relative flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                isFull
                  ? "bg-slate-50 border-slate-200 text-slate-400"
                  : isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-400 text-slate-800"
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-extrabold text-xs">
                  {slot.isExpress && <span className="text-amber-500">⚡ Preferencial</span>}
                  <span>{slot.timeRange}</span>
                </div>
                <div className="text-[9px] opacity-75 mt-0.5">
                  {isFull
                    ? "Alta demanda"
                    : isAlmostFull
                    ? "🔥 Muy solicitado"
                    : "Sugerido"}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center">
                {isSelected ? (
                  <span className="w-5 h-5 bg-[#EF233C] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
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
