// filepath: src/components/catalogo/ResultsBar.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Vista } from "@/types";

interface ResultsBarProps {
  showing: number;
  total: number;
  vista: Vista;
  onToggleVista: (v: Vista) => void;
  searchQuery?: string;
  onSearchChange?: (v: string) => void;
  marketAd?: React.ReactNode;
}

export default function ResultsBar({
  showing,
  total,
  vista,
  onToggleVista,
  searchQuery = "",
  onSearchChange,
  marketAd,
}: ResultsBarProps) {
  const [inputValue, setInputValue] = useState(searchQuery || "");

  useEffect(() => {
    setInputValue(searchQuery || "");
  }, [searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onSearchChange?.(val);
  };

  return (
    <div className="results-bar-wrap">
    <div className="results-bar">
      <div className="results-market-chip">
        <span className="results-market-dot" />
        OFERTAS DESTACADAS
      </div>

      {/* Buscador inline premium */}
      {onSearchChange && (
        <div className="results-search-wrap">
          <span className="results-search-icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="search-icon-svg"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            className="results-search-input"
            placeholder="Buscar por nombre, marca o código..."
            value={inputValue}
            onChange={handleChange}
            aria-label="Buscar productos"
          />
          {inputValue && (
            <button
              className="results-search-clear"
              onClick={() => {
                setInputValue("");
                onSearchChange("");
              }}
              aria-label="Limpiar búsqueda"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
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
    {marketAd}
    </div>
  );
}
