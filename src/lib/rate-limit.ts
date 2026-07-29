// filepath: src/lib/rate-limit.ts
/**
 * Implementación de Rate Limiting en memoria para Next.js (Token Bucket / Sliding Window)
 * Protege endpoints sensibles como login, checkout y búsquedas públicas contra bots y brute-force.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Limpieza periódica cada 5 minutos para evitar fugas de memoria
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    memoryStore.forEach((record, key) => {
      if (now > record.resetTime) {
        memoryStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit?: number;      // Máximo de peticiones permitidas en la ventana
  windowMs?: number;   // Tamaño de la ventana de tiempo en milisegundos
}

/**
 * Verifica si una clave (IP o Identifier) ha excedido el límite de peticiones.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { success: boolean; remaining: number; resetTime: number } {
  const limit = options.limit || 10;
  const windowMs = options.windowMs || 60 * 1000; // 1 minuto por defecto
  const now = Date.now();

  const key = `ratelimit:${identifier}`;
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}
