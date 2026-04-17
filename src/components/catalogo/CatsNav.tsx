"use client";

import React from "react";
import { EMOJI_POR_CATEGORIA } from "@/types";

interface CatsNavProps {
  categorias: string[];
  activeCat: string;
  onSelect: (cat: string) => void;
}

export default function CatsNav({ categorias, activeCat, onSelect }: CatsNavProps) {
  return (
    <nav className="sticky-nav" aria-label="Categorías de productos">
      <div className="cats-wrap">
        <div className="cats-inner-circular">
          {categorias.map((cat) => {
            const emoji = EMOJI_POR_CATEGORIA[cat] || "📦";
            const isActive = cat === activeCat;
            return (
              <button
                key={cat}
                className={`cat-circle-btn${isActive ? " active" : ""}`}
                onClick={() => onSelect(cat)}
                aria-pressed={isActive}
              >
                <div className="cat-circle-icon">{emoji}</div>
                <span className="cat-circle-label">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
