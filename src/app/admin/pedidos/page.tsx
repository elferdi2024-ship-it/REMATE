"use client";

import { useState, useEffect, useCallback } from "react";
import { subscribePedidosHoy } from "@/lib/pedidos";
import PedidoAdminCard, { type PedidoAdmin } from "@/components/admin/PedidoAdminCard";

const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

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
    // Convert Firestore docs to our PedidoAdmin type
    const mapped: PedidoAdmin[] = docs.map((d) => ({
      id: d.id,
      uid: d.uid ?? null,
      clienteNombre: d.clienteNombre ?? "Cliente",
      fecha: d.fecha?.toDate?.() ?? new Date(),
      items: d.items ?? [],
      total: d.total ?? 0,
      notas: d.notas ?? "",
    }));
    setPedidos(mapped);
    setError(null);
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    try {
      unsub = subscribePedidosHoy(handleUpdate);
    } catch {
      setError("No se pudieron cargar los pedidos. Verific\u00E1 tu conexi\u00F3n.");
    }

    return () => {
      unsub?.();
    };
  }, [handleUpdate]);

  const totalGeneral = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  function handleViewFull(_pedido: PedidoAdmin) {
    // The card handles its own expand/collapse state
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-bebas text-2xl tracking-wider text-white md:text-3xl" style={{ color: "var(--oscuro)" }}>
          PEDIDOS DE HOY \u2014 {formatHeaderDate()}
        </h1>
        <p className="mt-1 text-sm font-semibold" style={{ color: "var(--muted)" }}>
          {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} \u00B7 {formatCurrency(totalGeneral)} total
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="mb-6 rounded-xl px-4 py-3 text-center text-sm font-semibold"
          style={{
            background: "rgba(239, 35, 60, 0.08)",
            color: "var(--rojo)",
            border: "1px solid rgba(239, 35, 60, 0.2)",
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {!error && pedidos.length === 0 && (
        <div
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16"
          style={{ borderColor: "var(--border2)" }}
        >
          <span className="mb-3 text-4xl">\uD83D\uDCE6</span>
          <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            A\u00FAn no hay pedidos hoy
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            Aparecer\u00E1n ac\u00E1 en tiempo real
          </p>
        </div>
      )}

      {/* Order cards */}
      <div className="flex flex-col gap-4">
        {pedidos.map((pedido) => (
          <PedidoAdminCard
            key={pedido.id}
            pedido={pedido}
            onViewFull={handleViewFull}
          />
        ))}
      </div>
    </div>
  );
}
