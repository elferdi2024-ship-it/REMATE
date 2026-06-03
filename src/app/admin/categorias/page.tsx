// filepath: src/app/admin/categorias/page.tsx
"use client";

import CategoriasAdmin from "@/components/admin/CategoriasAdmin";

export default function AdminCategoriasPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[var(--admin-text-mid)]">
      <div>
        <h1 className="font-bebas text-4xl tracking-wide text-[var(--admin-text-hi)] md:text-5xl">
          GESTIÓN DE <span className="text-[var(--admin-accent)]">CATEGORÍAS</span>
        </h1>
        <p className="text-[var(--admin-text-lo)] mt-2 font-medium">Personalizá los íconos de las categorías del catálogo</p>
      </div>

      <CategoriasAdmin />
    </div>
  );
}
