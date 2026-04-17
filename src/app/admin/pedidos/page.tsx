"use client";

import PedidoAdminCard, { type PedidoAdmin } from "@/components/admin/PedidoAdminCard";
import { subscribePedidosHoy } from "@/lib/pedidos";
import { useCallback, useEffect, useState } from "react";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatHeaderDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const mes = MESES[now.getMonth()];
  const year = now.getFullYear();
  return `${day} ${mes} ${year}`;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = useCallback((docs: any[]) => {
    const mapped: PedidoAdmin[] = docs.map((d) => ({
      id: d.id,
      uid: d.uid ?? null,
      clienteNombre: d.clienteNombre ?? "Cliente",
      fecha: d.fecha?.toDate?.() ?? new Date(),
      items: d.items ?? [],
      total: d.total ?? 0,
      notas: d.notas ?? "",
    }));
    // Sort descending by date
    mapped.sort((a, b) => {
      const ta = a.fecha instanceof Date ? a.fecha.getTime() : a.fecha.seconds * 1000;
      const tb = b.fecha instanceof Date ? b.fecha.getTime() : b.fecha.seconds * 1000;
      return tb - ta;
    });
    setPedidos(mapped);
    setError(null);
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribePedidosHoy(handleUpdate);
    } catch {
      setError("Error de conexión. Reintentando...");
    }
    return () => {
      unsub?.();
    };
  }, [handleUpdate]);

  const totalGeneral = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalItems = pedidos.reduce((sum, p) => sum + p.items.reduce((acc, i) => acc + i.cantidad, 0), 0);

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-bebas text-4xl tracking-wide text-white md:text-5xl">
            PEDIDOS DE <span className="text-[#00E5FF]">HOY</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">{formatHeaderDate()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0A0F1C] to-[#0A0F1C]/50 p-6 shadow-xl">
          <div className="absolute -right-4 -top-4 text-6xl opacity-5">📦</div>
          <p className="text-sm font-semibold text-gray-400">Total Pedidos</p>
          <p className="mt-2 font-bebas text-4xl text-white">{pedidos.length}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[#00E5FF]/20 bg-gradient-to-br from-[#00E5FF]/10 to-[#0A0F1C] p-6 shadow-[0_0_30px_rgba(0,229,255,0.05)]">
          <div className="absolute -right-4 -top-4 text-6xl opacity-5">💰</div>
          <p className="text-sm font-semibold text-[#00E5FF]">Ingresos Hoy</p>
          <p className="mt-2 font-bebas text-4xl text-white">{formatCurrency(totalGeneral)}</p>
        </div>
        <div className="relative col-span-2 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0A0F1C] to-[#0A0F1C]/50 p-6 shadow-xl md:col-span-1">
          <div className="absolute -right-4 -top-4 text-6xl opacity-5">🛒</div>
          <p className="text-sm font-semibold text-gray-400">Artículos Vendidos</p>
          <p className="mt-2 font-bebas text-4xl text-white">{totalItems}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-medium text-red-400">
          ⚠️ {error}
        </div>
      )}

      {!error && pedidos.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#0A0F1C]/30 text-center">
          <span className="mb-4 text-5xl opacity-50">💤</span>
          <h3 className="font-bebas text-2xl text-gray-400">Sin Movimiento</h3>
          <p className="mt-2 text-sm text-gray-500">Esperando que ingresen nuevos pedidos...</p>
        </div>
      )}

      <div className="grid gap-6">
        {pedidos.map((pedido) => (
          <PedidoAdminCard key={pedido.id} pedido={pedido} onViewFull={() => {}} />
        ))}
      </div>
    </div>
  );
}
