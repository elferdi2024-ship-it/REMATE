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

export interface PremiumPromo {
  id: string;
  titulo: string;
  cantidad: number;
  precio: number;
  imagen: string;
  activa: boolean;
  sucursalId?: string | null;
}

export interface OfertaConfig {
  activa: boolean;
  titulo: string;
  subtitulo: string;
  productos: OfertaProducto[];
  premiumPromos?: PremiumPromo[];
  expiresAt?: string;
  updatedAt: string;
}

