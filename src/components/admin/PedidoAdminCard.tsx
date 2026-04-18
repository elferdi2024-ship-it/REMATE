"use client";

import { useState, useEffect } from "react";
import { actualizarEstadoPedido, eliminarPedido, type PedidoItem } from "@/lib/pedidos";
import { armarMensajeWA } from "@/lib/whatsapp";

export interface PedidoAdmin {
  id: string;
  uid: string | null;
  clienteNombre: string;
  clienteTelefono?: string;
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
    // Formato exacto para programa de facturación: Concepto [TAB] Uni [TAB] [TAB] Precio
    // Según instrucciones: item.nombre + '\t' + item.cantidad + '\t' + '\t' + item.precioUnitario
    const lineas = pedido.items.map(item => 
      `${item.nombre}\t${item.cantidad}\t\t${item.precioUnitario}`
    );
    const textoFinal = lineas.join('\n');
    copyToClipboard(textoFinal, "¡Copiado para Facturación! ✅\nListo para pegar en el programa.");
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
    const itemsWA = pedido.items.map(i => ({
      codigo: i.codigo,
      nombre: i.nombre,
      precio: i.precioUnitario,
      cantidad: i.cantidad
    }));
    
    const texto = armarMensajeWA(
      pedido.clienteNombre,
      pedido.clienteTelefono || "",
      itemsWA,
      pedido.notas,
      pedido.id.slice(-6).toUpperCase()
    );
    
    copyToClipboard(texto, "¡Recibo de texto copiado! ✅");
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
              href={`https://wa.me/598${pedido.clienteTelefono.replace(/\s+/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-xs font-black text-black transition-all hover:scale-[1.02] hover:shadow-[0_10px_20px_rgba(37,211,102,0.3)] active:scale-95"
            >
              <span className="text-lg">💬</span>
              <span>WHATSAPP</span>
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
            onClick={handleCopiadoFacturacion}
            disabled={isUpdating}
            className="flex h-[56px] w-[56px] items-center justify-center rounded-2xl border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-xl text-[#00E5FF] transition-all hover:bg-[#00E5FF]/20 active:scale-95"
            title="Copiar para Facturación"
          >
            📄
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
                <div key={idx} className="flex flex-col">
                  <div className="font-bold">{item.nombre}</div>
                  <div className="flex justify-between text-gray-600">
                    <span>{item.cantidad} x {formatCurrency(item.precioUnitario)}</span>
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
        <div className="animate-in slide-in-from-top-2 border-t border-white/5 bg-black/60 backdrop-blur-sm p-4 sm:p-6">
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <span>Detalle de Productos</span>
              <span className="text-[#00E5FF]">Total {pedido.items.length}</span>
            </div>
            
            <div className="divide-y divide-white/5">
              {pedido.items.map((item, i) => (
                <div key={i} className="flex flex-col py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
                  {/* Item Main Info */}
                  <div className="flex flex-1 items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-sm font-black text-[#00E5FF] border border-[#00E5FF]/20">
                      {item.cantidad}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-200 leading-snug break-words">
                        {item.nombre}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] font-bold text-gray-500 border border-white/5 uppercase">
                          COD: {item.codigo}
                        </span>
                        <span className="text-[10px] text-gray-600 font-medium">
                          {formatCurrency(item.precioUnitario)} c/u
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Item Subtotal (Optional for admin) */}
                  <div className="mt-2 flex items-center justify-end border-t border-white/5 pt-2 sm:mt-0 sm:border-none sm:pt-0">
                    <p className="font-mono text-xs font-bold text-gray-400">
                      Sub: {formatCurrency(item.cantidad * item.precioUnitario)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pedido.notas && (
            <div className="flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <span className="text-xl">💬</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500">
                  Instrucciones del cliente
                </p>
                <p className="mt-1 text-sm italic text-yellow-100/70 leading-relaxed">&quot;{pedido.notas}&quot;</p>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
             <button 
              className="text-[10px] font-bold text-gray-500 hover:text-white underline uppercase tracking-tighter"
              onClick={() => setIsViewingFull(false)}
             >
               Cerrar Panel
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
