// filepath: src/components/ui/ScrollToTopBtn.tsx
"use client";

import React, { useState, useEffect } from "react";
import { haptic } from "@/lib/haptic";

export default function ScrollToTopBtn() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const scrollToTop = () => {
    haptic.add();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-[130px] md:bottom-8 right-4 z-[90] w-11 h-11 bg-stone-900/90 hover:bg-stone-900 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border border-stone-700/50 active:scale-90 transition-all cursor-pointer"
      aria-label="Volver arriba"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  );
}
