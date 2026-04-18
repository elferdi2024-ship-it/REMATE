"use client";

import { useEffect, useRef, useState } from "react";
import { generarFacturaBlob } from "@/lib/generarFactura";
import { enviarFacturaWhatsApp } from "@/lib/whatsapp";

interface CartItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface FacturaModalProps {
  isOpen: boolean;
  nombre: string;
  telefono: string;
  items: CartItem[];
  notas?: string;
  numeroPedido?: string;
  numeroWhatsApp?: string;
  logoUrl?: string;
  onClose: () => void;
  onEnviado?: () => void;
}

type Estado = "generando" | "listo" | "enviando" | "error";

export default function FacturaModal({
  isOpen,
  nombre,
  telefono,
  items,
  notas,
  numeroPedido,
  numeroWhatsApp,
  logoUrl = "/logo.png",
  onClose,
  onEnviado,
}: FacturaModalProps) {
  const [estado, setEstado] = useState<Estado>("generando");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);

  // Generar factura cada vez que se abre el modal
  useEffect(() => {
    if (!isOpen) return;

    setEstado("generando");
    setPreviewUrl(null);

    generarFacturaBlob({ nombre, telefono, items, notas, numeroPedido, logoUrl })
      .then((blob) => {
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setEstado("listo");
      })
      .catch((err) => {
        console.error("Error generating factura:", err);
        setEstado("error");
      });

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [isOpen]);

  async function handleEnviar() {
    setEstado("enviando");
    try {
      await enviarFacturaWhatsApp(
        numeroWhatsApp || process.env.NEXT_PUBLIC_WA_NUMBER || "",
        nombre,
        telefono,
        items,
        notas,
        logoUrl,
        numeroPedido
      );
      onEnviado?.();
      onClose();
    } catch (err) {
      console.error("Error sending factura:", err);
      setEstado("error");
    }
  }

  function handleDescargar() {
    if (!blobRef.current) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blobRef.current);
    a.download = `pedido-elremate-${Date.now()}.png`;
    a.click();
  }

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-black text-white shrink-0">
          <div>
            <p className="text-[10px] tracking-widest text-white/50 uppercase font-bold">
              Vista previa
            </p>
            <h2 className="text-base font-semibold leading-tight">
              Tu factura de pedido
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors font-bold"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="flex-1 overflow-y-auto">
          {estado === "generando" && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Generando tu factura…</p>
            </div>
          )}

          {estado === "error" && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-red-500">
              <p className="text-sm font-medium">No se pudo generar la factura.</p>
              <button
                onClick={() => setEstado("generando")}
                className="text-xs underline text-gray-500"
              >
                Reintentar
              </button>
            </div>
          )}

          {(estado === "listo" || estado === "enviando") && previewUrl && (
            <div className="p-4">
              {/* Imagen de la factura */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Vista previa de la factura"
                  className="w-full h-auto"
                />
              </div>

              {/* Resumen rápido */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400 px-1">
                <span>{items.length} producto{items.length !== 1 ? "s" : ""}</span>
                <span>
                  Total:{" "}
                  <strong className="text-black">
                    ${items
                      .reduce((s, i) => s + i.precio * i.cantidad, 0)
                      .toLocaleString("es-UY")}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        {(estado === "listo" || estado === "enviando") && (
          <div className="shrink-0 border-t border-gray-100 px-4 py-4 flex flex-col gap-2 bg-gray-50/50">
            {/* Botón principal */}
            <button
              onClick={handleEnviar}
              disabled={estado === "enviando"}
              className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {estado === "enviando" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <WhatsAppIcon />
                  Enviar por WhatsApp
                </>
              )}
            </button>

            {/* Acciones secundarias */}
            <div className="flex gap-2">
              <button
                onClick={handleDescargar}
                className="flex-1 text-sm text-gray-500 border border-gray-200 rounded-xl py-2.5 bg-white hover:bg-gray-50 transition-colors"
              >
                Descargar imagen
              </button>
              <button
                onClick={onClose}
                className="flex-1 text-sm text-gray-500 border border-gray-200 rounded-xl py-2.5 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
