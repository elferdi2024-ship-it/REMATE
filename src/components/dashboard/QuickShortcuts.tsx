// filepath: src/components/dashboard/QuickShortcuts.tsx
"use client";

import React from "react";
import Link from "next/link";

interface ShortcutItem {
  href: string;
  label: string;
  desc: string;
  icon: string;
}

const SHORTCUTS: ShortcutItem[] = [
  {
    href: "/admin/precios",
    label: "Actualizar Precios XLSX",
    desc: "Carga masiva por sucursal",
    icon: "📋",
  },
  {
    href: "/admin/productos",
    label: "Sincronizar Imágenes",
    desc: "Fotografías y miniaturas",
    icon: "🖼️",
  },
  {
    href: "/admin/publicidad",
    label: "Administrar Publicidad",
    desc: "Banners y convenios con marcas",
    icon: "📢",
  },
  {
    href: "/admin/ofertas",
    label: "Gestionar Ofertas",
    desc: "Precios especiales y banners",
    icon: "🔥",
  },
  {
    href: "/admin/cupones",
    label: "Cupones de Descuento",
    desc: "Códigos promocionales",
    icon: "🎟️",
  },
  {
    href: "/admin/sucursales",
    label: "Sucursales",
    desc: "Horarios y catálogos zonales",
    icon: "🏪",
  },
  {
    href: "/admin/stats",
    label: "Métricas del Negocio",
    desc: "Reportes y facturación",
    icon: "📈",
  },
];

export default function QuickShortcuts() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-sm transition-all duration-300 md:p-7 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <h3 className="font-bebas text-xl tracking-wide text-[var(--admin-text-hi)]">
            ATAJOS DEL SISTEMA
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--admin-text-lo)] uppercase font-bold">
          Navegación Rápida
        </span>
      </div>

      <div className="grid gap-2.5">
        {SHORTCUTS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3.5 transition-all hover:border-[var(--admin-accent)]/40 hover:bg-[var(--admin-input-bg)] active:scale-[0.99] shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-card-bg)] border border-[var(--admin-border)] text-base group-hover:scale-105 transition-transform shadow-2xs">
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-text-hi)] group-hover:text-[var(--admin-accent)] transition-colors">
                  {item.label}
                </p>
                <p className="text-[10px] text-[var(--admin-text-lo)]">
                  {item.desc}
                </p>
              </div>
            </div>
            <span className="text-xs text-[var(--admin-text-lo)] group-hover:text-[var(--admin-accent)] group-hover:translate-x-0.5 transition-all">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
