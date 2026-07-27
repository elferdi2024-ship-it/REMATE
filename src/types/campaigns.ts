// filepath: src/types/campaigns.ts

export type CampaignType = "top_bar" | "hero_banner" | "flash_offer" | "lead_modal";

export interface MarketingCampaign {
  id: string;
  tipo: CampaignType;
  nombreInterno: string;
  titulo: string;
  subtitulo?: string;
  ctaTexto?: string;
  ctaUrl?: string;
  imagenDesktop?: string;
  imagenMobile?: string;
  colorFondo?: string;
  colorTexto?: string;
  colorAccent?: string;
  fechaInicio: string; // ISO String
  fechaFin: string; // ISO String
  activa: boolean;
  sucursalIds: string[]; // Empty array = Todas las sucursales
  prioridad: number;
  metadata?: {
    descuentoPorcentaje?: number;
    productosSku?: string[];
    delayPopupSeconds?: number;
  };
  createdAt: string;
  updatedAt: string;
}
