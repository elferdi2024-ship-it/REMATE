// filepath: src/components/catalogo/PerishableSelector.tsx
"use client";

import React from "react";

interface PerishableSelectorProps {
  category: string;
  selectedOption?: string;
  onSelectOption?: (option: string) => void;
}

const RIPENESS_OPTIONS: Record<string, string[]> = {
  frutas: ["Verdes (maduran en 3-4 días)", "Punto justo (para consumir hoy/mañana)", "Bien maduras"],
  verduras: ["Hojas firmes", "Selección estándar"],
  carnes: ["Corte magro", "Corte con grasa estándar", "Trozo entero"],
};

export default function PerishableSelector({
  category,
  selectedOption,
  onSelectOption,
}: PerishableSelectorProps) {
  const catKey = category.toLowerCase();
  const options =
    RIPENESS_OPTIONS[catKey] ||
    (catKey.includes("frut") ? RIPENESS_OPTIONS.frutas : catKey.includes("carn") ? RIPENESS_OPTIONS.carnes : null);

  if (!options) return null;

  return (
    <div className="w-full bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-2 mt-2 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px] mb-1">
        <span>🥬</span>
        <span>Preferencia de Selección / Frescura:</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const isSelected = selectedOption === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelectOption?.(opt)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                isSelected
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                  : "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100/50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
