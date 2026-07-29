// filepath: src/lib/security-sanitizer.ts
/**
 * Módulo de sanitización de texto e inputs de usuario para prevención de XSS e inyecciones.
 */

/**
 * Sanitiza cadenas de texto para evitar inyección de HTML o scripts (<script>, event handlers, etc.).
 */
export function sanitizeInputText(input: string): string {
  if (!input) return "";

  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Valida y limpia números telefónicos para evitar inyección de caracteres maliciosos.
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return "";
  return phone.replace(/[^\d\s\+\-\(\)]/g, "").trim();
}

/**
 * Valida correos electrónicos con patrón estricto.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida RUT uruguayo básico (12 dígitos numéricos).
 */
export function isValidRutUruguayo(rut: string): boolean {
  if (!rut) return false;
  const cleanRut = rut.replace(/\D/g, "");
  return cleanRut.length === 12;
}
