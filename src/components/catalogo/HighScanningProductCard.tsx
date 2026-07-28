// filepath: src/components/catalogo/HighScanningProductCard.tsx
"use client";

import React, { memo } from "react";
import Image from "next/image";
import type { Producto } from "@/types";
import { formatPrice } from "@/lib/format";
import { haptic } from "@/lib/haptic";

interface HighScanningProductCardProps {
  producto: Producto;
  qty: number;
  onAdd: (producto: Producto) => void;
  onQtyChange: (codigo: string, qty: number) => void;
  onQuickView?: (producto: Producto) => void;
}

export const HighScanningProductCard = memo(function HighScanningProductCard({
  producto,
  qty,
  onAdd,
  onQtyChange,
  onQuickView,
}: HighScanningProductCardProps) {
  const isInCart = qty > 0;

  return (
    <article 
      className="gpu-accelerated relative flex flex-col bg-white border border-stone-200/70 rounded-2xl p-2.5 transition-shadow duration-200 hover:shadow-md select-none"
      style={{ minHeight: "270px" }}
    >
      {/* Zona Superior: Imagen escaneable */}
      <div 
        onClick={() => onQuickView?.(producto)}
        className="relative w-full bg-stone-50 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center mb-2"
        style={{ aspectRatio: "1 / 1" }}
      >
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 45vw, 18vw"
            className="object-contain p-2 transition-transform duration-200 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="text-3xl">📦</span>
        )}

        {/* Sello de Descuento (Si aplica) */}
        {producto.precioAnterior && producto.precioAnterior > producto.precio && (
          <span className="absolute top-2 left-2 bg-[#E8302A] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
            OFF
          </span>
        )}
      </div>

      {/* Info Principal: Jerarquía Estricta */}
      <div className="flex flex-col flex-1">
        {/* Marca o Categoria (Metadata) */}
        <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider truncate mb-0.5">
          {producto.marca || producto.categoria}
        </span>

        {/* Nombre del Producto */}
        <h3 
          onClick={() => onQuickView?.(producto)}
          className="text-xs font-bold text-stone-900 leading-snug line-clamp-2 cursor-pointer mb-2 hover:text-[#E8302A] transition-colors"
          style={{ height: "2.4em" }}
        >
          {producto.nombre}
        </h3>

        {/* Precio & Unidad en el pie de tarjeta */}
        <div className="mt-auto flex items-end justify-between gap-1 pt-1 border-t border-stone-100">
          <div>
            {producto.precioAnterior && producto.precioAnterior > producto.precio && (
              <span className="block text-[10px] text-stone-400 line-through font-semibold leading-none">
                {formatPrice(producto.precioAnterior)}
              </span>
            )}
            <span className="block text-xl font-black text-[#E8302A] leading-none tracking-wide font-price">
              {formatPrice(producto.precio)}
            </span>
            <span className="block text-[9px] text-stone-500 font-bold uppercase mt-0.5">
              {producto.contenido || "Unidad"}
            </span>
          </div>

          {/* CTA Táctil Ergónomico: Min 44x44px */}
          <div className="shrink-0">
            {isInCart ? (
              <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-xl overflow-hidden h-[44px]">
                <button
                  type="button"
                  aria-label={`Quitar una unidad de ${producto.nombre}`}
                  onClick={() => {
                    haptic.remove();
                    onQtyChange(producto.codigo, qty - 1);
                  }}
                  className="w-[36px] h-full flex items-center justify-center font-black text-emerald-800 text-base active:bg-emerald-100"
                >
                  −
                </button>
                <span className="w-[20px] text-center font-black text-xs text-emerald-900">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label={`Agregar una unidad adicional de ${producto.nombre}`}
                  onClick={() => {
                    haptic.add();
                    onQtyChange(producto.codigo, qty + 1);
                  }}
                  className="w-[36px] h-full flex items-center justify-center font-black text-emerald-800 text-base active:bg-emerald-100"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                aria-label={`Agregar ${producto.nombre} al carrito`}
                onClick={() => {
                  haptic.add();
                  onAdd(producto);
                }}
                className="w-[44px] h-[44px] bg-[#E8302A] text-white rounded-xl flex items-center justify-center shadow-sm hover:bg-[#c9241f] active:scale-95 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

export default HighScanningProductCard;
