// filepath: src/hooks/useAdEntrance.ts
"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Hook para manejar animaciones de entrada basadas en IntersectionObserver.
 * Utilizado por componentes de publicidad para trigger de animaciones y lazy loading
 * con un threshold menor para detectarlo más rápido en mobile scroll.
 */
export function useAdEntrance<T extends HTMLElement>(
  threshold = 0.15,
  rootMargin = "0px 0px -40px 0px"
) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isVisible };
}
