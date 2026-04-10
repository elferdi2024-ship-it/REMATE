"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, doc, getDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StatsView from "@/components/admin/StatsView";

interface PedidoDoc {
  id: string;
  clienteNombre?: string;
  total?: number;
  fecha?: Timestamp;
}

interface TopProduct {
  codigo: string;
  nombre: string;
  count: number;
}

interface AvgTicketClient {
  nombre: string;
  total: number;
  pedidos: number;
  avg: number;
}

interface DayOfWeekData {
  day: string;
  count: number;
}

interface WeeklyRevenue {
  week: string;
  total: number;
}

const DIAS = ["Dom", "Lun", "Mar", "Mi\u00E9", "Jue", "Vie", "S\u00E1b"];

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [avgTicketPerClient, setAvgTicketPerClient] = useState<AvgTicketClient[]>([]);
  const [ordersByDayOfWeek, setOrdersByDayOfWeek] = useState<DayOfWeekData[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenue[]>([]);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);

      // Fetch all data in parallel
      const [statsSnap, pedidosSnap] = await Promise.all([
        getDoc(doc(db, "stats", "productos")).catch(() => null),
        getDocs(query(collection(db, "pedidos_globales"), orderBy("fecha", "desc"))).catch(() => null),
      ]);

      // 1. Top 10 products
      const statsData = statsSnap?.data()?.counts ?? statsSnap?.data() ?? {};
      const productCounts: Record<string, number> = {};
      for (const [codigo, count] of Object.entries(statsData)) {
        if (typeof count === "number" && count > 0) {
          productCounts[codigo] = count;
        }
      }

      // Try to get product names from catalogo_activo
      const catalogNames: Record<string, string> = {};
      try {
        const catalogSnap = await getDoc(doc(db, "catalogo_activo", "productos"));
        const catalogData = catalogSnap.data()?.items ?? catalogSnap.data() ?? {};
        for (const [codigo, item] of Object.entries(catalogData)) {
          if (item && typeof item === "object" && "nombre" in (item as Record<string, unknown>)) {
            catalogNames[codigo] = (item as Record<string, string>).nombre;
          }
        }
      } catch {
        // fallback: use codigo as name
      }

      const sorted = Object.entries(productCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([codigo, count]) => ({
          codigo,
          nombre: catalogNames[codigo] || `Producto ${codigo.slice(0, 8)}`,
          count,
        }));
      setTopProducts(sorted);

      // 2. Parse all orders for aggregations
      const pedidos: PedidoDoc[] = (pedidosSnap?.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) ?? []) as PedidoDoc[];

      // Average ticket per client
      const clientMap: Record<string, { total: number; pedidos: number }> = {};
      for (const p of pedidos) {
        const nombre = p.clienteNombre ?? "Cliente";
        if (!clientMap[nombre]) {
          clientMap[nombre] = { total: 0, pedidos: 0 };
        }
        clientMap[nombre].total += p.total ?? 0;
        clientMap[nombre].pedidos += 1;
      }
      const avgData = Object.entries(clientMap)
        .map(([nombre, data]) => ({
          nombre,
          ...data,
          avg: data.pedidos > 0 ? data.total / data.pedidos : 0,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 20);
      setAvgTicketPerClient(avgData);

      // Orders by day of week (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentPedidos = pedidos.filter((p) => {
        const fecha = p.fecha?.toDate?.();
        return fecha && fecha >= thirtyDaysAgo;
      });

      const dayCounts: Record<string, number> = {};
      for (const d of DIAS) dayCounts[d] = 0;
      for (const p of recentPedidos) {
        const fecha = p.fecha?.toDate?.();
        if (fecha) {
          const dayName = DIAS[fecha.getDay()];
          dayCounts[dayName] = (dayCounts[dayName] ?? 0) + 1;
        }
      }
      setOrdersByDayOfWeek(DIAS.map((d) => ({ day: d, count: dayCounts[d] ?? 0 })));

      // Weekly revenue (last 8 weeks)
      const weekMap: Record<string, number> = {};
      for (const p of pedidos) {
        const fecha = p.fecha?.toDate?.();
        if (!fecha) continue;
        // Get the Monday of that week
        const d = new Date(fecha);
        const dayOfWeek = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const weekKey = `${monday.getDate().toString().padStart(2, "0")}/${(monday.getMonth() + 1).toString().padStart(2, "0")}`;
        weekMap[weekKey] = (weekMap[weekKey] ?? 0) + (p.total ?? 0);
      }
      const weeklyData = Object.entries(weekMap)
        .map(([week, total]) => ({ week, total }))
        .sort((a, b) => a.week.localeCompare(b.week))
        .slice(-8);
      setWeeklyRevenue(weeklyData);

      setLoading(false);
    }

    fetchAll();
  }, []);

  const data = useMemo(
    () => ({
      topProducts,
      avgTicketPerClient,
      ordersByDayOfWeek,
      weeklyRevenue,
    }),
    [topProducts, avgTicketPerClient, ordersByDayOfWeek, weeklyRevenue]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="font-bebas text-2xl tracking-wider md:text-3xl"
          style={{ color: "var(--oscuro)" }}
        >
          ESTAD\u00CDSTICAS
        </h1>
        <p className="mt-1 text-sm font-semibold" style={{ color: "var(--muted)" }}>
          Datos globales de pedidos
        </p>
      </div>

      <StatsView data={data} loading={loading} />
    </div>
  );
}
