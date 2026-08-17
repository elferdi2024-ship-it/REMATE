// filepath: src/components/catalogo/ProductoCard.tsx
"use client";

import React, { memo, useCallback, useRef } from "react";
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
  return map[cat] || { bg: "#F1F5F9", color: "#334155" };
}

function highlightText(text: string, searchTerm: string | undefined): React.ReactNode {
  if (!searchTerm || !searchTerm.trim()) return text;
  const regex = new RegExp(`(${searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-red-100 text-[#EF233C] rounded px-0.5 font-black">{part}</mark>
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
    toast.success(`1x ${producto.nombre} agregado`, {
      position: 'top-center',
      duration: 1400,
      style: { background: '#0F172A', color: 'white', border: '1px solid #334155', fontWeight: 'bold' }
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
      className={`group relative flex flex-col bg-white border ${
        isInCart ? "border-[#EF233C] ring-2 ring-[#EF233C]/20 shadow-md" : "border-slate-200/90 hover:border-slate-300"
      } rounded-2xl p-3 transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-0.5 select-none cursor-pointer`}
      style={{ minHeight: "285px" }}
    >
      {/* Thumbnail Container */}
      <div 
        className="relative w-full rounded-xl overflow-hidden mb-2.5 flex items-center justify-center border border-slate-100 bg-slate-50/50"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Favorito Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorito(producto.codigo);
          }}
          className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all border border-slate-200/80"
          aria-label={favorito ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={favorito ? "#EF233C" : "none"}
            stroke={favorito ? "#EF233C" : "#64748B"}
            strokeWidth="2.2"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {/* Indicador Check En Carrito */}
        {isInCart && (
          <div className="absolute top-11 left-2 z-20 w-6 h-6 bg-[#EF233C] text-white rounded-full flex items-center justify-center text-xs font-black shadow-xs">
            ✓
          </div>
        )}

        {/* Badge Descuento OFF */}
        {producto.precioAnterior && producto.precioAnterior > producto.precio && (
          <div className="absolute top-2 right-2 z-20 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
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
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
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

        {/* CTA Táctil Ergónomico (Min 44x44px) + Atajos Mayoristas */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="absolute bottom-2 right-2 z-20 flex flex-col items-end gap-1.5"
        >
          <AnimatePresence mode="wait">
            {isInCart ? (
              <motion.div
                key="qty-ctrl-bar"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex flex-col items-end gap-1"
              >
                {/* Stepper Principal */}
                <div className="flex items-center bg-white border-2 border-[#EF233C] rounded-full h-[40px] px-1 shadow-md">
                  <button
                    type="button"
                    onClick={handleDec}
                    aria-label="Disminuir cantidad"
                    className="w-7 h-7 text-[#EF233C] font-black text-base flex items-center justify-center active:scale-90 hover:bg-red-50 rounded-full transition-colors"
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
                    aria-label="Cantidad"
                    className="w-8 text-center font-black text-xs text-slate-900 bg-transparent outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleInc}
                    aria-label="Aumentar cantidad"
                    className="w-7 h-7 text-[#EF233C] font-black text-base flex items-center justify-center active:scale-90 hover:bg-red-50 rounded-full transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Atajos Rápidos por Bulto */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      haptic.add();
                      onQtyChange(producto.codigo, qty + 6);
                      toast.success(`+6x ${producto.nombre} agregados`, { duration: 1200 });
                    }}
                    title="Sumar 6 unidades (Medio Bulto)"
                    className="text-[10px] font-black bg-slate-900 hover:bg-slate-800 text-white px-2 py-0.5 rounded-md shadow-xs active:scale-95 transition-all"
                  >
                    +6
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      haptic.add();
                      onQtyChange(producto.codigo, qty + 12);
                      toast.success(`+12x ${producto.nombre} agregados`, { duration: 1200 });
                    }}
                    title="Sumar 12 unidades (Caja Cerrada)"
                    className="text-[10px] font-black bg-[#EF233C] hover:bg-[#C01730] text-white px-2 py-0.5 rounded-md shadow-xs active:scale-95 transition-all"
                  >
                    +12
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center gap-1">
                <motion.button
                  key="add-btn-main"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={handleAdd}
                  className="w-[42px] h-[42px] bg-[#EF233C] text-white rounded-xl flex items-center justify-center shadow-md shadow-[#EF233C]/20 hover:bg-[#C01730] transition-all"
                  aria-label={`Agregar ${producto.nombre}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </motion.button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info Body */}
      <div className="flex flex-col flex-1 pt-1">
        {/* Badges de Categoría y Frescura */}
        <div className="flex flex-wrap gap-1 mb-1.5 items-center">
          <span 
            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider"
            style={{ background: badgeBg, color: badgeColor }}
          >
            {producto.categoria}
          </span>

          {producto.marca && (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 tracking-wider">
              {producto.marca}
            </span>
          )}

          {isFresh && (
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              🥬 Fresco
            </span>
          )}
        </div>

        {/* Nombre del Producto */}
        <h3 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-[#EF233C] transition-colors" style={{ height: "2.4em" }}>
          {highlightText(producto.nombre, searchTerm)}
        </h3>

        {/* Pie: Precios y Unidad Medida ($/kg, $/L) */}
        {(() => {
          const { precioUnitarioTexto, packSizeTexto } = obtenerPrecioPorUnidad(producto.precio, producto.nombre);
          return (
            <div className="mt-auto pt-1.5 border-t border-slate-100">
              {producto.precioAnterior && producto.precioAnterior > producto.precio && (
                <span className="block text-[11px] text-slate-400 font-semibold line-through leading-none mb-0.5">
                  {formatPrice(producto.precioAnterior)}
                </span>
              )}
              
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-2xl font-extrabold text-slate-900 leading-none tracking-tight font-mono">
                  {formatPrice(producto.precio)}
                </span>
                {precioUnitarioTexto && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 shrink-0">
                    {precioUnitarioTexto}
                  </span>
                )}
              </div>

              <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mt-1 flex items-center justify-between">
                <span>Precio Mayorista</span>
                <span className="text-slate-700 font-bold">{packSizeTexto}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </article>
  );
});

export default ProductoCard;
