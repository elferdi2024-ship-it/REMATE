// filepath: src/app/admin/precios/page.tsx
"use client";

import PreciosUploader from "@/components/admin/PreciosUploader";

export default function PreciosPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[var(--admin-text-mid)]">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-bebas text-4xl tracking-wide text-[var(--admin-text-hi)] md:text-5xl">
            ACTUALIZAR <span className="text-[var(--admin-accent)]">PRECIOS</span>
          </h1>
          <p className="text-[var(--admin-text-lo)] mt-2 font-medium">Subí el archivo .xlsx con la lista de precios actualizada</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-500 dark:text-blue-400">
            ℹ️
          </div>
          <h2 className="text-lg font-bold text-[var(--admin-text-hi)]">Formato Esperado</h2>
        </div>
        <p className="text-sm text-[var(--admin-text-lo)] mb-4 leading-relaxed">
          El archivo Excel debe tener las columnas en el siguiente orden exacto. Las columnas vacías son ignoradas pero deben respetarse los espacios.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Código", "(vacío)", "Nombre", "(vacío)", "(vacío)", "Precio", "(vacío)"].map((col, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
              col === "(vacío)" ? "bg-[var(--admin-bg)] text-[var(--admin-text-lo)] border border-[var(--admin-border)]" : "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border border-[var(--admin-accent)]/20"
            }`}>
              <span className="opacity-50">{i + 1}.</span> {col}
            </div>
          ))}
        </div>
      </div>

      <PreciosUploader />
    </div>
  );
}
