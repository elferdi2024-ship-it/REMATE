"use client";

import { useMemo } from "react";

interface StatsData {
  topProducts: { codigo: string; nombre: string; count: number }[];
  avgTicketPerClient: { nombre: string; total: number; pedidos: number; avg: number }[];
  ordersByDayOfWeek: { day: string; count: number }[];
  weeklyRevenue: { week: string; total: number }[];
}

interface StatsViewProps {
  data: StatsData;
  loading?: boolean;
}

const DIAS = ["Dom", "Lun", "Mar", "Mi\u00E9", "Jue", "Vie", "S\u00E1b"];

export default function StatsView({ data, loading }: StatsViewProps) {
  const maxProductCount = useMemo(
    () => Math.max(...data.topProducts.map((p) => p.count), 1),
    [data.topProducts]
  );

  const maxDayCount = useMemo(
    () => Math.max(...data.ordersByDayOfWeek.map((d) => d.count), 1),
    [data.ordersByDayOfWeek]
  );

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent" />
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
            Cargando estad\u00EDsticas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top 10 Products - CSS Bar Chart */}
      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--white)", borderColor: "var(--border)" }}
      >
        <h2 className="mb-4 font-bebas text-xl tracking-wide" style={{ color: "var(--oscuro)" }}>
          \uD83D\uDD25 TOP 10 PRODUCTOS M\u00C1S PEDIDOS
        </h2>
        {data.topProducts.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
            A\u00FAn no hay datos de productos
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {data.topProducts.map((product, i) => {
              const pct = (product.count / maxProductCount) * 100;
              return (
                <div key={product.codigo} className="flex items-center gap-3">
                  <span
                    className="w-6 text-right text-xs font-bold tabular-nums"
                    style={{ color: "var(--muted)" }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between">
                      <span
                        className="truncate text-xs font-semibold"
                        style={{ color: "var(--text)" }}
                        title={product.nombre}
                      >
                        {product.nombre.length > 30 ? product.nombre.slice(0, 30) + "\u2026" : product.nombre}
                      </span>
                      <span
                        className="ml-2 shrink-0 text-xs font-bold tabular-nums"
                        style={{ color: "var(--oscuro)" }}
                      >
                        {product.count}
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg3)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background:
                            i === 0
                              ? "var(--rojo)"
                              : i === 1
                                ? "var(--ambar)"
                                : "var(--rojo)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Average ticket per client */}
      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--white)", borderColor: "var(--border)" }}
      >
        <h2 className="mb-4 font-bebas text-xl tracking-wide" style={{ color: "var(--oscuro)" }}>
          \uD83D\uDCB0 TICKET PROMEDIO POR CLIENTE
        </h2>
        {data.avgTicketPerClient.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
            No hay datos de clientes
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--oscuro)" }}>
                  <th className="px-3 py-2 text-left font-semibold text-gray-300">Cliente</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-300">Pedidos</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-300">Total</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-300">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {data.avgTicketPerClient.map((c, i) => (
                  <tr
                    key={c.nombre}
                    className="border-t"
                    style={{
                      borderColor: "var(--border)",
                      background: i % 2 === 0 ? "var(--white)" : "var(--bg)",
                    }}
                  >
                    <td className="px-3 py-2 font-medium" style={{ color: "var(--text)" }}>
                      {c.nombre}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: "var(--text2)" }}>
                      {c.pedidos}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums" style={{ color: "var(--oscuro)" }}>
                      {formatCurrency(c.total)}
                    </td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums" style={{ color: "var(--rojo-dark)" }}>
                      {formatCurrency(c.avg)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Orders by day of week */}
      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--white)", borderColor: "var(--border)" }}
      >
        <h2 className="mb-4 font-bebas text-xl tracking-wide" style={{ color: "var(--oscuro)" }}>
          \uD83D\uDCC5 PEDIDOS POR D\u00CDA (\u00DALTIMOS 30 D\u00CDAS)
        </h2>
        {data.ordersByDayOfWeek.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
            No hay datos
          </p>
        ) : (
          <div className="flex items-end gap-3" style={{ height: "160px" }}>
            {DIAS.map((dayName, i) => {
              const dayData = data.ordersByDayOfWeek.find((d) => d.day === dayName);
              const count = dayData?.count ?? 0;
              const heightPct = maxDayCount > 0 ? (count / maxDayCount) * 100 : 0;
              return (
                <div key={dayName} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold tabular-nums" style={{ color: "var(--oscuro)" }}>
                    {count || "\u2014"}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(heightPct, 2)}%`,
                      background: count === maxDayCount ? "var(--rojo)" : "var(--rojo)",
                      minHeight: count > 0 ? "8px" : "2px",
                    }}
                  />
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Weekly revenue */}
      <section
        className="rounded-xl border p-5"
        style={{ background: "var(--white)", borderColor: "var(--border)" }}
      >
        <h2 className="mb-4 font-bebas text-xl tracking-wide" style={{ color: "var(--oscuro)" }}>
          \uD83D\uDCC8 INGRESO SEMANAL
        </h2>
        {data.weeklyRevenue.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
            No hay datos
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--oscuro)" }}>
                  <th className="px-3 py-2 text-left font-semibold text-gray-300">Semana</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-300">Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {data.weeklyRevenue.map((w, i) => (
                  <tr
                    key={w.week}
                    className="border-t"
                    style={{
                      borderColor: "var(--border)",
                      background: i % 2 === 0 ? "var(--white)" : "var(--bg)",
                    }}
                  >
                    <td className="px-3 py-2 font-medium" style={{ color: "var(--text)" }}>
                      {w.week}
                    </td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums" style={{ color: "var(--verde-dark)" }}>
                      {formatCurrency(w.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
