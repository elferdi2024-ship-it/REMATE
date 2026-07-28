// filepath: src/lib/cupones.ts

export interface Cupon {
  id: string;
  codigo: string;          // Ej: "REMATE10"
  descuento: number;       // Ej: 100 o 10
  tipo: "fijo" | "porcentaje"; // "fijo" ($100) o "porcentaje" (10%)
  minimoCompra: number;   // Ej: 1000
  activo: boolean;         // Inactivo por omisión salvo activación desde admin
  descripcion?: string;
  fechaExpiracion?: string;
}

export interface ConfigCupones {
  sistemaActivo: boolean; // False por defecto
  cupones: Cupon[];
}

const STORAGE_KEY = "elremate_config_cupones";

const DEFAULT_CONFIG: ConfigCupones = {
  sistemaActivo: false, // INACTIVO POR OMISIÓN por requerimiento de negocio
  cupones: [
    {
      id: "cup-1",
      codigo: "BIENVENIDA100",
      descuento: 100,
      tipo: "fijo",
      minimoCompra: 1500,
      activo: false, // Inactivo por omisión
      descripcion: "Descuento de $100 en tu primera compra superior a $1.500",
    },
    {
      id: "cup-2",
      codigo: "SUPER10",
      descuento: 10,
      tipo: "porcentaje",
      minimoCompra: 2000,
      activo: false, // Inactivo por omisión
      descripcion: "10% de descuento en compras mayores a $2.000",
    },
  ],
};

export function getCuponesConfig(): ConfigCupones {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return JSON.parse(raw) as ConfigCupones;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveCuponesConfig(config: ConfigCupones): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("cupones_updated"));
  } catch (err) {
    console.error("Error guardando cupones:", err);
  }
}
