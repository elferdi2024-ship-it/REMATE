// filepath: src/hooks/useAdImpression.ts
"use client";

import { useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, increment } from "firebase/firestore";
import { trackAdFrequency } from "@/lib/adFrequency";

/** Registra apertura del modal de una marca */
export async function trackModalOpen(brandId: string): Promise<void> {
  try {
    const month = new Date().toISOString().slice(0, 7);
    await setDoc(
      doc(db, "ads_impressions", brandId),
      { 
        modal_opens: increment(1),
        [`modal_${month}`]: increment(1),
      },
      { merge: true }
    );
  } catch {}
}

/** Registra que el usuario hizo click en "Ver en catálogo" desde el modal */
export async function trackModalCta(brandId: string): Promise<void> {
  try {
    await setDoc(
      doc(db, "ads_impressions", brandId),
      { cta_clicks: increment(1) },
      { merge: true }
    );
  } catch {}
}

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

          // Registrar impression en Firestore
          const month = new Date().toISOString().slice(0, 7);
          setDoc(
            doc(db, "ads_impressions", brandId),
            {
              total: increment(1),
              [month]: increment(1),
              lastSeen: new Date().toISOString()
            },
            { merge: true }
          ).catch(() => {});

          // Incrementar sessionStorage cap
          trackAdFrequency(brandId);
          
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
