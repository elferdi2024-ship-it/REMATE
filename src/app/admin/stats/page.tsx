// filepath: src/app/admin/stats/page.tsx
"use client";

import StatsView from "@/components/admin/StatsView";

export default function StatsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[var(--admin-text-mid)]">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-bebas text-4xl tracking-wide text-[var(--admin-text-hi)] md:text-5xl">
            PANEL DE <span className="text-[var(--admin-accent)]">ESTADÍSTICAS</span>
          </h1>
          <p className="text-[var(--admin-text-lo)] mt-2 font-medium">Análisis de ventas y rendimiento</p>
        </div>
      </div>

      <StatsView />
    </div>
  );
}
