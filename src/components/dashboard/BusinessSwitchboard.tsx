// filepath: src/components/dashboard/BusinessSwitchboard.tsx
"use client";

import React, { useState, useEffect } from "react";

export interface TiendaConfig {
  pedidosAbiertos: boolean;
  bannerMensaje: string;
  minimoEnvioGratis?: number;
}

interface BusinessSwitchboardProps {
  config: TiendaConfig;
  configSaving: boolean;
  onSaveConfig: (updatedFields: Partial<TiendaConfig>) => Promise<void>;
}

export default function BusinessSwitchboard({
  config,
  configSaving,
  onSaveConfig,
}: BusinessSwitchboardProps) {
  const [localBanner, setLocalBanner] = useState(config.bannerMensaje || "");
  const [localMinimo, setLocalMinimo] = useState<number | string>(
    config.minimoEnvioGratis ?? 2500
  );

  // Sincronizar estado local cuando config cambie remotamente
  useEffect(() => {
    setLocalBanner(config.bannerMensaje || "");
  }, [config.bannerMensaje]);

  useEffect(() => {
    setLocalMinimo(config.minimoEnvioGratis ?? 2500);
  }, [config.minimoEnvioGratis]);

  const handleTogglePedidos = () => {
    onSaveConfig({ pedidosAbiertos: !config.pedidosAbiertos });
  };

  const handleSaveBanner = () => {
    onSaveConfig({ bannerMensaje: localBanner.trim() });
  };

  const handleClearBanner = () => {
    setLocalBanner("");
    onSaveConfig({ bannerMensaje: "" });
  };

  const handleSaveMinimo = () => {
    const parsed = Number(localMinimo);
    if (!isNaN(parsed) && parsed >= 0) {
      onSaveConfig({ minimoEnvioGratis: parsed });
    }
  };

  const handlePresetMinimo = (val: number) => {
    setLocalMinimo(val);
    onSaveConfig({ minimoEnvioGratis: val });
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-sm transition-all duration-300 md:p-8">
      {/* Header del Panel */}
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎛️</span>
            <h2 className="font-bebas text-2xl tracking-wide text-[var(--admin-text-hi)] md:text-3xl">
              LLAVE DE PASO DEL NEGOCIO
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-[var(--admin-text-lo)] font-medium">
            Interruptores de estado comercial y políticas globales de venta
          </p>
        </div>
        {configSaving && (
          <div className="flex items-center gap-2 rounded-full bg-[var(--admin-accent)]/10 px-3 py-1 text-xs font-mono font-bold text-[var(--admin-accent)]">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[var(--admin-accent)]" />
            Guardando cambios...
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Control 1: Toggle Recepción de Pedidos */}
        <div
          className={`flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between ${
            config.pedidosAbiertos
              ? "border-emerald-500/30 bg-emerald-500/[0.03]"
              : "border-amber-500/40 bg-amber-500/[0.04]"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-sm text-[var(--admin-text-hi)]">
                Recepción y Cierre de Pedidos
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider ${
                  config.pedidosAbiertos
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-amber-500/15 text-amber-500"
                }`}
              >
                {config.pedidosAbiertos ? "Venta Activa" : "Pausada"}
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-[var(--admin-text-lo)]">
              {config.pedidosAbiertos
                ? "Los clientes pueden armar carritos y finalizar órdenes vía WhatsApp normalmente."
                : "Los clientes solo podrán explorar precios. El checkout mostrará que la recepción está pausada por el administrador."}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={config.pedidosAbiertos}
            disabled={configSaving}
            onClick={handleTogglePedidos}
            className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/40 ${
              config.pedidosAbiertos
                ? "bg-emerald-500"
                : "bg-[var(--admin-input-bg)] border-[var(--admin-border)]"
            } ${configSaving ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                config.pedidosAbiertos ? "translate-x-8" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Control 2: Banner de Aviso Global */}
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[var(--admin-text-hi)] flex items-center gap-2">
                <span>📢</span> Banner de Alerta en Tienda
              </h3>
              <p className="text-xs text-[var(--admin-text-lo)] mt-0.5">
                Mensaje de cabecera urgente visible para todos los clientes en la tienda.
              </p>
            </div>
            {config.bannerMensaje && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-500">
                Visible en tienda
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ej: Descuento del 10% abonando al contado hoy..."
                value={localBanner}
                onChange={(e) => setLocalBanner(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveBanner()}
                className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-4 py-2.5 text-xs sm:text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)] focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
              />
              {localBanner && (
                <button
                  type="button"
                  onClick={() => setLocalBanner("")}
                  className="absolute right-3 top-2.5 text-xs text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={configSaving || localBanner === (config.bannerMensaje || "")}
                onClick={handleSaveBanner}
                className="rounded-xl bg-[var(--admin-accent)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                Guardar
              </button>
              {config.bannerMensaje && (
                <button
                  type="button"
                  disabled={configSaving}
                  onClick={handleClearBanner}
                  className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-2.5 text-xs font-semibold text-[var(--admin-text-lo)] hover:text-red-500 hover:border-red-500/40 transition active:scale-[0.98]"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>

          {/* Preview en vivo del banner */}
          <div className="rounded-xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-input-bg)]/40 p-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--admin-text-lo)] block mb-1.5 font-bold">
              👁️ Vista Previa en Tienda:
            </span>
            {localBanner.trim() ? (
              <div className="rounded-lg bg-[#EF233C] px-3.5 py-1.5 text-center text-xs font-bold text-white shadow-xs">
                📢 {localBanner.trim()}
              </div>
            ) : (
              <div className="text-center text-xs text-[var(--admin-text-lo)] italic py-1">
                (Sin banner configurado — no ocupará espacio en el catálogo)
              </div>
            )}
          </div>
        </div>

        {/* Control 3: Meta de Despacho Bonificado / Envío Gratis */}
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[var(--admin-text-hi)] flex items-center gap-2">
                <span>🚚</span> Meta de Envío Gratis
              </h3>
              <p className="text-xs text-[var(--admin-text-lo)] mt-0.5">
                Monto mínimo acumulado en carrito para bonificar el despacho al cliente.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[var(--admin-text-hi)] tabular-nums">
              Actual: $ {Number(config.minimoEnvioGratis || 2500).toLocaleString("es-UY")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-2.5 font-mono text-xs font-bold text-[var(--admin-text-lo)]">
                $ UYU
              </span>
              <input
                type="number"
                min="0"
                step="100"
                value={localMinimo}
                onChange={(e) => setLocalMinimo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveMinimo()}
                placeholder="2500"
                className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] pl-16 pr-4 py-2.5 font-mono text-xs sm:text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)] focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] tabular-nums font-bold"
              />
            </div>
            <button
              type="button"
              disabled={
                configSaving ||
                Number(localMinimo) === Number(config.minimoEnvioGratis ?? 2500)
              }
              onClick={handleSaveMinimo}
              className="rounded-xl bg-[var(--admin-accent)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              Aplicar
            </button>
          </div>

          {/* Preset Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
              Valores rápidos:
            </span>
            {[2000, 2500, 3000, 3500, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handlePresetMinimo(val)}
                className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold transition active:scale-95 ${
                  Number(config.minimoEnvioGratis) === val
                    ? "bg-[var(--admin-accent)] text-white shadow-xs"
                    : "border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text-mid)] hover:border-[var(--admin-accent)]/40"
                }`}
              >
                ${val.toLocaleString("es-UY")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
