"use client";

import StatsView from "@/components/admin/StatsView";

export default function StatsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-bebas text-4xl tracking-wide text-white md:text-5xl">
            PANEL DE <span className="text-[#00E5FF]">ESTADÍSTICAS</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Análisis de ventas y rendimiento</p>
        </div>
      </div>

      <StatsView />
    </div>
  );
}
