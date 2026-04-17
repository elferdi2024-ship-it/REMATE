interface CartItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

/**
 * Formats the WhatsApp message exactly as PRD section 9 specifies.
 * Uses plain, user-friendly language — no technical jargon.
 */
export function armarMensajeWA(
  nombre: string,
  telefono: string,
  items: CartItem[],
  notas?: string
): string {
  const displayName = nombre.trim() || "Cliente";
  const displayTel = telefono.trim() || "No proporcionado";
  const lines: string[] = [];

  // Header - Cliente
  lines.push(`*INFORMACIÓN DEL CLIENTE*`);
  lines.push(`👤 Nombre: ${displayName}`);
  lines.push(`📱 Teléfono: ${displayTel}`);
  lines.push("");

  // Header - Pedido
  lines.push(`*DETALLE DEL PEDIDO*`);
  lines.push(`_Concepto | Unidades | Código_`);
  lines.push(`----------------------------------`);

  // Items
  for (const item of items) {
    // Limit name length for table view
    const shortName = item.nombre.length > 20 ? item.nombre.substring(0, 18) + ".." : item.nombre;
    lines.push(`${shortName} | *${item.cantidad}* | ${item.codigo}`);
  }

  lines.push(`----------------------------------`);
  lines.push(
    `*TOTAL ESTIMADO: $${items.reduce((sum, i) => sum + i.precio * i.cantidad, 0).toLocaleString("es-UY")}*`
  );

  // Notes
  if (notas?.trim()) {
    lines.push("");
    lines.push(`*Notas:* ${notas.trim()}`);
  }

  return lines.join("\n");
}

/**
 * Opens the WhatsApp web link with the given number and message.
 * Uses NEXT_PUBLIC_WA_NUMBER from env as fallback if no number provided.
 */
export function enviarWhatsApp(numero: string, mensaje: string): void {
  const phone = numero || process.env.NEXT_PUBLIC_WA_NUMBER || "";
  const encoded = encodeURIComponent(mensaje);
  const url = `https://wa.me/${phone}?text=${encoded}`;
  window.open(url, "_blank");
}
