export interface Producto {
  codigo: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen?: string;
}

export interface CartItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
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

export type Vista = "grilla" | "lista";

export const CATEGORIAS = [
  "ACEITES Y GRASAS",
  "ARTÍCULOS DEL HOGAR",
  "BEBIDAS ALCOHÓLICAS",
  "BEBIDAS SIN ALCOHOL",
  "CARNES Y EMBUTIDOS",
  "CONDIMENTOS Y ESPECIAS",
  "CONGELADOS",
  "CONSERVAS Y ENLATADOS",
  "DESCARTABLES Y ART. DEL HOGAR",
  "DULCES Y MERMELADAS",
  "FRUTAS Y VERDURAS",
  "GOLOSINAS Y SNACKS",
  "HARINAS, PASTAS Y CEREALES",
  "HIGIENE PERSONAL",
  "LÁCTEOS Y HUEVOS",
  "LIMPIEZA DEL HOGAR",
  "MASCOTAS",
  "OTROS",
  "PANADERÍA Y REPOSTERÍA",
  "SALSAS Y ADEREZOS",
  "YERBA, TÉ Y CAFÉ",
] as const;

export const EMOJI_POR_CATEGORIA: Record<string, string> = {
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
