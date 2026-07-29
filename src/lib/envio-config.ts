// filepath: src/lib/envio-config.ts

export type ZonaEnvio = 'canelones' | 'montevideo';

export const UMBRAL_ENVIO_GRATIS = 2500;

export const COSTOS_ENVIO: Record<ZonaEnvio, { nombre: string; costo: number }> = {
  canelones: {
    nombre: 'Canelones',
    costo: 250,
  },
  montevideo: {
    nombre: 'Montevideo',
    costo: 400,
  },
};

export function calcularCostoEnvio(
  subtotal: number,
  metodo: 'envio' | 'retiro',
  zona: ZonaEnvio
): number {
  if (metodo === 'retiro') return 0;
  if (subtotal >= UMBRAL_ENVIO_GRATIS) return 0;
  return COSTOS_ENVIO[zona]?.costo ?? 250;
}
