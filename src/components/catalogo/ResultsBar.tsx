// filepath: src/components/catalogo/ResultsBar.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { Vista, Producto } from "@/types";

interface ResultsBarProps {
  showing: number;
  total: number;
  vista: Vista;
  onToggleVista: (v: Vista) => void;
  searchQuery?: string;
  onSearchChange?: (v: string) => void;
  marketAd?: React.ReactNode;
  ofertasCount?: number;
  sortBy?: string;
  onSortChange?: (val: string) => void;
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
  suggestedProducts?: Producto[];
  onSelectSuggestion?: (term: string) => void;
  onOpenQuickOrder?: () => void;
}

export default function ResultsBar({
  showing,
  total,
  vista,
  onToggleVista,
  searchQuery = "",
  onSearchChange,
  marketAd,
  ofertasCount,
  sortBy = "relevancia",
  onSortChange,
  onOpenFilters,
  activeFiltersCount = 0,
  suggestedProducts = [],
  onSelectSuggestion,
  onOpenQuickOrder,
}: ResultsBarProps) {
  const isSearchActive = Boolean(searchQuery && searchQuery.trim().length > 0);

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3.5 mb-5 shadow-xs transition-all relative z-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Estado de búsqueda / Total de productos o badge de Ofertas */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {ofertasCount && ofertasCount > 0 ? (
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#EF233C] bg-red-50 hover:bg-red-100 border border-red-200/80 px-2.5 py-1.5 rounded-xl transition-all active:scale-95 shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF233C] animate-pulse" />
              <span>Ofertas ({ofertasCount})</span>
            </Link>
          ) : null}

          {isSearchActive ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50/90 border border-red-200 text-xs font-bold text-[#EF233C]">
              <span className="truncate max-w-[200px] sm:max-w-xs">
                Resultados para: &ldquo;{searchQuery}&rdquo;
              </span>
              <span className="font-mono text-[10px] text-red-500 font-extrabold">({showing})</span>
              {onSearchChange && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Limpiar búsqueda"
                  className="w-4 h-4 rounded-full bg-red-200/80 hover:bg-red-300 text-red-900 flex items-center justify-center text-[10px] font-black transition-colors"
                  title="Borrar término de búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 px-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                <strong className="font-bold text-slate-900">{total}</strong> productos disponibles
              </span>
            </div>
          )}
        </div>

        {/* Right: Controles compactos (Filtros, Pedido Rápido, Ordenar, Modo de Vista) */}
        <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
          {/* Botón Pedido Rápido B2B */}
          {onOpenQuickOrder && (
            <button
              type="button"
              onClick={onOpenQuickOrder}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 shrink-0 border border-slate-800"
            >
              <span>⚡ Pedido Rápido</span>
            </button>
          )}

          {/* Botón Filtros Avanzados (Mobile Sheet) */}
          {onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl text-xs font-bold text-slate-800 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#EF233C] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}

          {/* Ordenar por selector */}
          {onSortChange && (
            <div className="relative inline-block">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                aria-label="Ordenar productos"
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800 font-bold text-xs rounded-xl pl-2.5 pr-7 py-1.5 outline-none focus:border-slate-400 cursor-pointer h-8 transition-colors"
              >
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Precio: Menor</option>
                <option value="precio-desc">Precio: Mayor</option>
                <option value="nombre-asc">Nombre: A-Z</option>
                <option value="oferta-desc">Ofertas Primero</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          )}

          {/* Toggle Vista: Grilla / Lista / Compacta */}
          <div className="inline-flex items-center bg-slate-100 border border-slate-200/80 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => onToggleVista("grilla")}
              aria-label="Vista cuadrícula"
              aria-pressed={vista === "grilla"}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                vista === "grilla"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ⊞
            </button>
            <button
              type="button"
              onClick={() => onToggleVista("lista")}
              aria-label="Vista lista"
              aria-pressed={vista === "lista"}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                vista === "lista"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ≡
            </button>
            <button
              type="button"
              onClick={() => onToggleVista("compacta")}
              aria-label="Vista compacta"
              aria-pressed={vista === "compacta"}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                vista === "compacta"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {marketAd && <div className="mt-3">{marketAd}</div>}
    </div>
  );
}
