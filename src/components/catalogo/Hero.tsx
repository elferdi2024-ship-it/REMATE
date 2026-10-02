// filepath: src/components/catalogo/Hero.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Producto } from "@/types";
import { SUCURSALES } from "@/lib/sucursales";
import { haptic } from "@/lib/haptic";

interface HeroProps {
  onOpenCart?: () => void;
  cartQty?: number;
  cartTotal?: number;
  onOpenUser?: () => void;
  onShareCart?: () => void;
  isLoggedIn?: boolean;
  userDisplayName?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSearchSubmit?: (q: string) => void;
  suggestedProducts?: Producto[];
  recentSearches?: string[];
  onSelectSuggestion?: (query: string) => void;
  sucursalId?: string | null;
  onChangeBranch?: () => void;
}

const POPULAR_TAGS = [
  { label: "Mayonesa", query: "mayonesa", emoji: "🥫" },
  { label: "Refrescos", query: "refresco", emoji: "🥤" },
  { label: "Hamburguesas", query: "hamburguesa", emoji: "🍔" },
  { label: "Helados", query: "helado", emoji: "🍦" },
  { label: "Cerveza", query: "cerveza", emoji: "🍺" },
  { label: "Aceites", query: "aceite", emoji: "🫗" },
];

export default function Hero({
  onOpenUser,
  isLoggedIn = false,
  userDisplayName,
  onSearchSubmit,
  onSelectSuggestion,
  sucursalId = null,
}: HeroProps) {
  const sucursalObj = SUCURSALES.find((s) => s.id === sucursalId);
  const sucursalNombre = sucursalObj ? sucursalObj.nombre : "Canelones";

  const handleTagClick = (query: string) => {
    haptic.add();
    if (onSelectSuggestion) onSelectSuggestion(query);
    else if (onSearchSubmit) onSearchSubmit(query);
  };

  return (
    <section className="relative w-full bg-gradient-to-r from-[#121624] via-[#1A2038] to-[#121624] text-white border-b border-slate-800 shadow-md transition-all select-none">
      {/* Glow sutil en el fondo sin imágenes ruidosas que rompan el diseño */}
      <div className="absolute top-0 right-1/4 w-72 h-36 bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-36 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 flex flex-col gap-3">
        {/* Fila Principal: Logo, Identidad Mayorista y Accesos Rápidos */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Identidad con Logo Compacto y Tipografía Impecable */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-white/95 p-1 shadow-md shadow-black/40 ring-2 ring-[#EF233C]/60 shrink-0">
              <Image
                src="/logo.png"
                alt="El Remate Mayorista"
                fill
                sizes="56px"
                priority
                className="object-contain p-0.5"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#EF233C] bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF233C] animate-pulse" />
                  Mayorista Oficial
                </span>
                <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                  • Precios directos de fábrica
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white font-display mt-0.5 truncate">
                El Remate{" "}
                <span className="text-[#EF233C]">{sucursalNombre}</span>
              </h1>
            </div>
          </div>

          {/* Micro-perks en Desktop & Acceso Mi Cuenta / Guía Marti */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Link
              href="/tutorial"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-full transition-all shadow-xs"
            >
              <span>🎙️ Guía Marti</span>
            </Link>

            {onOpenUser && (
              <button
                onClick={onOpenUser}
                type="button"
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all shadow-xs ${
                  isLoggedIn
                    ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/60"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700/80"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span className="truncate max-w-[120px]">
                  {isLoggedIn ? userDisplayName || "Mi Cuenta" : "Iniciar Sesión"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Fila de Etiquetas Rápidas (Popular Shortcuts) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5 pb-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 hidden sm:inline">
            Lo más pedido:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag.query}
              type="button"
              onClick={() => handleTagClick(tag.query)}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 px-2.5 py-1 rounded-full whitespace-nowrap transition-all active:scale-95 shrink-0 shadow-2xs"
            >
              <span>{tag.emoji}</span>
              <span>{tag.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
