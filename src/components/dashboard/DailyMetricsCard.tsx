// filepath: src/components/dashboard/DailyMetricsCard.tsx
"use client";

import React from "react";
import Link from "next/link";

interface PedidosStats {
  totalCount: number;
  noLeidos: number;
  pendientes: number;
  cargados: number;
  totalVentas: number;
}

interface DailyMetricsCardProps {
  pedidosStats: PedidosStats;
  ticketPromedio: number;
  formatCurrency: (val: number) => string;
}

export default function DailyMetricsCard({
  pedidosStats,
  ticketPromedio,
  formatCurrency,
}: DailyMetricsCardProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-sm transition-all duration-300 md:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="font-bebas text-2xl tracking-wide text-[var(--admin-text-hi)]">
              PEDIDOS DE HOY
            </h2>
          </div>
          <p className="text-xs text-[var(--admin-text-lo)] font-medium">
            Métricas de facturación y cola de despacho
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
          En vivo
        </span>
      </div>

      {/* Tarjeta Destacada: Facturación Estimada */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-5 shadow-xs transition-all hover:border-[var(--admin-accent)]/30">
        <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)] block">
              Facturación Estimada
            </span>
            <p className="font-bebas text-3xl sm:text-4xl text-[var(--admin-text-hi)] mt-1 tracking-tight tabular-nums">
              {formatCurrency(pedidosStats.totalVentas)}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-500 shadow-2xs">
            💰
          </div>
        </div>
      </div>

      {/* Métricas Secundarias: Cantidad y Ticket Promedio */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4 transition-all hover:border-[var(--admin-accent)]/30">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)] block">
            Pedidos Totales
          </span>
          <p className="font-bebas text-2xl sm:text-3xl text-[var(--admin-text-hi)] mt-1 tabular-nums">
            {pedidosStats.totalCount}
          </p>
          <span className="text-[10px] text-[var(--admin-text-lo)] mt-0.5 block">
            registrados hoy
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4 transition-all hover:border-[var(--admin-accent)]/30">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)] block">
            Ticket Promedio
          </span>
          <p className="font-bebas text-2xl sm:text-3xl text-[var(--admin-text-hi)] mt-1 tabular-nums truncate">
            {formatCurrency(ticketPromedio)}
          </p>
          <span className="text-[10px] text-[var(--admin-text-lo)] mt-0.5 block">
            por pedido
          </span>
        </div>
      </div>

      {/* Desglose de Estados de la Cola */}
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4.5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-[var(--admin-border)]/60 pb-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
            Estado de Cola
          </span>
          <span className="text-[10px] text-[var(--admin-text-lo)] font-semibold">
            {pedidosStats.totalCount} total
          </span>
        </div>

        {/* No Leídos */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 font-semibold text-red-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            No Leídos (Urgente)
          </span>
          <span className="font-mono font-bold text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md tabular-nums">
            {pedidosStats.noLeidos}
          </span>
        </div>

        {/* Pendientes */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            En Preparación
          </span>
          <span className="font-mono font-bold text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md tabular-nums">
            {pedidosStats.pendientes}
          </span>
        </div>

        {/* Cargados */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Cargados / Listos
          </span>
          <span className="font-mono font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md tabular-nums">
            {pedidosStats.cargados}
          </span>
        </div>
      </div>

      {/* Botón Principal a Pedidos */}
      <Link
        href="/admin/pedidos"
        className="group flex items-center justify-center gap-2 rounded-2xl bg-[var(--admin-accent)] hover:opacity-90 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all active:scale-[0.98] shadow-sm"
      >
        <span>Gestionar Pedidos de Hoy</span>
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </Link>
    </section>
  );
}
