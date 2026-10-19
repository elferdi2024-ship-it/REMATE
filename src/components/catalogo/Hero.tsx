// filepath: src/components/catalogo/Hero.tsx
"use client";

import React from "react";
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
  { label: "Limpieza", query: "limpieza", emoji: "🧼" },
  { label: "Galletitas", query: "galletitas", emoji: "🍪" },
  { label: "Lácteos", query: "lacteos", emoji: "🥛" },
];

export default function Hero({
  onOpenUser,
  isLoggedIn = false,
  userDisplayName,
  onSearchSubmit,
  onSelectSuggestion,
  sucursalId = null,
  onChangeBranch,
}: HeroProps) {
  const sucursalObj = SUCURSALES.find((s) => s.id === sucursalId);
  const sucursalNombre = sucursalObj ? sucursalObj.nombre : "Canelones";

  const handleTagClick = (query: string) => {
    haptic.add();
    if (onSelectSuggestion) onSelectSuggestion(query);
    else if (onSearchSubmit) onSearchSubmit(query);
  };

  return (
    <section className="relative w-full bg-slate-50/80 border-b border-slate-200/80 select-none transition-colors">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-5 py-2.5 sm:py-3 flex flex-col gap-2">
        {/* Fila 1: Título de Sucursal, badge mayorista y cuenta */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#EF233C] bg-red-50 border border-red-200/70 px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF233C]" />
              Mayorista
            </span>

            <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-none whitespace-nowrap font-display">
              El Remate <span className="text-[#EF233C]">{sucursalNombre}</span>
            </h1>

            {onChangeBranch && (
              <button
                type="button"
                onClick={onChangeBranch}
                className="text-[11px] text-slate-500 hover:text-[#EF233C] underline underline-offset-2 font-bold transition-colors shrink-0"
              >
                (cambiar)
              </button>
            )}

            <span className="text-slate-300 hidden sm:inline">•</span>

            <span className="text-[11px] sm:text-xs text-slate-500 font-medium hidden xs:inline whitespace-nowrap">
              Precios de fábrica · Stock permanente
            </span>
          </div>

          {/* Acceso a cuenta / tutorial */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Link
              href="/tutorial"
              className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 px-2 py-1 rounded-lg transition-colors no-underline shadow-2xs"
            >
              <span>🎙️ Guía Marti</span>
            </Link>

            {onOpenUser && (
              <button
                onClick={onOpenUser}
                type="button"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 px-2.5 py-1 rounded-full transition-all active:scale-95 shrink-0 shadow-2xs"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLoggedIn ? "bg-emerald-500" : "bg-slate-400"}`} />
                <span className="max-w-[100px] truncate font-semibold">
                  {isLoggedIn ? userDisplayName || "Cuenta" : "Ingresar"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Fila 2: Chips rápidos de búsqueda con scroll táctil suave y sin textos cortados */}
        <div className="relative w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 touch-pan-x pr-8">
            <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase tracking-wider text-[#EF233C] bg-red-50 border border-red-200/70 px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
              <span>🔥</span>
              <span>Más pedido:</span>
            </span>

            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag.query}
                type="button"
                onClick={() => handleTagClick(tag.query)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-900 hover:text-white border border-slate-200/90 hover:border-slate-900 px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all active:scale-95 shadow-2xs"
              >
                <span className="text-xs">{tag.emoji}</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>

          {/* Sombra sutil indicadora de scroll derecho */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
