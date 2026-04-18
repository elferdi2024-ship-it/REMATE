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
  logoUrl?: string; // ruta a tu logo, ej: "/images/logo.png"
}

// ── Helpers de canvas ────────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`));
    img.src = src;
  });
}

function generarNumeroPedido(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const ts = String(now.getTime()).slice(-4);
  return `${now.getFullYear()}${mm}${dd}-${ts}`;
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
  const { nombre, telefono, items, notas, logoUrl } = opciones;
  const numeroPedido = opciones.numeroPedido ?? generarNumeroPedido();
  const fecha = formatFecha();
  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);

  // ── Dimensiones ────────────────────────────────────────────────────────────
  const W = 640;
  const PADDING = 36;
  const COL_W = W - PADDING * 2;

  const HEADER_H = 120;
  const INFO_H = 90;
  const TABLE_ROW_H = 44;
  const TABLE_HEADER_H = 36;
  const FOOTER_H = notas?.trim() ? 130 : 90;
  const H =
    HEADER_H + INFO_H + TABLE_HEADER_H + items.length * TABLE_ROW_H + FOOTER_H;

  const canvas = document.createElement("canvas");
  // 2x para pantallas retina
  canvas.width = W * 2;
  canvas.height = H * 2;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  // ── Fondo ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // ── Header negro ───────────────────────────────────────────────────────────
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, W, HEADER_H);

  // Logo (si existe)
  let logoLoaded = false;
  if (logoUrl) {
    try {
      const img = await loadImage(logoUrl);
      const logoH = 64;
      const logoW = (img.width / img.height) * logoH;
      ctx.drawImage(img, PADDING, (HEADER_H - logoH) / 2, logoW, logoH);
      logoLoaded = true;
    } catch {
      // fallback: solo texto
    }
  }

  if (!logoLoaded) {
    // Texto "el remate" como fallback
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillText("el remate", PADDING, HEADER_H / 2 + 10);
  }

  // Número de pedido (derecha del header)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText(`PEDIDO #${numeroPedido}`, W - PADDING, HEADER_H / 2 - 8);
  ctx.font = "12px 'Courier New', monospace";
  ctx.fillStyle = "#AAAAAA";
  ctx.fillText(fecha, W - PADDING, HEADER_H / 2 + 12);
  ctx.textAlign = "left";

  // ── Sección: datos del cliente ─────────────────────────────────────────────
  let y = HEADER_H + 24;

  ctx.fillStyle = "#0A0A0A";
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillText("DATOS DEL CLIENTE", PADDING, y);

  // Línea separadora delgada
  ctx.fillStyle = "#E0E0E0";
  ctx.fillRect(PADDING, y + 6, COL_W, 1);

  y += 20;
  ctx.fillStyle = "#555555";
  ctx.font = "13px Georgia, serif";
  ctx.fillText("👤  " + (nombre || "Cliente"), PADDING, y);
  y += 22;
  ctx.fillText("📱  " + (telefono || "No proporcionado"), PADDING, y);

  // ── Tabla de productos ─────────────────────────────────────────────────────
  y = HEADER_H + INFO_H;

  // Header de la tabla
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, y, W, TABLE_HEADER_H);

  const COL = {
    nombre: PADDING,
    cod: PADDING + 248,
    cant: PADDING + 350,
    precio: PADDING + 408,
    subtotal: W - PADDING,
  };

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("PRODUCTO", COL.nombre, y + TABLE_HEADER_H / 2 + 4);
  ctx.fillText("CÓD.", COL.cod, y + TABLE_HEADER_H / 2 + 4);
  ctx.fillText("CANT.", COL.cant, y + TABLE_HEADER_H / 2 + 4);
  ctx.fillText("P.UNIT.", COL.precio, y + TABLE_HEADER_H / 2 + 4);
  ctx.textAlign = "right";
  ctx.fillText("SUBTOTAL", COL.subtotal, y + TABLE_HEADER_H / 2 + 4);

  y += TABLE_HEADER_H;

  // Filas de productos
  items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    ctx.fillStyle = isEven ? "#F9F9F9" : "#FFFFFF";
    ctx.fillRect(0, y, W, TABLE_ROW_H);

    // Borde inferior
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0, y + TABLE_ROW_H - 1, W, 1);

    const cy = y + TABLE_ROW_H / 2 + 5;
    const subtotal = item.precio * item.cantidad;

    ctx.textAlign = "left";
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "13px Georgia, serif";

    // Nombre truncado
    const maxNombreW = 220;
    let nombreDisplay = item.nombre;
    ctx.font = "13px Georgia, serif";
    while (
      ctx.measureText(nombreDisplay).width > maxNombreW &&
      nombreDisplay.length > 4
    ) {
      nombreDisplay = nombreDisplay.slice(0, -1);
    }
    if (nombreDisplay !== item.nombre) nombreDisplay += "…";
    ctx.fillText(nombreDisplay, COL.nombre, cy);

    ctx.font = "12px 'Courier New', monospace";
    ctx.fillStyle = "#666666";
    ctx.fillText(item.codigo, COL.cod, cy);

    ctx.fillStyle = "#1A1A1A";
    ctx.textAlign = "left";
    ctx.fillText(String(item.cantidad), COL.cant + 10, cy);

    ctx.fillText(formatPrecio(item.precio), COL.precio, cy);

    ctx.textAlign = "right";
    ctx.font = "bold 13px Georgia, serif";
    ctx.fillStyle = "#0A0A0A";
    ctx.fillText(formatPrecio(subtotal), COL.subtotal, cy);

    y += TABLE_ROW_H;
  });

  // ── Total ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, y, W, 52);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "13px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("TOTAL ESTIMADO", PADDING, y + 32);

  ctx.font = "bold 22px Georgia, serif";
  ctx.textAlign = "right";
  ctx.fillText(formatPrecio(total), W - PADDING, y + 33);

  y += 52;

  // ── Notas ──────────────────────────────────────────────────────────────────
  if (notas?.trim()) {
    y += 16;
    ctx.fillStyle = "#0A0A0A";
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText("OBSERVACIONES", PADDING, y);

    ctx.fillStyle = "#E0E0E0";
    ctx.fillRect(PADDING, y + 6, COL_W, 1);

    y += 22;
    ctx.fillStyle = "#444444";
    ctx.font = "13px Georgia, serif";

    // Wrap de texto para notas largas
    const maxW = COL_W;
    const words = notas.trim().split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, PADDING, y);
        y += 18;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, PADDING, y);
    y += 22;
  }

  // ── Pie de página ──────────────────────────────────────────────────────────
  y += 16;
  ctx.fillStyle = "#F0F0F0";
  ctx.fillRect(0, y, W, 1);
  y += 16;

  ctx.fillStyle = "#AAAAAA";
  ctx.font = "12px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("¡Gracias por tu pedido en el remate!", W / 2, y);
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillText("Este comprobante es orientativo — precios sujetos a confirmación", W / 2, y + 16);

  // ── Exportar como Blob ─────────────────────────────────────────────────────
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Error al generar la imagen"));
      },
      "image/png",
      1.0
    );
  });
}

// ── Descarga directa (fallback desktop) ─────────────────────────────────────

export async function descargarFactura(opciones: FacturaOptions): Promise<void> {
  const blob = await generarFacturaBlob(opciones);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pedido-elremate-${opciones.numeroPedido ?? Date.now()}.png`;
  a.click();
  URL.revokeObjectURL(url);
}
