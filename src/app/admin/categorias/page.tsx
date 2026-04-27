"use client";

import CategoriasAdmin from "@/components/admin/CategoriasAdmin";

export default function AdminCategoriasPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-bebas text-4xl tracking-wide text-white md:text-5xl">
          GESTIÓN DE <span className="text-[#00E5FF]">CATEGORÍAS</span>
        </h1>
        <p className="text-gray-400 mt-2 font-medium">Personalizá los íconos de las categorías del catálogo</p>
      </div>

      <CategoriasAdmin />
    </div>
  );
}
