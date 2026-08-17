// filepath: src/components/catalogo/HeroLanding.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SUCURSALES } from "@/lib/sucursales";

interface HeroLandingProps {
  selectedSucursal: string;
  onOpenSucursalModal?: () => void;
  onSelectSucursal?: (id: string) => void;
}

export default function HeroLanding({ 
  selectedSucursal, 
  onOpenSucursalModal,
  onSelectSucursal 
}: HeroLandingProps) {
  const sucursalNombre = SUCURSALES.find(s => s.id === selectedSucursal)?.nombre || "";

  return (
    <section className="relative w-full bg-gradient-to-b from-[#7F1D1D] via-[#450A0A] to-[#1F0404] text-white overflow-hidden min-h-[85vh] flex items-center border-b border-red-900/60 shadow-xl">
      {/* Background with optimized overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Distribuidora El Remate Canelones"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#450A0A]/90 via-[#7F1D1D]/75 to-[#1F0404]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F0404] via-transparent to-[#450A0A]/70" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center flex flex-col items-center">
        {/* Brand Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="Distribuidora El Remate"
            width={180}
            height={180}
            className="object-contain max-w-[200px] h-auto drop-shadow-xl"
            priority
          />
        </div>

        {/* Badges / Header Context */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="bg-[#EF233C] text-white text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-md shadow-xs">
            Venta Mayorista y Minorista
          </span>
          <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
            Distribuidora Oficial · Canelones
          </span>
          {selectedSucursal && (
            <button
              type="button"
              onClick={onOpenSucursalModal}
              className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-md transition-all hover:bg-emerald-900/60 active:scale-95 flex items-center gap-1.5"
            >
              <span>🏪</span> {sucursalNombre.toUpperCase()} ✎
            </button>
          )}
        </div>

        {/* Main Title */}
        <h1 className="font-bebas text-4xl sm:text-6xl lg:text-7xl tracking-wide leading-none text-white mb-3 max-w-4xl">
          PRECIOS MAYORISTAS DIRECTOS
          <span className="block text-[#EF233C] mt-1">
            SIN INTERMEDIARIOS
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
          Abastecé tu comercio, almacén o tu hogar con stock garantizado en alimentos, bebidas y limpieza con despacho express en Canelones.
        </p>

        {/* Interactive Branch Selector Matrix */}
        <div className="w-full max-w-4xl mx-auto mb-8 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-6 text-center shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-3.5">
            <span className="text-sm">🏪</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              SELECCIONÁ TU SUCURSAL MÁS CERCANA:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {SUCURSALES.map((sucursal) => {
              const isSelected = selectedSucursal === sucursal.id;
              return (
                <button
                  key={sucursal.id}
                  type="button"
                  onClick={() => onSelectSucursal?.(sucursal.id)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1 select-none active:scale-95 ${
                    isSelected
                      ? "bg-[#EF233C] border-[#EF233C] text-white shadow-md shadow-[#EF233C]/30 ring-2 ring-white/20"
                      : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold tracking-tight truncate w-full">
                    {sucursal.nombre}
                  </span>
                  <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${
                    isSelected ? "bg-white text-[#EF233C]" : "bg-slate-800 text-slate-400"
                  }`}>
                    {isSelected ? "Activo ✓" : "Ver Catálogo"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex gap-3.5 flex-wrap justify-center mb-10 items-center">
          {selectedSucursal ? (
            <Link
              href={`/catalogo?sucursal=${selectedSucursal}`}
              className="bg-[#EF233C] hover:bg-[#C01730] text-white rounded-xl px-7 py-3.5 font-bold text-sm sm:text-base tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-[#EF233C]/25 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <span>🛒 Ver Catálogo de {sucursalNombre}</span>
              <span>→</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onOpenSucursalModal}
              className="bg-[#EF233C] hover:bg-[#C01730] text-white rounded-xl px-7 py-3.5 font-bold text-sm sm:text-base tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-[#EF233C]/25 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <span>🛒 Seleccionar Sucursal y Entrar</span>
              <span>→</span>
            </button>
          )}

          <a
            href="https://wa.me/59899322325"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-900/40 text-emerald-400 border border-emerald-600/40 hover:bg-emerald-900/60 rounded-xl px-6 py-3.5 font-bold text-sm tracking-wider uppercase flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <span>💬 WhatsApp Directo</span>
          </a>
        </div>

        {/* Confidence Stats Data Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 border border-slate-800 rounded-2xl bg-slate-900/80 backdrop-blur-md w-full max-w-3xl overflow-hidden">
          <div className="p-3.5 text-center">
            <div className="font-bebas text-2xl sm:text-3xl text-[#EF233C] leading-none">1900+</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Productos en Stock</div>
          </div>
          <div className="p-3.5 text-center">
            <div className="font-bebas text-2xl sm:text-3xl text-white leading-none">6</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Sucursales Canelones</div>
          </div>
          <div className="p-3.5 text-center">
            <div className="font-bebas text-2xl sm:text-3xl text-emerald-400 leading-none">24-48h</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Despacho Express</div>
          </div>
          <div className="p-3.5 text-center">
            <div className="font-bebas text-2xl sm:text-3xl text-amber-400 leading-none">100%</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Pago Contra Entrega</div>
          </div>
        </div>
      </div>
    </section>
  );
}
