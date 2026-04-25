"use client";

import { useState, useEffect } from "react";
import { getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function StatsView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Simplified fetching logic for demonstration
        const q = query(collection(db, "pedidos_globales"), orderBy("fecha", "desc"), limit(100));
        const snap = await getDocs(q);
        
        let totalRevenue = 0;
        let totalItems = 0;
        
        snap.forEach((doc) => {
          const data = doc.data();
          totalRevenue += data.total || 0;
          totalItems += (data.items || []).reduce((acc: number, item: any) => acc + (item.cantidad || 0), 0);
        });

        setStats({
          pedidos: snap.size,
          ingresos: totalRevenue,
          articulos: totalItems,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/5 bg-[#0A0F1C] shadow-xl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent shadow-[0_0_15px_rgba(0,229,255,0.5)]"></div>
      </div>
    );
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0A0F1C] to-[#0A0F1C]/50 p-6 shadow-xl">
          <div className="absolute -right-4 -top-4 text-6xl opacity-5">📈</div>
          <p className="text-sm font-semibold text-gray-400">Total Pedidos (Recientes)</p>
          <p className="mt-2 font-bebas text-5xl text-white">{stats?.pedidos || 0}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[#00E5FF]/20 bg-gradient-to-br from-[#00E5FF]/10 to-[#0A0F1C] p-6 shadow-[0_0_30px_rgba(0,229,255,0.05)]">
          <div className="absolute -right-4 -top-4 text-6xl opacity-5">💵</div>
          <p className="text-sm font-semibold text-[#00E5FF]">Ingresos Estimados</p>
          <p className="mt-2 font-bebas text-5xl text-white">{formatCurrency(stats?.ingresos || 0)}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0A0F1C] to-[#0A0F1C]/50 p-6 shadow-xl">
          <div className="absolute -right-4 -top-4 text-6xl opacity-5">🛒</div>
          <p className="text-sm font-semibold text-gray-400">Volumen Artículos</p>
          <p className="mt-2 font-bebas text-5xl text-white">{stats?.articulos || 0}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0A0F1C] p-6 shadow-xl">
        <h3 className="mb-4 font-bold text-white uppercase tracking-wider text-sm">Resumen de Actividad</h3>
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#050914] text-center">
          <span className="mb-4 text-4xl opacity-50">📊</span>
          <p className="text-gray-400 text-sm">Los gráficos detallados estarán disponibles próximamente.</p>
        </div>
      </div>
    </div>
  );
}
