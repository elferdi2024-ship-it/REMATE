// filepath: src/components/catalogo/ProductoSkeleton.tsx
import React from "react";

export function ProductoSkeleton() {
  return (
    <div className="relative flex flex-col bg-white border border-stone-100 rounded-2xl p-3.5 h-[320px] shadow-sm overflow-hidden">
      {/* Fondo de Shimmer */}
      <div className="absolute inset-0 z-0 pointer-events-none skeleton-shimmer" />
      
      {/* Elementos internos z-10 para quedar sobre el shimmer */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Image Placeholder */}
        <div className="w-full aspect-square bg-stone-100/80 rounded-xl mb-4" />
        
        {/* Category Placeholder */}
        <div className="w-16 h-4 bg-stone-100/80 rounded-md mb-2" />
        
        {/* Title Placeholder (2 lines) */}
        <div className="w-[85%] h-4 bg-stone-100/80 rounded-md mb-1.5" />
        <div className="w-[60%] h-4 bg-stone-100/80 rounded-md mb-4" />
        
        {/* Price and Button */}
        <div className="mt-auto flex items-end justify-between">
          <div className="w-20 h-6 bg-stone-100/80 rounded-lg" />
          <div className="w-11 h-11 bg-stone-100/80 rounded-full" />
        </div>
      </div>
    </div>
  );
}

