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
    <div className="w-full bg-white border border-stone-200 rounded-2xl p-3.5 shadow-sm my-3">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-base">🕒</span>
        <h4 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">
          Reserva de Franja Horaria de Entrega
        </h4>
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
                  ? "bg-[#E8302A] text-white shadow-md shadow-[#E8302A]/20"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
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
              disabled={isFull}
              onClick={() => onSelectSlot(slot)}
              className={`relative flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                isFull
                  ? "bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed"
                  : isSelected
                  ? "bg-stone-900 text-white border-stone-900 shadow-md"
                  : "bg-white border-stone-200 hover:border-stone-400 text-stone-800"
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-black text-xs">
                  {slot.isExpress && <span className="text-amber-400">⚡ Express</span>}
                  <span>{slot.timeRange}</span>
                </div>
                <div className="text-[9px] opacity-75 mt-0.5">
                  {isFull
                    ? "Agotado"
                    : isAlmostFull
                    ? "🔥 ¡Últimos cupos!"
                    : "Disponible"}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center">
                {isFull ? (
                  <span className="text-[10px] text-red-500 font-bold">Sin cupo</span>
                ) : isSelected ? (
                  <span className="w-5 h-5 bg-[#E8302A] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-bold">Reservar</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
