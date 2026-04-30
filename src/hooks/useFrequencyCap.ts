// filepath: src/hooks/useFrequencyCap.ts
"use client";

const SESSION_CAPS: Record<string, number> = {
  spotlight:       2,   // máximo 2 BrandSpotlight distintos por sesión
  banner:          4,   // máximo 4 banners por sesión
  videoCard:       1,   // máximo 1 video por sesión (el video autoplay molesta)
  nativeStory:     1,   // máximo 1 NativeStoryCard por sesión
  flashDeal:       2,   // máximo 2 flash deals si hay más de uno activo
  sponsoredProduct: 6,  // máximo 6 productos destacados por sesión
};

/**
 * Checks if a user has seen a specific ad format for a brand enough times.
 */
export function hasSeenEnough(format: string, brandId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const seen = JSON.parse(sessionStorage.getItem("adsSeen") || "{}");
    const cap = SESSION_CAPS[format] || 2;
    return (seen[format]?.[brandId] || 0) >= cap;
  } catch (e) {
    return false;
  }
}

/**
 * Marks an ad format for a brand as seen in the session storage.
 */
export function markAsSeen(format: string, brandId: string): void {
  if (typeof window === "undefined") return;
  try {
    const seen = JSON.parse(sessionStorage.getItem("adsSeen") || "{}");
    if (!seen[format]) seen[format] = {};
    seen[format][brandId] = (seen[format][brandId] || 0) + 1;
    sessionStorage.setItem("adsSeen", JSON.stringify(seen));
  } catch (e) {}
}
