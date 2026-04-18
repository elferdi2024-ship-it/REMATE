interface CartItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface FacturaOptions {
  nombre: string;
  telefono: string;
  items: CartItem[];
  notas?: string;
  direccion?: string;
  numeroPedido?: string;
  logoUrl?: string;
}

// ── Helpers de canvas ────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`));
    img.src = src;
  });
}

function formatFecha(): string {
  const now = new Date();
  return now.toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrecio(valor: number): string {
  return `$${valor.toLocaleString("es-UY")}`;
}

// ── Generador principal ──────────────────────────────────────────────────────

export async function generarFacturaBlob(
  opciones: FacturaOptions
): Promise<Blob> {
  const { nombre, telefono, items, notas, direccion, logoUrl, numeroPedido } = opciones;
  
  // Sincronización de ID: Mostramos los últimos 6 en grande para búsqueda rápida en Admin
  // Pero mantenemos el ID completo por debajo o legible.
  const idCompleto = numeroPedido || "S/N";
  const idResumen = idCompleto.length > 8 ? idCompleto.slice(-6).toUpperCase() : idCompleto;
  
  const fecha = formatFecha();
  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);

  // ── Dimensiones ────────────────────────────────────────────────────────────
  const W = 640;
  const PADDING = 40;
  const COL_W = W - PADDING * 2;

  const HEADER_H = 150;
  const INFO_H = direccion?.trim() ? 120 : 100;
  const TABLE_HEADER_H = 40;
  const TABLE_ROW_H = 50; 
  const FOOTER_MIN_H = 120;
  const DISCLAIMER_H = 130;
  
  const itemsH = items.length * TABLE_ROW_H;
  const notasH = notas?.trim() ? 60 + (notas.length / 50) * 20 : 0;
  const H = HEADER_H + INFO_H + TABLE_HEADER_H + itemsH + FOOTER_MIN_H + notasH + DISCLAIMER_H;

  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // ── Header ──────────────────────────────────────────────────────────
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, HEADER_H);

  let logoLoaded = false;
  if (logoUrl) {
    try {
      const img = await loadImage(logoUrl);
      const logoH = 70;
      const logoW = (img.width / img.height) * logoH;
      ctx.drawImage(img, PADDING, (HEADER_H - logoH) / 2, logoW, logoH);
      logoLoaded = true;
    } catch { /* fallback */ }
  }

  if (!logoLoaded) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("el remate", PADDING, HEADER_H / 2 + 10);
  }

  // ID de Pedido (Sincronizado con Admin)
  ctx.textAlign = "right";
  ctx.fillStyle = "#00E5FF";
  ctx.font = "bold 12px monospace";
  ctx.fillText("BÚSQUEDA ADMIN (ÚLT. 6)", W - PADDING, HEADER_H / 2 - 15);
  ctx.font = "bold 34px monospace";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(idResumen, W - PADDING, HEADER_H / 2 + 15);
  ctx.font = "10px monospace";
  ctx.fillStyle = "#666666";
  ctx.fillText(idCompleto, W - PADDING, HEADER_H / 2 + 30);
  
  ctx.textAlign = "left";

  // ── Info Cliente ───────────────────────────────────────────────────────────
  let y = HEADER_H + 30;
  ctx.fillStyle = "#666666";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("DETALLES DEL CLIENTE", PADDING, y);
  
  y += 25;
  ctx.fillStyle = "#000000";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(nombre || "Cliente", PADDING, y);
  
  ctx.textAlign = "right";
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#444444";
  ctx.fillText(telefono || "Sin teléfono", W - PADDING, y);
  ctx.textAlign = "left";

  if (direccion?.trim()) {
    y += 22;
    ctx.fillStyle = "#555555";
    ctx.font = "13px sans-serif";
    ctx.fillText("📍 " + direccion, PADDING, y);
  }

  y += 15;
  ctx.strokeStyle = "#EEEEEE";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, y);
  ctx.lineTo(W - PADDING, y);
  ctx.stroke();

  // ── Tabla ─────────────────────────────────────────────────────
  y += 30;
  ctx.fillStyle = "#F8F8F8";
  ctx.fillRect(PADDING, y, COL_W, TABLE_HEADER_H);
  
  ctx.fillStyle = "#000000";
  ctx.font = "bold 11px sans-serif";
  const COL = {
    prod: PADDING + 10,
    cod: PADDING + 280,
    cant: PADDING + 380,
    unit: PADDING + 450,
    sub: W - PADDING - 10
  };
  
  const ty = y + TABLE_HEADER_H / 2 + 4;
  ctx.fillText("PRODUCTO", COL.prod, ty);
  ctx.fillText("CÓDIGO", COL.cod, ty);
  ctx.fillText("CANT", COL.cant, ty);
  ctx.fillText("P.UNIT", COL.unit, ty);
  ctx.textAlign = "right";
  ctx.fillText("TOTAL", COL.sub, ty);
  ctx.textAlign = "left";

  y += TABLE_HEADER_H;

  items.forEach((item, i) => {
    if (i % 2 !== 0) {
      ctx.fillStyle = "#FAFAFA";
      ctx.fillRect(PADDING, y, COL_W, TABLE_ROW_H);
    }
    const cy = y + TABLE_ROW_H / 2 + 5;
    ctx.fillStyle = "#000000";
    ctx.font = "bold 13px sans-serif";
    let n = item.nombre;
    if (ctx.measureText(n).width > 240) {
        while(ctx.measureText(n + "...").width > 240) n = n.slice(0, -1);
        n += "...";
    }
    ctx.fillText(n, COL.prod, cy - 2);
    ctx.font = "11px monospace";
    ctx.fillStyle = "#888888";
    ctx.fillText(item.codigo, COL.cod, cy - 2);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(String(item.cantidad), COL.cant + 5, cy - 2);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#666666";
    ctx.fillText(formatPrecio(item.precio), COL.unit, cy - 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(formatPrecio(item.precio * item.cantidad), COL.sub, cy - 2);
    ctx.textAlign = "left";
    y += TABLE_ROW_H;
  });

  // ── Total ───────────────────────────────────────────────────────────
  y += 20;
  ctx.fillStyle = "#000000";
  ctx.fillRect(PADDING, y, COL_W, 60);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("TOTAL DEL PEDIDO", PADDING + 20, y + 35);
  ctx.textAlign = "right";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText(formatPrecio(total), W - PADDING - 20, y + 42);
  ctx.textAlign = "left";

  y += 85;

  // Disclaimer
  ctx.fillStyle = "#FFF9C4";
  ctx.fillRect(PADDING, y, COL_W, 50);
  ctx.strokeStyle = "#FBC02D";
  ctx.lineWidth = 1;
  ctx.strokeRect(PADDING, y, COL_W, 50);
  ctx.textAlign = "center";
  ctx.fillStyle = "#444444";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("⚠️ DOCUMENTO NO VÁLIDO COMO FACTURA FISCAL", W / 2, y + 22);
  ctx.font = "10.5px sans-serif";
  ctx.fillText("Este documento es una NOTA DE PEDIDO. El pago y la factura final se coordinan por privado.", W / 2, y + 38);
  ctx.textAlign = "left";

  y += 85;

  if (notas?.trim()) {
    ctx.fillStyle = "#666666";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("OBSERVACIONES", PADDING, y);
    y += 20;
    ctx.fillStyle = "#333333";
    ctx.font = "italic 13px sans-serif";
    const words = notas.split(" ");
    let line = "";
    words.forEach(w => {
        if (ctx.measureText(line + w).width > COL_W) {
            ctx.fillText(line, PADDING, y);
            y += 18;
            line = w + " ";
        } else {
            line += w + " ";
        }
    });
    ctx.fillText(line, PADDING, y);
    y += 30;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#999999";
  ctx.font = "11px sans-serif";
  ctx.fillText("Pedido realizado a través de elremate.com.uy", W/2, H - 40);
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("FECHA: " + fecha, W/2, H - 25);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject("Canvas error"), "image/png");
  });
}

export async function descargarFactura(opciones: FacturaOptions): Promise<void> {
  const blob = await generarFacturaBlob(opciones);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pedido-${opciones.numeroPedido || "remate"}.png`;
  a.click();
  URL.revokeObjectURL(url);
}
