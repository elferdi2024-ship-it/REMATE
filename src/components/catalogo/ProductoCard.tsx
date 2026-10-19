// filepath: src/components/catalogo/ProductoCard.tsx
// Lucian UX/UI Prompt #051 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#051
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

function highlightText(text: string, searchTerm: string | undefined): React.ReactNode {
  if (!searchTerm || !searchTerm.trim()) return text;
  const regex = new RegExp(`(${searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-red-100 text-[#EF233C] rounded px-0.5 font-extrabold">
        {part}
      </mark>
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

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      haptic.add();
      onAdd(producto, e);
      toast.success(`1x ${producto.nombre} agregado`, {
        position: "top-center",
        duration: 1400,
        style: {
          background: "#0F172A",
          color: "white",
          border: "1px solid #334155",
          fontWeight: "bold",
        },
      });
    },
    [onAdd, producto]
  );

  const handleDec = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      haptic.remove();
      onQtyChange(producto.codigo, Math.max(0, qty - 1));
    },
    [onQtyChange, producto.codigo, qty]
  );

  const handleInc = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      haptic.add();
      onQtyChange(producto.codigo, qty + 1);
    },
    [onQtyChange, producto.codigo, qty]
  );

  const emoji = EMOJI_POR_CATEGORIA[producto.categoria] || "📦";
  const isFresh = ["FRUTAS Y VERDURAS", "CARNES Y EMBUTIDOS", "LÁCTEOS Y HUEVOS"].includes(
    producto.categoria.toUpperCase()
  );
  const hasDiscount = Boolean(producto.precioAnterior && producto.precioAnterior > producto.precio);
  const discountPct = hasDiscount
    ? Math.round((1 - producto.precio / (producto.precioAnterior as number)) * 100)
    : 0;
  const hasBulkTiers = Boolean(producto.escalaPrecios && producto.escalaPrecios.length > 0);

  const [imageError, setImageError] = React.useState(false);

  return (
    <article
      ref={cardRef}
      onClick={() => onQuickView?.(producto)}
      className={`ux group relative flex flex-col bg-white border ${
        isInCart
          ? "border-[#EF233C] ring-2 ring-[#EF233C]/15 shadow-[0_12px_28px_-10px_rgba(239,35,60,0.18)]"
          : "border-slate-200/85 hover:border-slate-300 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.05)] hover:shadow-[0_14px_32px_-12px_rgba(15,23,42,0.12)]"
      } rounded-2xl p-2.5 sm:p-3 transition-all duration-200 ease-out hover:-translate-y-0.5 select-none cursor-pointer`}
      style={{ minHeight: "294px" }}
    >
      {/* Escenario de Producto estilo Lucian #051 (.u051-stage) */}
      <div
        className="relative w-full rounded-xl overflow-hidden mb-2.5 flex items-center justify-center border border-slate-100 bg-gradient-to-b from-slate-50/40 to-slate-100/60"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Sombra de base sutil (.u051-shadow) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 bottom-2.5 w-2/3 h-3 -translate-x-1/2 rounded-full opacity-60 transition-transform duration-300 group-hover:scale-110"
          style={{
            background: "radial-gradient(closest-side, rgba(15, 23, 42, 0.12), transparent)",
          }}
        />

        {/* Botón Favorito (Top-Left) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorito(producto.codigo);
          }}
          className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:scale-110 active:scale-90 transition-all border border-slate-200/80"
          aria-label={favorito ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={favorito ? "#EF233C" : "none"}
            stroke={favorito ? "#EF233C" : "#64748B"}
            strokeWidth="2.3"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {/* Badges Superiores Derecha: Descuento / Lo más pedido / Cantidad en carrito (.u051-cart b) */}
        <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1">
          {hasDiscount && (
            <span
              className="bg-[#EF233C] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-2xs tabular-nums tracking-tight"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              -{discountPct}%
            </span>
          )}

          {!hasDiscount && producto.destacado && (
            <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-2xs">
              Lo más pedido
            </span>
          )}

          {isInCart && (
            <span
              className="flex items-center gap-0.5 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs tabular-nums"
              style={{
                fontFamily: "var(--font-mono)",
                transition: "transform 0.4s var(--ux-spring)",
              }}
            >
              <span>✓</span>
              <span>{qty}</span>
            </span>
          )}
        </div>

        {/* Imagen del Producto */}
        {producto.imagen && !imageError ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-contain p-2.5 transition-transform duration-300 ease-out group-hover:scale-[1.06]"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-2 text-center select-none">
            <span className="text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110">
              {emoji}
            </span>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-1 line-clamp-1 max-w-[90px]">
              {producto.categoria.split(" ")[0]}
            </span>
          </div>
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

        {/* Control Táctil Ergonómico Lucian #051 + Atajos Mayoristas */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2 right-2 z-20 flex flex-col items-end gap-1"
        >
          <AnimatePresence mode="wait">
            {isInCart ? (
              <motion.div
                key="qty-ctrl-bar"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className="flex flex-col items-end gap-1"
              >
                {/* Stepper Principal */}
                <div className="flex items-center bg-white border-2 border-[#EF233C] rounded-xl h-[38px] px-1 shadow-[0_6px_16px_rgba(239,35,60,0.22)]">
                  <button
                    type="button"
                    onClick={handleDec}
                    aria-label="Disminuir cantidad"
                    className="w-7 h-7 text-[#EF233C] font-black text-base flex items-center justify-center active:scale-90 hover:bg-red-50 rounded-lg transition-colors"
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
                    className="w-8 text-center font-extrabold text-xs text-slate-900 bg-transparent outline-none tabular-nums"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                  <button
                    type="button"
                    onClick={handleInc}
                    aria-label="Aumentar cantidad"
                    className="w-7 h-7 text-[#EF233C] font-black text-base flex items-center justify-center active:scale-90 hover:bg-red-50 rounded-lg transition-colors"
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
                    className="text-[10px] font-extrabold bg-slate-900 hover:bg-slate-800 text-white px-2 py-0.5 rounded-md shadow-xs active:scale-95 transition-all tabular-nums"
                    style={{ fontFamily: "var(--font-mono)" }}
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
                    className="text-[10px] font-extrabold bg-[#EF233C] hover:bg-[#C01730] text-white px-2 py-0.5 rounded-md shadow-xs active:scale-95 transition-all tabular-nums"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    +12
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="add-btn-main"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleAdd}
                className="w-10 h-10 bg-slate-900 group-hover:bg-[#EF233C] text-white rounded-xl flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(15,23,42,0.35)] group-hover:shadow-[0_6px_16px_-4px_rgba(239,35,60,0.45)] transition-colors"
                aria-label={`Agregar ${producto.nombre}`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cuerpo de Información con Jerarquía Clara */}
      <div className="flex flex-col flex-1 pt-0.5">
        {/* Fila de Metadatos: Rubro / Marca / Escala */}
        <div className="flex flex-wrap gap-1 mb-1.5 items-center">
          <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 tracking-wider truncate max-w-[130px]">
            {producto.categoria}
          </span>

          {producto.marca && (
            <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-900/[0.05] text-slate-700 tracking-wider truncate max-w-[90px]">
              {producto.marca}
            </span>
          )}

          {hasBulkTiers && (
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80">
              x Bulto
            </span>
          )}

          {isFresh && (
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              Fresco
            </span>
          )}
        </div>

        {/* Nombre del Producto */}
        <h3 className="text-[12.5px] sm:text-[13px] font-bold text-slate-900 leading-[1.35] line-clamp-2 mb-2 group-hover:text-[#EF233C] transition-colors min-h-[2.7em] tracking-[-0.01em]">
          {highlightText(producto.nombre, searchTerm)}
        </h3>

        {/* Bloque de Precio Mayorista Tabular + Precio por Unidad */}
        {(() => {
          const { precioUnitarioTexto, packSizeTexto } = obtenerPrecioPorUnidad(
            producto.precio,
            producto.nombre
          );
          return (
            <div className="mt-auto pt-2 border-t border-slate-100">
              {hasDiscount && (
                <span
                  className="block text-[11px] text-slate-400 font-semibold line-through leading-none mb-0.5 tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatPrice(producto.precioAnterior as number)}
                </span>
              )}

              <div className="flex items-baseline justify-between gap-1">
                <span
                  className="text-xl sm:text-[22px] font-extrabold text-slate-900 leading-none tracking-tight tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatPrice(producto.precio)}
                </span>
                {precioUnitarioTexto && (
                  <span
                    className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/70 shrink-0 tabular-nums"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {precioUnitarioTexto}
                  </span>
                )}
              </div>

              <div className="text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mt-1.5 flex items-center justify-between">
                <span>Directo fábrica</span>
                {packSizeTexto ? (
                  <span className="text-slate-700 font-extrabold">{packSizeTexto}</span>
                ) : (
                  <span className="text-emerald-700 font-bold">En stock</span>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </article>
  );
});

export default ProductoCard;
