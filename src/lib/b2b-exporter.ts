// filepath: src/lib/b2b-exporter.ts
import type { Pedido } from "@/types";

/**
 * Exporta un pedido o lista de pedidos a formato CSV compatible con Microsoft Excel.
 */
export function exportarPedidoCSV(pedido: Pedido, nombreCliente: string = "Comercio"): void {
  if (!pedido || !pedido.items || pedido.items.length === 0) return;

  const fechaTexto = new Date(pedido.fecha).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const headers = ["Código SKU", "Producto", "Cantidad", "Precio Unitario ($)", "Subtotal ($)"];

  const rows = pedido.items.map((item) => [
    `"${item.codigo}"`,
    `"${item.nombre.replace(/"/g, '""')}"`,
    item.cantidad,
    item.precioUnitario || 0,
    (item.cantidad * (item.precioUnitario || 0)),
  ]);

  // Fila de Total
  rows.push(["", '"TOTAL PEDIDO"', "", "", pedido.total]);

  const csvContent =
    "\uFEFF" + // BOM UTF-8 para Excel
    `"NOTIFICACIÓN DE PEDIDO - EL REMATE" \n` +
    `"Cliente / Comercio:","${nombreCliente}"\n` +
    `"Fecha:","${fechaTexto}"\n` +
    `"ID Pedido:","${pedido.id || "N/A"}"\n\n` +
    headers.join(",") +
    "\n" +
    rows.map((e) => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `pedido-elremate-${pedido.id || "export"}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
