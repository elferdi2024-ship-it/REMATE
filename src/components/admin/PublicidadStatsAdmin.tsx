// filepath: src/components/admin/PublicidadStatsAdmin.tsx
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
  const totalClicksGlobal = stats.reduce((sum, s) => sum + s.ctaClicks, 0);
  
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
      <div className="flex min-h-[400px] items-center justify-center text-[var(--admin-text-hi)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--admin-accent)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[var(--admin-text-mid)]">
      {/* Header */}
      <div className="flex flex-col items-stretch justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-bebas text-2xl sm:text-3xl tracking-widest text-[var(--admin-text-hi)]">
            RENDIMIENTO DE <span className="text-[var(--admin-accent)]">PUBLICIDAD</span>
          </h1>
          <p className="text-[var(--admin-text-lo)] mt-1 text-sm">Estadísticas pro y estimaciones de retorno ROI B2B en vivo</p>
        </div>
        
        <button
          onClick={exportCSV}
          className="w-full md:w-auto text-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-[var(--admin-text-hi)] transition-all hover:bg-[var(--admin-input-bg)]"
        >
          Exportar Reporte Completo (CSV)
        </button>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] border border-[var(--admin-accent)]/30 bg-gradient-to-br from-[var(--admin-accent)]/20 to-transparent p-4 sm:p-6 transition-all hover:scale-[1.02] bg-[var(--admin-card-bg)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-lo)] mb-1">Marcas Activas</p>
          <p className="font-bebas text-4xl leading-none text-[var(--admin-text-hi)]">{stats.length}</p>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-transparent p-4 sm:p-6 transition-all hover:scale-[1.02] bg-[var(--admin-card-bg)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-lo)] mb-1">Total Impresiones</p>
          <p className="font-bebas text-4xl leading-none text-[var(--admin-text-hi)]">{totalImpresiones.toLocaleString()}</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] border border-green-500/30 bg-gradient-to-br from-green-500/20 to-transparent p-4 sm:p-6 transition-all hover:scale-[1.02] bg-[var(--admin-card-bg)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-lo)] mb-1">Clicks de Compra (CTA)</p>
          <p className="font-bebas text-4xl leading-none text-[var(--admin-text-hi)]">{totalClicksGlobal.toLocaleString()}</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-transparent p-4 sm:p-6 transition-all hover:scale-[1.02] bg-[var(--admin-card-bg)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-lo)] mb-1">CTR Promedio Global</p>
          <p className="font-bebas text-4xl leading-none text-[var(--admin-accent)]">{ctrPromedioGlobal.toFixed(2)}%</p>
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
            oro: { text: "🥇 Oro", color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20 dark:text-yellow-400" },
            plata: { text: "🥈 Plata", color: "text-slate-500 bg-slate-500/10 border-slate-500/20 dark:text-slate-300" },
            bronce: { text: "🥉 Bronce", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
            "-": { text: "Standby", color: "text-gray-400 bg-gray-500/10 border-gray-500/20" }
          };
          const tierMeta = tierBadges[s.tier as keyof typeof tierBadges] || tierBadges["-"];

          // Barra de semáforo de conversión
          const progressColor = brandCtr > 3 ? "bg-[var(--admin-accent)]" : brandCtr > 1.2 ? "bg-blue-500" : "bg-gray-400 dark:bg-gray-600";

          return (
            <div key={s.brandId} className="flex flex-col rounded-2xl sm:rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 sm:p-6 shadow-xl relative overflow-hidden group">
              {/* Brillo suave de fondo al hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center justify-between mb-4 z-10">
                <h3 className="font-bebas text-2xl tracking-wide text-[var(--admin-text-hi)] uppercase">{s.brandName}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${tierMeta.color}`}>
                  {tierMeta.text}
                </span>
              </div>
              
              <div className="flex-1 space-y-4 z-10">
                {/* Impresiones */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-lo)]">Impresiones ({currentMonth})</p>
                  <div className="flex items-end gap-3 mt-1">
                    <p className="font-bebas text-4xl leading-none text-[var(--admin-accent)]">{curr.toLocaleString()}</p>
                    <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mb-1`}>
                      {isPositive ? "↑" : "↓"} {Math.abs(deltaPct).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Métricas de Conversión */}
                <div className="grid grid-cols-3 gap-2 border-t border-[var(--admin-border)] pt-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase text-[var(--admin-text-lo)]">Vistas Total</p>
                    <p className="text-sm font-bold text-[var(--admin-text-hi)] mt-0.5">{s.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase text-[var(--admin-text-lo)]">Modales Ab.</p>
                    <p className="text-sm font-bold text-[var(--admin-text-hi)] mt-0.5">{s.modalOpens.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase text-[var(--admin-text-lo)]">Clicks CTA</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-0.5">{s.ctaClicks.toLocaleString()}</p>
                  </div>
                </div>

                {/* CTR con Barra de Progreso */}
                <div className="border-t border-[var(--admin-border)] pt-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[9px] font-bold uppercase text-[var(--admin-text-lo)]">Tasa de Conversión (CTR)</span>
                    <span className="font-extrabold text-[var(--admin-text-hi)]">{brandCtr.toFixed(2)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${progressColor} transition-all duration-500`}
                      style={{ width: `${Math.min(brandCtr * 15, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Estimador de ROI Publicitario */}
                <div className="border-t border-[var(--admin-border)] pt-4 bg-[var(--admin-bg)] p-3 rounded-2xl border border-[var(--admin-border)]">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[var(--admin-text-lo)] uppercase mb-2">
                    <span>Estimador ROI B2B</span>
                    <span className="text-[var(--admin-accent)] font-black">${ticketVal.toLocaleString("es-UY")} ticket</span>
                  </div>
                  
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="100"
                    value={ticketVal}
                    onChange={(e) => handleTicketChange(s.brandId, Number(e.target.value))}
                    className="w-full h-1 bg-[var(--admin-border)] rounded-lg appearance-none cursor-pointer accent-[var(--admin-accent)] mb-3"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[var(--admin-text-lo)] uppercase">Facturación Estimada:</span>
                    <span className="text-sm font-black text-green-600 dark:text-green-400 font-bebas tracking-wide">
                      $UY {facturacionEstimada.toLocaleString("es-UY")}
                    </span>
                  </div>
                </div>

                {/* Slots Top */}
                <div className="border-t border-[var(--admin-border)] pt-4">
                  <p className="text-[10px] font-bold uppercase text-[var(--admin-text-lo)] mb-2">Ubicaciones Top</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(s.bySlot).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([slot,val]) => (
                      <span key={slot} className="rounded-full border border-[var(--admin-border)] px-2 py-0.5 text-[9px] text-[var(--admin-text-mid)] bg-[var(--admin-bg)]">
                        {slot}: {val}
                      </span>
                    ))}
                    {Object.keys(s.bySlot).length === 0 && (
                      <span className="text-[10px] text-[var(--admin-text-lo)]/60">Ningún slot registrado aún</span>
                    )}
                  </div>
                </div>

                {/* A/B Testing Variant */}
                <div className="border-t border-[var(--admin-border)] pt-4 flex justify-between text-[10px] text-[var(--admin-text-lo)]">
                  <span className="font-bold uppercase text-[var(--admin-text-lo)]">CTA Split-Test:</span>
                  <div className="flex gap-3 font-semibold">
                    <span>A: <strong className="text-[var(--admin-text-hi)]">{(s.byAb["A"] || 0).toLocaleString()}</strong></span>
                    <span>B: <strong className="text-[var(--admin-text-hi)]">{(s.byAb["B"] || 0).toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>

              {/* Footer de Card */}
              <div className="mt-6 pt-4 border-t border-[var(--admin-border)] flex flex-col gap-3 z-10">
                <div className="text-[10px] text-[var(--admin-text-lo)] flex justify-between">
                  <span>Último impacto:</span>
                  <span className="text-[var(--admin-text-hi)] font-medium">
                    {s.lastSeen ? formatDistanceToNow(new Date(s.lastSeen), { addSuffix: true, locale: es }) : "Nunca"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a href={`/admin/publicidad/reporte/${s.brandId}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border border-[var(--admin-accent)]/20 py-2 rounded-lg text-center text-xs font-bold hover:bg-[var(--admin-accent)] hover:text-white transition-colors">
                    📤 Ver Reporte
                  </a>
                  <button onClick={() => {
                    const win = window.open(`/admin/publicidad/reporte/${s.brandId}`, '_blank');
                    if(win) {
                       win.onload = () => { setTimeout(() => win.print(), 1000); };
                    }
                  }} className="flex-1 bg-[var(--admin-input-bg)] text-[var(--admin-text-hi)] border border-[var(--admin-border)] py-2 rounded-lg text-center text-xs font-bold hover:bg-[var(--admin-border)] transition-colors">
                    🖨️ Imprimir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla Detallada por Meses */}
      <div className="rounded-2xl sm:rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 sm:p-6 shadow-xl">
        <h2 className="mb-6 font-bebas text-2xl tracking-widest text-[var(--admin-text-hi)]">Desglose de Impresiones Mensuales</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--admin-text-lo)]">
            <thead className="border-b border-[var(--admin-border)] text-[10px] uppercase tracking-widest text-[var(--admin-text-lo)]">
              <tr>
                <th className="pb-3 pr-4 font-bold">Mes de Campaña</th>
                {stats.map(s => (
                  <th key={s.brandId} className="pb-3 px-4 font-bold">{s.brandName}</th>
                ))}
                <th className="pb-3 pl-4 font-bold text-right text-[var(--admin-text-hi)]">Consumo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {todosMeses.map(mes => {
                const totalMes = stats.reduce((sum, s) => sum + (s.byMonth[mes] || 0), 0);
                return (
                  <tr key={mes} className="hover:bg-[var(--admin-input-bg)]/30 transition-colors">
                    <td className="py-4 pr-4 font-bold text-[var(--admin-text-hi)]">{mes}</td>
                    {stats.map(s => (
                      <td key={`${mes}-${s.brandId}`} className="py-4 px-4 text-[var(--admin-text-mid)]">
                        {(s.byMonth[mes] || 0).toLocaleString()}
                      </td>
                    ))}
                    <td className="py-4 pl-4 text-right font-bold text-[var(--admin-accent)]">
                      {totalMes.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {todosMeses.length === 0 && (
                <tr>
                  <td colSpan={stats.length + 2} className="text-center py-6 text-[var(--admin-text-lo)]/60">
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
