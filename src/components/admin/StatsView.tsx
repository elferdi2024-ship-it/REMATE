// filepath: src/components/admin/StatsView.tsx
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
      <div className="flex h-64 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] shadow-xl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--admin-accent)] border-t-transparent shadow-[0_0_15px_var(--admin-accent-glow)]"></div>
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
    <div className="space-y-6 text-[var(--admin-text-mid)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-xl">
          <div className="absolute -right-4 -top-4 text-6xl opacity-5">📈</div>
          <p className="text-sm font-semibold text-[var(--admin-text-lo)]">Total Pedidos (Recientes)</p>
          <p className="mt-2 font-bebas text-5xl text-[var(--admin-text-hi)]">{stats?.pedidos || 0}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--admin-accent)]/20 bg-gradient-to-br from-[var(--admin-accent)]/10 to-[var(--admin-card-bg)] p-6 shadow-[0_0_30px_var(--admin-accent-glow)]">
          <div className="absolute -right-4 -top-4 text-6xl opacity-5">💵</div>
          <p className="text-sm font-semibold text-[var(--admin-accent)]">Ingresos Estimados</p>
          <p className="mt-2 font-bebas text-5xl text-[var(--admin-text-hi)]">{formatCurrency(stats?.ingresos || 0)}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-xl">
          <div className="absolute -right-4 -top-4 text-6xl opacity-5">🛒</div>
          <p className="text-sm font-semibold text-[var(--admin-text-lo)]">Volumen Artículos</p>
          <p className="mt-2 font-bebas text-5xl text-[var(--admin-text-hi)]">{stats?.articulos || 0}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-xl">
        <h3 className="mb-4 font-bold text-[var(--admin-text-hi)] uppercase tracking-wider text-sm">Resumen de Actividad</h3>
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-bg)] text-center">
          <span className="mb-4 text-4xl opacity-50">📊</span>
          <p className="text-[var(--admin-text-lo)] text-sm">Los gráficos detallados estarán disponibles próximamente.</p>
        </div>
      </div>
    </div>
  );
}
