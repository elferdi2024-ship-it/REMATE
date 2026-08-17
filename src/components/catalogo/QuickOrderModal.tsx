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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EF233C] flex items-center justify-center text-white text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-display tracking-wide uppercase leading-tight">
                Pedido Rápido Mayorista
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Carga masiva por bultos para comercios y abastecimiento express.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-lg font-bold transition-all"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por código, nombre o marca (ej. Aceite, Arroz, Hellmanns)..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-[#EF233C] focus:ring-1 focus:ring-[#EF233C]"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
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

        {/* Table of products */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filtered.slice(0, 80).map((prod) => {
            const currentQty = qtyMap[prod.codigo] || 0;
            return (
              <div
                key={prod.codigo}
                className="p-3 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                {/* Product Detail */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                    {prod.imagen ? (
                      <Image
                        src={prod.imagen}
                        alt={prod.nombre}
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-lg">📦</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {prod.nombre}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      <span className="font-mono text-slate-400">#{prod.codigo}</span>
                      <span>·</span>
                      <span>{prod.categoria}</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-black text-slate-900 font-mono">
                    {formatPrice(prod.precio)}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold uppercase">
                    Mayorista
                  </div>
                </div>

                {/* Stepper + Bulk Shortcuts */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-8 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        haptic.remove();
                        onQtyChange(prod.codigo, Math.max(0, currentQty - 1));
                      }}
                      className="w-6 h-6 text-slate-600 hover:text-red-600 font-black text-sm flex items-center justify-center"
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
                      className="w-8 text-center font-mono font-black text-xs text-slate-900 bg-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        haptic.add();
                        onQtyChange(prod.codigo, currentQty + 1);
                      }}
                      className="w-6 h-6 text-slate-600 hover:text-emerald-600 font-black text-sm flex items-center justify-center"
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
                    title="Agregar 6 un."
                    className="text-[10px] font-black bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1 rounded-md transition-colors"
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
                    title="Agregar 12 un. (Caja)"
                    className="text-[10px] font-black bg-[#EF233C] hover:bg-[#C01730] text-white px-2 py-1 rounded-md transition-colors"
                  >
                    +12
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
          <div className="text-xs font-medium text-slate-300">
            <span>Total en pedido: </span>
            <strong className="font-mono font-black text-white text-sm">
              {totalItemsSelected} unidades
            </strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#EF233C] hover:bg-[#C01730] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
          >
            Listo, volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickOrderModal;
