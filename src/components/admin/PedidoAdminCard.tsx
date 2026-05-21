"use client";

import { useState, useEffect } from "react";
import { actualizarEstadoPedido, eliminarPedido, type PedidoItem } from "@/lib/pedidos";

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

  const previewItems = pedido.items.slice(0, 3);
  const remaining = pedido.items.length - 3;

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });
  }

  const statusColors = {
    no_leido: "bg-red-500/20 text-red-400 border-red-500/30",
    pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    cargado: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-[32px] border transition-all duration-500 ${
        isFresh
          ? "border-[#00E5FF]/40 bg-gradient-to-br from-[#0A0F1C] to-[#00E5FF]/5 shadow-[0_20px_50px_rgba(0,229,255,0.15)]"
          : "border-white/5 bg-[#0A0F1C] hover:border-white/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
      }`}
    >
      {/* Glossy Overlay Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {isFresh && (
        <div className="absolute right-6 top-0 z-10">
          <div className="rounded-b-2xl bg-[#00E5FF] px-4 py-1.5 shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            <span className="text-[10px] font-black uppercase tracking-widest text-black">NUEVO</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 p-8">
        {/* Header Meta */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${status === 'no_leido' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'} animate-pulse`} />
            <span className="font-mono text-[11px] font-bold tracking-tighter text-gray-500">
              {formatDate(pedido.fecha)}
            </span>
          </div>
          <div className="rounded-lg bg-white/5 px-3 py-1 border border-white/5">
            <span className="font-mono text-[10px] font-bold text-gray-400">ID: {pedido.id.slice(-6).toUpperCase()}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h3 className="font-bebas text-5xl tracking-wide text-white leading-none">
              {pedido.clienteNombre}
            </h3>
            <div className="flex items-center gap-4">
               <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">
                {pedido.items.length} {pedido.items.length === 1 ? "Artículo" : "Artículos"}
              </p>
              <div className={`h-1 w-1 rounded-full bg-white/20`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'no_leido' ? 'text-red-400' : 'text-green-400'}`}>
                {status.replace("_", " ")}
              </span>
            </div>
            {pedido.clienteDireccion && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-3 py-1.5 w-fit">
                {pedido.clienteDireccion.includes("RETIRO EN LOCAL") ? (
                  <>
                    <span className="text-xs">🏪</span>
                    <span className="text-[10px] font-black text-amber-400 tracking-wider uppercase">RETIRO EN LOCAL</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs">🚚</span>
                    <span className="text-[10px] font-black text-[#00E5FF] tracking-wider uppercase">ENVÍO A DOMICILIO</span>
                  </>
                )}
                <span className="text-white/10 text-xs">|</span>
                <span className="text-[10px] font-mono text-gray-400 truncate max-w-[200px] sm:max-w-xs" title={pedido.clienteDireccion}>
                  {pedido.clienteDireccion.replace("RETIRO EN LOCAL: ", "").replace("🏠 ENVÍO A DOMICILIO: ", "")}
                </span>
              </div>
            )}
          </div>

          <div className="relative">
            <p className="bg-gradient-to-r from-[#00E5FF] to-blue-400 bg-clip-text font-bebas text-6xl text-transparent leading-none">
              {formatCurrency(pedido.total)}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/5 pt-8">
          {pedido.clienteTelefono && (
            <a 
              href={`https://wa.me/${cleanPhone(pedido.clienteTelefono)}?text=${getWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-xs font-black text-black transition-all hover:scale-[1.02] hover:shadow-[0_10px_20px_rgba(37,211,102,0.3)] active:scale-95"
            >
              <span className="text-lg">💬</span>
              <span>WHATSAPP PRO</span>
            </a>
          )}
          
          <button
            onClick={() => setIsViewingReceipt(!isViewingReceipt)}
            className={`flex h-[56px] flex-1 items-center justify-center gap-3 rounded-2xl border transition-all active:scale-95 ${
              isViewingReceipt 
                ? "border-amber-500/50 bg-amber-500/20 text-amber-400" 
                : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
            title="Ver Recibo de Texto"
          >
            <span className="text-xl">🧾</span>
            <span className="text-[10px] font-black uppercase tracking-widest">RECIBO</span>
          </button>

          <button
            onClick={handleImprimir}
            className="flex h-[56px] flex-1 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white active:scale-95"
            title="Imprimir Ticket Térmico 80mm"
          >
            <span className="text-xl">🖨️</span>
            <span className="text-[10px] font-black uppercase tracking-widest">IMPRIMIR</span>
          </button>

          <button
            onClick={handleCopiadoFacturacion}
            disabled={isUpdating}
            className="relative flex h-[56px] flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#00E5FF] to-blue-400 font-black text-black shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(0,229,255,0.6)] active:scale-95 disabled:opacity-50"
            title="Copiar para Facturación"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 animate-ping rounded-2xl bg-[#00E5FF]/20" />
            <span className="relative text-lg">📋</span>
            <span className="relative text-[11px] uppercase tracking-[0.15em]">Copiar para Facturación</span>
          </button>

          <button
            onClick={handleEliminar}
            disabled={isUpdating}
            className="flex h-[56px] w-[56px] items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 text-xl text-red-400 transition-all hover:bg-red-500/20 active:scale-90"
            title="Eliminar Pedido"
          >
            🗑️
          </button>
        </div>

        {/* Status Switcher - Premium Look */}
        <div className="mt-4 flex gap-2">
          <button
            disabled={isUpdating}
            onClick={() => handleStatusChange("no_leido")}
            className={`flex flex-1 items-center justify-center gap-3 rounded-2xl border py-4 transition-all ${
              status === "no_leido"
                ? "border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                : "border-white/5 bg-white/5 text-gray-500 hover:border-white/20"
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${status === 'no_leido' ? 'bg-red-500' : 'bg-gray-600'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">NO LEÍDO</span>
          </button>

          <button
            disabled={isUpdating}
            onClick={() => handleStatusChange("pendiente")}
            className={`flex flex-1 items-center justify-center gap-3 rounded-2xl border py-4 transition-all ${
              status === "pendiente"
                ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                : "border-white/5 bg-white/5 text-gray-500 hover:border-white/20"
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${status === 'pendiente' ? 'bg-yellow-500' : 'bg-gray-600'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">PENDIENTE</span>
          </button>
          
          <button
            disabled={isUpdating}
            onClick={() => handleStatusChange("cargado")}
            className={`flex flex-1 items-center justify-center gap-3 rounded-2xl border py-4 transition-all ${
              status === "cargado"
                ? "border-green-500/50 bg-green-500/10 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                : "border-white/5 bg-white/5 text-gray-500 hover:border-white/20"
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${status === 'cargado' ? 'bg-green-500' : 'bg-gray-600'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">CARGADO</span>
          </button>
        </div>

        <button
          onClick={() => {
            setIsViewingFull(!isViewingFull);
            onViewFull(pedido);
          }}
          className={`mt-6 w-full rounded-2xl border py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all ${
            isViewingFull
              ? "border-[#00E5FF] bg-[#00E5FF] text-black shadow-[0_0_30px_rgba(0,229,255,0.4)]"
              : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {isViewingFull ? "OCULTAR DETALLES" : "VER DETALLES COMPLETOS"}
        </button>
      </div>

      {/* ── Text Receipt View (Canva tipo texto) ── */}
      {isViewingReceipt && (
        <div className="animate-in fade-in zoom-in-95 duration-300 border-t border-white/5 bg-[#0F172A] p-6">
          <div className="relative mx-auto max-w-md overflow-hidden rounded-xl bg-white p-8 text-black shadow-2xl">
            {/* Decoración de recibo cortado */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#fff_0%,#fff_50%,#000_50%,#000_100%)] bg-[length:10px_100%]" />
            
            <div className="mb-6 text-center">
              <h4 className="font-mono text-xl font-black uppercase tracking-widest">EL REMATE</h4>
              <p className="font-mono text-[10px] text-gray-500 uppercase">Distribuidora · Canelones</p>
            </div>

            <div className="mb-4 space-y-1 font-mono text-[11px] leading-tight">
              <div className="flex justify-between">
                <span>PEDIDO:</span>
                <span className="font-bold">#{pedido.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{new Date(pedido.fecha instanceof Date ? pedido.fecha : pedido.fecha.seconds * 1000).toLocaleString("es-UY")}</span>
              </div>
              <div className="border-b border-dashed border-gray-300 my-2" />
              <div>CLIENTE: <span className="font-bold">{pedido.clienteNombre}</span></div>
              {pedido.clienteTelefono && <div>TEL: {pedido.clienteTelefono}</div>}
            </div>

            <div className="mb-4 border-b border-dashed border-gray-300 pb-2" />

            <div className="space-y-3 font-mono text-[11px]">
              {pedido.items.map((item, idx) => (
                <div key={idx} className="flex flex-col group/receipt-item">
                  <button 
                    onClick={() => copyToClipboard(item.nombre, "Copiado: " + item.nombre)}
                    className="text-left font-bold hover:text-[#00E5FF] transition-colors uppercase"
                  >
                    {item.nombre}
                  </button>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex gap-2">
                      <button onClick={() => copyToClipboard(item.cantidad.toString(), "Copiado: " + item.cantidad)} className="hover:text-black hover:underline">{item.cantidad}</button>
                      <span>x</span>
                      <span>{formatCurrency(item.precioUnitario)}</span>
                      <button onClick={() => copyToClipboard(item.codigo, "Copiado: " + item.codigo)} className="ml-2 text-[9px] text-gray-400 hover:text-black">({item.codigo})</button>
                    </span>
                    <span className="text-black font-bold">{formatCurrency(item.cantidad * item.precioUnitario)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-4 border-b border-dashed border-gray-300" />

            <div className="flex justify-between font-mono text-lg font-black">
              <span>TOTAL:</span>
              <span>{formatCurrency(pedido.total)}</span>
            </div>

            {pedido.notas && (
              <div className="mt-4 rounded bg-gray-100 p-2 font-mono text-[10px] italic">
                OBS: {pedido.notas}
              </div>
            )}

            <div className="mt-8 text-center font-mono text-[9px] text-gray-400">
              *** GRACIAS POR SU PREFERENCIA ***
            </div>

            {/* Botón flotante para copiar dentro del canva */}
            <button
              onClick={handleCopiadoRecibo}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 text-[10px] font-bold text-white transition-all hover:bg-gray-800 active:scale-95"
            >
              <span>📋</span> COPIAR TEXTO FORMATEADO
            </button>
          </div>
          
          <button 
            onClick={() => setIsViewingReceipt(false)}
            className="mt-4 w-full text-center text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest"
          >
            Cerrar Recibo
          </button>
        </div>
      )}

      {/* Expandable Details Area */}
      {isViewingFull && (
        <div className="animate-in slide-in-from-top-2 border-t border-white/5 bg-[#0F172A] p-4 sm:p-8">
          {/* White Receipt Container */}
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-xl bg-white p-6 sm:p-10 text-black shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Cut line decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#fff_0%,#fff_50%,#f1f5f9_50%,#f1f5f9_100%)] bg-[length:20px_100%]" />
            
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b-2 border-black pb-4">
              <div>
                <h4 className="font-mono text-2xl font-black tracking-tighter">ORDEN DE PEDIDO</h4>
                <p className="font-mono text-[10px] text-gray-500">#{pedido.id.toUpperCase()}</p>
              </div>
              <div className="mt-2 text-right sm:mt-0">
                <p className="font-mono text-xs font-bold uppercase">{pedido.clienteNombre}</p>
                <p className="font-mono text-[10px] text-gray-400">{new Date(pedido.fecha instanceof Date ? pedido.fecha : pedido.fecha.seconds * 1000).toLocaleString("es-UY")}</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-[40px_1fr_100px] border-b border-black pb-2 mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Cant</span>
                <span>Producto / Código</span>
                <span className="text-right">Subtotal</span>
              </div>

              {pedido.items.map((item, i) => (
                <div key={i} className="group/item grid grid-cols-[40px_1fr_100px] items-start py-2 border-b border-dashed border-gray-200 hover:bg-gray-50 transition-colors">
                  {/* Cantidad */}
                  <button
                    onClick={() => copyToClipboard(item.cantidad.toString(), "Cantidad: " + item.cantidad)}
                    className="h-8 w-8 rounded bg-black text-white text-[11px] font-bold hover:bg-[#00E5FF] hover:text-black transition-colors"
                  >
                    {item.cantidad}
                  </button>

                  <div className="px-2">
                    {/* Nombre */}
                    <button
                      onClick={() => copyToClipboard(item.nombre, "Producto: " + item.nombre)}
                      className="text-left font-mono text-[12px] font-bold uppercase hover:text-[#00E5FF] transition-colors leading-tight"
                    >
                      {item.nombre}
                    </button>
                    {/* Código */}
                    <div className="mt-0.5">
                      <button
                        onClick={() => copyToClipboard(item.codigo, "Código: " + item.codigo)}
                        className="font-mono text-[9px] text-gray-400 hover:text-black hover:underline"
                      >
                        {item.codigo}
                      </button>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs font-bold pt-1">
                    {formatCurrency(item.cantidad * item.precioUnitario)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-end gap-1 border-t-2 border-black pt-4">
              <div className="flex w-full justify-between text-[10px] font-bold text-gray-400">
                <span>SUBTOTAL:</span>
                <span>{formatCurrency(pedido.total)}</span>
              </div>
              <div className="flex w-full justify-between text-xl font-black">
                <span>TOTAL:</span>
                <span>{formatCurrency(pedido.total)}</span>
              </div>
            </div>

            {pedido.notas && (
              <div className="mt-8 rounded-lg border-2 border-black border-dashed p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Observaciones</p>
                <p className="font-mono text-xs italic text-gray-700 leading-relaxed">&quot;{pedido.notas}&quot;</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-center">
             <button 
              className="group flex items-center gap-2 rounded-full bg-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-white/10 hover:text-white"
              onClick={() => setIsViewingFull(false)}
             >
               <span className="text-lg">↑</span> OCULTAR FACTURA
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
