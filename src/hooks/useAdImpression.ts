// filepath: src/hooks/useAdImpression.ts
"use client";

import { useEffect, useRef } from "react";

/**
 * Registra una "impresión" cuando el anuncio lleva visible más del 50%
 * en pantalla. Utiliza IntersectionObserver y marca un flag para no
 * repetir el log en la misma sesión/montaje.
 */
export function useAdImpression<T extends HTMLElement>(brandId: string, assetId?: string) {
  const ref = useRef<T>(null);
  const recorded = useRef(false);

  useEffect(() => {
    if (!ref.current || recorded.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          recorded.current = true;
          observer.disconnect();

          // TODO: Conectar con Firestore cuando se habilite el panel de analíticas
          // await incrementAdImpression(brandId, assetId);
          console.log(`[AdTracker] Impression recorded: Brand ${brandId}, Asset: ${assetId || "Global"}`);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [brandId, assetId]);

  return ref;
}
