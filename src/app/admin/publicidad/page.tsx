"use client";

import { useState } from "react";
import PublicidadAdmin from "@/components/admin/PublicidadAdmin";
import PublicidadStatsAdmin from "@/components/admin/PublicidadStatsAdmin";
import MarketingRailAdmin from "@/components/admin/MarketingRailAdmin";

export default function PublicidadPage() {
  const [activeTab, setActiveTab] = useState<"stats" | "config" | "marketing">("stats");

  const tabs = [
    { key: "stats" as const, label: "Dashboard" },
    { key: "config" as const, label: "Marcas" },
    { key: "marketing" as const, label: "Tarjetas Marketing" },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.key
                ? "border-b-2 border-[#00E5FF] text-[#00E5FF]"
                : "text-gray-500 hover:text-white"
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
      </div>
    </div>
  );
}
