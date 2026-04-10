"use client";

import React from "react";
import type { Vista } from "@/types";

interface ResultsBarProps {
  showing: number;
  total: number;
  vista: Vista;
  onToggleVista: (v: Vista) => void;
}

export default function ResultsBar({ showing, total, vista, onToggleVista }: ResultsBarProps) {
  return (
    <div className="results-bar">
      <span>
        Mostrando {showing} de {total} productos
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
  );
}
