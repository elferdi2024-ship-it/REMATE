// filepath: src/components/catalogo/HamburgerMenuDrawer.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { SUCURSALES } from "@/lib/sucursales";
import { EMOJI_POR_CATEGORIA } from "@/types";

interface HamburgerMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sucursalId?: string | null;
  onOpenBranchModal: () => void;
  onSelectCategory: (cat: string) => void;
  activeCat: string;
  onToggleOfertas: () => void;
  onToggleFavoritos: () => void;
  pedidosAbiertos?: boolean;
  categorias: readonly string[];
}

export default function HamburgerMenuDrawer({
  isOpen,
  onClose,
  sucursalId,
  onOpenBranchModal,
  onSelectCategory,
  activeCat,
  onToggleOfertas,
  onToggleFavoritos,
  pedidosAbiertos = true,
  categorias,
}: HamburgerMenuDrawerProps) {
  const sucursalObj = SUCURSALES.find((s) => s.id === sucursalId) || SUCURSALES[0];
  const sucursalTelefono = sucursalObj?.telefono?.replace(/\s+/g, "") || "59894611400";
  const waUrl = `https://wa.me/598${sucursalTelefono.replace(/^0/, "")}?text=Hola%2C%20quisiera%20hacer%20un%20pedido%20o%20consulta%20en%20El%20Remate`;

  // Prevenir scroll en body cuando el drawer esté abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Cerrar al presionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
        className="relative z-10 flex h-full w-full max-w-[340px] flex-col bg-white text-[#1B2620] shadow-2xl transition-transform duration-300 ease-out animate-in slide-in-from-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E6E0] px-4 py-3.5">
          <span className="text-lg font-extrabold tracking-tight text-[#1B2620]">
            Menú
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E6E6E0] bg-[#F6F6F3] text-sm font-bold text-[#1B2620] transition hover:bg-[#EAEAE6] active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Status Chip */}
          <div className="flex items-center gap-2 rounded-full bg-[#1B2620]/5 px-3 py-1.5 text-xs font-semibold text-[#1B2620]">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                  pedidosAbiertos ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  pedidosAbiertos ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span className="text-[11.5px]">
              {pedidosAbiertos ? "Abierto ahora · Recepción activa" : "Recepción pausada · Solo catálogo"}
            </span>
          </div>

          {/* Botón WhatsApp Destacado */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#1FA855] hover:bg-[#188a46] px-4 py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.98]"
          >
            <span className="text-lg">💬</span>
            <span>Pedir por WhatsApp</span>
          </a>

          {/* Enlaces de Navegación Principal */}
          <nav className="flex flex-col gap-1 border-b border-[#E6E6E0] pb-3" aria-label="Navegación del sitio">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl p-2.5 text-sm font-bold text-[#1B2620] transition hover:bg-[#F6F6F3]"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏠</span>
                <span>Inicio</span>
              </div>
              <span className="text-xs text-slate-400">›</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                onToggleOfertas();
                onClose();
              }}
              className="flex items-center justify-between rounded-xl p-2.5 text-sm font-bold text-[#1B2620] transition hover:bg-[#F6F6F3] text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏷️</span>
                <span>Ofertas de la semana</span>
              </div>
              <span className="text-xs text-slate-400">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectCategory("Todos");
                onClose();
              }}
              className="flex items-center justify-between rounded-xl p-2.5 text-sm font-bold text-[#1B2620] transition hover:bg-[#F6F6F3] text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🛒</span>
                <span>Catálogo completo</span>
              </div>
              <span className="text-xs text-slate-400">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleFavoritos();
                onClose();
              }}
              className="flex items-center justify-between rounded-xl p-2.5 text-sm font-bold text-[#1B2620] transition hover:bg-[#F6F6F3] text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">❤️</span>
                <span>Mis favoritos</span>
              </div>
              <span className="text-xs text-slate-400">›</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenBranchModal();
                onClose();
              }}
              className="flex items-center justify-between rounded-xl p-2.5 text-sm font-bold text-[#1B2620] transition hover:bg-[#F6F6F3] text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏪</span>
                <span className="flex items-center gap-1.5">
                  <span>Sucursales</span>
                  <span className="rounded-md bg-[#EF233C]/10 px-1.5 py-0.2 font-mono text-[10px] font-black text-[#EF233C]">
                    {sucursalObj.nombre}
                  </span>
                </span>
              </div>
              <span className="text-xs text-[#EF233C] font-bold">Cambiar ›</span>
            </button>
          </nav>

          {/* Catálogo por Rubro (Grilla 3x3) */}
          <div className="space-y-2 border-b border-[#E6E6E0] pb-4">
            <p className="font-mono text-[10.5px] font-extrabold uppercase tracking-wider text-[#7A8179]">
              Catálogo por rubro
            </p>
            <div className="grid grid-cols-3 gap-2">
              {categorias.slice(0, 9).map((cat) => {
                const emoji = EMOJI_POR_CATEGORIA[cat] || "📦";
                const isAct = cat === activeCat;
                // Formatear nombre corto para la tarjeta compacta
                const shortName = cat
                  .toLowerCase()
                  .replace(/ y .*/, "")
                  .replace(/, .*/, "")
                  .replace(/artículos del /, "")
                  .replace(/de la /, "")
                  .trim();
                const displayName = shortName.charAt(0).toUpperCase() + shortName.slice(1);

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat);
                      onClose();
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition active:scale-95 ${
                      isAct
                        ? "border-[#1B2620] bg-[#1B2620] text-white shadow-xs"
                        : "border-[#E6E6E0] bg-[#F6F6F3]/60 text-[#1B2620] hover:border-[#1B2620]"
                    }`}
                  >
                    <span className="text-xl leading-none">{emoji}</span>
                    <span className="text-[11px] font-bold leading-tight line-clamp-1">
                      {displayName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Información de Sucursal & Horarios */}
          <div className="space-y-2.5">
            <p className="font-mono text-[10.5px] font-extrabold uppercase tracking-wider text-[#7A8179]">
              Nuestro Local / Sucursal
            </p>
            <div className="rounded-xl border border-[#E6E6E0] bg-[#F6F6F3]/50 p-3 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-sm">📍</span>
                <div>
                  <p className="font-bold text-[#1B2620]">
                    El Remate · {sucursalObj.nombre}
                  </p>
                  <p className="text-[#7A8179] text-[11px]">
                    {sucursalObj.direccion}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-[#E6E6E0]/60 pt-2">
                <span className="text-sm">⏰</span>
                <p className="text-[#7A8179] text-[11px]">
                  Lun a Sáb · 08:00 a 19:00 hs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E6E6E0] bg-[#FAF9F6] px-4 py-3 text-xs space-y-1.5">
          <a
            href={`tel:${sucursalTelefono}`}
            className="flex items-center gap-2 font-bold text-[#1B2620] hover:text-[#EF233C] transition-colors"
          >
            <span>📞</span>
            <span>{sucursalObj.telefono || "094 611 400"}</span>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] font-semibold text-[#7A8179] hover:text-[#1B2620] transition-colors"
          >
            <span>📷</span>
            <span>@elrematedistribuidora</span>
          </a>
        </div>
      </aside>
    </div>
  );
}
