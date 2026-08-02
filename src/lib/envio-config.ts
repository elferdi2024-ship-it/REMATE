// filepath: src/lib/envio-config.ts

export type ZonaEnvio = 'canelones' | 'montevideo';

export const UMBRAL_ENVIO_GRATIS = 1000;

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
  zona: ZonaEnvio,
  umbralGratis: number = UMBRAL_ENVIO_GRATIS
): number {
  if (metodo === 'retiro') return 0;
  if (subtotal >= umbralGratis) return 0;
  return COSTOS_ENVIO[zona]?.costo ?? 250;
}
