// filepath: src/components/carrito/PedidoEnviarWhatsApp.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import type { CartItem } from "@/types";

export interface PedidoPendienteWA {
  id: string;
  url: string;
  mensaje: string;
  total: number;
  cantidadProductos: number;
  entregaLabel: string;
  sucursalNombre: string;
  creadoEn: number;
  /** true si ya intentamos abrir WhatsApp automáticamente */
  autoAbierto: boolean;
  items?: CartItem[];
}

interface PedidoEnviarWhatsAppProps {
  pedido: PedidoPendienteWA | null;
  /** El cliente confirmó que envió el mensaje */
  onConfirmado: () => void;
  /** Cerrar sin confirmar (se mantiene el recordatorio) */
  onCerrar: () => void;
  /** Permite re-cargar los productos al carrito para editarlos o repetirlos */
  onModificar?: (items: CartItem[]) => void;
}

function formatUY(valor: number): string {
  return `$${valor.toLocaleString("es-UY")}`;
}

function numeroCorto(id: string): string {
  return id.slice(-6).toUpperCase();
}

export default function PedidoEnviarWhatsApp({
  pedido,
  onConfirmado,
  onCerrar,
  onModificar,
}: PedidoEnviarWhatsAppProps) {
  const [abierto, setAbierto] = useState<boolean>(false);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [avisoSalir, setAvisoSalir] = useState<boolean>(false);

  useEffect(() => {
    setAbierto(Boolean(pedido?.autoAbierto));
    setCopiado(false);
    setAvisoSalir(false);
  }, [pedido?.id, pedido?.autoAbierto]);

  // Bloquear scroll del fondo
  useEffect(() => {
    if (!pedido) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pedido]);

  const handleCopiar = useCallback(async () => {
    if (!pedido) return;
    try {
      await navigator.clipboard.writeText(pedido.mensaje);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }, [pedido]);

  const handleCerrar = useCallback(() => {
    if (!abierto && !avisoSalir) {
      setAvisoSalir(true);
      return;
    }
    onCerrar();
  }, [abierto, avisoSalir, onCerrar]);

  if (!pedido) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm animate-[waFade_.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-final-title"
    >
      <style>{`
        @keyframes waFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes waUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes waPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(37,211,102,.55) } 70% { box-shadow: 0 0 0 16px rgba(37,211,102,0) } }
        @keyframes waPop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
      `}</style>

      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-[waUp_.28s_cubic-bezier(.16,1,.3,1)] max-h-[95dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        {/* Header verde */}
        <div className="relative bg-gradient-to-br from-[#25D366] to-[#128C7E] px-6 pt-7 pb-6 text-white text-center">
          <button
            type="button"
            onClick={handleCerrar}
            aria-label="Cerrar"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>

          <div className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg animate-[waPop_.45s_ease-out]">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.932 1.395 5.608L0 24l6.538-1.373A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.923 0-3.728-.5-5.287-1.375l-.378-.225-3.88.816.824-3.787-.248-.39A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          </div>

          <p className="mt-4 text-[11px] font-bold tracking-[0.18em] uppercase text-white/80">Paso Final</p>
          <h2 id="wa-final-title" className="mt-1 text-2xl font-extrabold leading-tight">
            {abierto ? "¿Ya enviaste el mensaje?" : "Enviá tu pedido por WhatsApp"}
          </h2>
          <p className="mt-2 text-sm text-white/90 leading-snug">
            {abierto
              ? "En WhatsApp tocá la flechita ➤ para que la sucursal reciba tu pedido y comience a armarlo."
              : "Tu pedido ya está redactado. Tocá el botón y presioná enviar ➤ en el chat."}
          </p>
        </div>

        {/* Indicador de 2 pasos visual */}
        <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-around text-xs text-emerald-950 font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Abrir chat</span>
          </div>
          <span className="text-emerald-400">➔</span>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#128C7E] text-white flex items-center justify-center text-[10px] font-bold">2</span>
            <span>Apretar Enviar ➤</span>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="mx-6 mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pedido <strong className="text-slate-800">#{numeroCorto(pedido.id)}</strong></span>
            <span>{pedido.cantidadProductos} producto{pedido.cantidadProductos !== 1 ? "s" : ""}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-600">Total</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{formatUY(pedido.total)}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 leading-snug">
            {pedido.entregaLabel} · Sucursal <strong className="text-slate-700">{pedido.sucursalNombre}</strong>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="px-6 pt-4 pb-6 space-y-2.5">
          <a
            href={pedido.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAbierto(true)}
            className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5a] active:scale-[.98] text-white text-base font-extrabold tracking-wide shadow-lg shadow-[#25D366]/30 transition animate-[waPulse_1.8s_ease-out_infinite]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.932 1.395 5.608L0 24l6.538-1.373A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
            {abierto ? "Abrir WhatsApp de nuevo" : "Enviar pedido por WhatsApp"}
          </a>

          {abierto && (
            <button
              type="button"
              onClick={onConfirmado}
              className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[.98] text-white text-sm font-bold transition flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Sí, ya envié el mensaje</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopiar}
              className="w-full h-10 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
            >
              <span>{copiado ? "✓ Copiado" : "📋 Copiar texto"}</span>
            </button>

            {onModificar && pedido.items && pedido.items.length > 0 && (
              <button
                type="button"
                onClick={() => onModificar(pedido.items!)}
                className="w-full h-10 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
              >
                <span>✏️ Modificar</span>
              </button>
            )}
          </div>

          {avisoSalir ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 leading-snug">
              <strong>Atención:</strong> Si no enviás el mensaje en WhatsApp, la sucursal no preparará tu pedido.
              <button type="button" onClick={onCerrar} className="block mt-2 font-bold underline text-amber-950">
                Entendido, cerrar de todos modos
              </button>
            </div>
          ) : (
            <p className="text-center text-[11px] text-slate-400 leading-snug">
              🔒 Tu pedido se prepara en el local en cuanto reciben tu mensaje.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
