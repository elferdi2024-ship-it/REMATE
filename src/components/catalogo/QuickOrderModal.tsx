// filepath: src/components/catalogo/QuickOrderModal.tsx
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { haptic } from "@/lib/haptic";
import { toast } from "sonner";
import type { Producto } from "@/types";

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  qtyMap: Record<string, number>;
  onQtyChange: (codigo: string, qty: number) => void;
}

export function QuickOrderModal({
  isOpen,
  onClose,
  productos,
  qtyMap,
  onQtyChange,
}: QuickOrderModalProps) {
  const [filterText, setFilterText] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("TODAS");

  const categories = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => {
      if (p.categoria) set.add(p.categoria);
    });
    return ["TODAS", ...Array.from(set).sort()];
  }, [productos]);

  const filtered = useMemo(() => {
    const query = filterText.toLowerCase().trim();
    return productos.filter((p) => {
      if (selectedCat !== "TODAS" && p.categoria !== selectedCat) return false;
      if (!query) return true;
      return (
        p.nombre.toLowerCase().includes(query) ||
        p.codigo.toLowerCase().includes(query) ||
        (p.marca && p.marca.toLowerCase().includes(query))
      );
    });
  }, [productos, filterText, selectedCat]);

  if (!isOpen) return null;

  const totalItemsSelected = Object.values(qtyMap).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl h-[92vh] sm:h-auto sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#EF233C] flex items-center justify-center text-white text-base sm:text-lg shadow-sm shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide leading-tight truncate">
                Pedido Rápido Mayorista
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                Carga ágil por unidades o bultos cerrados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-base font-bold transition-all shrink-0 ml-2"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-2.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por código, nombre o marca..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-[#EF233C] focus:ring-1 focus:ring-[#EF233C]"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#EF233C]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Products List (Responsive Layout: 2 lines per row on mobile to eliminate all collisions) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filtered.slice(0, 100).map((prod) => {
            const currentQty = qtyMap[prod.codigo] || 0;
            return (
              <div
                key={prod.codigo}
                className={`p-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-slate-50 transition-colors ${
                  currentQty > 0 ? "bg-red-50/20" : ""
                }`}
              >
                {/* Product Detail (Image + Full Name + Metadata) */}
                <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                    {prod.imagen ? (
                      <Image
                        src={prod.imagen}
                        alt={prod.nombre}
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-base">📦</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {prod.nombre}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                      <span className="font-mono text-slate-500 font-bold">#{prod.codigo}</span>
                      <span>•</span>
                      <span className="truncate uppercase">{prod.categoria}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom line on mobile / Right block on desktop: Price + Stepper + Shortcuts */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-12 sm:pl-0">
                  <div className="text-left sm:text-right shrink-0">
                    <div
                      className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums leading-none"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatPrice(prod.precio)}
                    </div>
                    <span className="text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded mt-0.5 inline-block">
                      Mayorista
                    </span>
                  </div>

                  {/* Stepper + Quick Bulk Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg h-8 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          haptic.remove();
                          onQtyChange(prod.codigo, Math.max(0, currentQty - 1));
                        }}
                        className="w-6 h-6 text-slate-600 hover:text-red-600 font-black text-sm flex items-center justify-center active:scale-90"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={currentQty || ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 0) onQtyChange(prod.codigo, val);
                        }}
                        className="w-8 text-center font-bold text-xs text-slate-900 bg-transparent outline-none tabular-nums"
                        style={{ fontFamily: "var(--font-mono)" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          haptic.add();
                          onQtyChange(prod.codigo, currentQty + 1);
                        }}
                        className="w-6 h-6 text-slate-600 hover:text-emerald-600 font-black text-sm flex items-center justify-center active:scale-90"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        haptic.add();
                        onQtyChange(prod.codigo, currentQty + 6);
                        toast.success(`+6 ${prod.nombre}`);
                      }}
                      title="Agregar 6 unidades"
                      className="text-[10px] font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1.5 rounded-lg transition-colors active:scale-95 tabular-nums"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      +6
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        haptic.add();
                        onQtyChange(prod.codigo, currentQty + 12);
                        toast.success(`+12 ${prod.nombre}`);
                      }}
                      title="Agregar 12 unidades (Caja)"
                      className="text-[10px] font-extrabold bg-[#EF233C] hover:bg-[#C01730] text-white px-2 py-1.5 rounded-lg transition-colors active:scale-95 tabular-nums"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      +12
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Sticky */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800 shrink-0">
          <div className="text-xs font-medium text-slate-300">
            <span>En pedido: </span>
            <strong
              className="font-extrabold text-white text-sm tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {totalItemsSelected} unidades
            </strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#EF233C] hover:bg-[#C01730] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
          >
            Listo, volver
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickOrderModal;
