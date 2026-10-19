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
    <section className="relative w-full bg-slate-900 text-white border-b border-slate-800 shadow-xs select-none">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-5 py-2.5 sm:py-3 flex flex-col gap-2">
        {/* Fila 1: Título de Sucursal sin recortes de texto + Propuesta de valor */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-white bg-[#EF233C] px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Mayorista
            </span>

            <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-none whitespace-nowrap">
              El Remate <span className="text-red-400 font-black">{sucursalNombre}</span>
            </h1>

            {onChangeBranch && (
              <button
                type="button"
                onClick={onChangeBranch}
                className="text-[10px] text-slate-400 hover:text-white underline underline-offset-2 font-semibold transition-colors shrink-0"
              >
                (cambiar)
              </button>
            )}

            <span className="text-slate-500 hidden sm:inline">•</span>

            <span className="text-[10.5px] sm:text-xs text-slate-300 font-medium hidden xs:inline whitespace-nowrap">
              Precios de fábrica · Stock permanente
            </span>
          </div>

          {/* Acceso a cuenta / tutorial si aplica */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Link
              href="/tutorial"
              className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors no-underline"
            >
              <span>🎙️ Guía Marti</span>
            </Link>

            {onOpenUser && (
              <button
                onClick={onOpenUser}
                type="button"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-full transition-all active:scale-95 shrink-0"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLoggedIn ? "bg-emerald-400" : "bg-slate-400"}`} />
                <span className="max-w-[100px] truncate">
                  {isLoggedIn ? userDisplayName || "Cuenta" : "Ingresar"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Fila 2: Chips rápidos de búsqueda sin cortes de palabras ni scrollbar molesto */}
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-0.5">
            Lo más pedido:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag.query}
              type="button"
              onClick={() => handleTagClick(tag.query)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-200 bg-white/10 hover:bg-[#EF233C] hover:text-white border border-white/10 hover:border-[#EF233C] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-all active:scale-95"
            >
              <span className="text-xs">{tag.emoji}</span>
              <span>{tag.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
