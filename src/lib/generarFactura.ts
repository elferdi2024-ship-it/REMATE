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
  const { nombre, telefono, items, notas, logoUrl, numeroPedido } = opciones;
  const idPedido = numeroPedido || "S/N";
  const fecha = formatFecha();
  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);

  // ── Dimensiones ────────────────────────────────────────────────────────────
  const W = 640;
  const PADDING = 40;
  const COL_W = W - PADDING * 2;

  const HEADER_H = 140;
  const INFO_H = 100;
  const TABLE_HEADER_H = 40;
  const TABLE_ROW_H = 50; // Más alto para legibilidad
  const FOOTER_MIN_H = 120;
  
  // Calcular altura dinámica
  const itemsH = items.length * TABLE_ROW_H;
  const notasH = notas?.trim() ? 60 + (notas.length / 50) * 20 : 0;
  const H = HEADER_H + INFO_H + TABLE_HEADER_H + itemsH + FOOTER_MIN_H + notasH;

  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  // Fondo blanco limpio
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // ── Header Premium ──────────────────────────────────────────────────────────
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, HEADER_H);

  // Logo
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

  // ID de Pedido (Derecha, Muy Legible)
  ctx.textAlign = "right";
  ctx.fillStyle = "#00E5FF"; // Cyan neón para el ID como en la web
  ctx.font = "bold 14px monospace";
  ctx.fillText("ID DE PEDIDO", W - PADDING, HEADER_H / 2 - 10);
  ctx.font = "bold 24px monospace";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(idPedido, W - PADDING, HEADER_H / 2 + 18);
  
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

  // Separador
  y += 15;
  ctx.strokeStyle = "#EEEEEE";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, y);
  ctx.lineTo(W - PADDING, y);
  ctx.stroke();

  // ── Tabla de Productos ─────────────────────────────────────────────────────
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

  // Filas
  items.forEach((item, i) => {
    if (i % 2 !== 0) {
      ctx.fillStyle = "#FAFAFA";
      ctx.fillRect(PADDING, y, COL_W, TABLE_ROW_H);
    }
    
    const cy = y + TABLE_ROW_H / 2 + 5;
    
    // Nombre
    ctx.fillStyle = "#000000";
    ctx.font = "bold 13px sans-serif";
    let n = item.nombre;
    if (ctx.measureText(n).width > 240) {
        while(ctx.measureText(n + "...").width > 240) n = n.slice(0, -1);
        n += "...";
    }
    ctx.fillText(n, COL.prod, cy - 2);
    
    // Código y P.Unit abajo en gris si es necesario, pero aquí pedimos legibilidad
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

  // ── Total Final ───────────────────────────────────────────────────────────
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

  y += 80;

  // Disclaimer / Advertencia (Solicitado por el usuario)
  ctx.fillStyle = "#FFF9C4"; // Amarillo muy suave de fondo
  ctx.fillRect(PADDING, y, COL_W, 45);
  ctx.strokeStyle = "#FBC02D";
  ctx.lineWidth = 1;
  ctx.strokeRect(PADDING, y, COL_W, 45);

  ctx.textAlign = "center";
  ctx.fillStyle = "#444444";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("⚠️ DOCUMENTO NO VÁLIDO COMO FACTURA FISCAL", W / 2, y + 20);
  ctx.font = "10px sans-serif";
  ctx.fillText("Este documento es una NOTA DE PEDIDO. El pago y la factura final se coordinan por privado.", W / 2, y + 34);
  ctx.textAlign = "left";

  y += 75;

  // Observaciones
  if (notas?.trim()) {
    ctx.fillStyle = "#666666";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("OBSERVACIONES", PADDING, y);
    y += 20;
    ctx.fillStyle = "#333333";
    ctx.font = "italic 13px sans-serif";
    
    // Wrap simple
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

  // Footer
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
