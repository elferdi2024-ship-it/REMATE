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
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4 animate-[waFade_.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-final-title"
    >
      <style>{`
        @keyframes waFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes waUp { from { transform: translateY(100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes waPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(37,211,102,.55) } 70% { box-shadow: 0 0 0 14px rgba(37,211,102,0) } }
      `}</style>

      {/* Backdrop tap para cerrar con aviso */}
      <div className="absolute inset-0 -z-10" onClick={handleCerrar} />

      {/* Sheet nativo móvil / modal desktop */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden animate-[waUp_.28s_cubic-bezier(.16,1,.3,1)] max-h-[92dvh] flex flex-col pb-[max(14px,env(safe-area-inset-bottom,14px))]">
        
        {/* Barra superior de arrastre / grab handle (Mobile) */}
        <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header compacto */}
        <div className="relative px-5 pt-2 pb-3 text-center shrink-0">
          <button
            type="button"
            onClick={handleCerrar}
            aria-label="Cerrar"
            className="absolute top-1 right-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 mb-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.932 1.395 5.608L0 24l6.538-1.373A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.923 0-3.728-.5-5.287-1.375l-.378-.225-3.88.816.824-3.787-.248-.39A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            <span className="text-[10px] font-black tracking-wider uppercase">
              {abierto ? "Confirmación de Pedido" : "Paso Final"}
            </span>
          </div>

          <h2 id="wa-final-title" className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
            {abierto ? "¿Ya enviaste el mensaje?" : "Enviá tu pedido por WhatsApp"}
          </h2>
          <p className="mt-1 text-xs text-slate-500 leading-normal max-w-[280px] mx-auto">
            {abierto
              ? "Tocá en la flecha de enviar ➤ en WhatsApp para que el local empiece a armarlo."
              : "Tocá el botón para abrir el chat con el pedido listo."}
          </p>
        </div>

        {/* Micro-guía visual de 2 pasos */}
        <div className="mx-5 mb-2.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-center justify-between text-[11px] text-emerald-950 font-medium shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[9px] font-bold">1</span>
            <span>Abrir chat</span>
          </div>
          <span className="text-emerald-400 font-bold">→</span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#128C7E] text-white flex items-center justify-center text-[9px] font-bold">2</span>
            <span className="font-bold text-emerald-900">Apretar Enviar ➤</span>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="mx-5 mb-3 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-3 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5">
            <span className="font-semibold text-slate-700">Pedido <strong className="text-slate-900 font-mono">#{numeroCorto(pedido.id)}</strong></span>
            <span>{pedido.cantidadProductos} producto{pedido.cantidadProductos !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-600">Total</span>
            <span className="text-2xl font-black text-slate-900 tabular-nums">{formatUY(pedido.total)}</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
            <span className="truncate">{pedido.entregaLabel}</span>
            <span className="font-semibold text-slate-700 shrink-0">Sucursal {pedido.sucursalNombre}</span>
          </div>
        </div>

        {/* Acciones principales adaptadas al estado */}
        <div className="px-5 space-y-2 shrink-0">
          {abierto ? (
            <>
              {/* Si ya volvió de WhatsApp: La acción primaria es CONFIRMAR que lo envió */}
              <button
                type="button"
                onClick={onConfirmado}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[.98] text-white text-sm font-extrabold tracking-wide shadow-md transition flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>✓ Sí, ya envié el mensaje</span>
              </button>

              {/* Botón secundario para reabrir WhatsApp si se le cerró */}
              <a
                href={pedido.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] active:scale-[.98] text-white text-xs font-bold tracking-wide shadow-sm transition flex items-center justify-center gap-2"
              >
                <WhatsAppIcon />
                <span>Reabrir chat de WhatsApp</span>
              </a>
            </>
          ) : (
            /* Si aún no abrió WhatsApp: Botón gigante principal */
            <a
              href={pedido.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setAbierto(true)}
              className="w-full h-13 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] active:scale-[.98] text-white text-base font-extrabold tracking-wide shadow-lg shadow-[#25D366]/30 transition flex items-center justify-center gap-2.5 animate-[waPulse_1.8s_ease-out_infinite]"
            >
              <WhatsAppIcon />
              <span>Enviar pedido por WhatsApp</span>
            </a>
          )}

          {/* Fila de utilidades: Copiar texto y Modificar */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleCopiar}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <span>{copiado ? "✓ Copiado" : "📋 Copiar texto"}</span>
            </button>

            {onModificar && pedido.items && pedido.items.length > 0 && (
              <button
                type="button"
                onClick={() => onModificar(pedido.items!)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <span>✏️ Modificar</span>
              </button>
            )}
          </div>

          {avisoSalir ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 leading-snug">
              <strong>Atención:</strong> Si no enviás el mensaje en WhatsApp, la sucursal no recibe el pedido.
              <button type="button" onClick={onCerrar} className="block mt-1 font-bold underline text-amber-950">
                Cerrar de todos modos
              </button>
            </div>
          ) : (
            <p className="text-center text-[10px] text-slate-400 leading-tight pt-1">
              🔒 El local prepara tu pedido inmediatamente al recibir el WhatsApp.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.932 1.395 5.608L0 24l6.538-1.373A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.923 0-3.728-.5-5.287-1.375l-.378-.225-3.88.816.824-3.787-.248-.39A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}
