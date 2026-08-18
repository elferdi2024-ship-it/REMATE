import type { BulkPriceTier } from "@/types";

export interface OfertaProducto {
  codigo: string;
  nombre: string;
  precioOriginal: number;
  precioOferta: number;
  descuento: number;
  imagen?: string;
  categoria: string;
  destacado: boolean;
  escalaPrecios?: BulkPriceTier[];
}

export interface PremiumPromo {
  id: string;
  titulo: string;
  cantidad: number | null;
  precio: number | null;
  imagen: string;
  activa: boolean;
  sucursalId?: string | null;
  escalaPrecios?: BulkPriceTier[];
}

export interface CarouselSlide {
  id: string;
  titulo: string;
  subtitulo: string;
  imagenDesktop: string;
  imagenMobile: string;
  ctaTexto: string;
  ctaLink: string;
  colorAccent: string;
  activo: boolean;
  orden: number;
}

/** Banner publicitario de marca — espacio premium full-width */
export interface BrandBanner {
  id: string;
  marcaNombre: string;
  titulo: string;
  subtitulo: string;
  imagen: string;
  ctaTexto: string;
  ctaLink: string;
  colorFondo: string;
  colorTexto: string;
  activo: boolean;
  orden: number;
  fechaInicio?: string;
  fechaFin?: string;
}

/** Producto patrocinado — posición preferencial en grilla */
export interface SponsoredProduct {
  id: string;
  codigoProducto?: string;
  nombreProducto: string;
  marcaNombre: string;
  precioOriginal?: number | null;
  precioPromo?: number | null;
  imagen?: string;
  badgeTexto: string;
  activo: boolean;
  orden: number;
}

/** Oferta agrupada por categoría temática */
export interface CategoryOffer {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  imagen: string;
  colorAccent: string;
  productos: string[]; // códigos de producto
  activa: boolean;
  fechaInicio?: string;
  fechaFin?: string;
}

/** Oferta relámpago con countdown */
export interface FlashOffer {
  id: string;
  titulo: string;
  descripcion: string;
  productos: OfertaProducto[];
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  colorAccent: string;
}

export interface OfertaConfig {
  activa: boolean;
  titulo: string;
  subtitulo: string;
  productos: OfertaProducto[];
  mainCarousel?: CarouselSlide[];
  premiumPromos?: PremiumPromo[];
  brandBanners?: BrandBanner[];
  sponsoredProducts?: SponsoredProduct[];
  categoryOffers?: CategoryOffer[];
  flashOffers?: FlashOffer[];
  expiresAt?: string;
  updatedAt: string;
}
