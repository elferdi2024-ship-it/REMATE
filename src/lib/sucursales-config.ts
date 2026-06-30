// filepath: src/lib/sucursales-config.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface SucursalConfig {
  telefonoWhatsApp: string; // formato internacional sin +, ej: "59894611400"
}

/**
 * Reads the WhatsApp phone for a sucursal from Firestore.
 * Falls back to NEXT_PUBLIC_WA_NUMBER if not configured.
 */
export async function getSucursalWhatsApp(sucursalId: string | null): Promise<string> {
  const fallback = process.env.NEXT_PUBLIC_WA_NUMBER || "59894611400";
  if (!sucursalId) return fallback;
  
  try {
    const snap = await getDoc(doc(db, "sucursales_config", sucursalId));
    if (snap.exists()) {
      const data = snap.data() as SucursalConfig;
      if (data.telefonoWhatsApp?.trim()) return data.telefonoWhatsApp.trim();
    }
  } catch (err) {
    console.warn("⚠️ Error leyendo config sucursal:", err);
  }
  return fallback;
}

/**
 * Saves a WhatsApp phone number for a sucursal.
 */
export async function setSucursalWhatsApp(sucursalId: string, telefono: string): Promise<void> {
  await setDoc(doc(db, "sucursales_config", sucursalId), {
    telefonoWhatsApp: telefono.replace(/[\s+\-]/g, ""),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
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
