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
  direccion?: string
): string {
  const num = numeroPedido ?? generarNumeroPedido();
  const fecha = new Date().toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const lines: string[] = [];

  lines.push(`🧾 *PEDIDO MAYORISTA #${num}*`);
  lines.push(`📅 ${fecha}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);

  lines.push(`*DATOS DEL CLIENTE*`);
  lines.push(`👤 *Nombre:* ${nombre.trim() || "Cliente"}`);
  lines.push(`📱 *Tel:* ${telefono.trim() || "No proporcionado"}`);
  if (direccion?.trim()) {
    lines.push(`📍 *Entrega:* ${direccion.trim()}`);
  }
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);

  lines.push(`*🛒 DETALLE DEL PEDIDO*`);
  lines.push(``);
  for (const item of items) {
    const subtotal = item.precio * item.cantidad;
    // Formato tabular legible
    lines.push(`📦 *${item.nombre}*`);
    lines.push(`   ↳ \`${item.codigo}\` | ${item.cantidad} x ${formatPrecio(item.precio)} = *${formatPrecio(subtotal)}*`);
  }

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💰 *TOTAL A PAGAR: ${formatPrecio(total)}*`);

  if (notas?.trim()) {
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`📝 *NOTAS AL VENDEDOR:*`);
    lines.push(`_${notas.trim()}_`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`⚡ _Pedido generado desde Catálogo Web_`);

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
  skipRedirect: boolean = false
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

  // Descarga automática de la factura (tanto en móvil como en PC)
  if (blob) {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pedido-${numFinal}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Si falla la descarga, continuar igual con el mensaje
    }
  }

  // Abrir WhatsApp directo al chat de la sucursal
  const mensaje = armarMensajeWA(nombre, telefono, items, notas, numFinal, direccion);
  const encoded = encodeURIComponent(mensaje);
  const url = `https://wa.me/${phone}?text=${encoded}`;
  window.open(url, "_blank");
}

// ── Función de compatibilidad (mantiene la API anterior) ─────────────────────

/**
 * @deprecated Usar `enviarFacturaWhatsApp` para incluir la imagen.
 * Se conserva para no romper integraciones existentes.
 */
export function enviarWhatsApp(numero: string, mensaje: string): void {
  const phone = numero || process.env.NEXT_PUBLIC_WA_NUMBER || "";
  const encoded = encodeURIComponent(mensaje);
  const url = `https://wa.me/${phone}?text=${encoded}`;
  window.open(url, "_blank");
}
