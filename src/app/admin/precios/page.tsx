"use client";

import PreciosUploader from "@/components/admin/PreciosUploader";

export default function PreciosPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-bebas text-4xl tracking-wide text-white md:text-5xl">
            ACTUALIZAR <span className="text-[#00E5FF]">PRECIOS</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Subí el archivo .xlsx con la lista de precios actualizada</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0A0F1C] to-[#0A0F1C]/50 p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
            ℹ️
          </div>
          <h2 className="text-lg font-bold text-white">Formato Esperado</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          El archivo Excel debe tener las columnas en el siguiente orden exacto. Las columnas vacías son ignoradas pero deben respetarse los espacios.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Código", "(vacío)", "Nombre", "(vacío)", "(vacío)", "Precio", "(vacío)"].map((col, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
              col === "(vacío)" ? "bg-white/5 text-gray-500 border border-white/5" : "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20"
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
