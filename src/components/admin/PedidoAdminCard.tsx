// filepath: src/components/admin/PedidoAdminCard.tsx
"use client";

import { useState, useEffect } from "react";
import { actualizarEstadoPedido, eliminarPedido, type PedidoItem } from "@/lib/pedidos";
import { SUCURSALES } from "@/lib/sucursales";

export interface PedidoAdmin {
  id: string;
  uid: string | null;
  clienteNombre: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  fecha: { seconds: number; nanoseconds: number } | Date;
  items: PedidoItem[];
  total: number;
  notas?: string;
  status?: "no_leido" | "pendiente" | "cargado";
  sucursalId?: string | null;
}

interface PedidoAdminCardProps {
  pedido: PedidoAdmin;
  onViewFull: (pedido: PedidoAdmin) => void;
}

function formatDate(ts: { seconds: number; nanoseconds: number } | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts.seconds * 1000);
  return d.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });
}

function isNew(ts: { seconds: number; nanoseconds: number } | Date): boolean {
  const d = ts instanceof Date ? ts.getTime() : ts.seconds * 1000;
  return Date.now() - d < 5 * 60 * 1000; // 5 min
}

export default function PedidoAdminCard({ pedido, onViewFull }: PedidoAdminCardProps) {
  const [isViewingFull, setIsViewingFull] = useState(false);
  const [isViewingReceipt, setIsViewingReceipt] = useState(false);
  const [isFresh, setIsFresh] = useState(isNew(pedido.fecha));
  const [status, setStatus] = useState(pedido.status || "no_leido");
  const [isUpdating, setIsUpdating] = useState(false);

  const cleanPhone = (tel: string) => {
    let cleaned = tel.replace(/[\s\-\(\)]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.startsWith("598")) {
      return cleaned;
    }
    return `598${cleaned}`;
  };

  const getWhatsAppMessage = () => {
    const isRetiro = pedido.clienteDireccion?.includes("RETIRO EN LOCAL");
    const text = `*Distribuidora El Remate* 🛒\n\n¡Hola *${pedido.clienteNombre}*! Recibimos tu pedido en la web.\n\n📋 *Detalle del Pedido:*\n🔢 ID de Orden: #${pedido.id.slice(-6).toUpperCase()}\n💰 Total Estimado: ${formatCurrency(pedido.total)}\n🚚 Entrega: ${isRetiro ? "Retiro en local" : "Envío a domicilio"}\n\nEl despacho de tu pedido está en proceso. ¡Muchas gracias por tu preferencia!`;
    return encodeURIComponent(text);
  };

  const handleImprimir = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    const fechaFormateada = new Date(pedido.fecha instanceof Date ? pedido.fecha : pedido.fecha.seconds * 1000).toLocaleString("es-UY");

    const itemsHtml = pedido.items
      .map(
        (i) => `
        <tr class="item-row">
          <td class="qty">${i.cantidad}</td>
          <td class="desc">
            <span class="name">${i.nombre}</span>
            <span class="code">(${i.codigo})</span>
          </td>
          <td class="price">${formatCurrency(i.cantidad * i.precioUnitario)}</td>
        </tr>
      `
      )
      .join("");

    const isRetiro = pedido.clienteDireccion?.includes("RETIRO EN LOCAL");
    const metodoLabel = isRetiro ? "🟢 RETIRO EN SUCURSAL" : "🚚 ENVÍO A DOMICILIO";
    const direccionClean = pedido.clienteDireccion
      ? pedido.clienteDireccion.replace("RETIRO EN LOCAL: ", "").replace("RETIRO EN SUCURSAL: ", "").replace("🏠 ENVÍO A DOMICILIO: ", "")
      : "No especificada";

    const content = `
      <html>
        <head>
          <title>Picking - #${pedido.id.slice(-6).toUpperCase()}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 74mm;
              margin: 0 auto;
              padding: 5mm 0;
              font-size: 11px;
              color: #000;
              line-height: 1.3;
            }
            .text-center { text-align: center; }
            .header {
              border-bottom: 1px dashed #000;
              padding-bottom: 3mm;
              margin-bottom: 3mm;
              font-size: 11px;
            }
            .title {
              font-size: 16px;
              font-weight: bold;
              margin: 0 0 1mm 0;
              letter-spacing: 1px;
            }
            .subtitle {
              font-size: 10px;
              margin: 0 0 2mm 0;
              text-transform: uppercase;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 3mm;
              font-size: 10px;
            }
            .info-table td {
              padding: 0.5mm 0;
              vertical-align: top;
            }
            .info-table td.label {
              font-weight: bold;
              width: 18mm;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 3mm 0;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
            }
            .items-table th {
              border-bottom: 1px solid #000;
              text-align: left;
              font-size: 10px;
              padding-bottom: 1mm;
            }
            .items-table td {
              padding: 1.5mm 0;
              vertical-align: top;
            }
            .items-table .qty {
              width: 8mm;
              font-weight: bold;
              font-size: 12px;
            }
            .items-table .desc {
              font-size: 11px;
            }
            .items-table .desc .name {
              display: block;
              text-transform: uppercase;
            }
            .items-table .desc .code {
              font-size: 9px;
              color: #555;
              display: block;
              margin-top: 0.5mm;
            }
            .items-table .price {
              text-align: right;
              width: 18mm;
              font-weight: bold;
            }
            .totals {
              margin-top: 3mm;
              text-align: right;
              font-size: 13px;
              font-weight: bold;
            }
            .notes {
              margin-top: 4mm;
              padding: 2mm;
              border: 1px dashed #000;
              font-size: 9px;
              background-color: #f9f9f9;
            }
            .notes-title {
              font-weight: bold;
              margin-bottom: 1mm;
              text-transform: uppercase;
            }
            .signature {
              margin-top: 10mm;
              border-top: 1px solid #000;
              text-align: center;
              padding-top: 2mm;
              font-size: 10px;
            }
            @media print {
              body {
                width: 74mm;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header text-center">
            <h1 class="title">EL REMATE</h1>
            <p class="subtitle">Distribuidora · Canelones</p>
            <div style="font-size: 12px; font-weight: bold; margin-top: 2mm;">
              TICKET DE PREPARACIÓN
            </div>
            <div style="font-size: 10px;">ID: #${pedido.id.slice(-6).toUpperCase()}</div>
          </div>

          <table class="info-table">
            <tr>
              <td class="label">CLIENTE:</td>
              <td style="font-weight: bold; text-transform: uppercase;">${pedido.clienteNombre}</td>
            </tr>
            ${pedido.clienteTelefono ? `
            <tr>
              <td class="label">TEL:</td>
              <td>${pedido.clienteTelefono}</td>
            </tr>` : ''}
            <tr>
              <td class="label">FECHA:</td>
              <td>${fechaFormateada}</td>
            </tr>
            <tr>
              <td class="label">ENTREGA:</td>
              <td style="font-weight: bold;">${metodoLabel}</td>
            </tr>
            <tr>
              <td class="label">DIREC:</td>
              <td style="font-size: 9px; max-width: 56mm; word-wrap: break-word;">${direccionClean}</td>
            </tr>
          </table>

          <div class="divider"></div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 8mm;">CANT</th>
                <th>DETALLE</th>
                <th style="text-align: right; width: 18mm;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="totals">
            TOTAL: ${formatCurrency(pedido.total)}
          </div>

          ${pedido.notas ? `
          <div class="notes">
            <div class="notes-title">Observaciones:</div>
            <div>${pedido.notas}</div>
          </div>` : ''}

          <div class="signature">
            Firma Preparador / Reparto
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFresh(isNew(pedido.fecha));
    }, 30000);
    return () => clearInterval(interval);
  }, [pedido.fecha]);

  const handleStatusChange = async (newStatus: "no_leido" | "pendiente" | "cargado") => {
    try {
      setIsUpdating(true);
      await actualizarEstadoPedido(pedido.id, newStatus);
      setStatus(newStatus);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEliminar = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.")) {
      try {
        setIsUpdating(true);
        await eliminarPedido(pedido.id);
      } catch (err) {
        console.error("Error deleting order:", err);
        alert("Error al eliminar el pedido");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCopiadoFacturacion = () => {
    // Formato para sistema de facturación: CÓDIGO [TAB] PRODUCTO [TAB] CANTIDAD
    const lineas = pedido.items.map(item =>
      `${item.codigo}\t${item.nombre}\t${item.cantidad}`
    );
    const textoFinal = lineas.join('\n');
    copyToClipboard(textoFinal, "¡Copiado para Facturación! ✅\nListo para pegar en el sistema.");
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        handleStatusChange("cargado");
        alert(message);
      })
      .catch(err => {
        console.error("Error al copiar", err);
      });
  };

  const handleCopiadoRecibo = () => {
    // Formato solicitado: SOLO CÓDIGO, NOMBRE Y CANTIDAD (Sin precios ni totales)
    const lineas = pedido.items.map(i => 
      `${i.codigo} | ${i.nombre} | Cant: ${i.cantidad}`
    );
    
    const textoFinal = lineas.join('\n');
    
    copyToClipboard(textoFinal, "¡Lista de productos copiada! ✅\n(Código, Nombre y Cantidad)");
  };

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });
  }

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-[24px] border transition-all duration-300 text-[var(--admin-text-mid)] ${
        status === "no_leido"
          ? "border-red-500/50 bg-red-500/5 shadow-[0_8px_30px_rgba(239,68,68,0.15)] animate-[pulse_2.5s_infinite]"
          : isFresh
          ? "border-blue-500/30 bg-blue-500/5 shadow-[0_8px_30px_rgba(59,130,246,0.12)]"
          : "border-[var(--admin-border)] bg-[var(--admin-card-bg)] hover:border-[var(--admin-accent)]/20 hover:shadow-xl"
      }`}
    >
      {/* Fresh Badge */}
      {isFresh && (
        <div className="absolute right-4 top-0 z-10">
          <div className="rounded-b-lg bg-blue-500 px-3 py-1 shadow-md animate-pulse">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white">NUEVO PEDIDO</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 p-5 sm:p-6">
        {/* Pipeline Stepper / Header Meta */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--admin-border)] pb-4">
          <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-start w-full sm:w-auto">
            {/* Stepper horizontal interactivo de estados */}
            <div className="flex items-center gap-1.5 flex-none">
              {/* Recibido */}
              <button
                disabled={isUpdating}
                onClick={() => handleStatusChange("no_leido")}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                  status === "no_leido"
                    ? "bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                    : "bg-[var(--admin-bg)] text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
                }`}
                title="Recibido / No Leído"
              >
                <span className="text-[11px]">📥</span>
              </button>
              <div className={`h-[2px] w-4 sm:w-6 rounded transition-colors duration-300 ${status === "pendiente" || status === "cargado" ? "bg-amber-500" : "bg-[var(--admin-border)]"}`} />
              
              {/* Preparando */}
              <button
                disabled={isUpdating}
                onClick={() => handleStatusChange("pendiente")}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                  status === "pendiente"
                    ? "bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    : status === "cargado"
                    ? "bg-amber-500/20 text-amber-500"
                    : "bg-[var(--admin-bg)] text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
                }`}
                title="Preparando / Pendiente"
              >
                <span className="text-[11px]">📦</span>
              </button>
              <div className={`h-[2px] w-4 sm:w-6 rounded transition-colors duration-300 ${status === "cargado" ? "bg-green-500" : "bg-[var(--admin-border)]"}`} />

              {/* Cargado */}
              <button
                disabled={isUpdating}
                onClick={() => handleStatusChange("cargado")}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                  status === "cargado"
                    ? "bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                    : "bg-[var(--admin-bg)] text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
                }`}
                title="Cargado / Completado"
              >
                <span className="text-[11px]">🚚</span>
              </button>
            </div>
            
            <div className="rounded-full bg-[var(--admin-bg)] px-2.5 py-1 border border-[var(--admin-border)] shrink-0">
              <span className="font-mono text-[9px] font-bold text-[var(--admin-text-lo)]">
                {formatDate(pedido.fecha)}
              </span>
            </div>
          </div>

          <div className="self-end sm:self-center rounded-md bg-[var(--admin-bg)] px-2.5 py-1 text-[10px] font-bold text-[var(--admin-text-lo)] border border-[var(--admin-border)] shrink-0">
            ID: <span className="font-mono text-[var(--admin-text-hi)]">{pedido.id.slice(-6).toUpperCase()}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--admin-text-hi)] truncate flex items-center gap-2" title={pedido.clienteNombre}>
              {status === "no_leido" && (
                <span className="relative flex h-3.5 w-3.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                </span>
              )}
              <span>{pedido.clienteNombre}</span>
            </h3>
            <div className="flex items-center gap-2.5 flex-wrap mt-1">
              <span className="text-[11px] font-semibold text-[var(--admin-text-lo)] uppercase tracking-wider">
                {pedido.items.length} {pedido.items.length === 1 ? "Artículo" : "Artículos"}
              </span>
              <div className="h-1 w-1 rounded-full bg-[var(--admin-border)]" />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                status === 'no_leido' ? 'text-red-500' : status === 'pendiente' ? 'text-amber-500' : 'text-green-500'
              }`}>
                {status === 'no_leido' ? 'NO LEÍDO' : status === 'pendiente' ? 'PENDIENTE' : 'CARGADO'}
              </span>
              {pedido.sucursalId && (
                <>
                  <div className="h-1 w-1 rounded-full bg-[var(--admin-border)]" />
                  <span className="text-[10px] font-extrabold text-[var(--admin-accent)] tracking-wider uppercase bg-[var(--admin-accent)]/10 px-2 py-0.5 rounded">
                    🏪 {SUCURSALES.find(s => s.id === pedido.sucursalId)?.nombre || pedido.sucursalId}
                  </span>
                </>
              )}
            </div>
            
            {pedido.clienteDireccion && (
              <div className="mt-3 flex flex-col gap-1 rounded-xl bg-[var(--admin-bg)] p-3 border border-[var(--admin-border)] w-full sm:flex-row sm:items-center sm:gap-2 sm:w-fit sm:py-1.5">
                {pedido.clienteDireccion.includes("RETIRO EN LOCAL") ? (
                  <span className="text-[10px] font-black text-orange-600 tracking-wider uppercase shrink-0 dark:text-orange-400">🏬 RETIRO EN LOCAL</span>
                ) : (
                  <span className="text-[10px] font-black text-blue-600 tracking-wider uppercase shrink-0 dark:text-blue-400">🚚 ENVÍO A DOMICILIO</span>
                )}
                <span className="hidden sm:inline text-[var(--admin-border)] text-xs shrink-0">|</span>
                <span className="text-[10px] text-[var(--admin-text-mid)] font-medium line-clamp-2 sm:line-clamp-1" title={pedido.clienteDireccion}>
                  {pedido.clienteDireccion.replace("RETIRO EN LOCAL: ", "").replace("🏠 ENVÍO A DOMICILIO: ", "").replace("RETIRO EN SUCURSAL: ", "")}
                </span>
              </div>
            )}
          </div>

          <div className="shrink-0 self-end sm:self-center text-right">
            <p className="font-display text-3xl sm:text-4xl font-bold tracking-tighter text-[var(--admin-text-hi)]">
              {formatCurrency(pedido.total)}
            </p>
          </div>
        </div>

        {/* Action Bar (100% Responsivo en Móvil) */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          {pedido.clienteTelefono ? (
            <a 
              href={`https://wa.me/${cleanPhone(pedido.clienteTelefono)}?text=${getWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 min-w-[180px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1DA851] py-3 px-4 text-[11px] font-black tracking-widest text-white shadow-[0_4px_15px_rgba(37,211,102,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              <span>WHATSAPP PRO</span>
            </a>
          ) : (
            <div className="w-full sm:flex-1 min-w-[180px] flex items-center justify-center rounded-xl bg-[var(--admin-bg)] text-[var(--admin-text-lo)] border border-[var(--admin-border)] py-3 px-4 text-[11px] font-black tracking-widest">
              SIN TELÉFONO
            </div>
          )}

          {/* Grid de dos columnas en móvil, inline flex en PC */}
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-none">
            <button
              onClick={() => setIsViewingReceipt(!isViewingReceipt)}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-3 px-3 text-[11px] font-black tracking-widest transition-all active:scale-95 ${
                isViewingReceipt 
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                  : "border-[var(--admin-border)] bg-[var(--admin-bg)] text-[var(--admin-text-mid)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)]"
              }`}
            >
              <span>RECIBO</span>
            </button>

            <button
              onClick={handleImprimir}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-[var(--admin-text-mid)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)] transition-all active:scale-95"
            >
              <span>IMPRIMIR</span>
            </button>
          </div>

          {/* Copiar factura y borrar en flex horizontal responsivo */}
          <div className="flex gap-2 w-full sm:w-auto sm:flex-1">
            <button
              onClick={handleCopiadoFacturacion}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--admin-accent)] to-blue-500 text-[var(--admin-sidebar-bg)] font-black tracking-widest py-3 px-2 text-[11px] transition-all hover:shadow-[0_0_20px_var(--admin-accent-glow)] active:scale-95 disabled:opacity-50"
            >
              <span className="truncate">COPIAR FACTURA</span>
            </button>

            <button
              onClick={handleEliminar}
              disabled={isUpdating}
              className="w-12 h-11 shrink-0 flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all py-3 text-[11px] font-bold active:scale-95"
              title="Eliminar Pedido"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        {/* Smart Workflow Action Button (Flujo de Trabajo Inteligente) */}
        <div className="mt-4">
          {status === "no_leido" && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange("pendiente")}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black tracking-widest py-3 px-4 text-[10px] shadow-[0_4px_15px_rgba(245,158,11,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(245,158,11,0.35)] hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              <span>📦 EMPEZAR PREPARACIÓN (PENDIENTE)</span>
            </button>
          )}

          {status === "pendiente" && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange("cargado")}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black tracking-widest py-3 px-4 text-[10px] shadow-[0_4px_15px_rgba(34,197,94,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(34,197,94,0.35)] hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              <span>🚚 COMPLETAR CARGA (CARGADO)</span>
            </button>
          )}

          {status === "cargado" && (
            <div className="flex gap-2">
              <div className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400 py-3 px-4 text-[10px] font-black tracking-widest uppercase">
                <span>✅ PEDIDO PREPARADO Y CARGADO</span>
              </div>
              <button
                disabled={isUpdating}
                onClick={() => handleStatusChange("pendiente")}
                className="w-12 h-11 shrink-0 flex items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-[var(--admin-text-lo)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)] transition-all active:scale-95 disabled:opacity-50"
                title="Revertir a Pendiente"
              >
                <span>↩️</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setIsViewingFull(!isViewingFull);
            onViewFull(pedido);
          }}
          className={`mt-4 w-full rounded-lg border py-3 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
            isViewingFull
              ? "border-[var(--admin-text-hi)] bg-[var(--admin-text-hi)] text-[var(--admin-sidebar-bg)]"
              : "border-[var(--admin-border)] bg-[var(--admin-bg)] text-[var(--admin-text-lo)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)]"
          }`}
        >
          {isViewingFull ? "OCULTAR DETALLES" : "VER DETALLES COMPLETOS"}
        </button>
      </div>

      {/* ── Text Receipt View ── */}
      {isViewingReceipt && (
        <div className="animate-in fade-in zoom-in-95 duration-200 border-t border-[var(--admin-border)] bg-[var(--admin-bg)] p-4 sm:p-6">
          <div className="relative mx-auto max-w-md overflow-hidden rounded-xl bg-white p-6 sm:p-8 text-black shadow-xl ring-1 ring-gray-200/50">
            {/* Cut line decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#fff_0%,#fff_50%,#000_50%,#000_100%)] bg-[length:10px_100%]" />
            
            <div className="mb-4 text-center">
              <h4 className="font-mono text-lg font-black uppercase tracking-wider">EL REMATE</h4>
              <p className="font-mono text-[10px] text-gray-500 uppercase">Canelones · Picking</p>
            </div>

            <div className="mb-3 space-y-1 font-mono text-[11px] leading-tight text-black">
              <div className="flex justify-between">
                <span>ID ORDEN:</span>
                <span className="font-bold">#{pedido.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{new Date(pedido.fecha instanceof Date ? pedido.fecha : pedido.fecha.seconds * 1000).toLocaleString("es-UY")}</span>
              </div>
              <div className="border-b border-dashed border-gray-300 my-1.5" />
              <div>CLIENTE: <span className="font-bold uppercase">{pedido.clienteNombre}</span></div>
              {pedido.clienteTelefono && <div>TEL: {pedido.clienteTelefono}</div>}
            </div>

            <div className="mb-3 border-b border-dashed border-gray-300 pb-1.5" />

            <div className="space-y-2.5 font-mono text-[11px] text-black">
              {pedido.items.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <button 
                    onClick={() => copyToClipboard(item.nombre, "Copiado: " + item.nombre)}
                    className="text-left font-bold hover:text-blue-600 transition-colors uppercase leading-tight"
                  >
                    {item.nombre}
                  </button>
                  <div className="flex justify-between text-gray-600 mt-1">
                    <span className="flex gap-2">
                      <button onClick={() => copyToClipboard(item.cantidad.toString(), "Copiado: " + item.cantidad)} className="hover:text-black hover:underline">{item.cantidad} u.</button>
                      <span>x</span>
                      <span>{formatCurrency(item.precioUnitario)}</span>
                      <button onClick={() => copyToClipboard(item.codigo, "Copiado: " + item.codigo)} className="ml-1 text-[9px] text-gray-400 hover:text-black">({item.codigo})</button>
                    </span>
                    <span className="text-black font-bold">{formatCurrency(item.cantidad * item.precioUnitario)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-3 border-b border-dashed border-gray-300" />

            <div className="flex justify-between font-mono text-base font-black text-black">
              <span>TOTAL:</span>
              <span>{formatCurrency(pedido.total)}</span>
            </div>

            {pedido.notas && (
              <div className="mt-4 rounded bg-gray-50 border border-gray-100 p-3 font-mono text-[10px] italic text-gray-700 leading-normal">
                OBS: {pedido.notas}
              </div>
            )}

            <div className="mt-6 text-center font-mono text-[9px] text-gray-400">
              *** DOCUMENTO INTERNO DE PREPARACIÓN ***
            </div>

            <button
              onClick={handleCopiadoRecibo}
              className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg bg-black hover:bg-gray-800 py-3 text-[10px] font-bold text-white transition-all active:scale-95"
            >
              📋 COPIAR TEXTO FORMATEADO
            </button>
          </div>
          
          <button 
            onClick={() => setIsViewingReceipt(false)}
            className="mt-4 w-full text-center text-[10px] font-bold text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)] uppercase tracking-widest"
          >
            Cerrar Recibo
          </button>
        </div>
      )}

      {/* Expandable Details Area */}
      {isViewingFull && (
        <div className="animate-in slide-in-from-top-2 border-t border-[var(--admin-border)] bg-[var(--admin-bg)] p-4 sm:p-6">
          {/* White Receipt Container */}
          <div className="relative mx-auto max-w-xl overflow-hidden rounded-xl bg-white p-5 sm:p-8 text-black shadow-xl ring-1 ring-gray-200/50">
            {/* Cut line decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#fff_0%,#fff_50%,#f1f5f9_50%,#f1f5f9_100%)] bg-[length:15px_100%]" />
            
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-gray-300 pb-4">
              <div>
                <h4 className="font-mono text-lg font-black tracking-tight">PICKING / PREPARACIÓN</h4>
                <p className="font-mono text-[10px] text-gray-500">#{pedido.id.toUpperCase()}</p>
              </div>
              <div className="mt-2 text-left sm:text-right sm:mt-0">
                <p className="font-mono text-sm font-bold uppercase">{pedido.clienteNombre}</p>
                <p className="font-mono text-[10px] text-gray-400">{new Date(pedido.fecha instanceof Date ? pedido.fecha : pedido.fecha.seconds * 1000).toLocaleString("es-UY")}</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-[40px_1fr_90px] border-b border-gray-300 pb-2 mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <span>Cant</span>
                <span>Producto / Código</span>
                <span className="text-right">Subtotal</span>
              </div>

              {pedido.items.map((item, i) => (
                <div key={i} className="grid grid-cols-[40px_1fr_90px] items-start py-2 border-b border-dashed border-gray-200 hover:bg-gray-50 transition-colors text-black">
                  <button
                    onClick={() => copyToClipboard(item.cantidad.toString(), "Cantidad: " + item.cantidad)}
                    className="h-7 w-7 rounded bg-gray-100 text-black text-[11px] font-bold hover:bg-black hover:text-white transition-colors"
                  >
                    {item.cantidad}
                  </button>

                  <div className="px-3">
                    <button
                      onClick={() => copyToClipboard(item.nombre, "Producto: " + item.nombre)}
                      className="text-left font-mono text-[12px] font-bold uppercase hover:text-blue-600 transition-colors leading-tight block w-full text-black"
                    >
                      {item.nombre}
                    </button>
                    <div className="mt-1">
                      <button
                        onClick={() => copyToClipboard(item.codigo, "Código: " + item.codigo)}
                        className="font-mono text-[9px] text-gray-400 hover:text-black hover:underline"
                      >
                        {item.codigo}
                      </button>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[12px] font-bold pt-1 text-black">
                    {formatCurrency(item.cantidad * item.precioUnitario)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col items-end gap-1 border-t border-gray-300 pt-4">
              <div className="flex w-full justify-between text-[11px] font-bold text-gray-500">
                <span>SUBTOTAL:</span>
                <span>{formatCurrency(pedido.total)}</span>
              </div>
              <div className="flex w-full justify-between text-lg font-black border-t border-dashed border-gray-200 pt-2 mt-1 text-black">
                <span>TOTAL:</span>
                <span>{formatCurrency(pedido.total)}</span>
              </div>
            </div>

            {pedido.notas && (
              <div className="mt-6 rounded-lg bg-yellow-50/50 border border-yellow-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-800 mb-1">Observaciones</p>
                <p className="font-mono text-[11px] italic text-yellow-900 leading-relaxed">&quot;{pedido.notas}&quot;</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-center">
             <button 
              className="flex items-center gap-2 rounded-full bg-[var(--admin-card-bg)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-lo)] shadow-sm border border-[var(--admin-border)] transition-all hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text-hi)]"
              onClick={() => setIsViewingFull(false)}
             >
               <span>↑</span> OCULTAR DETALLES
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
