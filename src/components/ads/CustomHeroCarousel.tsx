"use client";

import React, { useState, useEffect, useRef, TouchEvent } from "react";
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
  
  // Touch support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setIsVisible(entry.isIntersecting); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isVisible, isPaused, slides.length]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div 
      ref={ref}
      className="relative w-full aspect-square md:aspect-[16/9] max-h-[520px] overflow-hidden bg-zinc-950 group rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, idx) => {
        const isActive = idx === currentIdx;
        const bgImg = slide.imagenDesktop || slide.imagenMobile;
        const accent = slide.colorAccent || "#00E5FF";

        const hasOverlay = slide.titulo || slide.ctaTexto;

        const content = (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${isActive ? "opacity-100 z-10 translate-x-0" : "opacity-0 z-0 pointer-events-none translate-x-8"}`}
          >
            {bgImg ? (
              !hasOverlay ? (
                <>
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Image src={bgImg} alt="" fill className="object-cover blur-2xl opacity-35 scale-110" />
                  </div>
                  <div className="relative w-full h-full flex items-center justify-center p-0 md:p-2">
                    <Image src={bgImg} alt={slide.titulo || "Banner promocional"} fill className="object-contain" priority={idx === 0} />
                  </div>
                </>
              ) : (
                <Image src={bgImg} alt={slide.titulo || "Banner promocional"} fill className="object-cover" priority={idx === 0} />
              )
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}30 0%, #070B19 100%)` }} />
            )}

            {hasOverlay && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 w-full md:w-2/3">
                  <div className="flex items-center gap-3 mb-2 md:mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] md:text-xs text-white/70 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                        Destacado
                      </span>
                    </div>
                  </div>

                  {slide.titulo && (
                    <h2 className="text-2xl md:text-5xl font-bebas text-white tracking-wide mb-1 md:mb-2 text-shadow-lg">
                      {slide.titulo}
                    </h2>
                  )}
                  
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
              </>
            )}
          </div>
        );

        if (!hasOverlay && slide.ctaLink) {
          return (
            <Link key={slide.id} href={slide.ctaLink} className={`absolute inset-0 block transition-all duration-700 ease-in-out ${isActive ? "opacity-100 z-10 translate-x-0" : "opacity-0 z-0 pointer-events-none translate-x-8"}`}>
              {bgImg ? (
                <>
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Image src={bgImg} alt="" fill className="object-cover blur-2xl opacity-35 scale-110" />
                  </div>
                  <div className="relative w-full h-full flex items-center justify-center p-0 md:p-2">
                    <Image src={bgImg} alt={slide.titulo || "Banner"} fill className="object-contain" priority={idx === 0} />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}30 0%, #070B19 100%)` }} />
              )}
            </Link>
          );
        }

        return content;
      })}

      {slides.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <button
            onClick={(e) => { e.preventDefault(); prevSlide(); }}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <button
            onClick={(e) => { e.preventDefault(); nextSlide(); }}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          {/* Progress Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 px-6">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentIdx(idx)}
                className="group/dot p-2 -m-2 flex items-center justify-center cursor-pointer"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIdx 
                      ? 'w-6 md:w-8 bg-white' 
                      : 'w-1.5 md:w-2 bg-white/40 group-hover/dot:bg-white/60'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
