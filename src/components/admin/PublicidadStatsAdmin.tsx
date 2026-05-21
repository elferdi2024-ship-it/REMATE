"use client";

import { useAdStats } from "@/hooks/useAdStats";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function PublicidadStatsAdmin() {
  const { stats, loading } = useAdStats();
  
  // Estado local para los sliders de ticket promedio del simulador de ROI por cada marca
  const [ticketSizes, setTicketSizes] = useState<Record<string, number>>({});

  const { currentMonth, prevMonth } = useMemo(() => {
    const d = new Date();
    const curr = d.toISOString().slice(0, 7);
    d.setMonth(d.getMonth() - 1);
    const prev = d.toISOString().slice(0, 7);
    return { currentMonth: curr, prevMonth: prev };
  }, []);

  const totalImpresiones = stats.reduce((sum, s) => sum + s.total, 0);
  const totalImpresionesMes = stats.reduce((sum, s) => sum + (s.byMonth[currentMonth] || 0), 0);
  const totalClicksGlobal = stats.reduce((sum, s) => sum + s.ctaClicks, 0);
  const totalModalesGlobal = stats.reduce((sum, s) => sum + s.modalOpens, 0);
  
  const ctrPromedioGlobal = useMemo(() => {
    if (totalImpresiones === 0) return 0;
    return (totalClicksGlobal / totalImpresiones) * 100;
  }, [totalClicksGlobal, totalImpresiones]);
  
  const todosMeses = useMemo(() => {
    const setMeses = new Set<string>();
    stats.forEach(s => Object.keys(s.byMonth).forEach(m => setMeses.add(m)));
    return Array.from(setMeses).sort().reverse();
  }, [stats]);

  const exportCSV = () => {
    let csv = "Brand ID,Brand Name,Tier,Total Impresiones,Modal Opens,CTA Clicks,CTR %,Ultima Vez Visto," + todosMeses.join(",") + "\n";
    stats.forEach(s => {
      const ctr = s.total > 0 ? ((s.ctaClicks / s.total) * 100).toFixed(2) : "0.00";
      const row = [
        s.brandId,
        s.brandName,
        s.tier.toUpperCase(),
        s.total,
        s.modalOpens,
        s.ctaClicks,
        `${ctr}%`,
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
    link.setAttribute("download", `publicidad_stats_completo_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTicketChange = (brandId: string, val: number) => {
    setTicketSizes(prev => ({
      ...prev,
      [brandId]: val
    }));
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
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-bebas text-3xl tracking-widest text-white">
            RENDIMIENTO DE <span className="text-[#00E5FF]">PUBLICIDAD</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Estadísticas pro y estimaciones de retorno ROI B2B en vivo</p>
        </div>
        
        <button
          onClick={exportCSV}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
        >
          Exportar Reporte Completo (CSV)
        </button>
      </div>

      {/* Global Stats Grid - Enriquecida */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="relative overflow-hidden rounded-[32px] border border-[#00E5FF]/30 bg-gradient-to-br from-[#00E5FF]/20 to-transparent p-6 transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Marcas Activas</p>
          <p className="font-bebas text-4xl leading-none text-white">{stats.length}</p>
        </div>
        
        <div className="relative overflow-hidden rounded-[32px] border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-transparent p-6 transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Total Impresiones</p>
          <p className="font-bebas text-4xl leading-none text-white">{totalImpresiones.toLocaleString()}</p>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-green-500/30 bg-gradient-to-br from-green-500/20 to-transparent p-6 transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Clicks de Compra (CTA)</p>
          <p className="font-bebas text-4xl leading-none text-white">{totalClicksGlobal.toLocaleString()}</p>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-transparent p-6 transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">CTR Promedio Global</p>
          <p className="font-bebas text-4xl leading-none text-[#00E5FF]">{ctrPromedioGlobal.toFixed(2)}%</p>
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

          // Computar CTR local de la marca
          const brandCtr = s.total > 0 ? (s.ctaClicks / s.total) * 100 : 0;
          
          // Slider de ticket promedio del patrocinador
          const ticketVal = ticketSizes[s.brandId] || 3500;
          const facturacionEstimada = s.ctaClicks * ticketVal;

          // Definir colores del Tier en Admin
          const tierBadges = {
            oro: { text: "🥇 Oro", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
            plata: { text: "🥈 Plata", color: "text-slate-300 bg-slate-500/10 border-slate-500/20" },
            bronce: { text: "🥉 Bronce", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
            "-": { text: "Standby", color: "text-gray-400 bg-gray-500/10 border-gray-500/20" }
          };
          const tierMeta = tierBadges[s.tier as keyof typeof tierBadges] || tierBadges["-"];

          // Barra de semáforo de conversión
          const progressColor = brandCtr > 3 ? "bg-[#00E5FF]" : brandCtr > 1.2 ? "bg-blue-500" : "bg-gray-600";

          return (
            <div key={s.brandId} className="flex flex-col rounded-3xl border border-white/10 bg-[#050914] p-6 shadow-xl relative overflow-hidden group">
              {/* Brillo suave de fondo al hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center justify-between mb-4 z-10">
                <h3 className="font-bebas text-2xl tracking-wide text-white uppercase">{s.brandName}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${tierMeta.color}`}>
                  {tierMeta.text}
                </span>
              </div>
              
              <div className="flex-1 space-y-4 z-10">
                {/* Impresiones */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Impresiones ({currentMonth})</p>
                  <div className="flex items-end gap-3 mt-1">
                    <p className="font-bebas text-4xl leading-none text-[#00E5FF]">{curr.toLocaleString()}</p>
                    <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'} mb-1`}>
                      {isPositive ? "↑" : "↓"} {Math.abs(deltaPct).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Métricas de Conversión */}
                <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase text-gray-500">Vistas Total</p>
                    <p className="text-sm font-bold text-white mt-0.5">{s.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase text-gray-500">Modales Ab.</p>
                    <p className="text-sm font-bold text-white mt-0.5">{s.modalOpens.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase text-gray-500">Clicks CTA</p>
                    <p className="text-sm font-bold text-green-400 mt-0.5">{s.ctaClicks.toLocaleString()}</p>
                  </div>
                </div>

                {/* CTR con Barra de Progreso */}
                <div className="border-t border-white/5 pt-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[9px] font-bold uppercase text-gray-500">Tasa de Conversión (CTR)</span>
                    <span className="font-extrabold text-white">{brandCtr.toFixed(2)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${progressColor} transition-all duration-500`}
                      style={{ width: `${Math.min(brandCtr * 15, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Estimador de ROI Publicitario */}
                <div className="border-t border-white/5 pt-4 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase mb-2">
                    <span>Estimador ROI B2B</span>
                    <span className="text-[#00E5FF] font-black">${ticketVal.toLocaleString("es-UY")} ticket</span>
                  </div>
                  
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="100"
                    value={ticketVal}
                    onChange={(e) => handleTicketChange(s.brandId, Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF] mb-3"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Facturación Estimada:</span>
                    <span className="text-sm font-black text-green-400 font-bebas tracking-wide">
                      $UY {facturacionEstimada.toLocaleString("es-UY")}
                    </span>
                  </div>
                </div>

                {/* Slots Top */}
                <div className="border-t border-white/5 pt-4">
                  <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">Ubicaciones Top</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(s.bySlot).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([slot,val]) => (
                      <span key={slot} className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] text-white/80 bg-white/5">
                        {slot}: {val}
                      </span>
                    ))}
                    {Object.keys(s.bySlot).length === 0 && (
                      <span className="text-[10px] text-gray-600">Ningún slot registrado aún</span>
                    )}
                  </div>
                </div>

                {/* A/B Testing Variant */}
                <div className="border-t border-white/5 pt-4 flex justify-between text-[10px] text-gray-400">
                  <span className="font-bold uppercase text-gray-500">CTA Split-Test:</span>
                  <div className="flex gap-3 font-semibold">
                    <span>A: <strong className="text-white">{(s.byAb["A"] || 0).toLocaleString()}</strong></span>
                    <span>B: <strong className="text-white">{(s.byAb["B"] || 0).toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>

              {/* Footer de Card */}
              <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-gray-600 flex justify-between z-10">
                <span>Último impacto:</span>
                <span className="text-white font-medium">
                  {s.lastSeen ? formatDistanceToNow(new Date(s.lastSeen), { addSuffix: true, locale: es }) : "Nunca"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla Detallada por Meses */}
      <div className="rounded-3xl border border-white/10 bg-[#0A0F1C]/80 p-6 backdrop-blur-md">
        <h2 className="mb-6 font-bebas text-2xl tracking-widest text-white">Desglose de Impresiones Mensuales</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500">
              <tr>
                <th className="pb-3 pr-4 font-bold">Mes de Campaña</th>
                {stats.map(s => (
                  <th key={s.brandId} className="pb-3 px-4 font-bold">{s.brandName}</th>
                ))}
                <th className="pb-3 pl-4 font-bold text-right text-white">Consumo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {todosMeses.map(mes => {
                const totalMes = stats.reduce((sum, s) => sum + (s.byMonth[mes] || 0), 0);
                return (
                  <tr key={mes} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-4 font-bold text-white">{mes}</td>
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
              {todosMeses.length === 0 && (
                <tr>
                  <td colSpan={stats.length + 2} className="text-center py-6 text-gray-600">
                    No se registran impresiones en ningún mes aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

