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

const DESKTOP_PREVIEW_LIMIT = 3;

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
  const previewItems = pack.items.slice(0, DESKTOP_PREVIEW_LIMIT);
  const remainingCount = Math.max(0, pack.items.length - DESKTOP_PREVIEW_LIMIT);

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
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer select-none w-[76vw] max-w-[292px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink ${
        isInCart
          ? "ring-2 ring-emerald-400 shadow-[0_12px_28px_-10px_rgba(16,185,129,0.45)]"
          : "ring-1 ring-white/15 hover:ring-emerald-400/60 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
      }`}
    >
      {/* Banda superior compacta */}
      <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-1.5 bg-gradient-to-b from-slate-50/90 to-white">
        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
          <Smartphone className="w-2.5 h-2.5 shrink-0" />
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

      {/* Imagen promocional compacta para que entre todo en pantalla */}
      <div className="relative mx-3 rounded-xl bg-gradient-to-b from-[#FAF8F5] to-[#F1F5F9] border border-slate-100 overflow-hidden h-[150px] sm:h-[175px] md:h-[190px] flex items-center justify-center">
        {producto.imagen && !imgError ? (
          <Image
            src={producto.imagen}
            alt={pack.tituloDisplay}
            fill
            sizes="(max-width: 768px) 76vw, 33vw"
            className="object-contain p-1.5 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <span className="text-3xl mb-1">📦</span>
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
              {pack.tituloDisplay}
            </span>
          </div>
        )}

        {isInCart && (
          <div
            className="absolute top-1.5 right-1.5 z-10 inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Check className="w-2.5 h-2.5 stroke-[3]" />
            <span>{qty} en pedido</span>
          </div>
        )}
      </div>

      {/* Información + acción */}
      <div className="flex flex-col flex-1 p-3 pt-2.5">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-700">
            {pack.eyebrow}
          </span>
          <span
            className="text-[9.5px] font-bold text-slate-400 tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {pack.totalUnidades} u. totales
          </span>
        </div>

        <h3 className="text-[15px] sm:text-base font-black text-slate-950 leading-tight tracking-tight group-hover:text-[#EF233C] transition-colors truncate">
          {pack.tituloDisplay}
        </h3>

        <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5 mb-2 line-clamp-1">
          {pack.subtitulo}
        </p>

        {/* Móvil: acceso directo compacto para ver todo el contenido */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(producto);
          }}
          className="md:hidden mb-2.5 w-full flex items-center justify-between gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-50/90 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-lg px-2.5 py-1.5 transition-colors"
        >
          <span>📦 Ver los {pack.items.length} productos que incluye</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </button>

        {/* Desktop: vista previa de los primeros 3 ítems + botón lista completa */}
        <div className="hidden md:block bg-slate-50/90 border border-slate-200/75 rounded-xl p-2.5 mb-2.5">
          <ul className="space-y-1">
            {previewItems.map((entry, idx) => (
              <li
                key={idx}
                className="flex items-baseline gap-1.5 text-[11px] text-slate-700 leading-snug"
              >
                <span
                  className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 px-1.5 rounded shrink-0 tabular-nums"
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
            className="mt-2 w-full flex items-center justify-between gap-1 text-[10.5px] font-extrabold text-slate-800 hover:text-[#EF233C] bg-white hover:bg-red-50/60 border border-slate-200/80 hover:border-red-200 rounded-lg px-2 py-1 transition-colors"
          >
            <span>
              {remainingCount > 0
                ? `+${remainingCount} ${remainingCount === 1 ? "producto más" : "productos más"} · Ver detalle`
                : "Ver detalle completo"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>

        {/* Precio y botón de compra */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">
              Precio pack
            </span>
            <span
              className="text-xl sm:text-2xl font-black text-slate-950 leading-none tracking-tight tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatPrice(producto.precio)}
            </span>
          </div>

          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            {isInCart ? (
              <div className="flex items-center bg-white border-2 border-[#EF233C] rounded-xl h-9 px-1 shadow-xs">
                <button
                  type="button"
                  onClick={handleDec}
                  aria-label={`Restar ${pack.tituloDisplay}`}
                  className="w-7 h-7 rounded-lg text-[#EF233C] hover:bg-red-50 flex items-center justify-center active:scale-90 transition-all"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.8]" />
                </button>
                <span
                  className="w-7 text-center text-xs font-black text-slate-950 tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={handleInc}
                  aria-label={`Sumar ${pack.tituloDisplay}`}
                  className="w-7 h-7 rounded-lg text-[#EF233C] hover:bg-red-50 flex items-center justify-center active:scale-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-1 bg-[#EF233C] hover:bg-[#C01730] text-white text-xs font-extrabold px-3.5 h-9 rounded-xl shadow-[0_6px_14px_-4px_rgba(239,35,60,0.45)] active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
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
      className="relative mb-4 sm:mb-6 rounded-[20px] sm:rounded-[28px] bg-gradient-to-br from-[#0F172A] via-[#131C33] to-[#0B1120] border border-slate-800/90 p-3 sm:p-5 md:p-6 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.55)] overflow-hidden"
    >
      {/* Acentos ambientales sutiles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-12 w-64 h-64 rounded-full bg-[#EF233C]/15 blur-3xl"
      />

      {/* Encabezado compacto */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-2.5 sm:mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-2xl font-black text-white tracking-tight leading-tight m-0">
              Packs Exclusivos App
            </h2>
            <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[9.5px] sm:text-[10.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Solo en la app</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-[13px] text-slate-300 font-medium mt-0.5 m-0 truncate">
            Tocá cualquier pack para ver todo lo que trae adentro
          </p>
        </div>

        <span className="md:hidden text-[10.5px] font-bold text-slate-400 shrink-0 whitespace-nowrap">
          Deslizá →
        </span>
      </div>

      {/* Carrusel snap en móvil (con peek de la siguiente card) / Grilla 3 col en desktop */}
      <div
        className="relative z-10 flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1 -mx-3 px-3 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:mx-0 md:px-0 md:pb-0 no-scrollbar"
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
