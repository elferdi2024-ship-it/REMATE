// filepath: src/components/catalogo/CategoryRail.tsx
"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { EMOJI_POR_CATEGORIA } from "@/types";
import { haptic } from "@/lib/haptic";

interface CategoryRailProps {
  categorias: string[];
  activeCat: string;
  onSelect: (cat: string) => void;
}

export default function CategoryRail({ categorias, activeCat, onSelect }: CategoryRailProps) {
  const allCategories = ["Todos", ...categorias];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <nav
      aria-label="Navegación de categorías"
      className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-2.5 transition-all"
    >
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-6 items-center snap-x snap-mandatory"
      >
        {allCategories.map((cat, idx) => {
          const isActive = activeCat === cat || (cat === "Todos" && (activeCat === "" || !activeCat));
          const emoji = cat === "Todos" ? "✨" : (EMOJI_POR_CATEGORIA[cat] || "🏷️");
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                haptic.add();
                onSelect(cat);
              }}
              className={`relative shrink-0 snap-start flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-[13px] transition-all duration-200 active:scale-95 select-none ${
                isActive
                  ? "bg-[#EF233C] text-white shadow-sm shadow-[#EF233C]/25"
                  : "bg-slate-50 border border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:text-slate-950 hover:border-slate-300"
              }`}
            >
              <span className="text-sm leading-none">{emoji}</span>
              <span className="whitespace-nowrap tracking-tight">{cat}</span>
              {isActive && (
                <motion.div
                  layoutId="activeCategoryIndicator"
                  className="absolute inset-0 rounded-full ring-2 ring-[#EF233C]/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
