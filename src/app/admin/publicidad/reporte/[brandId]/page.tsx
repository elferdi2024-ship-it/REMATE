"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import type { BrandConfig } from "@/types/brands";
import { TIER_COLORS } from "@/types/brands";
import type { BrandStats } from "@/hooks/useAdStats";

export default function BrandReportPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [stats, setStats] = useState<BrandStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketAvg, setTicketAvg] = useState(500);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load config
        const configSnap = await getDoc(doc(db, "configuracion", "publicidad"));
        let currentBrand: BrandConfig | null = null;
        if (configSnap.exists()) {
          const brands = configSnap.data().brands as BrandConfig[] || [];
          currentBrand = brands.find(b => b.id === brandId) || null;
          setBrand(currentBrand);
        }

        // Load stats
        const statsSnap = await getDoc(doc(db, "ads_impressions", brandId));
        if (statsSnap.exists()) {
          const data = statsSnap.data();
          const byMonth: Record<string, number> = {};
          const bySlot: Record<string, number> = {};
          const byAb: Record<string, number> = {};

          Object.entries(data).forEach(([k, v]) => {
            if (/^\d{4}-\d{2}$/.test(k)) byMonth[k] = Number(v) || 0;
            if (/^slot_/.test(k) && !/_\d{4}-\d{2}$/.test(k)) bySlot[k.replace("slot_", "")] = Number(v) || 0;
            if (/^ab_/.test(k)) byAb[k.replace("ab_", "")] = Number(v) || 0;
          });

          setStats({
            brandId,
            brandName: currentBrand?.name || brandId,
            tier: currentBrand?.tier || "bronce",
            total: Number(data.total) || 0,
            modalOpens: Number(data.modal_opens) || 0,
            ctaClicks: Number(data.cta_clicks) || 0,
            byMonth,
            bySlot,
            byAb,
            lastSeen: data.lastSeen,
          });
        } else {
          // No stats yet
          setStats({
            brandId,
            brandName: currentBrand?.name || brandId,
            tier: currentBrand?.tier || "bronce",
            total: 0,
            modalOpens: 0,
            ctaClicks: 0,
            byMonth: {},
            bySlot: {},
            byAb: {},
          });
        }
      } catch (err) {
        console.error("Error loading brand report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [brandId]);

  const monthlyData = useMemo(() => {
    if (!stats) return [];
    const entries = Object.entries(stats.byMonth).sort((a, b) => a[0].localeCompare(b[0]));
    return entries.slice(-6); // last 6 months
  }, [stats]);

  const maxMonthVal = useMemo(() => {
    if (monthlyData.length === 0) return 1;
    return Math.max(...monthlyData.map(d => d[1]), 1);
  }, [monthlyData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1A1410]">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#D62828] border-t-transparent"></div>
      </div>
    );
  }

  if (!brand || !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1A1410] flex-col gap-4">
        <h1 className="text-white font-bebas text-3xl">No hay datos para esta marca</h1>
        <Link href="/admin/publicidad" className="text-[#D62828] underline">Volver al admin</Link>
      </div>
    );
  }

  const tStyle = TIER_COLORS[brand.tier];
  const accentColor = brand.color || "#D62828";
  
  const conversionRate = stats.total > 0 ? (stats.ctaClicks / stats.total) * 100 : 0;
  const estimatedRevenue = stats.ctaClicks * ticketAvg * 0.1; // Assumed 10% conversion after click

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--admin-bg, #09090b)" }}>
      {/* Hide in print */}
      <div className="print-hide p-4 border-b border-[var(--admin-border)] flex justify-between items-center bg-[var(--admin-card-bg)]">
        <Link href="/admin/publicidad?tab=reportes" className="text-[var(--admin-text-mid)] hover:text-white transition-colors text-sm">
          ← Volver a Reportes
        </Link>
        <button 
          onClick={() => window.print()} 
          className="bg-[var(--admin-accent)] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          <span role="img" aria-label="print">🖨️</span> Imprimir / PDF
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-8 print-p-0">
        
        {/* REPORT HEADER */}
        <div className="flex justify-between items-start mb-10 border-b border-[var(--admin-border)] pb-8">
          <div className="flex items-center gap-6">
            {brand.logo ? (
              <div className="w-24 h-24 bg-white rounded-2xl p-2 relative shadow-lg">
                <Image src={brand.logo} alt={brand.name} fill sizes="96px" className="object-contain p-2" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg" style={{ backgroundColor: accentColor }}>
                {brand.name.charAt(0)}
              </div>
            )}
            
            <div>
              <h1 className="font-bebas text-5xl text-white tracking-wider mb-2" style={{ color: "var(--admin-text-hi)" }}>
                {brand.name}
              </h1>
              <div className="flex gap-3 items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" 
                      style={{ color: tStyle.text, backgroundColor: tStyle.bg, border: `1px solid ${tStyle.border}` }}>
                  Tier {brand.tier}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${brand.active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {brand.active ? 'Campaña Activa' : 'Campaña Inactiva'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[var(--admin-text-mid)] text-sm mb-1">Reporte de Desempeño</div>
            <div className="font-bold text-[var(--admin-text-hi)]">El Remate Ads</div>
            <div className="text-[var(--admin-text-lo)] text-xs mt-2">
              Generado: {new Date().toLocaleDateString('es-UY')}
            </div>
          </div>
        </div>

        {/* KPIs ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--admin-card-bg)] rounded-xl p-5 border border-[var(--admin-border)]">
            <div className="text-[var(--admin-text-mid)] text-xs font-bold uppercase mb-2">Impresiones Totales</div>
            <div className="font-bebas text-4xl text-[var(--admin-text-hi)]">{stats.total.toLocaleString()}</div>
            <div className="text-xs text-[var(--admin-text-lo)] mt-1">vistas de productos/banners</div>
          </div>
          <div className="bg-[var(--admin-card-bg)] rounded-xl p-5 border border-[var(--admin-border)]">
            <div className="text-[var(--admin-text-mid)] text-xs font-bold uppercase mb-2">Interacciones (Clicks)</div>
            <div className="font-bebas text-4xl text-[var(--admin-text-hi)]">{stats.ctaClicks.toLocaleString()}</div>
            <div className="text-xs text-[var(--admin-text-lo)] mt-1">CTR: {conversionRate.toFixed(2)}%</div>
          </div>
          <div className="bg-[var(--admin-card-bg)] rounded-xl p-5 border border-[var(--admin-border)]">
            <div className="text-[var(--admin-text-mid)] text-xs font-bold uppercase mb-2">Aperturas de Modal</div>
            <div className="font-bebas text-4xl text-[var(--admin-text-hi)]">{stats.modalOpens.toLocaleString()}</div>
            <div className="text-xs text-[var(--admin-text-lo)] mt-1">galería multimedia vista</div>
          </div>
          <div className="bg-[var(--admin-card-bg)] rounded-xl p-5 border border-[var(--admin-border)] relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(135deg, transparent, ${accentColor})` }} />
            <div className="relative z-10">
              <div className="text-[var(--admin-text-mid)] text-xs font-bold uppercase mb-2">Retorno Estimado</div>
              <div className="font-bebas text-4xl" style={{ color: accentColor }}>${estimatedRevenue.toLocaleString()}</div>
              <div className="text-xs text-[var(--admin-text-lo)] mt-1">basado en ticket avg ${ticketAvg}</div>
            </div>
            
            <div className="print-hide absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => setTicketAvg(v => Math.max(100, v - 100))} className="bg-[var(--admin-bg)] text-[var(--admin-text-hi)] border border-[var(--admin-border)] text-xs px-2 rounded hover:bg-[var(--admin-border)]">-</button>
               <button onClick={() => setTicketAvg(v => v + 100)} className="bg-[var(--admin-bg)] text-[var(--admin-text-hi)] border border-[var(--admin-border)] text-xs px-2 rounded hover:bg-[var(--admin-border)]">+</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* MONTHLY CHART */}
          <div className="bg-[var(--admin-card-bg)] rounded-xl p-6 border border-[var(--admin-border)]">
            <h3 className="font-bold text-[var(--admin-text-hi)] mb-6">Evolución de Impresiones</h3>
            <div className="flex items-end gap-2 h-48 mb-4">
              {monthlyData.length > 0 ? (
                monthlyData.map(([month, val]) => {
                  const heightPct = (val / maxMonthVal) * 100;
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full relative h-full flex items-end justify-center">
                        <div 
                          className="w-full rounded-t-sm transition-all duration-500 relative"
                          style={{ height: `${heightPct}%`, backgroundColor: accentColor, opacity: 0.8 }}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-1 rounded">
                            {val}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-[var(--admin-text-mid)] uppercase">{month.slice(5)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-lo)]">Sin datos mensuales</div>
              )}
            </div>
          </div>

          {/* DISTRIBUTION */}
          <div className="bg-[var(--admin-card-bg)] rounded-xl p-6 border border-[var(--admin-border)] flex flex-col">
            <h3 className="font-bold text-[var(--admin-text-hi)] mb-6">Distribución por Ubicación</h3>
            <div className="flex-1 flex flex-col justify-center gap-4">
              {Object.entries(stats.bySlot).length > 0 ? (
                Object.entries(stats.bySlot)
                  .sort((a, b) => b[1] - a[1])
                  .map(([slot, count]) => {
                    const pct = (count / stats.total) * 100;
                    return (
                      <div key={slot} className="w-full">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[var(--admin-text-mid)] capitalize">{slot.replace('-', ' ')}</span>
                          <span className="text-[var(--admin-text-hi)] font-bold">{count.toLocaleString()} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full h-2 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accentColor, opacity: 0.7 }} />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-lo)]">Sin datos de ubicaciones</div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-16 text-center border-t border-[var(--admin-border)] pt-8 pb-4">
           <div className="font-bebas text-2xl text-[var(--admin-text-mid)] mb-1 tracking-widest">EL REMATE <span className="text-[var(--admin-text-hi)]">ADS</span></div>
           <div className="text-[var(--admin-text-lo)] text-xs">Conectando marcas con comercios uruguayos. distribuidoraelremate.uy</div>
        </div>

      </div>

      <style>{`
        @media print {
          .print-hide { display: none !important; }
          .print-p-0 { padding: 0 !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .min-h-screen { min-height: auto; background: white !important; }
          :root {
            --admin-bg: #ffffff;
            --admin-card-bg: #fafafa;
            --admin-border: #e5e7eb;
            --admin-text-hi: #111827;
            --admin-text-mid: #4b5563;
            --admin-text-lo: #9ca3af;
          }
        }
      `}</style>
    </div>
  );
}
