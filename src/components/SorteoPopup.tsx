// filepath: src/components/SorteoPopup.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "elremate_sorteo_popup_seen_v1";
const SORTEO_URL = "https://club.distribuidoraelremate.uy/r/gral-artigas";

export function SorteoPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const markSeenAndClose = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors in restricted environments
    }
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    try {
      const alreadySeen = localStorage.getItem(STORAGE_KEY);
      if (alreadySeen) return;
    } catch {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        markSeenAndClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, markSeenAndClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sorteo mensual El Remate"
    >
      {/* Backdrop */}
      <div
        onClick={markSeenAndClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm animate-in fade-in duration-300"
        aria-hidden="true"
      />

      {/* Card Container */}
      <div className="relative z-10 w-full max-w-[420px] animate-in zoom-in-95 fade-in duration-300">
        {/* Ambient Glow */}
        <div
          className="pointer-events-none absolute -inset-1.5 rounded-[28px] bg-gradient-to-tr from-[#EF233C] via-amber-400 to-[#EF233C] opacity-75 blur-md animate-pulse motion-reduce:animate-none"
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={markSeenAndClose}
          aria-label="Cerrar aviso de sorteo"
          className="absolute -right-2 -top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#1B2620] text-sm font-black text-white shadow-lg transition hover:scale-110 hover:bg-[#EF233C] active:scale-95"
        >
          ✕
        </button>

        {/* Clickable Promo Image */}
        <a
          href={SORTEO_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={markSeenAndClose}
          className="group relative block overflow-hidden rounded-[22px] border-2 border-amber-300/90 bg-[#D92323] shadow-2xl transition-transform duration-300 hover:scale-[1.015] active:scale-[0.985]"
        >
          <div className="relative aspect-[1024/728] w-full overflow-hidden">
            <Image
              src="/promos/sorteo-mensual.jpg"
              alt="El Remate - Sorteo todos los meses: Anotate y ganá premios cada mes"
              fill
              sizes="(max-width: 440px) 92vw, 420px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority
            />

            {/* Subtle Sheen Sweep */}
            <div
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full motion-reduce:hidden"
              aria-hidden="true"
            />
          </div>

          {/* Eye-catching Tap Prompt Bar */}
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-[#1B2620] via-[#26342C] to-[#1B2620] px-4 py-2.5 text-white">
            <span className="flex items-center gap-2 text-xs font-extrabold tracking-wide">
              <span className="inline-block animate-bounce motion-reduce:animate-none">🎁</span>
              <span>¡Toca para anotarte y participar!</span>
            </span>
            <span className="shrink-0 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-black text-[#1B2620] shadow-sm transition-transform group-hover:translate-x-0.5">
              Ir al sorteo →
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
