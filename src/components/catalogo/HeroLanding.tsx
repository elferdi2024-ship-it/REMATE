// filepath: src/components/catalogo/HeroLanding.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, ShoppingCart, MessageCircle } from "lucide-react";
import { SUCURSALES } from "@/lib/sucursales";

interface HeroLandingProps {
  selectedSucursal: string;
  onOpenSucursalModal?: () => void;
  onSelectSucursal?: (id: string) => void;
  onEnterCatalog?: (id: string) => void;
}

export default function HeroLanding({
  selectedSucursal,
  onSelectSucursal,
  onEnterCatalog,
}: HeroLandingProps) {
  const activeSucursal = SUCURSALES.find((s) => s.id === selectedSucursal) || null;

  const handleBranchClick = (id: string) => {
    if (onEnterCatalog) {
      onEnterCatalog(id);
    } else if (onSelectSucursal) {
      onSelectSucursal(id);
    }
  };

  return (
    <section className="relative w-full bg-gradient-to-b from-[#0F172A] via-[#171117] to-[#1A080A] text-white overflow-hidden border-b border-white/10">
      {/* Fondo sutil */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/hero-bg.jpg"
          alt="Distribuidora El Remate Canelones"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/90 via-[#1A0B0E]/85 to-[#0F172A]/95" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-8 sm:py-10 flex flex-col items-center text-center">
        {/* Marca compacta */}
        <div className="flex items-center justify-center gap-3 mb-3.5">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
            <Image
              src="/logo.png"
              alt="Distribuidora El Remate"
              fill
              sizes="64px"
              className="object-contain drop-shadow-[0_4px_14px_rgba(239,35,60,0.45)]"
              priority
            />
          </div>
          <div className="text-left">
            <span className="inline-block bg-[#EF233C] text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-md">
              Mayorista y Minorista
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-300 mt-1 m-0 leading-none">
              Distribuidora El Remate · Canelones
            </p>
          </div>
        </div>

        {/* Título corto y directo */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1] max-w-2xl mb-4">
          Entrá al catálogo y armá tu pedido{" "}
          <span className="text-[#EF233C]">en 1 minuto</span>
        </h1>

        {/* CTA Principal Inmediato — 1 toque al catálogo */}
        <div className="w-full max-w-md mb-5">
          {activeSucursal ? (
            <button
              type="button"
              onClick={() => handleBranchClick(activeSucursal.id)}
              className="w-full bg-[#EF233C] hover:bg-[#C01730] text-white rounded-2xl px-6 py-4 font-extrabold text-base sm:text-lg tracking-tight flex items-center justify-center gap-2.5 shadow-[0_12px_30px_-6px_rgba(239,35,60,0.55)] ring-2 ring-white/15 active:scale-[0.98] transition-all cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 shrink-0" />
              <span>Entrar al Catálogo · {activeSucursal.nombre}</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>
          ) : (
            <Link
              href="/seleccionar-sucursal"
              className="w-full bg-[#EF233C] hover:bg-[#C01730] text-white rounded-2xl px-6 py-4 font-extrabold text-base sm:text-lg tracking-tight flex items-center justify-center gap-2.5 shadow-[0_12px_30px_-6px_rgba(239,35,60,0.55)] ring-2 ring-white/15 active:scale-[0.98] transition-all no-underline"
            >
              <ShoppingCart className="w-5 h-5 shrink-0" />
              <span>Ver Catálogo Online</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </Link>
          )}
        </div>

        {/* Selector directo de sucursal (1 toque -> entra al catálogo) */}
        <div className="w-full max-w-4xl bg-white/[0.05] backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 mb-2.5 px-0.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#EF233C] shrink-0" />
              <span>
                {activeSucursal
                  ? "O elegí otra sucursal para entrar directo:"
                  : "Elegí tu sucursal para entrar directo al catálogo:"}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {SUCURSALES.map((sucursal) => {
              const isSelected = selectedSucursal === sucursal.id;
              return (
                <button
                  key={sucursal.id}
                  type="button"
                  onClick={() => handleBranchClick(sucursal.id)}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 active:scale-[0.97] group ${
                    isSelected
                      ? "bg-[#EF233C] border-[#EF233C] text-white shadow-md shadow-[#EF233C]/30"
                      : "bg-slate-900/80 border-white/10 text-slate-100 hover:border-[#EF233C] hover:bg-slate-900"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-[13px] font-extrabold tracking-tight truncate">
                      {sucursal.nombre}
                    </div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        isSelected ? "text-white/85" : "text-slate-400"
                      }`}
                    >
                      {sucursal.direccion}
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isSelected ? "text-white" : "text-slate-400 group-hover:text-[#EF233C]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Línea compacta de confianza + WhatsApp */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-300">
          <span>✓ +1.900 productos</span>
          <span className="text-white/25">•</span>
          <span>✓ Envío 24-48h</span>
          <span className="text-white/25">•</span>
          <span>✓ Pago contra entrega</span>
          <a
            href="https://wa.me/59899322325"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-2"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp directo</span>
          </a>
        </div>
      </div>
    </section>
  );
}
