// filepath: src/components/dashboard/DashboardHeader.tsx
"use client";

import React from "react";
import Link from "next/link";

interface DashboardHeaderProps {
  totalPedidosHoy: number;
  pedidosAbiertos: boolean;
}

export default function DashboardHeader({
  totalPedidosHoy,
  pedidosAbiertos,
}: DashboardHeaderProps) {
  return (
    <header className="relative flex flex-col items-start justify-between gap-5 rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-sm backdrop-blur-md transition-all duration-300 md:flex-row md:items-center md:p-8">
      {/* Glow ambiental sutil */}
      <div className="pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full bg-[var(--admin-accent)]/10 blur-3xl" />

      <div className="relative z-10 space-y-1">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--admin-accent)]/10 px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-[var(--admin-accent)] uppercase">
            ⚡ Dashboard Operativo
          </span>
          <span className="text-[11px] text-[var(--admin-text-lo)] font-medium">
            El Remate Mayorista
          </span>
        </div>
        <h1 className="font-bebas text-4xl tracking-tight text-[var(--admin-text-hi)] md:text-5xl">
          CENTRO DE <span className="text-[var(--admin-accent)]">CONTROL</span>
        </h1>
        <p className="max-w-xl text-xs sm:text-sm font-normal text-[var(--admin-text-lo)]">
          Monitoreo en tiempo real de operaciones, recepción de pedidos, políticas de entrega y catálogo express.
        </p>
      </div>

      {/* Badges y Quick Action */}
      <div className="relative z-10 flex flex-wrap items-center gap-3">
        {/* Estado Operativo */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-2.5 shadow-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                pedidosAbiertos ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                pedidosAbiertos ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--admin-text-lo)]">
              Recepción
            </span>
            <span
              className={`font-semibold text-xs leading-none ${
                pedidosAbiertos ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              {pedidosAbiertos ? "En Línea · Abierta" : "Pausada · Solo Catálogo"}
            </span>
          </div>
        </div>

        {/* Contador Pedidos Hoy */}
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-2.5 shadow-xs">
          <span className="text-base">📦</span>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[var(--admin-text-lo)]">
              Hoy
            </span>
            <span className="font-mono font-bold text-xs text-[var(--admin-text-hi)] tabular-nums">
              {totalPedidosHoy} {totalPedidosHoy === 1 ? "pedido" : "pedidos"}
            </span>
          </div>
        </div>

        {/* Ver Catálogo en vivo */}
        <Link
          href="/catalogo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] hover:bg-[var(--admin-input-bg)] px-4 py-2.5 text-xs font-semibold text-[var(--admin-text-hi)] transition-all active:scale-[0.98] shadow-xs"
        >
          <span>Ver Tienda</span>
          <span className="text-xs text-[var(--admin-accent)]">↗</span>
        </Link>
      </div>
    </header>
  );
}
