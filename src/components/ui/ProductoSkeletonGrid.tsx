// filepath: src/components/ui/ProductoSkeletonGrid.tsx
"use client";

import React from "react";

interface ProductoSkeletonGridProps {
  count?: number;
}

export default function ProductoSkeletonGrid({ count = 8 }: ProductoSkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 my-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-stone-200/80 rounded-[22px] p-3 flex flex-col animate-pulse min-h-[285px]"
        >
          {/* Image Thumbnail Placeholder */}
          <div className="w-full bg-stone-100 rounded-2xl aspect-square mb-3 relative overflow-hidden" />

          {/* Category Badge Placeholder */}
          <div className="w-20 h-4 bg-stone-100 rounded-md mb-2" />

          {/* Title Lines Placeholder */}
          <div className="w-full h-3 bg-stone-200/80 rounded-md mb-1.5" />
          <div className="w-3/4 h-3 bg-stone-200/60 rounded-md mb-4" />

          {/* Price & Unit Breakdown Placeholder */}
          <div className="mt-auto pt-2 border-t border-stone-100 flex items-center justify-between">
            <div className="w-24 h-6 bg-red-100/60 rounded-lg" />
            <div className="w-10 h-8 bg-stone-900/10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
