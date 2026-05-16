// filepath: src/hooks/useAdImpression.ts
"use client";

import { useEffect, useRef } from "react";
import { trackAdFrequency } from "@/lib/adFrequency";

/**
 * Envía un evento de ad al API Route propio (/api/ad-event).
 * Al ir a nuestro dominio en vez de firestore.googleapis.com,
 * los ad blockers no pueden interceptarlo.
 */
async function postAdEvent(
  brandId: string,
  assetId?: string,
  type = "impression",
  slot?: string,
  abVariant?: string
) {
  try {
    await fetch("/api/ad-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, assetId, type, slot, abVariant }),
      // keepalive permite que el request sobreviva si el usuario navega
      keepalive: true,
    });
  } catch {
    // Tracking nunca rompe UX — fallo silencioso
  }
}

/** Registra apertura del modal de una marca */
export async function trackModalOpen(brandId: string): Promise<void> {
  await postAdEvent(brandId, undefined, "modal_open");
}

/** Registra que el usuario hizo click en "Ver en catálogo" desde el modal */
export async function trackModalCta(brandId: string): Promise<void> {
  await postAdEvent(brandId, undefined, "cta_click");
}

/**
 * Registra una "impresión" cuando el anuncio lleva visible más del 50%
 * en pantalla. Utiliza IntersectionObserver y marca un flag para no
 * repetir el log en la misma sesión/montaje.
 */
export function useAdImpression<T extends HTMLElement>(
  brandId: string,
  assetId?: string,
  slot?: string,
  abVariant?: string
) {
  const ref = useRef<T>(null);
  const recorded = useRef(false);

  useEffect(() => {
    if (!ref.current || recorded.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          recorded.current = true;
          observer.disconnect();

          // Registrar via API Route (evita ad blockers)
          postAdEvent(brandId, assetId, "impression", slot, abVariant);

          // Incrementar sessionStorage cap
          trackAdFrequency(brandId);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [brandId, assetId, slot, abVariant]);

  return ref;
}
