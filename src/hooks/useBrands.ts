// filepath: src/hooks/useBrands.ts
"use client";

import { useState, useEffect } from "react";
import type { BrandConfig } from "@/types/brands";
import { loadBrands, DEFAULT_BRANDS } from "@/lib/brands";

/**
 * Hook to load brand configurations from Firebase.
 * Falls back to DEFAULT_BRANDS during loading/errors.
 * Caches in sessionStorage to avoid repeated fetches.
 */
export function useBrands() {
  const [brands, setBrands] = useState<BrandConfig[]>(DEFAULT_BRANDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Try sessionStorage cache first
    try {
      const cached = sessionStorage.getItem("__brands_cache");
      if (cached) {
        const parsed = JSON.parse(cached) as { brands: BrandConfig[]; ts: number };
        // Cache valid for 5 minutes
        if (Date.now() - parsed.ts < 5 * 60 * 1000) {
          setBrands(parsed.brands);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore cache errors
    }

    async function fetch() {
      try {
        const data = await loadBrands();
        if (!cancelled) {
          setBrands(data);
          // Cache
          try {
            sessionStorage.setItem(
              "__brands_cache",
              JSON.stringify({ brands: data, ts: Date.now() })
            );
          } catch {
            // Storage full, ignore
          }
        }
      } catch (err) {
        console.warn("useBrands: error loading, using defaults", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, []);

  return { brands, loading };
}
