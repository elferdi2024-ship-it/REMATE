// filepath: src/lib/sucursales-config.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface SucursalConfig {
  telefonoWhatsApp: string; // formato internacional sin +, ej: "59894611400"
}

export const WA_FALLBACK_NUMBER: string = process.env.NEXT_PUBLIC_WA_NUMBER || "59894611400";

/** Cache en memoria: sucursalId -> teléfono WhatsApp resuelto. */
const waCache = new Map<string, string>();
const waInflight = new Map<string, Promise<string>>();

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const t = setTimeout(() => resolve(fallback), ms);
    promise
      .then((v) => resolve(v))
      .catch(() => resolve(fallback))
      .finally(() => clearTimeout(t));
  });
}

/**
 * Reads the WhatsApp phone for a sucursal from Firestore.
 * Falls back to NEXT_PUBLIC_WA_NUMBER if not configured.
 * Resultado cacheado en memoria; nunca espera más de `timeoutMs`.
 */
export async function getSucursalWhatsApp(
  sucursalId: string | null,
  timeoutMs: number = 2500
): Promise<string> {
  if (!sucursalId) return WA_FALLBACK_NUMBER;

  const cached = waCache.get(sucursalId);
  if (cached) return cached;

  let inflight = waInflight.get(sucursalId);
  if (!inflight) {
    inflight = (async () => {
      try {
        const snap = await getDoc(doc(db, "sucursales_config", sucursalId));
        if (snap.exists()) {
          const data = snap.data() as SucursalConfig;
          if (data.telefonoWhatsApp?.trim()) {
            const tel = data.telefonoWhatsApp.trim();
            waCache.set(sucursalId, tel);
            return tel;
          }
        }
        waCache.set(sucursalId, WA_FALLBACK_NUMBER);
      } catch (err) {
        console.warn("⚠️ Error leyendo config sucursal:", err);
      } finally {
        waInflight.delete(sucursalId);
      }
      return WA_FALLBACK_NUMBER;
    })();
    waInflight.set(sucursalId, inflight);
  }

  return withTimeout(inflight, timeoutMs, WA_FALLBACK_NUMBER);
}

/** Lectura sincrónica desde cache (null si aún no se resolvió). */
export function getSucursalWhatsAppCached(sucursalId: string | null): string | null {
  if (!sucursalId) return WA_FALLBACK_NUMBER;
  return waCache.get(sucursalId) ?? null;
}

/** Precarga el número para que el checkout pueda abrir WhatsApp sin esperar red. */
export function prefetchSucursalWhatsApp(sucursalId: string | null): void {
  if (!sucursalId || waCache.has(sucursalId)) return;
  void getSucursalWhatsApp(sucursalId, 10000);
}

/**
 * Saves a WhatsApp phone number for a sucursal.
 */
export async function setSucursalWhatsApp(sucursalId: string, telefono: string): Promise<void> {
  const limpio = telefono.replace(/[\s+\-]/g, "");
  await setDoc(doc(db, "sucursales_config", sucursalId), {
    telefonoWhatsApp: limpio,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  waCache.set(sucursalId, limpio || WA_FALLBACK_NUMBER);
}

/**
 * Reads all sucursal configs at once.
 */
export async function getAllSucursalConfigs(): Promise<Record<string, SucursalConfig>> {
  const { SUCURSALES } = await import("./sucursales");
  const configs: Record<string, SucursalConfig> = {};
  
  await Promise.all(
    SUCURSALES.map(async (s) => {
      try {
        const snap = await getDoc(doc(db, "sucursales_config", s.id));
        if (snap.exists()) {
          configs[s.id] = snap.data() as SucursalConfig;
        }
      } catch { /* ignore */ }
    })
  );
  
  return configs;
}
