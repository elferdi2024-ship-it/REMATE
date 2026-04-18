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

  lines.push(`🧾 *PEDIDO #${num}*`);
  lines.push(`📅 ${fecha}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);

  lines.push(`*CLIENTE*`);
  lines.push(`👤 ${nombre.trim() || "Cliente"}`);
  lines.push(`📱 ${telefono.trim() || "No proporcionado"}`);
  if (direccion?.trim()) {
    lines.push(`📍 ${direccion.trim()}`);
  }
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);

  lines.push(`*PRODUCTOS*`);
  for (const item of items) {
    const subtotal = item.precio * item.cantidad;
    lines.push(``);
    lines.push(`▸ *${item.nombre}*`);
    lines.push(
      `   \`${item.codigo}\` · ${item.cantidad} u. × ${formatPrecio(item.precio)} = *${formatPrecio(subtotal)}*`
    );
  }

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💰 *TOTAL ESTIMADO: ${formatPrecio(total)}*`);

  if (notas?.trim()) {
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`📝 *Obs:* ${notas.trim()}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`_Precios sujetos a confirmación_`);

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
  direccion?: string
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

  // 2. Intentar Web Share API (mobile)
  if (blob && supportsShareFiles()) {
    const file = new File([blob], `pedido-${numFinal}.png`, {
      type: "image/png",
    });

    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          // El texto aparece como caption en WhatsApp mobile
          text: `Pedido #${numFinal} — el remate`,
        });
        return; // éxito: usuario eligió WhatsApp desde el selector nativo
      } catch (err: any) {
        // El usuario canceló el selector — no es un error real
        if (err?.name !== "AbortError") {
          console.error("Error en Web Share:", err);
        }
        return;
      }
    }
  }

  // 3. Fallback desktop: descargar imagen + abrir chat de texto
  if (blob) {
    try {
      // Descarga automática de la factura
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

  // Abrir WhatsApp con el mensaje formateado
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
