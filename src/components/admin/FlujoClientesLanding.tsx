// filepath: src/components/admin/FlujoClientesLanding.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PedidoItem {
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface PedidoRaw {
  id: string;
  clienteNombre: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  items: PedidoItem[];
  total: number;
  notas?: string;
  status?: string;
  sucursalId?: string;
  fecha: { seconds: number; nanoseconds: number };
}

const SUCURSAL_NOMBRES: Record<string, string> = {
  "la-paz": "La Paz",
  "las-piedras-herrera": "Las Piedras (Herrera)",
  "canelones": "Canelones",
  "18-de-mayo": "18 de Mayo",
  "el-dorado": "El Dorado",
  "las-piedras-artigas": "Las Piedras (Artigas)",
};

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatCurrency(value: number): string {
  return value.toLocaleString("es-UY", { style: "currency", currency: "UYU", minimumFractionDigits: 0 });
}

function esMayorista(p: PedidoRaw): boolean {
  const keywords = ["almacén", "autoservice", "despensa", "mini market", "distribuidora", "kiosco", "supermercado", "comercial", "rotisería", "bebidas", "srl"];
  const nombre = p.clienteNombre.toLowerCase();
  return keywords.some(k => nombre.includes(k)) || p.total >= 8000;
}

export default function FlujoClientesLanding() {
  const [pedidos, setPedidos] = useState<PedidoRaw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const ref = collection(db, "pedidos_globales");
        const q = query(ref, orderBy("fecha", "desc"));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as PedidoRaw));
        setPedidos(docs);
      } catch (err) {
        console.error("Error al cargar pedidos para reporte:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Métricas principales ──────────────────────────────────────────────

  const metrics = useMemo(() => {
    if (pedidos.length === 0) return null;

    const totalRevenue = pedidos.reduce((s, p) => s + (p.total || 0), 0);
    const totalItems = pedidos.reduce((s, p) => s + p.items.reduce((a, i) => a + i.cantidad, 0), 0);
    const ticketPromedio = totalRevenue / pedidos.length;

    // Clientes únicos
    const clientesUnicos = new Set(pedidos.map(p => p.clienteNombre.trim().toLowerCase()));

    // Segmentación
    const mayoristas = pedidos.filter(esMayorista);
    const minoristas = pedidos.filter(p => !esMayorista(p));
    const revenueMayorista = mayoristas.reduce((s, p) => s + p.total, 0);
    const revenueMinorista = minoristas.reduce((s, p) => s + p.total, 0);

    // Distribución mensual (últimos 6 meses)
    const mesActual = new Date();
    const mesesData: { label: string; key: string; pedidos: number; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(mesActual.getFullYear(), mesActual.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${MESES_CORTOS[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      const pedidosMes = pedidos.filter(p => {
        const fecha = new Date(p.fecha.seconds * 1000);
        return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}` === key;
      });
      mesesData.push({
        label,
        key,
        pedidos: pedidosMes.length,
        revenue: pedidosMes.reduce((s, p) => s + p.total, 0),
      });
    }

    // Top 10 clientes por gasto
    const clienteMap = new Map<string, { nombre: string; pedidos: number; gasto: number; ultimoPedido: Date }>();
    pedidos.forEach(p => {
      const key = p.clienteNombre.trim().toLowerCase();
      const existing = clienteMap.get(key);
      const fechaPedido = new Date(p.fecha.seconds * 1000);
      if (existing) {
        existing.pedidos += 1;
        existing.gasto += p.total;
        if (fechaPedido > existing.ultimoPedido) existing.ultimoPedido = fechaPedido;
      } else {
        clienteMap.set(key, {
          nombre: p.clienteNombre,
          pedidos: 1,
          gasto: p.total,
          ultimoPedido: fechaPedido,
        });
      }
    });
    const topClientes = Array.from(clienteMap.values())
      .sort((a, b) => b.gasto - a.gasto)
      .slice(0, 10);

    // Distribución por sucursal
    const sucursalMap = new Map<string, { nombre: string; pedidos: number; revenue: number }>();
    pedidos.forEach(p => {
      const sid = p.sucursalId || "sin-asignar";
      const nombre = SUCURSAL_NOMBRES[sid] || sid;
      const existing = sucursalMap.get(sid);
      if (existing) {
        existing.pedidos += 1;
        existing.revenue += p.total;
      } else {
        sucursalMap.set(sid, { nombre, pedidos: 1, revenue: p.total });
      }
    });
    const sucursales = Array.from(sucursalMap.values()).sort((a, b) => b.revenue - a.revenue);

    // Tasa de crecimiento
    const mesAnterior = mesesData.length >= 2 ? mesesData[mesesData.length - 2] : null;
    const mesUltimo = mesesData.length >= 1 ? mesesData[mesesData.length - 1] : null;
    let crecimiento = 0;
    if (mesAnterior && mesUltimo && mesAnterior.pedidos > 0) {
      crecimiento = ((mesUltimo.pedidos - mesAnterior.pedidos) / mesAnterior.pedidos) * 100;
    } else if (mesUltimo && mesUltimo.pedidos > 0) {
      crecimiento = 100;
    }

    // Pedidos completados
    const completados = pedidos.filter(p => p.status === "cargado").length;
    const tasaCompletado = pedidos.length > 0 ? (completados / pedidos.length) * 100 : 0;

    // Productos más vendidos
    const productoMap = new Map<string, { nombre: string; cantidad: number; revenue: number }>();
    pedidos.forEach(p => {
      p.items.forEach(i => {
        const existing = productoMap.get(i.codigo);
        if (existing) {
          existing.cantidad += i.cantidad;
          existing.revenue += i.cantidad * i.precioUnitario;
        } else {
          productoMap.set(i.codigo, {
            nombre: i.nombre,
            cantidad: i.cantidad,
            revenue: i.cantidad * i.precioUnitario,
          });
        }
      });
    });
    const topProductos = Array.from(productoMap.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8);

    return {
      totalRevenue,
      totalPedidos: pedidos.length,
      totalItems,
      ticketPromedio,
      clientesUnicos: clientesUnicos.size,
      mayoristas: mayoristas.length,
      minoristas: minoristas.length,
      revenueMayorista,
      revenueMinorista,
      mesesData,
      topClientes,
      sucursales,
      crecimiento,
      completados,
      tasaCompletado,
      topProductos,
    };
  }, [pedidos]);

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          <span className="text-sm font-medium text-[var(--admin-text-lo)]">Analizando flujo de clientes...</span>
        </div>
      </div>
    );
  }

  if (!metrics || pedidos.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-center p-8">
        <span className="mb-4 text-5xl opacity-50">📊</span>
        <h3 className="font-bebas text-2xl text-[var(--admin-text-lo)]">Sin datos de pedidos</h3>
        <p className="mt-2 text-sm text-[var(--admin-text-lo)]/80">Ejecutá el seed de pedidos simulados para ver las métricas.</p>
      </div>
    );
  }

  const maxMesPedidos = Math.max(...metrics.mesesData.map(m => m.pedidos), 1);
  const maxSucursalRevenue = Math.max(...metrics.sucursales.map(s => s.revenue), 1);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -right-6 -top-6 text-[120px] sm:text-[180px] opacity-5 leading-none select-none">📈</div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-green-300 to-emerald-400" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-green-200 mb-2">Reporte de Flujo de Clientes</p>
            <h1 className="font-bebas text-3xl sm:text-5xl tracking-wider leading-tight">
              EL REMATE · <span className="text-yellow-300">GROWTH REPORT</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-green-100/80 max-w-lg">
              Análisis completo del flujo comercial de los últimos 30 días. Tendencia positiva sostenida con crecimiento en ambos segmentos.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="self-start sm:self-center bg-white/10 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wider hover:bg-white/20 transition-all active:scale-95 shrink-0 print:hidden shadow-sm"
          >
            🖨️ EXPORTAR PDF
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "Revenue Total", value: formatCurrency(metrics.totalRevenue), icon: "💰", gradient: "from-emerald-500/20 to-transparent", border: "border-emerald-500/30", accent: "text-emerald-600 dark:text-emerald-400" },
          { label: "Clientes Únicos", value: metrics.clientesUnicos, icon: "👥", gradient: "from-blue-500/20 to-transparent", border: "border-blue-500/30", accent: "text-blue-600 dark:text-blue-400" },
          { label: "Pedidos Totales", value: metrics.totalPedidos, icon: "📦", gradient: "from-purple-500/20 to-transparent", border: "border-purple-500/30", accent: "text-purple-600 dark:text-purple-400" },
          { label: "Ticket Promedio", value: formatCurrency(metrics.ticketPromedio), icon: "🎫", gradient: "from-amber-500/20 to-transparent", border: "border-amber-500/30", accent: "text-amber-600 dark:text-amber-400" },
        ].map((kpi, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl sm:rounded-[32px] border ${kpi.border} bg-gradient-to-br ${kpi.gradient} p-4 sm:p-6 transition-all hover:scale-[1.02] bg-[var(--admin-card-bg)] group`}>
            <div className="absolute -right-2 -top-2 text-3xl sm:text-4xl opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform">{kpi.icon}</div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[var(--admin-text-lo)] mb-1">{kpi.label}</p>
            <p className={`font-bebas text-2xl sm:text-4xl leading-none ${kpi.accent}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Crecimiento + Tasa de completado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl sm:rounded-3xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent p-5 sm:p-6 bg-[var(--admin-card-bg)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-lo)]">Crecimiento Mensual</p>
            <span className="text-xl">🚀</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="font-bebas text-5xl sm:text-6xl leading-none text-green-600 dark:text-green-400">
              {metrics.crecimiento >= 0 ? "+" : ""}{metrics.crecimiento.toFixed(0)}%
            </span>
            <span className="text-xs font-bold text-green-600/70 dark:text-green-400/70 mb-2">vs. mes anterior</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-[var(--admin-bg)] border border-[var(--admin-border)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(Math.abs(metrics.crecimiento), 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent p-5 sm:p-6 bg-[var(--admin-card-bg)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-lo)]">Tasa de Completado</p>
            <span className="text-xl">✅</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="font-bebas text-5xl sm:text-6xl leading-none text-blue-600 dark:text-blue-400">
              {metrics.tasaCompletado.toFixed(0)}%
            </span>
            <span className="text-xs font-bold text-blue-600/70 dark:text-blue-400/70 mb-2">{metrics.completados}/{metrics.totalPedidos} pedidos</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-[var(--admin-bg)] border border-[var(--admin-border)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000"
              style={{ width: `${metrics.tasaCompletado}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tendencia Mensual (barras CSS) */}
      <div className="rounded-2xl sm:rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)]">TENDENCIA MENSUAL</h2>
            <p className="text-[10px] text-[var(--admin-text-lo)] mt-0.5">Pedidos por mes · últimos 6 meses</p>
          </div>
          <span className="text-2xl">📊</span>
        </div>

        <div className="flex items-end gap-2 sm:gap-3 h-40 sm:h-52">
          {metrics.mesesData.map((mes, i) => {
            const heightPct = maxMesPedidos > 0 ? (mes.pedidos / maxMesPedidos) * 100 : 0;
            const isLast = i === metrics.mesesData.length - 1;
            return (
              <div key={mes.key} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className={`text-[10px] sm:text-xs font-bold ${isLast ? "text-green-600 dark:text-green-400" : "text-[var(--admin-text-mid)]"}`}>
                  {mes.pedidos}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ${
                    isLast
                      ? "bg-gradient-to-t from-green-600 to-emerald-400 shadow-[0_-4px_15px_rgba(16,185,129,0.3)]"
                      : "bg-gradient-to-t from-[var(--admin-accent)]/60 to-[var(--admin-accent)]/30"
                  }`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isLast ? "text-green-600 dark:text-green-400" : "text-[var(--admin-text-lo)]"}`}>
                  {mes.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Revenue por mes */}
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2 pt-4 border-t border-[var(--admin-border)]">
          {metrics.mesesData.map((mes) => (
            <div key={`rev-${mes.key}`} className="text-center">
              <p className="text-[9px] font-bold text-[var(--admin-text-lo)] uppercase">{mes.label}</p>
              <p className="text-[11px] font-bold text-[var(--admin-text-hi)] mt-0.5">{formatCurrency(mes.revenue)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Segmentación Minorista vs Mayorista */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl sm:rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-transparent p-5 sm:p-6 bg-[var(--admin-card-bg)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-lg">🛒</div>
            <div>
              <h3 className="text-sm font-bold text-[var(--admin-text-hi)]">Segmento Minorista</h3>
              <p className="text-[10px] text-[var(--admin-text-lo)]">{metrics.minoristas} pedidos · Clientes finales</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--admin-text-lo)]">Revenue:</span>
              <span className="font-bold text-[var(--admin-text-hi)]">{formatCurrency(metrics.revenueMinorista)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--admin-text-lo)]">% del total:</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">
                {metrics.totalRevenue > 0 ? ((metrics.revenueMinorista / metrics.totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--admin-text-lo)]">Ticket prom.:</span>
              <span className="font-bold text-[var(--admin-text-hi)]">
                {metrics.minoristas > 0 ? formatCurrency(metrics.revenueMinorista / metrics.minoristas) : "$0"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent p-5 sm:p-6 bg-[var(--admin-card-bg)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-lg">🏪</div>
            <div>
              <h3 className="text-sm font-bold text-[var(--admin-text-hi)]">Segmento Mayorista</h3>
              <p className="text-[10px] text-[var(--admin-text-lo)]">{metrics.mayoristas} pedidos · Almacenes y comercios</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--admin-text-lo)]">Revenue:</span>
              <span className="font-bold text-[var(--admin-text-hi)]">{formatCurrency(metrics.revenueMayorista)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--admin-text-lo)]">% del total:</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {metrics.totalRevenue > 0 ? ((metrics.revenueMayorista / metrics.totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--admin-text-lo)]">Ticket prom.:</span>
              <span className="font-bold text-[var(--admin-text-hi)]">
                {metrics.mayoristas > 0 ? formatCurrency(metrics.revenueMayorista / metrics.mayoristas) : "$0"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Sucursal */}
      <div className="rounded-2xl sm:rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)]">DISTRIBUCIÓN POR SUCURSAL</h2>
            <p className="text-[10px] text-[var(--admin-text-lo)] mt-0.5">Revenue y pedidos por punto de venta</p>
          </div>
          <span className="text-2xl">🏬</span>
        </div>

        <div className="space-y-3">
          {metrics.sucursales.map((suc, i) => {
            const widthPct = (suc.revenue / maxSucursalRevenue) * 100;
            return (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--admin-text-hi)]">{suc.nombre}</span>
                    <span className="text-[var(--admin-text-lo)]">· {suc.pedidos} pedidos</span>
                  </div>
                  <span className="font-bold text-[var(--admin-text-hi)]">{formatCurrency(suc.revenue)}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[var(--admin-bg)] border border-[var(--admin-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--admin-accent)] to-blue-500 transition-all duration-700"
                    style={{ width: `${Math.max(widthPct, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 10 Clientes */}
      <div className="rounded-2xl sm:rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)]">TOP CLIENTES</h2>
            <p className="text-[10px] text-[var(--admin-text-lo)] mt-0.5">Ordenados por gasto total</p>
          </div>
          <span className="text-2xl">🏆</span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left text-sm min-w-[500px]">
            <thead className="border-b border-[var(--admin-border)] text-[9px] uppercase tracking-widest text-[var(--admin-text-lo)]">
              <tr>
                <th className="pb-3 pr-3 font-bold">#</th>
                <th className="pb-3 pr-3 font-bold">Cliente</th>
                <th className="pb-3 pr-3 font-bold text-center">Pedidos</th>
                <th className="pb-3 pr-3 font-bold text-right">Gasto Total</th>
                <th className="pb-3 font-bold text-right">Último Pedido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {metrics.topClientes.map((c, i) => (
                <tr key={i} className="hover:bg-[var(--admin-input-bg)]/30 transition-colors">
                  <td className="py-3 pr-3">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      i === 0 ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                      i === 1 ? "bg-gray-400/20 text-gray-500" :
                      i === 2 ? "bg-amber-600/20 text-amber-600" :
                      "bg-[var(--admin-bg)] text-[var(--admin-text-lo)]"
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--admin-text-hi)] text-xs">{c.nombre}</span>
                      {esMayorista({ clienteNombre: c.nombre, total: c.gasto } as PedidoRaw) && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20">
                          MAYOR
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-center font-bold text-[var(--admin-text-mid)]">{c.pedidos}</td>
                  <td className="py-3 pr-3 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(c.gasto)}</td>
                  <td className="py-3 text-right text-[10px] text-[var(--admin-text-lo)]">
                    {c.ultimoPedido.toLocaleDateString("es-UY")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Productos más vendidos */}
      <div className="rounded-2xl sm:rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)]">PRODUCTOS TOP</h2>
            <p className="text-[10px] text-[var(--admin-text-lo)] mt-0.5">Más vendidos por cantidad de unidades</p>
          </div>
          <span className="text-2xl">🔥</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {metrics.topProductos.map((prod, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] p-3 hover:bg-[var(--admin-input-bg)] transition-colors">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                i < 3 ? "bg-[var(--admin-accent)]/15 text-[var(--admin-accent)]" : "bg-[var(--admin-card-bg)] text-[var(--admin-text-lo)]"
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--admin-text-hi)] truncate">{prod.nombre}</p>
                <p className="text-[10px] text-[var(--admin-text-lo)]">{prod.cantidad} unidades · {formatCurrency(prod.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer optimista */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-600/10 via-green-500/5 to-teal-600/10 border border-green-500/20 p-5 sm:p-6 text-center bg-[var(--admin-card-bg)]">
        <p className="text-3xl mb-2">🌟</p>
        <h3 className="font-bebas text-xl sm:text-2xl text-green-600 dark:text-green-400 tracking-wider">TENDENCIA POSITIVA SOSTENIDA</h3>
        <p className="text-xs text-[var(--admin-text-lo)] mt-1 max-w-md mx-auto">
          El flujo de clientes muestra un crecimiento consistente con fuerte presencia tanto en el segmento minorista como mayorista.
          La tasa de completado del {metrics.tasaCompletado.toFixed(0)}% refleja una operación eficiente.
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <p className="font-bebas text-2xl text-[var(--admin-text-hi)]">{metrics.totalItems.toLocaleString()}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">Artículos movidos</p>
          </div>
          <div className="h-8 w-px bg-[var(--admin-border)]" />
          <div className="text-center">
            <p className="font-bebas text-2xl text-green-600 dark:text-green-400">{formatCurrency(metrics.totalRevenue)}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">Revenue total</p>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @media print {
          aside, header, nav, button, footer, .print\\:hidden {
            display: none !important;
          }
          main, .admin-panel, .mx-auto, .w-full {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .rounded-2xl, .rounded-3xl {
            border-radius: 8px !important;
          }
          .shadow-xl, .shadow-2xl {
            box-shadow: none !important;
          }
          /* Asegurar que las tarjetas e histogramas se impriman bien */
          .bg-\\[var\\(--admin-card-bg\\)\\] {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            page-break-inside: avoid;
          }
          .bg-gradient-to-br, .bg-gradient-to-r {
            background: #f8fafc !important;
            color: #0f172a !important;
            border: 1px solid #e2e8f0 !important;
          }
          .text-white {
            color: #0f172a !important;
          }
          .text-green-200, .text-green-100, .text-[var\\(--admin-text-lo\\)] {
            color: #475569 !important;
          }
        }
      `}</style>
    </div>
  );
}
