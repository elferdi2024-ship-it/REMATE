// filepath: src/components/catalogo/ExclusiveAppPacksSection.tsx
"use client";

import React, { memo, useMemo, useState } from "react";
import Image from "next/image";
import { Smartphone, PackageCheck, ChevronRight, Plus, Minus, Check } from "lucide-react";
import { toast } from "sonner";
import type { Producto } from "@/types";
import {
  resolveExclusivePacksFromCatalog,
  type ResolvedExclusivePack,
} from "@/lib/constants/exclusive-packs";
import { formatPrice } from "@/lib/format";
import { haptic } from "@/lib/haptic";

interface ExclusiveAppPacksSectionProps {
  productos: Producto[];
  qtyMap: Record<string, number>;
  onAdd: (producto: Producto, e?: React.MouseEvent) => void;
  onQtyChange: (codigo: string, qty: number) => void;
  onQuickView: (producto: Producto) => void;
}

const PREVIEW_LIMIT = 4;

const ExclusivePackCard = memo(function ExclusivePackCard({
  item,
  qty,
  onAdd,
  onQtyChange,
  onQuickView,
}: {
  item: ResolvedExclusivePack;
  qty: number;
  onAdd: (producto: Producto, e?: React.MouseEvent) => void;
  onQtyChange: (codigo: string, qty: number) => void;
  onQuickView: (producto: Producto) => void;
}) {
  const { pack, producto } = item;
  const [imgError, setImgError] = useState(false);
  const isInCart = qty > 0;
  const previewItems = pack.items.slice(0, PREVIEW_LIMIT);
  const remainingCount = Math.max(0, pack.items.length - PREVIEW_LIMIT);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.add();
    onAdd(producto, e);
    toast.success(`1x ${pack.tituloDisplay} agregado al pedido`, {
      position: "top-center",
      duration: 1500,
      style: {
        background: "#0F172A",
        color: "#FFFFFF",
        border: "1px solid #334155",
        fontWeight: "bold",
      },
    });
  };

  const handleDec = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.remove();
    onQtyChange(producto.codigo, Math.max(0, qty - 1));
  };

  const handleInc = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.add();
    onQtyChange(producto.codigo, qty + 1);
  };

  return (
    <article
      onClick={() => onQuickView(producto)}
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer select-none w-[82vw] max-w-[330px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink ${
        isInCart
          ? "ring-2 ring-emerald-400 shadow-[0_14px_34px_-10px_rgba(16,185,129,0.45)]"
          : "ring-1 ring-white/15 hover:ring-emerald-400/60 shadow-[0_14px_30px_-14px_rgba(0,0,0,0.55)] hover:-translate-y-0.5"
      }`}
    >
      {/* Banda superior: Exclusivo App + Cantidad de artículos */}
      <div className="flex items-center justify-between gap-2 px-3.5 pt-3 pb-2 bg-gradient-to-b from-slate-50/90 to-white">
        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
          <Smartphone className="w-3 h-3 shrink-0" />
          <span>{pack.badge}</span>
        </span>

        <span
          className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <PackageCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>{pack.items.length} prod.</span>
        </span>
      </div>

      {/* Imagen promocional del pack */}
      <div className="relative mx-3.5 rounded-xl bg-gradient-to-b from-[#FAF8F5] to-[#F1F5F9] border border-slate-100 overflow-hidden aspect-[4/3] flex items-center justify-center">
        {producto.imagen && !imgError ? (
          <Image
            src={producto.imagen}
            alt={pack.tituloDisplay}
            fill
            sizes="(max-width: 768px) 82vw, 33vw"
            className="object-contain p-2 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <span className="text-4xl mb-1">📦</span>
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
              {pack.tituloDisplay}
            </span>
          </div>
        )}

        {isInCart && (
          <div
            className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Check className="w-3 h-3 stroke-[3]" />
            <span>{qty} en pedido</span>
          </div>
        )}
      </div>

      {/* Información y vista previa del contenido */}
      <div className="flex flex-col flex-1 p-3.5 pt-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-0.5">
          {pack.eyebrow}
        </span>

        <h3 className="text-base sm:text-[17px] font-black text-slate-950 leading-tight tracking-tight group-hover:text-[#EF233C] transition-colors">
          {pack.tituloDisplay}
        </h3>

        <p className="text-[11.5px] text-slate-500 font-medium leading-snug mt-0.5 mb-2.5 line-clamp-2">
          {pack.subtitulo}
        </p>

        {/* Caja de contenido del pack */}
        <div className="bg-slate-50/90 border border-slate-200/75 rounded-xl p-2.5 mb-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
              Qué incluye adentro
            </span>
            <span
              className="text-[10px] font-bold text-slate-500 tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {pack.totalUnidades} u. totales
            </span>
          </div>

          <ul className="space-y-1">
            {previewItems.map((entry, idx) => (
              <li
                key={idx}
                className="flex items-baseline gap-1.5 text-[11.5px] text-slate-700 leading-snug"
              >
                <span
                  className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded shrink-0 tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {entry.cantidad}
                </span>
                <span className="truncate font-medium">{entry.nombre}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(producto);
            }}
            className="mt-2 w-full flex items-center justify-between gap-1 text-[11px] font-extrabold text-slate-800 hover:text-[#EF233C] bg-white hover:bg-red-50/60 border border-slate-200/80 hover:border-red-200 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <span>
              {remainingCount > 0
                ? `+${remainingCount} ${remainingCount === 1 ? "producto más" : "productos más"} · Ver lista completa`
                : "Ver detalle completo del pack"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>

        {/* Precio y botón de compra */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2.5">
          <div className="min-w-0">
            <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
              Precio pack
            </span>
            <span
              className="text-2xl font-black text-slate-950 leading-none tracking-tight tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatPrice(producto.precio)}
            </span>
          </div>

          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            {isInCart ? (
              <div className="flex items-center bg-white border-2 border-[#EF233C] rounded-xl h-10 px-1 shadow-xs">
                <button
                  type="button"
                  onClick={handleDec}
                  aria-label={`Restar ${pack.tituloDisplay}`}
                  className="w-8 h-8 rounded-lg text-[#EF233C] hover:bg-red-50 flex items-center justify-center active:scale-90 transition-all"
                >
                  <Minus className="w-4 h-4 stroke-[2.8]" />
                </button>
                <span
                  className="w-8 text-center text-sm font-black text-slate-950 tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={handleInc}
                  aria-label={`Sumar ${pack.tituloDisplay}`}
                  className="w-8 h-8 rounded-lg text-[#EF233C] hover:bg-red-50 flex items-center justify-center active:scale-90 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.8]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-1.5 bg-[#EF233C] hover:bg-[#C01730] text-white text-xs sm:text-[13px] font-extrabold px-4 h-10 rounded-xl shadow-[0_6px_16px_-4px_rgba(239,35,60,0.45)] active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.8]" />
                <span>Agregar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

export default function ExclusiveAppPacksSection({
  productos,
  qtyMap,
  onAdd,
  onQtyChange,
  onQuickView,
}: ExclusiveAppPacksSectionProps) {
  const resolvedPacks = useMemo(
    () => resolveExclusivePacksFromCatalog(productos),
    [productos]
  );

  if (resolvedPacks.length === 0) return null;

  return (
    <section
      aria-label="Packs exclusivos de la aplicación"
      className="relative mb-5 sm:mb-6 rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-[#0F172A] via-[#131C33] to-[#0B1120] border border-slate-800/90 p-4 sm:p-5 md:p-6 shadow-[0_20px_48px_-20px_rgba(15,23,42,0.55)] overflow-hidden"
    >
      {/* Acento ambiental sutil en esmeralda y rojo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-16 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-12 w-72 h-72 rounded-full bg-[#EF233C]/15 blur-3xl"
      />

      {/* Encabezado de sección */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Solo se compra por la aplicación</span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight m-0">
            Packs Exclusivos El Remate
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-300 font-medium mt-1 m-0">
            Combos cerrados a precio especial · Tocá cualquier pack para ver todos los productos que incluye adentro
          </p>
        </div>

        <span className="md:hidden text-[11px] font-bold text-slate-400 shrink-0">
          Deslizá para ver los {resolvedPacks.length} packs →
        </span>
      </div>

      {/* Carrusel snap en móvil / Grilla de 3 columnas en desktop */}
      <div
        className="relative z-10 flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-1.5 -mx-4 px-4 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:mx-0 md:px-0 md:pb-0 no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {resolvedPacks.map((item) => (
          <ExclusivePackCard
            key={item.pack.id}
            item={item}
            qty={qtyMap[item.producto.codigo] || 0}
            onAdd={onAdd}
            onQtyChange={onQtyChange}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </section>
  );
}
