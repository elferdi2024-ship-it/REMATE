"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BrandConfig } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";

interface BrandHeroCarouselProps {
  brands: BrandConfig[];
}

export default function BrandHeroCarousel({ brands }: BrandHeroCarouselProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!isVisible || isPaused || brands.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % brands.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isVisible, isPaused, brands.length]);

  if (brands.length === 0) return null;

  return (
    <div 
      ref={ref}
      className="relative w-full h-[200px] md:h-[280px] overflow-hidden bg-[#070B19] group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {brands.map((brand, idx) => {
        const isActive = idx === currentIdx;
        const bgImg = brand.assets?.find(a => a.type === "image")?.src;
        const accent = brand.color || "#00E5FF";
        const tStyle = TIER_COLORS[brand.tier];

        return (
          <div
            key={brand.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
          >
            {/* BACKGROUND */}
            {bgImg ? (
              <Image src={bgImg} alt={brand.name} fill className="object-cover" priority={idx === 0} />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}30 0%, #070B19 100%)` }} />
            )}

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

            {/* CONTENT */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 w-full md:w-2/3">
              <div className="flex items-center gap-3 mb-2 md:mb-4">
                {brand.logo ? (
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-lg p-1">
                    <Image src={brand.logo} alt={brand.name} width={48} height={48} className="object-contain w-full h-full" />
                  </div>
                ) : (
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: accent }}>
                    {brand.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-white/70 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                    Espacio Patrocinado
                  </span>
                  <span className="text-white font-bebas text-lg md:text-2xl tracking-wide leading-none mt-0.5">{brand.name}</span>
                </div>
              </div>

              <h2 className="text-2xl md:text-5xl font-bebas text-white tracking-wide mb-1 md:mb-2 text-shadow-lg">
                {brand.headline || `DESCUBRE LO MEJOR DE ${brand.name}`}
              </h2>
              
              {brand.tagline && (
                <p className="text-white/80 text-xs md:text-sm font-medium mb-4 md:mb-6 line-clamp-1 md:line-clamp-2">
                  {brand.tagline}
                </p>
              )}

              <Link 
                href={`/catalogo?search=${encodeURIComponent(brand.name)}`}
                className="inline-flex items-center justify-center bg-white text-black font-bebas text-sm md:text-lg px-6 md:px-8 py-2 md:py-2.5 rounded-full hover:scale-105 transition-transform w-max shadow-xl"
                style={{ boxShadow: `0 4px 15px ${accent}40` }}
              >
                VER PRODUCTOS
              </Link>
            </div>
          </div>
        );
      })}

      {/* PROGRESS BARS */}
      {brands.length > 1 && (
        <div className="absolute bottom-4 left-6 md:left-16 right-6 md:right-16 flex gap-2 z-20">
          {brands.map((b, idx) => (
            <div key={b.id} className="flex-1 h-1 md:h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer" onClick={() => setCurrentIdx(idx)}>
              <div 
                className={`h-full bg-white transition-all ${idx === currentIdx ? (isPaused ? '' : 'duration-[5000ms] ease-linear') : 'duration-300'}`}
                style={{ 
                  width: idx < currentIdx ? '100%' : idx === currentIdx ? (isPaused ? '50%' : '100%') : '0%',
                  transitionDuration: idx === currentIdx && !isPaused ? '5s' : '0.3s'
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
