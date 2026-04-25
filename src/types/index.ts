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
  "Aceites y Aderezos",
  "Bebidas",
  "Café, Té y Yerba",
  "Cereales y Granola",
  "Congelados",
  "Conservas de Pescado",
  "Descartables y Embalaje",
  "Especias y Condimentos",
  "Fiambres y Carnes",
  "Golosinas y Dulces",
  "Harinas, Pastas y Legumbres",
  "Higiene Personal",
  "Lácteos",
  "Limpieza",
  "Mermeladas y Conservas Dulces",
  "Otros",
  "Panadería",
  "Papel e Higiene",
] as const;

export const EMOJI_POR_CATEGORIA: Record<string, string> = {
  "Aceites y Aderezos": "🫙",
  "Bebidas": "🥤",
  "Café, Té y Yerba": "☕",
  "Cereales y Granola": "🥣",
  "Congelados": "🧊",
  "Conservas de Pescado": "🐟",
  "Descartables y Embalaje": "📦",
  "Especias y Condimentos": "🌿",
  "Fiambres y Carnes": "🥩",
  "Golosinas y Dulces": "🍬",
  "Harinas, Pastas y Legumbres": "🌾",
  "Higiene Personal": "🧴",
  "Lácteos": "🥛",
  "Limpieza": "🧹",
  "Mermeladas y Conservas Dulces": "🍯",
  "Otros": "📦",
  "Panadería": "🥖",
  "Papel e Higiene": "🧻",
};
