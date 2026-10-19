// filepath: src/components/catalogo/ResultsBar.tsx
// Lucian UX/UI Prompt #047 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#047
"use client";

import React, { useRef, useState, useEffect } from "react";
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

const VISTA_OPTIONS: { id: Vista; label: string; icon: React.ReactNode }[] = [
  {
    id: "grilla",
    label: "Vista cuadrícula",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "lista",
    label: "Vista tabla mayorista",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "compacta",
    label: "Vista compacta",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="4" rx="1" />
        <rect x="3" y="10" width="18" height="4" rx="1" />
        <rect x="3" y="16" width="18" height="4" rx="1" />
      </svg>
    ),
  },
];

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
  onOpenQuickOrder,
}: ResultsBarProps) {
  const isSearchActive = Boolean(searchQuery && searchQuery.trim().length > 0);
  const segRef = useRef<HTMLDivElement>(null);
  const optRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prevIdxRef = useRef<number>(VISTA_OPTIONS.findIndex((o) => o.id === vista));
  const [knobStyle, setKnobStyle] = useState<{ left: string; right: string; dir: "r" | "l" | "none" }>({
    left: "3px",
    right: "66%",
    dir: "none",
  });

  useEffect(() => {
    const seg = segRef.current;
    const idx = Math.max(0, VISTA_OPTIONS.findIndex((o) => o.id === vista));
    const btn = optRefs.current[idx];
    if (!seg || !btn) return;

    const dir = idx === prevIdxRef.current ? "none" : idx > prevIdxRef.current ? "r" : "l";
    prevIdxRef.current = idx;

    const l = btn.offsetLeft;
    const r = seg.clientWidth - btn.offsetLeft - btn.offsetWidth;
    setKnobStyle({
      left: `${l}px`,
      right: `${r}px`,
      dir,
    });
  }, [vista]);

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const nextIdx = (idx + d + VISTA_OPTIONS.length) % VISTA_OPTIONS.length;
    onToggleVista(VISTA_OPTIONS[nextIdx].id);
    optRefs.current[nextIdx]?.focus();
  };

  return (
    <div className="ux w-full bg-white border border-slate-200/85 rounded-2xl p-2.5 sm:p-3.5 mb-5 shadow-[0_6px_20px_-10px_rgba(15,23,42,0.06)] transition-all relative z-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Estado de búsqueda / Total de productos o badge de Ofertas */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {ofertasCount && ofertasCount > 0 ? (
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#EF233C] bg-red-50 hover:bg-red-100 border border-red-200/80 px-2.5 py-1.5 rounded-xl transition-all active:scale-95 shrink-0 no-underline"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF233C] animate-pulse" />
              <span>Ofertas</span>
              <span
                className="rounded-md bg-[#EF233C]/10 px-1.5 py-0.2 text-[10px] font-extrabold tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {ofertasCount}
              </span>
            </Link>
          ) : null}

          {isSearchActive ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xs">
              <span className="truncate max-w-[200px] sm:max-w-xs">
                Resultados para &ldquo;{searchQuery}&rdquo;
              </span>
              <span
                className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] text-white font-extrabold tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {showing}
              </span>
              {onSearchChange && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Limpiar búsqueda"
                  className="w-4 h-4 rounded-full bg-white/20 hover:bg-[#EF233C] text-white flex items-center justify-center text-[10px] font-black transition-colors"
                  title="Borrar término de búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 px-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
              <span>
                <strong
                  className="font-extrabold text-slate-900 tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {total}
                </strong>{" "}
                artículos en stock mayorista
              </span>
            </div>
          )}
        </div>

        {/* Right: Controles compactos (Filtros, Pedido Rápido, Ordenar, Selector Segmentado Lucian #047) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-between sm:justify-end w-full sm:w-auto">
          {/* Botón Pedido Rápido B2B */}
          {onOpenQuickOrder && (
            <button
              type="button"
              onClick={onOpenQuickOrder}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-[#EF233C] text-white rounded-xl text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider transition-all shadow-2xs active:scale-95 shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Pedido Rápido</span>
            </button>
          )}

          {/* Botón Filtros Avanzados (Mobile Sheet) */}
          {onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 transition-colors active:scale-95 shrink-0"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span
                  className="bg-[#EF233C] text-white text-[10px] font-extrabold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}

          {/* Ordenar por selector */}
          {onSortChange && (
            <div className="relative inline-block shrink-0">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                aria-label="Ordenar productos"
                className="appearance-none bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/90 text-slate-800 font-bold text-xs rounded-xl pl-2.5 pr-7 py-1.5 outline-none focus:border-slate-400 cursor-pointer h-8 transition-colors max-w-[130px] sm:max-w-none truncate"
              >
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Menor precio</option>
                <option value="precio-desc">Mayor precio</option>
                <option value="nombre-asc">Nombre: A-Z</option>
                <option value="oferta-desc">Ofertas primero</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          )}

          {/* Segmented Control elástico estilo Lucian #047 */}
          <div
            ref={segRef}
            role="radiogroup"
            aria-label="Modo de visualización del catálogo"
            className="relative inline-grid grid-cols-3 items-center bg-slate-100 border border-slate-200/80 rounded-xl p-[3px] shrink-0"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-[3px] bottom-[3px] rounded-[9px] bg-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.16),0_0_0_1px_rgba(15,23,42,0.06)]"
              style={{
                left: knobStyle.left,
                right: knobStyle.right,
                transition:
                  knobStyle.dir === "r"
                    ? "right 0.28s var(--ux-ease), left 0.46s var(--ux-spring) 0.05s"
                    : knobStyle.dir === "l"
                    ? "left 0.28s var(--ux-ease), right 0.46s var(--ux-spring) 0.05s"
                    : "left 0.25s var(--ux-ease), right 0.25s var(--ux-ease)",
              }}
            />
            {VISTA_OPTIONS.map((opt, i) => {
              const checked = vista === opt.id;
              return (
                <button
                  key={opt.id}
                  ref={(el) => {
                    optRefs.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  aria-label={opt.label}
                  tabIndex={checked ? 0 : -1}
                  onClick={() => onToggleVista(opt.id)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className={`relative z-10 flex h-7 w-7 sm:w-8 items-center justify-center rounded-[9px] transition-all active:scale-90 ${
                    checked ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {opt.icon}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {marketAd && <div className="mt-3">{marketAd}</div>}
    </div>
  );
}
