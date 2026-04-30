// filepath: src/lib/adFrequency.ts

const SESSION_KEY = "ad_freq";
const DEFAULT_CAP = 3; // máximo 3 veces el mismo brand por sesión

interface FreqMap {
  [brandId: string]: number;
}

function getFreqMap(): FreqMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}");
  } catch {
    return {};
  }
}

function setFreqMap(map: FreqMap) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(map));
  } catch {}
}

/** Verifica si se puede mostrar. */
export function canShowAd(brandId: string, cap = DEFAULT_CAP): boolean {
  if (typeof window === "undefined") return true;
  const map = getFreqMap();
  const current = map[brandId] || 0;
  return current < cap;
}

/** Registra una impresión. */
export function trackAdFrequency(brandId: string): void {
  if (typeof window === "undefined") return;
  const map = getFreqMap();
  map[brandId] = (map[brandId] || 0) + 1;
  setFreqMap(map);
}

/** Resetea el contador de una marca (útil para testing). */
export function resetAdFrequency(brandId?: string) {
  if (typeof window === "undefined") return;
  if (!brandId) {
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  const map = getFreqMap();
  delete map[brandId];
  setFreqMap(map);
}
