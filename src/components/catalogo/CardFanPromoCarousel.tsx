// filepath: src/components/catalogo/CardFanPromoCarousel.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, PanInfo } from "framer-motion";
import type { PremiumPromo } from "@/types/ofertas";
import type { Producto } from "@/types";
import { haptic } from "@/lib/haptic";

interface CardFanPromoCarouselProps {
  promos: PremiumPromo[];
  onSelectPromo: (producto: Producto) => void;
  onAddPromo: (producto: Producto, e: React.MouseEvent) => void;
  onQtyChange: (codigo: string, qty: number) => void;
  qtyMap: Record<string, number>;
}

export default function CardFanPromoCarousel({
  promos,
  onSelectPromo,
  onAddPromo,
  qtyMap,
}: CardFanPromoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [viewMode, setViewMode] = useState<"fan" | "grid">("fan");
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const promosVisibles = promos.filter((p) => p.activa && p.imagen);
  const total = promosVisibles.length;

  useEffect(() => {
    if (total <= 1 || isHovered) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [total, isHovered]);

  if (total === 0) return null;

  const handlePrev = () => {
    haptic.add();
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    haptic.add();
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -30) {
      handleNext();
    } else if (info.offset.x > 30) {
      handlePrev();
    }
  };

  return (
    <section className="relative w-full overflow-hidden sm:rounded-[36px] bg-gradient-to-b from-[#161C30] via-[#0E1324] to-[#080B15] border-y sm:border border-slate-800 text-white pt-4 pb-3.5 px-3.5 sm:p-6 shadow-2xl select-none">
      {/* Glow ambiental de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-[110px] pointer-events-none" />

      {/* Header con Logo Grande y Tipografía Impactante */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-3 px-1 sm:px-2">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Logo Oficial Grande con Glow */}
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-white p-1 shadow-xl shadow-red-500/30 ring-2 sm:ring-4 ring-[#EF233C] shrink-0">
            <Image
              src="/logo.png"
              alt="El Remate Canelones"
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-2xl md:text-3xl font-black uppercase tracking-tight italic font-display m-0 flex items-center gap-1.5 leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-red-400 drop-shadow-[0_2px_12px_rgba(239,35,60,0.5)]">
                  OFERTAS DE REMATE!
                </span>
                <span className="text-sm sm:text-xl animate-bounce">🔥</span>
              </h2>
              <span className="bg-gradient-to-r from-[#EF233C] to-red-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md shadow-red-500/40 border border-red-400/40 shrink-0">
                6 PROMOS
              </span>
            </div>
            <p className="text-[11px] sm:text-sm text-slate-300 font-bold tracking-tight mt-1 m-0">
              Precios especiales por unidad y descuento mayorista por caja
            </p>
          </div>
        </div>

        {/* Controles de Navegación */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "fan" ? "grid" : "fan")}
            className="hidden md:flex items-center gap-1 text-xs font-black uppercase tracking-wider text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl transition-all shadow-xs"
            title="Cambiar formato de visualización"
          >
            {viewMode === "fan" ? "Vista Cinta" : "Vista Abanico 3D"}
          </button>

          <button
            type="button"
            onClick={handlePrev}
            aria-label="Oferta anterior"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-100 flex items-center justify-center text-base sm:text-lg font-black transition-all active:scale-95 shadow-sm"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Siguiente oferta"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-100 flex items-center justify-center text-base sm:text-lg font-black transition-all active:scale-95 shadow-sm"
          >
            ›
          </button>
        </div>
      </div>

      {viewMode === "fan" ? (
        /* Vista Abanico 3D Grande y Legible */
        <div
          className="relative w-full h-[355px] sm:h-[380px] md:h-[405px] flex items-center justify-center overflow-visible"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative w-full max-w-[740px] h-full flex items-center justify-center">
            {promosVisibles.map((promo, idx) => {
              let diff = idx - activeIndex;
              if (diff > total / 2) diff -= total;
              if (diff < -total / 2) diff += total;

              const isCenter = diff === 0;
              const isVisible = Math.abs(diff) <= 2;
              if (!isVisible) return null;

              const spreadMult = isHovered ? 1.16 : 1.0;
              const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
              const stepX = isMobile ? 100 : 140;

              const xOffset = diff * stepX * spreadMult;
              const yOffset = 0;
              const rotation = diff * 6.0;
              const scale = isCenter ? 1.0 : Math.max(0.82, 1 - Math.abs(diff) * 0.1);
              const zIndex = 30 - Math.abs(diff) * 10;
              const opacity = isCenter ? 1 : Math.max(0.45, 1 - Math.abs(diff) * 0.28);

              const promoProduct: Producto = {
                codigo: `PROMO-${promo.id}`,
                nombre: promo.titulo,
                precio: promo.precio || 0,
                categoria: "OFERTAS DE REMATE!",
                imagen: promo.imagen,
                destacado: true,
                escalaPrecios: promo.escalaPrecios,
              };

              const inCartQty = qtyMap[`PROMO-${promo.id}`] || 0;

              return (
                <motion.div
                  key={promo.id}
                  drag={isCenter ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (!isCenter) {
                      haptic.add();
                      setActiveIndex(idx);
                    } else {
                      onSelectPromo(promoProduct);
                    }
                  }}
                  animate={{
                    x: xOffset,
                    y: yOffset,
                    rotate: rotation,
                    scale,
                    opacity,
                    zIndex,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 24,
                  }}
                  className={`absolute w-[240px] sm:w-[265px] md:w-[285px] h-[335px] sm:h-[355px] md:h-[375px] rounded-3xl bg-white text-slate-950 p-4 sm:p-4.5 flex flex-col justify-between cursor-pointer select-none transition-shadow ${
                    isCenter
                      ? "border-2 border-[#EF233C] shadow-[0_24px_55px_rgba(239,35,60,0.38)] ring-4 ring-[#EF233C]/20"
                      : "border border-slate-200/90 shadow-md hover:border-slate-400"
                  }`}
                  style={{ transformOrigin: "bottom center" }}
                >
                  {/* Badge en esquina */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#EF233C] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
                      🔥 Oferta #{idx + 1}
                    </span>
                    {promo.escalaPrecios && promo.escalaPrecios.length > 0 && (
                      <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-lg">
                        Caja x{promo.escalaPrecios[0].minCantidad}
                      </span>
                    )}
                  </div>

                  {/* Imagen ampliada */}
                  <div className="relative w-full aspect-square max-h-[165px] sm:max-h-[185px] md:max-h-[200px] rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1">
                    <Image
                      src={promo.imagen}
                      alt={promo.titulo}
                      fill
                      sizes="(max-width: 640px) 240px, 285px"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      priority={isCenter}
                    />
                    {isCenter && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/15 transition-colors flex items-center justify-center">
                        <span className="opacity-0 hover:opacity-100 transition-opacity bg-slate-900/90 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                          🔍 Ver Detalle
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Título en tipografía clara y destacada */}
                  <div className="min-h-[2.85rem] sm:min-h-[3.2rem] flex items-center justify-center my-0.5 px-0.5">
                    <h4
                      className="font-black text-sm sm:text-base text-slate-950 line-clamp-2 leading-snug tracking-tight text-center font-display"
                      title={promo.titulo}
                    >
                      {promo.titulo}
                    </h4>
                  </div>

                  {/* Precios y Botón de Acción */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-auto">
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xl sm:text-2xl font-black text-[#EF233C] leading-none">
                        ${promo.precio?.toLocaleString("es-UY")}
                      </span>
                      {promo.escalaPrecios && promo.escalaPrecios.length > 0 ? (
                        <span className="text-[11px] sm:text-xs font-black text-emerald-700 leading-tight truncate mt-0.5">
                          ${promo.escalaPrecios[0].precioUnitario} x caja
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400">Unidad</span>
                      )}
                    </div>

                    {isCenter && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          haptic.add();
                          onAddPromo(promoProduct, e);
                        }}
                        className="bg-[#EF233C] hover:bg-[#C01730] text-white text-xs sm:text-sm font-black px-4 py-2.5 rounded-xl shadow-lg shadow-red-500/40 transition-all active:scale-95 shrink-0 uppercase tracking-wider"
                      >
                        {inCartQty > 0 ? `+1 (${inCartQty})` : "AGREGAR"}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Vista Cinta Horizontal */
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2 pt-1 snap-x">
          {promosVisibles.map((promo) => {
            const promoProduct: Producto = {
              codigo: `PROMO-${promo.id}`,
              nombre: promo.titulo,
              precio: promo.precio || 0,
              categoria: "OFERTAS DE REMATE!",
              imagen: promo.imagen,
              destacado: true,
              escalaPrecios: promo.escalaPrecios,
            };

            const inCartQty = qtyMap[`PROMO-${promo.id}`] || 0;

            return (
              <div
                key={promo.id}
                onClick={() => onSelectPromo(promoProduct)}
                className="flex-shrink-0 w-[210px] sm:w-[240px] snap-start rounded-3xl bg-white text-slate-950 border border-slate-200 p-4 flex flex-col justify-between hover:border-[#EF233C] transition-all cursor-pointer"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white mb-2 p-1">
                  <Image
                    src={promo.imagen}
                    alt={promo.titulo}
                    fill
                    sizes="(max-width: 640px) 210px, 240px"
                    className="object-contain"
                  />
                </div>
                <div className="min-h-[2.85rem] flex items-center mb-1">
                  <h4 className="font-black text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug font-display">
                    {promo.titulo}
                  </h4>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-mono text-lg sm:text-xl font-black text-[#EF233C]">
                      ${promo.precio}
                    </span>
                    {promo.escalaPrecios && promo.escalaPrecios.length > 0 && (
                      <div className="text-[11px] font-black text-emerald-700">
                        ${promo.escalaPrecios[0].precioUnitario} x caja
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPromo(promoProduct, e);
                    }}
                    className="bg-[#EF233C] text-white text-xs font-black px-4 py-2 rounded-xl"
                  >
                    {inCartQty > 0 ? `+1 (${inCartQty})` : "+ AGREGAR"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginador Circular */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 mt-2">
        {promosVisibles.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              haptic.add();
              setActiveIndex(idx);
            }}
            aria-label={`Ir a oferta ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === activeIndex
                ? "w-8 bg-[#EF233C] shadow-[0_0_10px_rgba(239,35,60,0.9)]"
                : "w-2 bg-slate-700 hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
