"use client";

import { useAdStats } from "@/hooks/useAdStats";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function PublicidadStatsAdmin() {
  const { stats, loading } = useAdStats();

  const { currentMonth, prevMonth } = useMemo(() => {
    const d = new Date();
    const curr = d.toISOString().slice(0, 7);
    d.setMonth(d.getMonth() - 1);
    const prev = d.toISOString().slice(0, 7);
    return { currentMonth: curr, prevMonth: prev };
  }, []);

  const totalImpresiones = stats.reduce((sum, s) => sum + s.total, 0);
  const totalImpresionesMes = stats.reduce((sum, s) => sum + (s.byMonth[currentMonth] || 0), 0);
  
  const todosMeses = useMemo(() => {
    const setMeses = new Set<string>();
    stats.forEach(s => Object.keys(s.byMonth).forEach(m => setMeses.add(m)));
    return Array.from(setMeses).sort().reverse();
  }, [stats]);

  const exportCSV = () => {
    let csv = "Brand,Tier,Total Impresiones,Ultima Vez Visto," + todosMeses.join(",") + "\n";
    stats.forEach(s => {
      const row = [
        s.brandId,
        s.tier,
        s.total,
        s.lastSeen || "N/A"
      ];
      todosMeses.forEach(m => {
        row.push((s.byMonth[m] || 0).toString());
      });
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `publicidad_stats_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00E5FF] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-bebas text-3xl tracking-widest text-white">
            RENDIMIENTO DE <span className="text-[#00E5FF]">PUBLICIDAD</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Estadísticas en tiempo real de anuncios</p>
        </div>
        
        <button
          onClick={exportCSV}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
        >
          Exportar CSV
        </button>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-[32px] border border-[#00E5FF]/30 bg-gradient-to-br from-[#00E5FF]/20 to-transparent p-6 transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Marcas Activas</p>
          <p className="font-bebas text-4xl leading-none text-white">{stats.length}</p>
        </div>
        <div className="relative overflow-hidden rounded-[32px] border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-transparent p-6 transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Impresiones ({currentMonth})</p>
          <p className="font-bebas text-4xl leading-none text-white">{totalImpresionesMes.toLocaleString()}</p>
        </div>
        <div className="relative overflow-hidden rounded-[32px] border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-transparent p-6 transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] col-span-2 md:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Total Histórico</p>
          <p className="font-bebas text-4xl leading-none text-white">{totalImpresiones.toLocaleString()}</p>
        </div>
      </div>

      {/* Grid de Cards de Marcas */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => {
          const curr = s.byMonth[currentMonth] || 0;
          const prev = s.byMonth[prevMonth] || 0;
          const delta = curr - prev;
          const deltaPct = prev > 0 ? (delta / prev) * 100 : (curr > 0 ? 100 : 0);
          const isPositive = delta >= 0;

          return (
            <div key={s.brandId} className="flex flex-col rounded-3xl border border-white/10 bg-[#050914] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bebas text-2xl tracking-wide text-white uppercase">{s.brandId}</h3>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Impresiones ({currentMonth})</p>
                  <div className="flex items-end gap-3 mt-1">
                    <p className="font-bebas text-5xl leading-none text-[#00E5FF]">{curr.toLocaleString()}</p>
                    <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'} mb-1`}>
                      {isPositive ? "↑" : "↓"} {Math.abs(deltaPct).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500">Mes Anterior</p>
                    <p className="text-lg font-bold text-white">{prev.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500">Total Global</p>
                    <p className="text-lg font-bold text-white">{s.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-gray-500 flex justify-between">
                <span>Última vista:</span>
                <span className="text-white">
                  {s.lastSeen ? formatDistanceToNow(new Date(s.lastSeen), { addSuffix: true, locale: es }) : "Nunca"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla Detallada */}
      <div className="rounded-3xl border border-white/10 bg-[#0A0F1C]/80 p-6 backdrop-blur-md">
        <h2 className="mb-6 font-bebas text-2xl tracking-widest text-white">Desglose por Mes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500">
              <tr>
                <th className="pb-3 pr-4 font-bold">Mes</th>
                {stats.map(s => (
                  <th key={s.brandId} className="pb-3 px-4 font-bold">{s.brandId}</th>
                ))}
                <th className="pb-3 pl-4 font-bold text-right text-white">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {todosMeses.map(mes => {
                const totalMes = stats.reduce((sum, s) => sum + (s.byMonth[mes] || 0), 0);
                return (
                  <tr key={mes} className="hover:bg-white/[0.02]">
                    <td className="py-4 pr-4 font-medium text-white">{mes}</td>
                    {stats.map(s => (
                      <td key={`${mes}-${s.brandId}`} className="py-4 px-4 text-gray-300">
                        {(s.byMonth[mes] || 0).toLocaleString()}
                      </td>
                    ))}
                    <td className="py-4 pl-4 text-right font-bold text-[#00E5FF]">
                      {totalMes.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
