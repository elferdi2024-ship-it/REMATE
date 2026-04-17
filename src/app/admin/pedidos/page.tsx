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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const playNotification = useCallback(() => {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Autoplay might be blocked
    } catch (e) {}
  }, []);

  const handleUpdate = useCallback((docs: any[]) => {
    setPedidos((prev) => {
      const mapped: PedidoAdmin[] = docs.map((d) => ({
        id: d.id,
        uid: d.uid ?? null,
        clienteNombre: d.clienteNombre ?? "Cliente",
        clienteTelefono: d.clienteTelefono ?? "",
        fecha: d.fecha?.toDate?.() ?? new Date(),
        items: d.items ?? [],
        total: d.total ?? 0,
        notas: d.notas ?? "",
        status: d.status ?? "no_leido",
      }));

      // Sort descending by date
      mapped.sort((a, b) => {
        const ta = a.fecha instanceof Date ? a.fecha.getTime() : a.fecha.seconds * 1000;
        const tb = b.fecha instanceof Date ? b.fecha.getTime() : b.fecha.seconds * 1000;
        return tb - ta;
      });

      // If we have more orders than before, play sound
      if (prev.length > 0 && mapped.length > prev.length) {
        playNotification();
      }

      return mapped;
    });
    setError(null);
  }, [playNotification]);

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

  const filteredPedidos = pedidos.filter((p) => {
    const matchesSearch =
      p.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clienteTelefono?.includes(searchTerm);
    const matchesStatus = statusFilter === "todos" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalGeneral = filteredPedidos.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalItems = filteredPedidos.reduce((sum, p) => sum + p.items.reduce((acc, i) => acc + i.cantidad, 0), 0);

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });
  }

  const counts = {
    todos: pedidos.length,
    no_leido: pedidos.filter((p) => p.status === "no_leido").length,
    pendiente: pedidos.filter((p) => p.status === "pendiente").length,
    cargado: pedidos.filter((p) => p.status === "cargado").length,
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-1 md:px-0">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-bebas text-4xl tracking-wide text-white md:text-5xl">
            PEDIDOS DE <span className="text-[#00E5FF]">HOY</span>
          </h1>
          <p className="text-gray-400 mt-1 font-medium">{formatHeaderDate()}</p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Buscar por cliente o tel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-[#00E5FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50"
            />
          </div>
        </div>
      </div>

      {/* Luxury Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Ventas Hoy", value: formatCurrency(totalGeneral), icon: "💰", color: "from-[#00E5FF]/20 to-transparent", border: "border-[#00E5FF]/30" },
          { label: "Artículos", value: totalItems, icon: "📦", color: "from-blue-500/20 to-transparent", border: "border-blue-500/30" },
          { label: "No Leídos", value: counts.no_leido, icon: "🔴", color: "from-red-500/20 to-transparent", border: "border-red-500/30", highlight: "text-red-400" },
          { label: "Pendientes", value: counts.pendiente, icon: "🟡", color: "from-yellow-500/20 to-transparent", border: "border-yellow-500/30", highlight: "text-yellow-400" },
        ].map((s, idx) => (
          <div key={idx} className={`relative overflow-hidden rounded-[32px] border ${s.border} bg-gradient-to-br ${s.color} p-6 transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] group`}>
            <div className="absolute -right-2 -top-2 text-4xl opacity-10 transition-transform group-hover:scale-125 group-hover:rotate-12">{s.icon}</div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{s.label}</p>
            <p className={`font-bebas text-4xl leading-none ${s.highlight || 'text-white'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Badges */}
      <div className="sticky top-0 z-20 -mx-4 overflow-x-auto bg-[#050914]/80 px-4 py-4 backdrop-blur-md md:static md:mx-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
        <div className="flex flex-nowrap gap-2 md:flex-wrap">
          {[
            { id: "todos", label: "Todos", count: counts.todos, color: "gray" },
            { id: "no_leido", label: "No leídos", count: counts.no_leido, color: "red" },
            { id: "pendiente", label: "Pendientes", count: counts.pendiente, color: "yellow" },
            { id: "cargado", label: "Cargados", count: counts.cargado, color: "green" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
                statusFilter === f.id
                  ? f.color === "red" ? "border-red-500 bg-red-500 text-white" :
                    f.color === "yellow" ? "border-yellow-500 bg-yellow-500 text-black" :
                    f.color === "green" ? "border-green-500 bg-green-500 text-white" :
                    "border-[#00E5FF] bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                  : "border-white/10 bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f.label}
              <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-lg bg-black/20 px-1.5 text-[10px]`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-medium text-red-400">
          ⚠️ {error}
        </div>
      )}

      {!error && filteredPedidos.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#0A0F1C]/30 text-center">
          <span className="mb-4 text-5xl opacity-50">🔍</span>
          <h3 className="font-bebas text-2xl text-gray-400">Sin resultados</h3>
          <p className="mt-2 text-sm text-gray-500">Prueba ajustando los filtros o la búsqueda.</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {filteredPedidos.map((pedido) => (
          <PedidoAdminCard key={pedido.id} pedido={pedido} onViewFull={() => {}} />
        ))}
      </div>
    </div>
  );
}
