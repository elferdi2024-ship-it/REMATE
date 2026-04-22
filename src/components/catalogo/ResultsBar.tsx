// filepath: src/components/catalogo/ResultsBar.tsx
"use client";

import React from "react";
import type { Vista } from "@/types";

interface ResultsBarProps {
  showing: number;
  total: number;
  vista: Vista;
  onToggleVista: (v: Vista) => void;
  searchQuery?: string;
  onSearchChange?: (v: string) => void;
}

export default function ResultsBar({
  showing,
  total,
  vista,
  onToggleVista,
  searchQuery = "",
  onSearchChange,
}: ResultsBarProps) {
  return (
    <div className="results-bar">
      {/* Buscador inline */}
      {onSearchChange && (
        <div className="results-search-wrap">
          <span className="results-search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="results-search-input"
            placeholder="Buscar producto..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar productos"
          />
          {searchQuery && (
            <button
              className="results-search-clear"
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Contador + toggle vista */}
      <div className="results-bar-right">
        <span className="results-count">
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
  );
}
