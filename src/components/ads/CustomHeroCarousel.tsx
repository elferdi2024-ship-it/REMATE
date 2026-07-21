"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CarouselSlide } from "@/types/ofertas";

interface CustomHeroCarouselProps {
  slides: CarouselSlide[];
}

export default function CustomHeroCarousel({ slides }: CustomHeroCarouselProps) {
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
    if (!isVisible || isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isVisible, isPaused, slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div 
      ref={ref}
      className="relative w-full h-full min-h-[220px] md:min-h-[400px] overflow-hidden bg-zinc-950 group rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, idx) => {
        const isActive = idx === currentIdx;
        const bgImg = slide.imagenDesktop || slide.imagenMobile; // Fallback for now if missing
        const accent = slide.colorAccent || "#00E5FF";

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
          >
            {/* BACKGROUND */}
            {bgImg ? (
              <Image src={bgImg} alt={slide.titulo} fill className="object-cover" priority={idx === 0} />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}30 0%, #070B19 100%)` }} />
            )}

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

            {/* CONTENT */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 w-full md:w-2/3">
              <div className="flex items-center gap-3 mb-2 md:mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-white/70 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                    Destacado
                  </span>
                </div>
              </div>

              <h2 className="text-2xl md:text-5xl font-bebas text-white tracking-wide mb-1 md:mb-2 text-shadow-lg">
                {slide.titulo}
              </h2>
              
              {slide.subtitulo && (
                <p className="text-white/80 text-xs md:text-sm font-medium mb-4 md:mb-6 line-clamp-1 md:line-clamp-2">
                  {slide.subtitulo}
                </p>
              )}

              {slide.ctaTexto && slide.ctaLink && (
                <Link 
                  href={slide.ctaLink}
                  className="inline-flex items-center justify-center bg-white text-black font-bebas text-sm md:text-lg px-6 md:px-8 py-2 md:py-2.5 rounded-full hover:scale-105 transition-transform w-max shadow-xl"
                  style={{ boxShadow: `0 4px 15px ${accent}40` }}
                >
                  {slide.ctaTexto}
                </Link>
              )}
            </div>
          </div>
        );
      })}

      {/* PROGRESS BARS */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-6 md:left-16 right-6 md:right-16 flex gap-2 z-20">
          {slides.map((s, idx) => (
            <div key={s.id} className="flex-1 h-1 md:h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer" onClick={() => setCurrentIdx(idx)}>
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
