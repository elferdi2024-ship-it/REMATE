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
}: ResultsBarProps) {
  return (
    <div className="results-bar-wrap">
    <div className="results-bar">
      {ofertasCount && ofertasCount > 0 ? (
        <Link
          href="/ofertas"
          className="results-market-chip active"
          style={{
            textDecoration: "none",
            cursor: "pointer",
            background: "rgba(232, 48, 42, 0.12)",
            border: "1px solid rgba(232, 48, 42, 0.25)",
            color: "#E8302A",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "1px",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232, 48, 42, 0.18)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(232, 48, 42, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(232, 48, 42, 0.12)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span
            className="results-market-dot animate-pulse"
            style={{
              width: "6px",
              height: "6px",
              background: "#E8302A",
              borderRadius: "50%",
              boxShadow: "0 0 8px #E8302A",
            }}
          />
          OFERTAS DESTACADAS ({ofertasCount})
        </Link>
      ) : (
        <div className="results-market-chip">
          <span className="results-market-dot" />
          OFERTAS DESTACADAS
        </div>
      )}

      {/* Buscador inline premium */}
      {onSearchChange && (
        <div className="results-search-wrap">
          <Buscador
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Buscar por nombre, marca o código..."
            suggestedProducts={suggestedProducts}
            onSelectSuggestion={onSelectSuggestion}
            variant="light"
          />
        </div>
      )}

      {/* Contador + toggle vista + Ordenar + Filtros */}
      <div className="results-bar-right" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {/* Botón Filtros Avanzados (Mobile) */}
        {onOpenFilters && (
          <button
            onClick={onOpenFilters}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-[#F5F2EE] hover:bg-[#EDE9E3] border border-[#C8C2B8] rounded-xl text-xs font-bold text-[#3A3330] transition-colors"
            style={{ height: "36px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "2px" }}>
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-[#E8302A] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}

        {/* Ordenar por dropdown */}
        {onSortChange && (
          <div style={{ position: "relative", display: "inline-block" }}>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="sort-select"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--texto, #111)",
                padding: "6px 28px 6px 12px",
                borderRadius: "12px",
                border: "1.5px solid var(--border, #DDD8D0)",
                background: "var(--bg, #fff)",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                height: "36px",
              }}
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: Menor a Mayor</option>
              <option value="precio-desc">Precio: Mayor a Menor</option>
              <option value="nombre-asc">Nombre: A-Z</option>
              <option value="oferta-desc">Ofertas Primero</option>
            </select>
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--muted)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        )}

        <span className="results-count" style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)" }}>
          {total} items
        </span>
        <div className="view-toggle">
          <button
            className={vista === "grilla" ? "active" : ""}
            onClick={() => onToggleVista("grilla")}
            aria-pressed={vista === "grilla"}
          >
            &#9638; Grilla
          </button>
          <button
            className={vista === "lista" ? "active" : ""}
            onClick={() => onToggleVista("lista")}
            aria-pressed={vista === "lista"}
          >
            &#9776; Lista
          </button>
        </div>
      </div>
    </div>
    {marketAd}
    </div>
  );
}
