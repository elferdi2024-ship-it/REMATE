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
    <section className="relative w-full bg-[#0F172A] text-white border-b border-slate-800 shadow-xs transition-all select-none">
      {/* Fondo degradado suave sin patrones de grilla */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="absolute -top-10 right-1/4 w-72 h-28 bg-[#EF233C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-3.5 sm:px-6 py-3 sm:py-3.5 flex flex-col gap-2">
        {/* Fila 1: Logo, Título, Sucursal y Acceso Usuario */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-white p-1 shadow-sm shrink-0">
              <Image
                src="/logo.png"
                alt="El Remate Mayorista"
                fill
                sizes="44px"
                priority
                className="object-contain p-0.5"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black text-white tracking-tight leading-tight truncate">
                  El Remate <span className="text-[#EF233C]">{sucursalNombre}</span>
                </h1>
                {onChangeBranch && (
                  <button
                    type="button"
                    onClick={onChangeBranch}
                    className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-white underline underline-offset-2 transition-colors shrink-0"
                  >
                    cambiar
                  </button>
                )}
              </div>

              {/* Pilares mayoristas compactos en 1 línea sin cortes */}
              <div className="flex items-center gap-2 text-[10.5px] sm:text-xs text-slate-300 font-medium overflow-hidden">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Precios directos de fábrica
                </span>
                <span className="text-slate-600 shrink-0">•</span>
                <span className="truncate text-slate-300">
                  Stock permanente y despacho directo
                </span>
              </div>
            </div>
          </div>

          {/* Acceso Guía & Usuario */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/tutorial"
              className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors no-underline"
            >
              <span>🎙️ Guía</span>
            </Link>

            {onOpenUser && (
              <button
                onClick={onOpenUser}
                type="button"
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
                  isLoggedIn
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-white/10 text-white border-white/15 hover:bg-white/15"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLoggedIn ? "bg-emerald-400" : "bg-slate-400"}`} />
                <span className="truncate max-w-[90px] sm:max-w-[130px]">
                  {isLoggedIn ? userDisplayName || "Mi Cuenta" : "Ingresar"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Fila 2: Etiquetas Populares sin scrollbar visible */}
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-0.5">
            Lo más pedido:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag.query}
              type="button"
              onClick={() => handleTagClick(tag.query)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-200 bg-white/10 hover:bg-[#EF233C] hover:text-white border border-white/10 hover:border-[#EF233C] px-2.5 py-1 rounded-full whitespace-nowrap transition-all active:scale-95 shrink-0"
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
