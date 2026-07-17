// filepath: src/app/admin/publicidad/page.tsx
"use client";

import { useState, useEffect } from "react";
import PublicidadAdmin from "@/components/admin/PublicidadAdmin";
import PublicidadStatsAdmin from "@/components/admin/PublicidadStatsAdmin";
import MarketingRailAdmin from "@/components/admin/MarketingRailAdmin";
import FlujoClientesLanding from "@/components/admin/FlujoClientesLanding";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { BrandConfig } from "@/types/brands";
import Link from "next/link";

export default function PublicidadPage() {
  const [activeTab, setActiveTab] = useState<"stats" | "config" | "marketing" | "reportes" | "flujo">("stats");
  const [brands, setBrands] = useState<BrandConfig[]>([]);

  useEffect(() => {
    // Only load params if we switch to reportes or to get it ready
    const loadBrands = async () => {
      const snap = await getDoc(doc(db, "configuracion", "publicidad"));
      if(snap.exists()) {
        setBrands(snap.data().brands || []);
      }
    };
    loadBrands();
  }, []);

  // Listen to URL params for tab=reportes or tab=flujo
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      if (tab === "reportes") {
        setActiveTab("reportes");
      } else if (tab === "flujo") {
        setActiveTab("flujo");
      }
    }
  }, []);

  const tabs = [
    { key: "stats" as const, label: "Dashboard" },
    { key: "config" as const, label: "Marcas" },
    { key: "marketing" as const, label: "Tarjetas Marketing" },
    { key: "reportes" as const, label: "Reportes B2B" },
    { key: "flujo" as const, label: "Flujo Clientes" },
  ];

  return (
    <div className="space-y-6 text-[var(--admin-text-mid)]">
      {/* Tabs */}
      <div className="flex border-b border-[var(--admin-border)] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.key
                ? "border-b-2 border-[var(--admin-accent)] text-[var(--admin-accent)]"
                : "text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pt-4">
        {activeTab === "stats" && <PublicidadStatsAdmin />}
        {activeTab === "config" && <PublicidadAdmin />}
        {activeTab === "marketing" && <MarketingRailAdmin />}
        {activeTab === "flujo" && <FlujoClientesLanding />}
        {activeTab === "reportes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map(brand => (
              <div key={brand.id} className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: brand.color || "#D62828" }}>
                    {brand.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[var(--admin-text-hi)] font-bebas tracking-wide text-xl">{brand.name}</h3>
                    <span className="text-[10px] uppercase font-bold text-[var(--admin-text-lo)]">Tier {brand.tier}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link href={`/admin/publicidad/reporte/${brand.id}`} target="_blank" className="flex-1 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border border-[var(--admin-accent)]/20 py-2 rounded-lg text-center text-xs font-bold hover:bg-[var(--admin-accent)] hover:text-white transition-colors">
                    Ver Reporte de Impacto
                  </Link>
                </div>
              </div>
            ))}
            {brands.length === 0 && (
              <div className="col-span-full py-10 text-center text-[var(--admin-text-lo)]">Cargando marcas o no hay marcas configuradas...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
