// filepath: src/app/admin/stats/page.tsx
"use client";

import StatsView from "@/components/admin/StatsView";

export default function StatsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[var(--admin-text-mid)]">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--admin-border)] pb-4 print:hidden">
        <div>
          <h1 className="font-bebas text-4xl tracking-wide text-[var(--admin-text-hi)] md:text-5xl">
            PANEL DE <span className="text-[var(--admin-accent)]">ESTADÍSTICAS</span>
          </h1>
          <p className="text-[var(--admin-text-lo)] mt-1 font-medium">Análisis de rendimiento comercial y ventas.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          🖨️ EXPORTAR PDF
        </button>
      </div>

      {/* Nota de Transición Digital */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 sm:p-5 text-xs leading-relaxed text-[var(--admin-text-mid)] page-break-avoid">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
          <span>📈</span> Nota de Transición Digital
        </div>
        <p className="text-[var(--admin-text-lo)] leading-relaxed">
          Actualmente nos encontramos en proceso de migración de nuestra cartera física de clientes y pedidos tradicionales hacia la web, con el objetivo de consolidarla en los próximos meses como nuestra fuente principal de recepción de pedidos y expandir las ventas en toda la región.
        </p>
      </div>

      <StatsView />
    </div>
  );
}
