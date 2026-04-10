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
    <nav className="sticky-nav" aria-label="Categor\u00edas de productos">
      <div className="cats-wrap">
        <div className="cats-inner">
          {categorias.map((cat) => {
            const emoji = EMOJI_POR_CATEGORIA[cat] || "\ud83d\udce6";
            const isActive = cat === activeCat;
            return (
              <button
                key={cat}
                className={`cat-pill${isActive ? " active" : ""}`}
                onClick={() => onSelect(cat)}
                aria-pressed={isActive}
              >
                {emoji} {cat}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
