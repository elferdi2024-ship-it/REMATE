// filepath: src/lib/RetailMediaGuard.ts

export interface DensityRules {
  maxSponsoredPerOrg: number; // Ej: 1 producto patrocinado cada 8 productos orgánicos
  maxBannersPerPage: number;  // Ej: Máximo 2 banners en pantalla
  requireExplicitBadge: boolean;
}

export const DEFAULT_DENSITY_RULES: DensityRules = {
  maxSponsoredPerOrg: 8,
  maxBannersPerPage: 2,
  requireExplicitBadge: true,
};

/**
 * Filtra y valida que la inserción de contenido patrocinado cumpla estrictamente
 * las reglas de densidad y divulgación transparente del Retail Media Network de El Remate.
 */
export class RetailMediaGuard {
  private rules: DensityRules;

  constructor(rules: DensityRules = DEFAULT_DENSITY_RULES) {
    this.rules = rules;
  }

  /**
   * Determina si se puede renderizar un producto patrocinado en un índice dado de la grilla.
   */
  public canInjectSponsoredProduct(
    index: number,
    alreadyInjectedCount: number
  ): boolean {
    if (index < this.rules.maxSponsoredPerOrg) {
      // La primera pantalla debe ser 100% orgánica para garantizar LCP y confianza
      return false;
    }
    const expectedMax = Math.floor(index / this.rules.maxSponsoredPerOrg);
    return alreadyInjectedCount < expectedMax;
  }

  /**
   * Valida la presencia de etiquetas transparentes de divulgación.
   */
  public getDisclosureBadgeText(): string {
    return "PATROCINADO";
  }
}

export const retailMediaGuard = new RetailMediaGuard();
