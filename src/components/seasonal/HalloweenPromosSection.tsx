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
    const amount = 180;
    scrollContainerRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section
      aria-label="Ofertas Especiales de Halloween"
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1A0D26] via-[#13091C] to-[#0D0714] border border-orange-500/40 shadow-[0_8px_24px_rgba(249,115,22,0.15)] text-white p-2.5 sm:p-4 my-1.5 sm:my-2.5 select-none"
    >
      {/* Glows decorativos de fondo */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full bg-orange-500/20 blur-[65px]" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-[#EF233C]/20 blur-[70px]" />

      {/* Telaraña SVG sutil en esquina superior derecha */}
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 text-orange-400/15"
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

      {/* Encabezado Ultra-Compacto (1 sola franja en móvil y desktop) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-2 mb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 via-[#EF233C] to-amber-600 p-[1.5px] shadow-md shadow-orange-500/25 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#160B20] rounded-[10px] flex items-center justify-center text-base sm:text-xl">
              🎃
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xs sm:text-base md:text-lg font-black tracking-tight uppercase font-display leading-none text-white m-0">
                Especial{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-[#EF233C]">
                  Halloween
                </span>
              </h2>
              <span className="bg-[#EF233C] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none">
                5 Promos
              </span>
              {itemsInCartCount > 0 && (
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  ✓ {itemsInCartCount}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-300/90 font-medium truncate m-0 mt-0.5">
              Tocá una placa para ampliar o sumá directo al pedido
            </p>
          </div>
        </div>

        {/* Controles compactos a la derecha */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={handleAddFullPack}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer ${
              comboAddedFlash
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-gradient-to-r from-orange-500 to-[#EF233C] hover:from-orange-400 hover:to-red-500 text-white shadow-orange-500/20 border border-orange-300/30"
            }`}
          >
            <span>{comboAddedFlash ? "✓ ¡Pack Listo!" : "🍬 Pack x5"}</span>
            <span className="bg-black/25 px-1.5 py-0.5 rounded-md font-mono text-[10px] sm:text-xs">
              ${totalComboPrice}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              haptic.selection();
              setMobileGridMode((prev) => !prev);
            }}
            className="lg:hidden text-[10px] font-bold text-orange-200 bg-white/10 hover:bg-white/15 border border-white/15 px-2 py-1.5 rounded-xl transition-colors"
          >
            {mobileGridMode ? "Carrusel" : "Grilla"}
          </button>

          {!mobileGridMode && (
            <div className="hidden sm:flex lg:hidden items-center gap-1">
              <button
                type="button"
                onClick={() => scrollHorizontal("left")}
                aria-label="Anterior"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white text-sm font-black"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scrollHorizontal("right")}
                aria-label="Siguiente"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white text-sm font-black"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Carrusel / Grilla Compacta de las 5 Placas 1:1 (En móvil se ven ~2.2 tarjetas a la vez y entran completas en pantalla) */}
      <div
        ref={scrollContainerRef}
        className={
          mobileGridMode
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3"
            : "flex lg:grid lg:grid-cols-5 gap-2.5 sm:gap-3 overflow-x-auto lg:overflow-visible no-scrollbar snap-x snap-mandatory pb-0.5"
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
                  : "w-[152px] xs:w-[162px] sm:w-[190px] lg:w-full shrink-0 snap-start"
              } group relative rounded-xl sm:rounded-2xl bg-white text-slate-900 overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                inCartQty > 0
                  ? "ring-2 ring-orange-500 shadow-[0_6px_20px_rgba(249,115,22,0.35)]"
                  : "border border-white/20 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
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
                  sizes="(max-width: 640px) 165px, (max-width: 1024px) 200px, 230px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />

                {/* Badge flotante compacto */}
                <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 pointer-events-none">
                  <span className="bg-slate-950/80 backdrop-blur-xs text-orange-300 border border-orange-400/40 text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-xs truncate">
                    {promo.destaque || promo.badge}
                  </span>
                  {inCartQty > 0 && (
                    <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm shrink-0">
                      ×{inCartQty}
                    </span>
                  )}
                </div>
              </div>

              {/* Barra inferior compacta: Título 1 línea + Precio + Botón Sumar */}
              <div className="p-2 sm:p-2.5 bg-white flex flex-col justify-between gap-1.5 border-t border-slate-100">
                <h3
                  onClick={() => onSelectPromo(prod)}
                  className="font-extrabold text-[11px] sm:text-xs text-slate-900 leading-tight truncate cursor-pointer hover:text-[#EF233C] transition-colors m-0"
                  title={promo.titulo}
                >
                  {promo.titulo}
                </h3>

                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-mono text-sm sm:text-base font-black text-[#EF233C] leading-none">
                    ${promo.precio}
                  </span>

                  {inCartQty === 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        haptic.add();
                        onAddPromo(prod, e);
                      }}
                      className="bg-gradient-to-r from-[#EF233C] to-orange-600 hover:from-[#D90429] hover:to-orange-500 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      + Sumar
                    </button>
                  ) : (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center bg-slate-900 text-white rounded-lg p-0.5 shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          haptic.selection();
                          onQtyChange(`PROMO-${promo.id}`, inCartQty - 1);
                        }}
                        aria-label="Restar 1"
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-md hover:bg-white/15 flex items-center justify-center font-black text-xs transition-colors cursor-pointer"
                      >
                        −
                      </button>
                      <span className="px-1.5 font-mono text-[11px] font-black min-w-[18px] text-center">
                        {inCartQty}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          haptic.add();
                          onAddPromo(prod, e);
                        }}
                        aria-label="Sumar 1"
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center font-black text-xs transition-colors cursor-pointer"
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
