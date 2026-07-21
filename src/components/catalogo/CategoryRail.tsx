"use client";

import React from "react";
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

  return (
    <div className="sticky top-[44px] z-[70] w-full bg-white/70 backdrop-blur-xl border-b border-zinc-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all overflow-hidden py-3">
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1 items-center snap-x snap-mandatory">
        {allCategories.map((cat, idx) => {
          const isActive = activeCat === cat || (cat === "Todos" && activeCat === "");
          const emoji = cat === "Todos" ? "✨" : (EMOJI_POR_CATEGORIA[cat] || "🏷️");
          return (
            <button
              key={idx}
              onClick={() => {
                haptic.add();
                onSelect(cat);
              }}
              className={`relative shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[13px] transition-all duration-300 active:scale-95 ${
                isActive
                  ? "bg-gradient-to-r from-[#E8302A] to-[#B91C1C] text-white shadow-[0_4px_12px_rgba(232,48,42,0.3)]"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-sm"
              }`}
            >
              <span>{emoji}</span>
              <span className="whitespace-nowrap tracking-wide">{cat}</span>
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 border-2 border-red-500 rounded-full"
                  style={{ pointerEvents: "none", mixBlendMode: "overlay" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
