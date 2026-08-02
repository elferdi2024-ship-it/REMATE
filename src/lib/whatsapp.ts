import { generarFacturaBlob, descargarFactura } from "./generarFactura";

interface CartItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrecio(valor: number): string {
  return `$${valor.toLocaleString("es-UY")}`;
}

function generarNumeroPedido(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const ts = String(now.getTime()).slice(-4);
  return `${now.getFullYear()}${mm}${dd}-${ts}`;
}

function isMobile(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

function supportsShareFiles(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  );
}

// ── Mensaje de texto enriquecido (respaldo o complemento) ────────────────────

export function armarMensajeWA(
  nombre: string,
  telefono: string,
  items: CartItem[],
  notas?: string,
  numeroPedido?: string,
  direccion?: string,
  costoEnvio: number = 0
): string {
  const num = numeroPedido ?? generarNumeroPedido();
  const fecha = new Date().toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const subtotalItems = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const totalFinal = subtotalItems + costoEnvio;
  const lines: string[] = [];

  lines.push(`🧾 *PEDIDO MAYORISTA EL REMATE #${num}*`);
  lines.push(`📅 ${fecha}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);

  lines.push(`*👤 DATOS DEL CLIENTE*`);
  lines.push(`• *Nombre / Negocio:* ${nombre.trim() || "Cliente"}`);
  lines.push(`• *Teléfono:* ${telefono.trim() || "No proporcionado"}`);
  if (direccion?.trim()) {
    lines.push(`• *Dirección:* ${direccion.trim()}`);
  }
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);

  lines.push(`*🛒 PRODUCTOS DE TU PEDIDO (${items.length})*`);
  lines.push(``);
  for (const item of items) {
    const sub = item.precio * item.cantidad;
    lines.push(`📦 *${item.nombre}*`);
    lines.push(`   ↳ SKU: \`${item.codigo}\` | Cantidad: ${item.cantidad} u. x ${formatPrecio(item.precio)} = *${formatPrecio(sub)}*`);
  }

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`*💵 RESUMEN DE COMPRA*`);
  lines.push(`• Subtotal Productos: *${formatPrecio(subtotalItems)}*`);
  if (costoEnvio > 0) {
    lines.push(`• Envío: *${formatPrecio(costoEnvio)}*`);
  } else {
    lines.push(`• Envío: *¡GRATIS! ($0)*`);
  }
  lines.push(`💰 *TOTAL A PAGAR: ${formatPrecio(totalFinal)}*`);

  if (notas?.trim()) {
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`📝 *INDICACIONES DE ENTREGA Y PREFERENCIAS:*`);
    lines.push(`${notas.trim()}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`⚡ _Pedido enviado mediante El Remate Web Express_`);

  return lines.join("\n");
}

// ── Función principal ────────────────────────────────────────────────────────

/**
 * Genera la factura como imagen y la envía a WhatsApp.
 *
 * - Mobile con Web Share API → comparte imagen directo a WhatsApp
 * - Desktop / sin soporte   → descarga la imagen + abre chat de texto
 */
export async function enviarFacturaWhatsApp(
  numero: string,
  nombre: string,
  telefono: string,
  items: CartItem[],
  notas?: string,
  logoUrl?: string,
  numeroPedido?: string,
  direccion?: string,
  skipRedirect: boolean = false,
  costoEnvio: number = 0
): Promise<void> {
  const phone = numero || process.env.NEXT_PUBLIC_WA_NUMBER || "";
  const numFinal = numeroPedido || generarNumeroPedido();

  // 1. Generar imagen de la factura
  let blob: Blob | null = null;
  try {
    blob = await generarFacturaBlob({
      nombre,
      telefono,
      items,
      notas,
      numeroPedido: numFinal,
      logoUrl,
      direccion,
    });
  } catch (err) {
    console.error("Error generando factura:", err);
  }

  // Si skipRedirect es true, solo descargamos la imagen y retornamos temprano sin abrir WhatsApp
  if (skipRedirect) {
    if (blob) {
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pedido-${numFinal}.png`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error descargando factura en modo silencioso:", err);
      }
    }
    return;
  }

  // 1. Copiar siempre mensaje al portapapeles como respaldo silencioso
  const mensaje = armarMensajeWA(nombre, telefono, items, notas, numFinal, direccion, costoEnvio);
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(mensaje).catch(() => {});
  }

  // 2. Abrir WhatsApp directo al chat de la sucursal (camino principal)
  const encoded = encodeURIComponent(mensaje);
  const isMob = isMobile();
  const primaryUrl = isMob
    ? `whatsapp://send?phone=${phone}&text=${encoded}`
    : `https://wa.me/${phone}?text=${encoded}`;

  const win = window.open(primaryUrl, "_blank");

  // 3. FALLBACK DE ÚLTIMO RECURSO (solo si la ventana fue bloqueada o no abrió)
  setTimeout(() => {
    if (!win || win.closed || typeof win.closed === "undefined") {
      const webUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;
      const winWeb = window.open(webUrl, "_blank");

      // Si tampoco se pudo abrir WhatsApp Web, descargar el PNG como último recurso
      setTimeout(() => {
        if ((!winWeb || winWeb.closed || typeof winWeb.closed === "undefined") && blob) {
          try {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `pedido-${numFinal}.png`;
            a.click();
            URL.revokeObjectURL(url);
          } catch (e) {
            console.error("Error en descarga fallback:", e);
          }
        }
      }, 500);
    }
  }, 800);
}

// ── Función de compatibilidad (mantiene la API anterior) ─────────────────────

/**
 * Usar para enviar cualquier mensaje genérico por WhatsApp con fallback.
 */
export function enviarWhatsApp(numero: string, mensaje: string): void {
  const phone = numero || process.env.NEXT_PUBLIC_WA_NUMBER || "";
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(mensaje).catch(() => {});
  }
  const encoded = encodeURIComponent(mensaje);
  const primaryUrl = isMobile()
    ? `whatsapp://send?phone=${phone}&text=${encoded}`
    : `https://wa.me/${phone}?text=${encoded}`;

  const win = window.open(primaryUrl, "_blank");

  setTimeout(() => {
    if (!win || win.closed || typeof win.closed === "undefined") {
      const webUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;
      window.open(webUrl, "_blank");
    }
  }, 800);
}
