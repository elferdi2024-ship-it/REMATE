"use client";

import { useState, useEffect } from "react";
import { actualizarEstadoPedido, type PedidoItem } from "@/lib/pedidos";

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
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isFresh
          ? "border-[#00E5FF]/40 bg-[#0A0F1C] shadow-[0_0_20px_rgba(0,229,255,0.15)]"
          : "border-white/10 bg-[#0A0F1C] hover:border-white/20 hover:bg-[#0A0F1C]/80"
      }`}
    >
      {isFresh && (
        <div className="absolute right-0 top-0 flex items-center justify-center bg-gradient-to-l from-[#00E5FF] to-transparent px-6 py-1">
          <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-black">
            NUEVO
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
              <span className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">Hora</span>
              <span className="font-mono text-sm font-black text-[#00E5FF]">
                {formatDate(pedido.fecha)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-xl font-bold uppercase tracking-tight text-white truncate max-w-[200px] sm:max-w-none">
                  {pedido.clienteNombre}
                </h3>
                <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${statusColors[status]}`}>
                  {status.replace("_", " ")}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                <p className="text-xs font-bold text-[#00E5FF]/80 uppercase tracking-widest">
                  {pedido.items.length} {pedido.items.length === 1 ? "Artículo" : "Artículos"}
                </p>
                {pedido.clienteTelefono && (
                  <a 
                    href={`https://wa.me/598${pedido.clienteTelefono.replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-colors hover:text-[#25D366]"
                  >
                    <span className="text-[#25D366]">WhatsApp:</span> {pedido.clienteTelefono}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 pt-2 md:pt-0">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Pedido</p>
              <p className="font-bebas text-4xl tracking-wide text-white leading-none">
                {formatCurrency(pedido.total)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-5">
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Estado:</label>
            <div className="flex gap-1.5">
              {(["no_leido", "pendiente", "cargado"] as const).map((s) => (
                <button
                  key={s}
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(s)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                    status === s
                      ? s === "no_leido" ? "border-red-500 bg-red-500/20 text-red-400" :
                        s === "pendiente" ? "border-yellow-500 bg-yellow-500/20 text-yellow-400" :
                        "border-green-500 bg-green-500/20 text-green-400"
                      : "border-white/5 bg-white/5 text-gray-600 hover:border-white/20 hover:text-gray-400"
                  }`}
                  title={s.replace("_", " ")}
                >
                  {s === "no_leido" ? "🔴" : s === "pendiente" ? "🟡" : "🟢"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const text = `PEDIDO: ${pedido.clienteNombre}\nTEL: ${pedido.clienteTelefono}\nTOTAL: ${formatCurrency(pedido.total)}\n\nITEMS:\n${pedido.items.map(i => `- ${i.cantidad}x ${i.nombre} [${i.codigo}]`).join("\n")}`;
                navigator.clipboard.writeText(text);
                // Simple feedback without toast for now to avoid complexity
                alert("Resumen copiado para el sistema");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg transition-all hover:bg-white/10 hover:border-[#00E5FF]/50"
              title="Copiar para sistema"
            >
              📋
            </button>

            <button
              onClick={() => {
                setIsViewingFull(!isViewingFull);
                onViewFull(pedido);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                isViewingFull
                  ? "bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isViewingFull ? "▲ Ocultar" : "▼ Detalle"}
            </button>
          </div>
        </div>
      </div>

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
