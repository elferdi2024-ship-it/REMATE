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
  return Date.now() - d < 5 * 60 * 1000; // less than 5 minutes
}

export default function PedidoAdminCard({ pedido, onViewFull }: PedidoAdminCardProps) {
  const [isViewingFull, setIsViewingFull] = useState(false);
  const [isFresh, setIsFresh] = useState(isNew(pedido.fecha));

  // Update "new" badge every 30 seconds
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
      maximumFractionDigits: 0,
    });
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border transition-all hover:shadow-lg"
      style={{
        background: "var(--white)",
        borderColor: isFresh ? "rgba(76, 201, 240, 0.4)" : "var(--border)",
      }}
    >
      {/* NUEVO blinking badge */}
      {isFresh && (
        <div
          className="absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-extrabold tracking-wider"
          style={{
            background: "var(--rojo)",
            color: "#fff",
            animation: "blink 1s ease-in-out infinite",
          }}
        >
          NUEVO
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold" style={{ color: "var(--oscuro)" }}>
            {formatDate(pedido.fecha)}
          </span>
          <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
            {pedido.clienteNombre.toUpperCase()}
          </span>
        </div>
        <span
          className="font-bebas text-xl tracking-wide"
          style={{ color: "var(--oscuro)" }}
        >
          {formatCurrency(pedido.total)}
        </span>
      </div>

      {/* Product preview */}
      <div className="px-4 pb-3">
        <p className="mb-1 text-xs font-semibold" style={{ color: "var(--muted)" }}>
          {pedido.items.length} producto{pedido.items.length !== 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap gap-1">
          {previewItems.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
              style={{
                background: "var(--bg2)",
                color: "var(--text2)",
              }}
            >
              {item.cantidad}x {item.nombre.length > 22 ? item.nombre.slice(0, 22) + "\u2026" : item.nombre}
            </span>
          ))}
          {remaining > 0 && (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold" style={{ color: "var(--muted)" }}>
              +{remaining} m{remaining === 1 ? "ás" : "ás"}
            </span>
          )}
        </div>
      </div>

      {/* Ver completo button */}
      <div className="border-t px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => {
            setIsViewingFull(!isViewingFull);
            onViewFull(pedido);
          }}
          className="w-full rounded-lg py-2 text-center text-xs font-bold uppercase tracking-wider transition-colors"
          style={{
            background: isViewingFull ? "var(--oscuro-2)" : "var(--oscuro)",
            color: "#fff",
          }}
        >
          {isViewingFull ? "\u25B2 Ocultar" : "Ver completo \u2193"}
        </button>
      </div>

      {/* Expanded full order */}
      {isViewingFull && (
        <div className="border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left" style={{ color: "var(--muted)" }}>
                <th className="pb-1 font-semibold">Producto</th>
                <th className="pb-1 text-right font-semibold">Cant.</th>
                <th className="pb-1 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items.map((item, i) => (
                <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-1.5 font-medium" style={{ color: "var(--text)" }}>
                    {item.nombre}
                  </td>
                  <td className="py-1.5 text-right" style={{ color: "var(--text2)" }}>
                    {item.cantidad}
                  </td>
                  <td className="py-1.5 text-right font-semibold" style={{ color: "var(--oscuro)" }}>
                    {formatCurrency(item.cantidad * item.precioUnitario)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pedido.notas && (
            <div className="mt-2 rounded-lg px-3 py-2 text-xs" style={{ background: "var(--bg2)", color: "var(--text2)" }}>
              <span className="font-semibold">Notas:</span> {pedido.notas}
            </div>
          )}
        </div>
      )}

      {/* Blink animation */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
