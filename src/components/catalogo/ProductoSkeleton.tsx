// filepath: src/components/catalogo/ProductoSkeleton.tsx
import React from "react";

export function ProductoSkeleton() {
  return (
    <div
      className="relative flex flex-col bg-white border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.04)] overflow-hidden"
      style={{ minHeight: "294px" }}
    >
      {/* Fondo de Shimmer */}
      <div className="absolute inset-0 z-0 pointer-events-none skeleton-shimmer" />

      {/* Elementos internos z-10 para quedar sobre el shimmer */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Image Stage Placeholder */}
        <div className="relative w-full aspect-square bg-slate-100/90 rounded-xl mb-2.5">
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/80" />
          <div className="absolute bottom-2 right-2 w-10 h-10 rounded-xl bg-slate-200/80" />
        </div>

        {/* Category & Brand Pill Placeholder */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-20 h-4 bg-slate-100 rounded-md" />
          <div className="w-12 h-4 bg-slate-100/80 rounded-md" />
        </div>

        {/* Title Placeholder (2 lines) */}
        <div className="w-[88%] h-3.5 bg-slate-100 rounded-md mb-1.5" />
        <div className="w-[62%] h-3.5 bg-slate-100/90 rounded-md mb-3" />

        {/* Price and Unit Pill */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="w-20 h-6 bg-slate-200/80 rounded-lg" />
          <div className="w-14 h-4 bg-slate-100 rounded-md" />
        </div>
      </div>
    </div>
  );
}
