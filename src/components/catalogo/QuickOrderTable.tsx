// filepath: src/components/catalogo/QuickOrderTable.tsx
"use client";

import React from "react";
import Image from "next/image";
import type { Producto } from "@/types";
import { formatPrice } from "@/lib/format";
import { obtenerPrecioPorUnidad } from "@/lib/search-normalizer";
import { haptic } from "@/lib/haptic";

interface QuickOrderTableProps {
  productos: Producto[];
  qtyMap: Record<string, number>;
  onAdd: (producto: Producto, e?: React.MouseEvent) => void;
  onQtyChange: (codigo: string, qty: number) => void;
  onQuickView?: (producto: Producto) => void;
}

export default function QuickOrderTable({
  productos,
  qtyMap,
  onAdd,
  onQtyChange,
  onQuickView,
}: QuickOrderTableProps) {
  if (productos.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-6">
      {/* Header Informativo Modo B2B */}
      <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <span className="font-extrabold text-xs tracking-wider uppercase">
            Modo Pedido Rápido por Tabla (B2B Mayorista)
          </span>
        </div>
        <span className="text-[10px] text-stone-400 font-mono font-bold">
          {productos.length} ítems en catálogo
        </span>
      </div>

      {/* Tabla de Alta Densidad */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-stone-100/90 text-stone-700 text-[11px] font-black uppercase tracking-wider border-b border-stone-200">
              <th className="py-3 px-4">Producto</th>
              <th className="py-3 px-3">Código</th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3 text-right">Precio Unit.</th>
              <th className="py-3 px-3 text-right">Unit. Medida</th>
              <th className="py-3 px-4 text-center min-w-[160px]">Cantidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {productos.map((prod) => {
              const currentQty = qtyMap[prod.codigo] || 0;
              const { precioUnitarioTexto, packSizeTexto } = obtenerPrecioPorUnidad(
                prod.precio,
                prod.nombre
              );

              return (
                <tr
                  key={prod.codigo}
                  className={`hover:bg-red-50/40 transition-colors ${
                    currentQty > 0 ? "bg-amber-50/30" : ""
                  }`}
                >
                  {/* Imagen + Nombre */}
                  <td className="py-2.5 px-4 flex items-center gap-3">
                    <div
                      onClick={() => onQuickView?.(prod)}
                      className="w-10 h-10 bg-stone-50 border border-stone-200 rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                    >
                      {prod.imagen ? (
                        <Image
                          src={prod.imagen}
                          alt={prod.nombre}
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <span className="text-lg">📦</span>
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => onQuickView?.(prod)}
                        className="font-bold text-stone-900 hover:text-[#E8302A] text-left transition-colors cursor-pointer line-clamp-1 text-xs"
                      >
                        {prod.nombre}
                      </button>
                      <span className="inline-block text-[10px] text-stone-500 font-semibold">
                        {packSizeTexto}
                      </span>
                    </div>
                  </td>

                  {/* Código */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500 font-semibold">
                    {prod.codigo}
                  </td>

                  {/* Categoría */}
                  <td className="py-2.5 px-3 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    {prod.categoria}
                  </td>

                  {/* Precio */}
                  <td className="py-2.5 px-3 text-right font-black text-stone-900 text-sm font-price">
                    {formatPrice(prod.precio)}
                  </td>

                  {/* Desglose $/kg $/L */}
                  <td className="py-2.5 px-3 text-right font-extrabold text-[#E8302A] text-[11px]">
                    {precioUnitarioTexto}
                  </td>

                  {/* Control de Cantidad Rápido */}
                  <td className="py-2.5 px-4 text-center">
                    {currentQty > 0 ? (
                      <div className="flex items-center justify-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-300">
                        <button
                          type="button"
                          onClick={() => {
                            haptic.add();
                            onQtyChange(prod.codigo, Math.max(0, currentQty - 1));
                          }}
                          className="w-7 h-7 bg-white border border-stone-200 rounded-lg flex items-center justify-center text-sm font-black text-stone-700 hover:bg-stone-200 active:scale-95 transition-all cursor-pointer shadow-sm"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 0) {
                              onQtyChange(prod.codigo, val);
                            }
                          }}
                          className="w-12 text-center font-black text-stone-900 text-xs bg-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            haptic.add();
                            onAdd(prod, e);
                          }}
                          className="w-7 h-7 bg-[#E8302A] text-white rounded-lg flex items-center justify-center text-sm font-black hover:bg-red-700 active:scale-95 transition-all cursor-pointer shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          haptic.add();
                          onAdd(prod, e);
                        }}
                        className="w-full py-1.5 px-3 bg-stone-900 hover:bg-[#E8302A] text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <span>+ AGREGAR</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
