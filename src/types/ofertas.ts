export interface OfertaProducto {
  codigo: string;
  nombre: string;
  precioOriginal: number;
  precioOferta: number;
  descuento: number;
  imagen?: string;
  categoria: string;
  destacado: boolean;
}

export interface OfertaConfig {
  activa: boolean;
  titulo: string;
  subtitulo: string;
  productos: OfertaProducto[];
  expiresAt?: string;
  updatedAt: string;
}
