"use client";

import { useState, useEffect } from "react";
import type { PedidoItem } from "@/lib/pedidos";

export interface PedidoAdmin {
  id: string;
  uid: string | null;
  clienteNombre: string;
  fecha: { seconds: number; nanoseconds: number } | Date;
  items: PedidoItem[];
  total: number;
  notas?: string;
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

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFresh(isNew(pedido.fecha));
    }, 30000);
    return () => clearInterval(interval);
  }, [pedido.fecha]);

  const previewItems = pedido.items.slice(0, 3);
  const remaining = pedido.items.length - 3;

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isFresh
          ? "border-[#00E5FF]/40 bg-[#0A0F1C] shadow-[0_0_20px_rgba(0,229,255,0.15)]"
          : "border-white/10 bg-[#0A0F1C] hover:border-white/20 hover:bg-[#0A0F1C]/80"
      }`}
    >
      {isFresh && (
        <div className="absolute right-0 top-0 flex items-center justify-center bg-gradient-to-r from-transparent via-[#00E5FF] to-[#00E5FF] px-4 py-1">
          <div className="absolute inset-0 animate-pulse bg-white/20" />
          <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-black">
            NUEVO
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 font-mono text-sm font-bold text-[#00E5FF]">
            {formatDate(pedido.fecha)}
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wide text-white">
              {pedido.clienteNombre}
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              {pedido.items.length} ARTÍCULOS
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bebas text-3xl tracking-wide text-white">
            {formatCurrency(pedido.total)}
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 bg-white/[0.02] px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {previewItems.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-lg border border-white/10 bg-[#050914] px-3 py-1 text-xs font-medium text-gray-300"
            >
              <span className="mr-1.5 font-bold text-[#00E5FF]">{item.cantidad}x</span>
              {item.nombre}
            </span>
          ))}
          {remaining > 0 && (
            <span className="inline-flex items-center rounded-lg border border-dashed border-white/20 bg-transparent px-3 py-1 text-xs font-bold text-gray-400">
              +{remaining} MÁS
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => {
          setIsViewingFull(!isViewingFull);
          onViewFull(pedido);
        }}
        className={`w-full border-t py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
          isViewingFull
            ? "border-[#00E5FF]/20 bg-[#00E5FF]/10 text-[#00E5FF]"
            : "border-white/5 bg-transparent text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        {isViewingFull ? "▲ Ocultar Detalle" : "▼ Ver Detalle Completo"}
      </button>

      {isViewingFull && (
        <div className="animate-in slide-in-from-top-2 border-t border-[#00E5FF]/20 bg-[#050914] p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="pb-3 pr-4 font-medium">Producto</th>
                  <th className="pb-3 text-right font-medium">Cant.</th>
                  <th className="pb-3 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pedido.items.map((item, i) => (
                  <tr key={i} className="group transition-colors hover:bg-white/5">
                    <td className="py-3 pr-4 font-medium text-gray-300 group-hover:text-white">
                      {item.nombre}
                    </td>
                    <td className="py-3 text-right font-bold text-[#00E5FF]">
                      {item.cantidad}
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-gray-400">
                      {formatCurrency(item.cantidad * item.precioUnitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pedido.notas && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
              <span className="text-lg">💬</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-yellow-500">
                  Notas del cliente
                </p>
                <p className="mt-1 text-sm text-yellow-100/80">{pedido.notas}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
