"use client";

import PreciosUploader from "@/components/admin/PreciosUploader";

export default function PreciosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="font-bebas text-2xl tracking-wider md:text-3xl"
          style={{ color: "var(--oscuro)" }}
        >
          ACTUALIZAR PRECIOS
        </h1>
        <p className="mt-1 text-sm font-semibold" style={{ color: "var(--muted)" }}>
          Sub\u00ED el archivo .xlsx con la lista de precios actualizada
        </p>
      </div>

      {/* Upload instructions */}
      <div
        className="mb-5 rounded-xl px-4 py-3 text-sm"
        style={{
          background: "var(--rojo-pale)",
          border: "1px solid rgba(76, 201, 240, 0.2)",
          color: "var(--oscuro)",
        }}
      >
        <span className="font-semibold">Formato esperado:</span> El archivo debe tener las columnas en orden:
        C\u00F3digo | (vac\u00EDo) | Nombre | (vac\u00EDo) | (vac\u00EDo) | Precio | (vac\u00EDo)
      </div>

      <PreciosUploader />
    </div>
  );
}
