export interface BulkPriceTier {
  minCantidad: number;       // Ej: 8 (para caja)
  precioUnitario: number;    // Ej: 236
  etiqueta?: string;         // Ej: "Caja x 8 u." o "Mayorista"
}

export interface Producto {
  codigo: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen?: string;
  marca?: string;
  deshabilitado?: boolean;
  precioAnterior?: number;
  contenido?: string;
  destacado?: boolean;
  exclusivoApp?: boolean;
  escalaPrecios?: BulkPriceTier[];
}

export interface CartItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  substitucion?: string;
  notaSubstitucion?: string;
  escalaPrecios?: BulkPriceTier[];
  precioBase?: number;
}

export interface PedidoItem {
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  id?: string;
  fecha: Date;
  items: PedidoItem[];
  total: number;
  notas?: string;
  mensajeWA: string;
}

export interface ListaItem {
  codigo: string;
  nombre: string;
  cantidad: number;
}

export interface Lista {
  id?: string;
  nombre: string;
  items: ListaItem[];
  actualizadaEn: Date;
}

export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  role: "cliente" | "admin";
  creadoEn: Date;
}

export type Vista = "grilla" | "lista" | "compacta";

export const CATEGORIAS = [
  "YERBA, TÉ Y CAFÉ",
  "LÁCTEOS Y HUEVOS",
  "BEBIDAS SIN ALCOHOL",
  "CARNES Y EMBUTIDOS",
  "HARINAS, PASTAS Y CEREALES",
  "ACEITES Y GRASAS",
  "LIMPIEZA DEL HOGAR",
  "GOLOSINAS Y SNACKS",
  "BEBIDAS ALCOHÓLICAS",
  "CONGELADOS",
  "PANADERÍA Y REPOSTERÍA",
  "SALSAS Y ADEREZOS",
  "DULCES Y MERMELADAS",
  "CONSERVAS Y ENLATADOS",
  "HIGIENE PERSONAL",
  "CONDIMENTOS Y ESPECIAS",
  "MASCOTAS",
  "DESCARTABLES Y ART. DEL HOGAR",
  "FRUTAS Y VERDURAS",
  "ARTÍCULOS DEL HOGAR",
  "OTROS",
] as const;

export const EMOJI_POR_CATEGORIA: Record<string, string> = {
  "Todos": "🏠",
  "ACEITES Y GRASAS": "🫗",
  "ARTÍCULOS DEL HOGAR": "🏠",
  "BEBIDAS ALCOHÓLICAS": "🍺",
  "BEBIDAS SIN ALCOHOL": "🥤",
  "CARNES Y EMBUTIDOS": "🥩",
  "CONDIMENTOS Y ESPECIAS": "🌿",
  "CONGELADOS": "🧊",
  "CONSERVAS Y ENLATADOS": "🥫",
  "DESCARTABLES Y ART. DEL HOGAR": "📦",
  "DULCES Y MERMELADAS": "🍯",
  "FRUTAS Y VERDURAS": "🍎",
  "GOLOSINAS Y SNACKS": "🍬",
  "HARINAS, PASTAS Y CEREALES": "🌾",
  "HIGIENE PERSONAL": "🧴",
  "LÁCTEOS Y HUEVOS": "🥛",
  "LIMPIEZA DEL HOGAR": "🧹",
  "MASCOTAS": "🐾",
  "OTROS": "📦",
  "PANADERÍA Y REPOSTERÍA": "🥖",
  "SALSAS Y ADEREZOS": "🥫",
  "YERBA, TÉ Y CAFÉ": "☕",
};
