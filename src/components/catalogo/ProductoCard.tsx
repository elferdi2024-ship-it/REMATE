// filepath: src/components/catalogo/ProductoCard.tsx
"use client";

import React, { memo, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { haptic } from "@/lib/haptic";
import type { Producto } from "@/types";
import type { BrandConfig } from "@/types/brands";
import { EMOJI_POR_CATEGORIA } from "@/types";
import Image from "next/image";
import { useFavoritos } from "@/lib/favoritos-context";
import { SponsorBadge } from "@/components/ads";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";
import { obtenerPrecioPorUnidad } from "@/lib/search-normalizer";

interface ProductoCardProps {
  producto: Producto;
  qty: number;
  searchTerm?: string;
  onAdd: (producto: Producto, e?: React.MouseEvent) => void;
  onQtyChange: (codigo: string, qty: number) => void;
  sponsorBrand?: BrandConfig | null;
  onQuickView?: (producto: Producto) => void;
}

function getCatBadgeColors(cat: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    "Aceites y Aderezos":            { bg: "#FEF3C7", color: "#92400E" },
    "Bebidas":                        { bg: "#DBEAFE", color: "#1D4ED8" },
    "Café, Té y Yerba":              { bg: "#FEF3C7", color: "#5C3317" },
    "Cereales y Granola":            { bg: "#FEF3C7", color: "#C26A00" },
    "Congelados":                     { bg: "#E0F2FE", color: "#0369A1" },
    "Conservas de Pescado":          { bg: "#CCFBF1", color: "#0F766E" },
    "Conservas y Enlatados":         { bg: "#CCFBF1", color: "#0F766E" },
    "Descartables y Embalaje":       { bg: "#F3F4F6", color: "#4B5563" },
    "Especias y Condimentos":        { bg: "#D1FAE5", color: "#065F46" },
    "Fiambres y Carnes":             { bg: "#FEE2E2", color: "#991B1B" },
    "Golosinas y Dulces":            { bg: "#EDE9FE", color: "#6D28D9" },
    "Harinas, Pastas y Legumbres":   { bg: "#FEF3C7", color: "#78350F" },
    "Higiene Personal":              { bg: "#CFFAFE", color: "#0369A1" },
    "Lácteos":                        { bg: "#FEF3C7", color: "#9A3412" },
    "Limpieza":                       { bg: "#CFFAFE", color: "#0E7490" },
    "Mermeladas y Conservas Dulces": { bg: "#FCE7F3", color: "#9D174D" },
    "Otros":                          { bg: "#F3F4F6", color: "#374151" },
    "Panadería":                      { bg: "#DCFCE7", color: "#2A6B3E" },
    "Papel e Higiene":               { bg: "#F8FAFC", color: "#374151" },
  };
  return map[cat] || { bg: "#F3F4F6", color: "#374151" };
}

function highlightText(text: string, searchTerm: string | undefined): React.ReactNode {
  if (!searchTerm || !searchTerm.trim()) return text;
  const regex = new RegExp(`(${searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-red-50 text-[#E8302A] rounded px-0.5 font-extrabold">{part}</mark>
    ) : (
      part
    )
  );
}

export const ProductoCard = memo(function ProductoCard({
  producto,
  qty,
  searchTerm,
  onAdd,
  onQtyChange,
  sponsorBrand,
  onQuickView,
}: ProductoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInCart = qty > 0;
  const { isFavorito, toggleFavorito } = useFavoritos();
  const favorito = isFavorito(producto.codigo);

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.add();
    onAdd(producto, e);
    toast.success(`1x ${producto.nombre} agregado al carrito`, {
      position: 'top-center',
      duration: 1400,
      style: { background: '#1A7A42', color: 'white', border: 'none', fontWeight: 'bold' }
    });
  }, [onAdd, producto]);

  const handleDec = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.remove();
    onQtyChange(producto.codigo, Math.max(0, qty - 1));
  }, [onQtyChange, producto.codigo, qty]);

  const handleInc = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.add();
    onQtyChange(producto.codigo, qty + 1);
  }, [onQtyChange, producto.codigo, qty]);

  const emoji = EMOJI_POR_CATEGORIA[producto.categoria] || "📦";
  const { bg: badgeBg, color: badgeColor } = getCatBadgeColors(producto.categoria);
  const isFresh = ["FRUTAS Y VERDURAS", "CARNES Y EMBUTIDOS", "LÁCTEOS Y HUEVOS"].includes(producto.categoria.toUpperCase());

  return (
    <article
      ref={cardRef}
      onClick={() => onQuickView?.(producto)}
      className={`gpu-accelerated group relative flex flex-col bg-white border ${
        isInCart ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md" : "border-stone-200/80 hover:border-stone-300"
      } rounded-[22px] p-3 transition-all duration-300 ease-out hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 select-none cursor-pointer`}
      style={{ minHeight: "285px" }}
    >
      {/* Thumbnail Container */}
      <div 
        className="relative w-full rounded-2xl overflow-hidden mb-2.5 flex items-center justify-center border border-stone-100/80"
        style={{ 
          background: "linear-gradient(180deg, #FFFFFF 0%, #F6F4EF 100%)",
          aspectRatio: "1 / 1"
        }}
      >
        {/* Favorito Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorito(producto.codigo);
          }}
          className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
          aria-label={favorito ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={favorito ? "#E8302A" : "none"}
            stroke={favorito ? "#E8302A" : "#888078"}
            strokeWidth="2.5"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {/* Indicador Check En Carrito */}
        {isInCart && (
          <div className="absolute top-11 left-2 z-20 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md animate-in fade-in zoom-in-75 duration-200">
            ✓
          </div>
        )}

        {/* Badge Descuento OFF */}
        {producto.precioAnterior && producto.precioAnterior > producto.precio && (
          <div className="absolute top-2 right-2 z-20 bg-gradient-to-r from-[#E8302A] to-[#C4231E] text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm -rotate-2">
            -{Math.round((1 - producto.precio / producto.precioAnterior) * 100)}%
          </div>
        )}

        {/* Imagen del Producto */}
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{emoji}</span>
        )}

        {/* Badge Marca Patrocinada */}
        {sponsorBrand && (
          <div className="absolute bottom-2 left-2 z-20">
            <SponsorBadge
              brandName={sponsorBrand.name}
              brandColor={sponsorBrand.color}
              logoUrl={sponsorBrand.logoUrl}
              size="sm"
            />
          </div>
        )}

        {/* CTA Táctil Ergónomico (Min 44x44px) */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="absolute bottom-2 right-2 z-20 h-[44px] flex items-end justify-end"
        >
          <AnimatePresence mode="wait">
            {isInCart ? (
              <motion.div
                key="qty-ctrl-bar"
                initial={{ opacity: 0, scale: 0.8, width: 44 }}
                animate={{ opacity: 1, scale: 1, width: 104 }}
                exit={{ opacity: 0, scale: 0.8, width: 44 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center bg-white border-2 border-emerald-600 rounded-full h-[44px] px-1 shadow-lg"
              >
                <button
                  type="button"
                  onClick={handleDec}
                  className="w-8 h-8 text-emerald-700 font-black text-base flex items-center justify-center active:scale-90"
                >
                  −
                </button>
                <input
                  type="number"
                  value={qty || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 0) onQtyChange(producto.codigo, val);
                  }}
                  className="w-7 text-center font-black text-xs text-stone-900 bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={handleInc}
                  className="w-8 h-8 text-emerald-700 font-black text-base flex items-center justify-center active:scale-90"
                >
                  +
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add-btn-main"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAdd}
                className="w-[44px] h-[44px] bg-[#E8302A] text-white rounded-2xl flex items-center justify-center shadow-md shadow-[#E8302A]/25 hover:bg-[#c9241f] transition-all"
                aria-label={`Agregar ${producto.nombre}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info Body */}
      <div className="flex flex-col flex-1 pt-1">
        {/* Badges de Categoría y Frescura */}
        <div className="flex flex-wrap gap-1 mb-1.5 items-center">
          <span 
            className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider"
            style={{ background: badgeBg, color: badgeColor }}
          >
            {producto.categoria}
          </span>

          {producto.marca && (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 tracking-wider">
              {producto.marca}
            </span>
          )}

          {isFresh && (
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
              🥬 Frescura
            </span>
          )}
        </div>

        {/* Nombre del Producto */}
        <h3 className="text-xs font-bold text-stone-900 leading-snug line-clamp-2 mb-2 group-hover:text-[#E8302A] transition-colors" style={{ height: "2.4em" }}>
          {highlightText(producto.nombre, searchTerm)}
        </h3>

        {/* Pie: Precios y Unidad Medida ($/kg, $/L) */}
        {(() => {
          const { precioUnitarioTexto, packSizeTexto } = obtenerPrecioPorUnidad(producto.precio, producto.nombre);
          return (
            <div className="mt-auto pt-1.5 border-t border-stone-100">
              {producto.precioAnterior && producto.precioAnterior > producto.precio && (
                <span className="block text-[11px] text-stone-400 font-semibold line-through leading-none mb-0.5">
                  {formatPrice(producto.precioAnterior)}
                </span>
              )}
              
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-2xl font-black text-[#E8302A] leading-none tracking-wide font-price">
                  {formatPrice(producto.precio)}
                </span>
                {precioUnitarioTexto && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 shrink-0">
                    {precioUnitarioTexto}
                  </span>
                )}
              </div>

              <div className="text-[9px] font-bold text-stone-500 uppercase tracking-wider mt-1 flex items-center justify-between">
                <span>Unidad IVA Incl.</span>
                <span className="text-stone-700 font-extrabold">{packSizeTexto}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </article>
  );
});

export default ProductoCard;
