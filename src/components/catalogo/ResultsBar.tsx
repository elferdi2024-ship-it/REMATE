// filepath: src/components/catalogo/ResultsBar.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { Vista, Producto } from "@/types";
import Buscador from "./Buscador";

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
  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-3.5 mb-6 shadow-xs transition-all relative z-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Left: Ofertas chip or inline search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {ofertasCount && ofertasCount > 0 ? (
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#EF233C] bg-red-50 hover:bg-red-100 border border-red-200/80 px-3.5 py-2 rounded-xl transition-all active:scale-95 shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-[#EF233C] animate-pulse" />
              <span>Ofertas ({ofertasCount})</span>
            </Link>
          ) : null}

          {/* Buscador inline */}
          {onSearchChange && (
            <div className="flex-1 min-w-0 max-w-md">
              <Buscador
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Filtrar por nombre o marca..."
                suggestedProducts={suggestedProducts}
                onSelectSuggestion={onSelectSuggestion}
                variant="light"
              />
            </div>
          )}
        </div>

        {/* Right: Controls (Filters, Quick Order, Sort, Count, View Mode) */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
          {/* Botón Pedido Rápido B2B */}
          {onOpenQuickOrder && (
            <button
              type="button"
              onClick={onOpenQuickOrder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 shrink-0 border border-slate-800"
            >
              <span>⚡ Pedido Rápido</span>
            </button>
          )}

          {/* Botón Filtros Avanzados (Mobile) */}
          {onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl text-xs font-bold text-slate-800 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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

          {/* Ordenar por dropdown */}
          {onSortChange && (
            <div className="relative inline-block">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                aria-label="Ordenar productos"
                className="appearance-none bg-slate-50 border border-slate-200/90 text-slate-800 font-bold text-xs rounded-xl pl-3 pr-8 py-2 outline-none focus:border-slate-400 cursor-pointer h-9 transition-colors"
              >
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Precio: Menor a Mayor</option>
                <option value="precio-desc">Precio: Mayor a Menor</option>
                <option value="nombre-asc">Nombre: A-Z</option>
                <option value="oferta-desc">Ofertas Primero</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          )}

          {/* Item count */}
          <span className="text-xs font-bold text-slate-500 hidden sm:inline-block px-1 font-mono">
            {total} items
          </span>

          {/* View Mode Toggle */}
          <div className="inline-flex items-center bg-slate-100 border border-slate-200/80 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => onToggleVista("grilla")}
              aria-label="Vista de cuadrícula"
              aria-pressed={vista === "grilla"}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                vista === "grilla"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ⊞ Grilla
            </button>
            <button
              type="button"
              onClick={() => onToggleVista("lista")}
              aria-label="Vista de lista"
              aria-pressed={vista === "lista"}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                vista === "lista"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ≡ Lista
            </button>
            <button
              type="button"
              onClick={() => onToggleVista("compacta")}
              aria-label="Vista compacta"
              aria-pressed={vista === "compacta"}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                vista === "compacta"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ☰ Compacta
            </button>
          </div>
        </div>
      </div>

      {marketAd && <div className="mt-3">{marketAd}</div>}
    </div>
  );
}
