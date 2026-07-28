// filepath: src/components/carrito/ProductSubstitutionSelector.tsx
"use client";

import React, { useState } from "react";

export type SubstitutionPolicy = 
  | "best_match"      // El armador elige el mejor sustituto similar
  | "same_brand"      // Misma marca, distinto tamaño/sabor
  | "call_me"          // Llamar al cliente antes de cambiar
  | "do_not_replace";  // No sustituir (cancelar ítem y reembolsar)

interface ProductSubstitutionSelectorProps {
  itemCodigo: string;
  itemNombre: string;
  currentPolicy?: SubstitutionPolicy;
  customNote?: string;
  onChange: (codigo: string, policy: SubstitutionPolicy, note: string) => void;
}

const POLICIES: { id: SubstitutionPolicy; label: string; desc: string; icon: string }[] = [
  {
    id: "best_match",
    label: "Reemplazo Inteligente",
    desc: "El armador elegirá el sustituto más parecido en precio y calidad.",
    icon: "🪄",
  },
  {
    id: "same_brand",
    label: "Misma Marca",
    desc: "Solo cambiar por otra variedad de la misma marca.",
    icon: "🏷️",
  },
  {
    id: "call_me",
    label: "Llamarme para confirmar",
    desc: "Te contactaremos antes de sustituir el producto.",
    icon: "📞",
  },
  {
    id: "do_not_replace",
    label: "No sustituir",
    desc: "Remover del pedido sin reemplazo si no hay stock.",
    icon: "🚫",
  },
];

export default function ProductSubstitutionSelector({
  itemCodigo,
  itemNombre,
  currentPolicy = "best_match",
  customNote = "",
  onChange,
}: ProductSubstitutionSelectorProps) {
  const [selected, setSelected] = useState<SubstitutionPolicy>(currentPolicy);
  const [note, setNote] = useState(customNote);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (policy: SubstitutionPolicy) => {
    setSelected(policy);
    onChange(itemCodigo, policy, note);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNote(val);
    onChange(itemCodigo, selected, val);
  };

  return (
    <div className="w-full bg-stone-50/90 border border-stone-200/80 rounded-xl p-2.5 mt-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-stone-700 font-medium truncate">
          <span>🔄</span>
          <span className="truncate text-[11px]">Si no hay stock:</span>
          <span className="font-bold text-[#E8302A] text-[11px]">
            {POLICIES.find((p) => p.id === selected)?.label}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#E8302A] hover:underline font-extrabold text-[11px] shrink-0"
        >
          {isOpen ? "Cerrar" : "Cambiar"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-2.5 pt-2.5 border-t border-stone-200 space-y-2">
          <p className="text-[10px] text-stone-500 font-semibold mb-1">
            Instrucciones para <strong className="text-stone-800">{itemNombre}</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {POLICIES.map((p) => {
              const active = selected === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p.id)}
                  className={`flex items-start gap-2 p-2 rounded-lg border text-left transition-all ${
                    active
                      ? "bg-white border-[#E8302A] ring-2 ring-[#E8302A]/10 shadow-sm"
                      : "bg-white/70 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <span className="text-sm shrink-0 mt-0.5">{p.icon}</span>
                  <div>
                    <div className="font-bold text-stone-800 text-[11px]">{p.label}</div>
                    <div className="text-[9px] text-stone-500 leading-tight mt-0.5">{p.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2">
            <input
              type="text"
              placeholder="Nota adicional ej: 'Traer de 500g si no hay de 1kg'"
              value={note}
              onChange={handleNoteChange}
              className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-[11px] text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#E8302A]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
