// filepath: src/lib/audit-logger.ts
/**
 * Módulo de Logging de Auditoría de Seguridad.
 * Registra acciones sensibles (cambios de precio, logins, accesos admin) sin almacenar passwords ni tarjetas.
 */

export interface AuditEvent {
  tipo: "LOGIN_FALLIDO" | "LOGIN_EXITOSO" | "CAMBIO_PRECIO" | "ACCESO_ADMIN" | "MODIFICACION_PEDIDO";
  usuario: string;
  detalles: string;
  ip?: string;
  timestamp?: string;
}

const auditLogsStore: AuditEvent[] = [];

/**
 * Registra un evento de auditoría en memoria y consola de servidor de manera segura.
 */
export function logAuditEvent(event: AuditEvent): void {
  const sanitizedUser = event.usuario ? event.usuario.replace(/[^\w\s@.-]/gi, "") : "Anónimo";
  
  const logEntry: AuditEvent = {
    ...event,
    usuario: sanitizedUser,
    timestamp: new Date().toISOString(),
  };

  auditLogsStore.push(logEntry);

  // Mantener máximo 500 registros en memoria
  if (auditLogsStore.length > 500) {
    auditLogsStore.shift();
  }

  // Log estructurado en consola para recopilación por servicios de infraestructura (CloudWatch, GCP Logging)
  console.log(`[SECURITY_AUDIT] [${logEntry.timestamp}] [${logEntry.tipo}] User: ${logEntry.usuario} - ${logEntry.detalles}`);
}

/**
 * Obtiene los últimos registros de auditoría de seguridad para el panel de administración.
 */
export function getRecentAuditLogs(limit: number = 50): AuditEvent[] {
  return auditLogsStore.slice(-limit).reverse();
}
