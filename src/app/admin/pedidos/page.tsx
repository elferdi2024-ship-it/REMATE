"use client";

import PedidoAdminCard, { type PedidoAdmin } from "@/components/admin/PedidoAdminCard";
import { actualizarEstadoPedido, subscribePedidosHoy, guardarPedidoGlobal } from "@/lib/pedidos";
import { SUCURSALES } from "@/lib/sucursales";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatHeaderDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const mes = MESES[now.getMonth()];
  const year = now.getFullYear();
  return `${day} ${mes} ${year}`;
}

export default function PedidosPage() {
  const { role, sucursalId } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [onlyFresh, setOnlyFresh] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [deliveryFilter, setDeliveryFilter] = useState<"todos" | "envio" | "retiro">("todos");
  const [branchFilter, setBranchFilter] = useState<string>("todas");
  const [simulating, setSimulating] = useState(false);
 
  const effectiveBranchFilter = role === "empleado" && sucursalId ? sucursalId : branchFilter;

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
        clienteDireccion: d.clienteDireccion ?? "",
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
    const ts = p.fecha instanceof Date ? p.fecha.getTime() : p.fecha.seconds * 1000;
    const isFresh = Date.now() - ts < 5 * 60 * 1000;
    const matchesFresh = !onlyFresh || isFresh;

    // Delivery Method Filter
    let matchesDelivery = true;
    const isRetiro = p.clienteDireccion?.includes("RETIRO EN LOCAL") || false;
    const isEnvio = p.clienteDireccion ? (!isRetiro && p.clienteDireccion.trim().length > 0) : false;

    if (deliveryFilter === "retiro") {
      matchesDelivery = isRetiro;
    } else if (deliveryFilter === "envio") {
      matchesDelivery = isEnvio;
    }

    // Branch Filter (Enforced scoping for employees)
    let matchesBranch = true;
    if (effectiveBranchFilter !== "todas") {
      const sucursal = SUCURSALES.find((s) => s.id === effectiveBranchFilter);
      if (sucursal) {
        matchesBranch = isRetiro && p.clienteDireccion?.toLowerCase().includes(sucursal.nombre.toLowerCase()) || false;
      } else {
        matchesBranch = false;
      }
    }

    return matchesSearch && matchesStatus && matchesFresh && matchesDelivery && matchesBranch;
  });

  const handleBulkStatus = useCallback(
    async (nextStatus: "no_leido" | "pendiente" | "cargado") => {
      if (filteredPedidos.length === 0) return;
      try {
        setBulkUpdating(true);
        await Promise.all(filteredPedidos.map((p) => actualizarEstadoPedido(p.id, nextStatus)));
      } catch (err) {
        console.error("Error in bulk status update:", err);
      } finally {
        setBulkUpdating(false);
      }
    },
    [filteredPedidos]
  );

  const handleSimulateOrder = useCallback(async () => {
    try {
      setSimulating(true);
      const mockOrder = {
        uid: null,
        clienteNombre: "Renato (Pedido de Entrenamiento)",
        clienteTelefono: "099 265 952",
        clienteDireccion: "RETIRO EN LOCAL - Sucursal Atlantida",
        items: [
          { codigo: "7730124002903", nombre: "Yerba Mate Premium 1kg", cantidad: 2, precioUnitario: 350 },
          { codigo: "876543210012", nombre: "Aceite de Oliva Extra Virgen 500ml", cantidad: 1, precioUnitario: 750 }
        ],
        total: 1450,
        notas: "Pedido simulado para entrenamiento. Pruebe los botones interactivos, imprima el ticket o contácteme por WhatsApp.",
        status: "no_leido" as const
      };
      await guardarPedidoGlobal(mockOrder);
    } catch (err) {
      console.error("Error al simular pedido:", err);
    } finally {
      setSimulating(false);
    }
  }, []);

  const totalGeneral = filteredPedidos.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalItems = filteredPedidos.reduce((sum, p) => sum + p.items.reduce((acc, i) => acc + i.cantidad, 0), 0);

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });
  }

  // Scoped count statistics for employee or full dashboard counts for admin/owner
  const counts = {
    todos: pedidos.filter(p => {
      if (role === "empleado" && sucursalId) {
        const sucursal = SUCURSALES.find(s => s.id === sucursalId);
        const isRetiro = p.clienteDireccion?.includes("RETIRO EN LOCAL") || false;
        return sucursal && isRetiro && p.clienteDireccion?.toLowerCase().includes(sucursal.nombre.toLowerCase());
      }
      return true;
    }).length,
    no_leido: pedidos.filter((p) => {
      const matchesStatus = p.status === "no_leido";
      if (role === "empleado" && sucursalId) {
        const sucursal = SUCURSALES.find(s => s.id === sucursalId);
        const isRetiro = p.clienteDireccion?.includes("RETIRO EN LOCAL") || false;
        return matchesStatus && sucursal && isRetiro && p.clienteDireccion?.toLowerCase().includes(sucursal.nombre.toLowerCase());
      }
      return matchesStatus;
    }).length,
    pendiente: pedidos.filter((p) => {
      const matchesStatus = p.status === "pendiente";
      if (role === "empleado" && sucursalId) {
        const sucursal = SUCURSALES.find(s => s.id === sucursalId);
        const isRetiro = p.clienteDireccion?.includes("RETIRO EN LOCAL") || false;
        return matchesStatus && sucursal && isRetiro && p.clienteDireccion?.toLowerCase().includes(sucursal.nombre.toLowerCase());
      }
      return matchesStatus;
    }).length,
    cargado: pedidos.filter((p) => {
      const matchesStatus = p.status === "cargado";
      if (role === "empleado" && sucursalId) {
        const sucursal = SUCURSALES.find(s => s.id === sucursalId);
        const isRetiro = p.clienteDireccion?.includes("RETIRO EN LOCAL") || false;
        return matchesStatus && sucursal && isRetiro && p.clienteDireccion?.toLowerCase().includes(sucursal.nombre.toLowerCase());
      }
      return matchesStatus;
    }).length,
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

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          {/* Botón de Simulación de Pedido (Solo para Administrador, Dueño o en pruebas) */}
          {(role === "admin" || role === "owner" || !role) && (
            <button
              onClick={handleSimulateOrder}
              disabled={simulating}
              className="shrink-0 flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#00E5FF] transition hover:bg-cyan-500/20 disabled:opacity-40 shadow-[0_0_15px_rgba(0,229,255,0.05)] hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
            >
              <span>🧪</span>
              <span>{simulating ? "SIMULANDO..." : "SIMULAR PEDIDO"}</span>
            </button>
          )}

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
          <button
            onClick={() => setOnlyFresh((prev) => !prev)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
              onlyFresh
                ? "border-[#00E5FF] bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                : "border-white/10 bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
            }`}
          >
            Solo nuevos (5m)
          </button>
        </div>
      </div>

      {/* Swiss Watch Control Deck: Method & Branch Filters */}
      {role === "empleado" && sucursalId ? (
        <div className="flex items-center gap-4 rounded-[32px] border border-[#00E5FF]/20 bg-gradient-to-r from-[#00E5FF]/5 to-transparent p-6 shadow-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#00E5FF]/10 text-white text-2xl shadow-inner">
            🏪
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00E5FF]">LOCAL ASIGNADO</p>
            <h3 className="font-bebas text-2xl text-white tracking-wide mt-0.5">
              SUCURSAL {SUCURSALES.find(s => s.id === sucursalId)?.nombre.toUpperCase() || "ASIGNADA"}
            </h3>
            <p className="text-xs text-gray-400">
              Visualizando únicamente los pedidos y retiros correspondientes a este punto de venta.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 rounded-[32px] border border-white/5 bg-[#0A0F1C] p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
          {/* Delivery Method Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">MÉTODO DE ENTREGA</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "todos", label: "TODOS", icon: "🌐" },
                { id: "envio", label: "🚚 ENVÍO", icon: "🚚" },
                { id: "retiro", label: "🏪 RETIRO", icon: "🏪" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setDeliveryFilter(m.id as any);
                    if (m.id !== "retiro") {
                      setBranchFilter("todas");
                    }
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                    deliveryFilter === m.id
                      ? "border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                      : "border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
 
          {/* Branch Filter (Enabled only when retiro is selected or todos is selected) */}
          <div className="space-y-2 flex-1 md:max-w-xs">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">FILTRAR SUCURSAL</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              disabled={deliveryFilter === "envio"}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-gray-500 focus:border-[#00E5FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              <option value="todas" className="bg-[#0A0F1C] text-white">TODAS LAS SUCURSALES</option>
              {SUCURSALES.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0A0F1C] text-white">
                  {s.nombre} ({s.direccion})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Acciones masivas:</span>
        <button
          onClick={() => handleBulkStatus("pendiente")}
          disabled={bulkUpdating || filteredPedidos.length === 0}
          className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-yellow-400 transition hover:bg-yellow-500/20 disabled:opacity-40"
        >
          Marcar filtrados pendiente
        </button>
        <button
          onClick={() => handleBulkStatus("cargado")}
          disabled={bulkUpdating || filteredPedidos.length === 0}
          className="rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-green-400 transition hover:bg-green-500/20 disabled:opacity-40"
        >
          Marcar filtrados cargado
        </button>
        <button
          onClick={() => handleBulkStatus("no_leido")}
          disabled={bulkUpdating || filteredPedidos.length === 0}
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
        >
          Marcar filtrados no leido
        </button>
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

      {/* Support Card / Tarjeta de Soporte */}
      <div className="relative overflow-hidden rounded-[32px] border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-[#0A0F1C]/80 to-transparent p-6 shadow-xl transition-all duration-300 hover:scale-[1.01] hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 text-2xl shadow-inner animate-pulse">
            🛠️
          </div>
          <div>
            <h3 className="font-bebas text-2xl text-white tracking-wide">
              ¿Necesitas ayuda o falla algo? <span className="text-[#00E5FF]">SOPORTE</span>
            </h3>
            <p className="text-xs text-gray-400">
              Estamos en línea para resolver cualquier inconveniente técnico o duda del sistema.
            </p>
          </div>
        </div>
        <a
          href="https://wa.me/59892265952?text=Hola%20Facundo,%20necesito%20soporte%20con%20el%20sistema%20de%20pedidos."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-blue-500 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
        >
          <span>💬</span> Facundo Fernandez
        </a>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {filteredPedidos.map((pedido) => (
          <PedidoAdminCard key={pedido.id} pedido={pedido} onViewFull={() => {}} />
        ))}
      </div>
    </div>
  );
}
