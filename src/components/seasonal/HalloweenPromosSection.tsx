// filepath: src/components/seasonal/HalloweenPromosSection.tsx
"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { HALLOWEEN_PROMOS, type HalloweenPromoItem } from "@/lib/constants/ofertas";
import type { Producto } from "@/types";
import { haptic } from "@/lib/haptic";

interface HalloweenPromosSectionProps {
  enabled?: boolean;
  qtyMap: Record<string, number>;
  onAddPromo: (producto: Producto, e?: React.MouseEvent) => void;
  onQtyChange: (codigo: string, qty: number) => void;
  onSelectPromo: (producto: Producto) => void;
}

function toProducto(promo: HalloweenPromoItem): Producto {
  return {
    codigo: `PROMO-${promo.id}`,
    nombre: `${promo.titulo} (Especial Halloween)`,
    precio: promo.precio || 0,
    categoria: "Golosinas y Chocolates",
    imagen: promo.imagen,
    destacado: true,
    escalaPrecios: promo.escalaPrecios,
  };
}

export default function HalloweenPromosSection({
  enabled = true,
  qtyMap,
  onAddPromo,
  onQtyChange,
  onSelectPromo,
}: HalloweenPromosSectionProps) {
  const [mobileGridMode, setMobileGridMode] = useState(false);
  const [comboAddedFlash, setComboAddedFlash] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  if (!enabled) return null;

  const totalComboPrice = HALLOWEEN_PROMOS.reduce((acc, p) => acc + (p.precio || 0), 0);
  const itemsInCartCount = HALLOWEEN_PROMOS.reduce(
    (acc, p) => acc + (qtyMap[`PROMO-${p.id}`] || 0),
    0
  );

  const handleAddFullPack = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.success();
    HALLOWEEN_PROMOS.forEach((promo, idx) => {
      const prod = toProducto(promo);
      onAddPromo(prod, idx === 0 ? e : undefined);
    });
    setComboAddedFlash(true);
    setTimeout(() => setComboAddedFlash(false), 2200);
  };

  const scrollHorizontal = (dir: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    haptic.selection();
    const amount = 270;
    scrollContainerRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section
      aria-label="Ofertas Especiales de Halloween"
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-[28px] bg-gradient-to-br from-[#1A0D26] via-[#13091C] to-[#0D0714] border border-orange-500/40 shadow-[0_14px_38px_rgba(249,115,22,0.16)] text-white p-3.5 sm:p-5 md:p-6 my-2.5 select-none"
    >
      {/* Glows decorativos de fondo (no bloquean clics) */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 rounded-full bg-orange-500/20 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[#EF233C]/20 blur-[90px]" />

      {/* Telaraña SVG sutil en esquina superior derecha */}
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 text-orange-400/15"
        fill="none"
      >
        <path
          d="M100 0 L0 0 M100 0 L0 35 M100 0 L0 75 M100 0 L25 100 M100 0 L65 100 M100 0 L100 100"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M78 0 Q74 16 64 26 Q54 36 72 48 Q84 56 100 46"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <path
          d="M52 0 Q48 26 32 42 Q46 58 62 72 Q82 78 100 74"
          stroke="currentColor"
          strokeWidth="1.1"
        />
      </svg>

      {/* Encabezado de la Sección */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3.5 mb-3.5 border-b border-white/10">
        <div className="flex items-start sm:items-center gap-3">
          {/* Emblema Calabaza + Destello */}
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-orange-500 via-[#EF233C] to-amber-600 p-0.5 shadow-lg shadow-orange-500/30 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#160B20] rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl">
              🎃
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 bg-orange-500/20 border border-orange-400/40 text-orange-300 text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                🕸️ Especial Halloween
              </span>
              <span className="inline-flex items-center gap-1 bg-[#EF233C] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                5 Ofertas Dulces
              </span>
              {itemsInCartCount > 0 && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  ✓ {itemsInCartCount} en tu pedido
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl md:text-[26px] font-black tracking-tight uppercase font-display mt-1 leading-tight text-white">
              Golosinas de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-[#EF233C]">
                Halloween en Remate
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5 m-0">
              Tocá cualquier placa para ampliarla o sumala directo a tu carrito mayorista/minorista.
            </p>
          </div>
        </div>

        {/* Acciones rápidas: Botón Combo Completo + Selector de Vista Móvil */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddFullPack}
            className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg cursor-pointer ${
              comboAddedFlash
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-gradient-to-r from-orange-500 to-[#EF233C] hover:from-orange-400 hover:to-red-500 text-white shadow-orange-500/25 border border-orange-300/30"
            }`}
          >
            <span>{comboAddedFlash ? "✓ ¡Pack Sumado!" : "🍬 Sumar las 5 Promos"}</span>
            <span className="bg-black/25 px-2 py-0.5 rounded-lg font-mono text-xs sm:text-sm">
              ${totalComboPrice}
            </span>
          </button>

          {/* Toggle Carrusel / Grilla en Móvil */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              type="button"
              onClick={() => {
                haptic.selection();
                setMobileGridMode((prev) => !prev);
              }}
              className="text-[11px] font-bold text-orange-200 bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-2 rounded-xl transition-colors"
            >
              {mobileGridMode ? "Ver Carrusel" : "Ver Grilla (5)"}
            </button>

            {!mobileGridMode && (
              <>
                <button
                  type="button"
                  onClick={() => scrollHorizontal("left")}
                  aria-label="Anterior"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white font-black"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => scrollHorizontal("right")}
                  aria-label="Siguiente"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white font-black"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grilla / Carrusel de las 5 Placas 1:1 */}
      <div
        ref={scrollContainerRef}
        className={
          mobileGridMode
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5"
            : "flex lg:grid lg:grid-cols-5 gap-3 sm:gap-3.5 overflow-x-auto lg:overflow-visible no-scrollbar snap-x snap-mandatory pb-1"
        }
      >
        {HALLOWEEN_PROMOS.map((promo) => {
          const prod = toProducto(promo);
          const inCartQty = qtyMap[`PROMO-${promo.id}`] || 0;

          return (
            <article
              key={promo.id}
              data-halloween-card="true"
              className={`${
                mobileGridMode
                  ? "w-full"
                  : "w-[235px] sm:w-[250px] lg:w-full shrink-0 snap-start"
              } group relative rounded-2xl bg-white text-slate-900 overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                inCartQty > 0
                  ? "ring-3 ring-orange-500 shadow-[0_10px_28px_rgba(249,115,22,0.35)]"
                  : "border border-white/20 shadow-md hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {/* Flyer 1:1 Cuadrado Completo */}
              <div
                onClick={() => {
                  haptic.selection();
                  onSelectPromo(prod);
                }}
                className="relative w-full aspect-square bg-amber-50 overflow-hidden cursor-pointer"
              >
                <Image
                  src={promo.imagen}
                  alt={promo.titulo}
                  fill
                  sizes="(max-width: 640px) 245px, (max-width: 1024px) 260px, 240px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />

                {/* Badge flotante superior */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                  <span className="bg-slate-950/80 backdrop-blur-xs text-orange-300 border border-orange-400/40 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-xs">
                    {promo.badge}
                  </span>
                  {inCartQty > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                      {inCartQty} en carrito
                    </span>
                  )}
                </div>

                {/* Botón lupa sutil al pasar el mouse */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-end justify-end p-2 pointer-events-none">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    🔍 Ver Flyer
                  </span>
                </div>
              </div>

              {/* Barra inferior de conversión rápida */}
              <div className="p-2.5 sm:p-3 bg-white flex flex-col justify-between gap-2 border-t border-slate-100">
                <div>
                  <h3
                    onClick={() => onSelectPromo(prod)}
                    className="font-black text-xs sm:text-sm text-slate-900 leading-snug line-clamp-1 cursor-pointer hover:text-[#EF233C] transition-colors"
                    title={promo.titulo}
                  >
                    {promo.titulo}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1 m-0 mt-0.5">
                    {promo.subtitulo}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                      Oferta
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black text-[#EF233C]">
                      ${promo.precio}
                    </span>
                  </div>

                  {inCartQty === 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        haptic.add();
                        onAddPromo(prod, e);
                      }}
                      className="bg-gradient-to-r from-[#EF233C] to-orange-600 hover:from-[#D90429] hover:to-orange-500 text-white text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-md shadow-red-500/25 transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      + Sumar
                    </button>
                  ) : (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center bg-slate-900 text-white rounded-xl p-0.5 shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          haptic.selection();
                          onQtyChange(`PROMO-${promo.id}`, inCartQty - 1);
                        }}
                        aria-label="Restar 1"
                        className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center font-black text-sm transition-colors cursor-pointer"
                      >
                        −
                      </button>
                      <span className="px-2 font-mono text-xs sm:text-sm font-black min-w-[24px] text-center">
                        {inCartQty}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          haptic.add();
                          onAddPromo(prod, e);
                        }}
                        aria-label="Sumar 1"
                        className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center font-black text-sm transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
