"use client";

import { useState } from "react";
import PublicidadAdmin from "@/components/admin/PublicidadAdmin";
import PublicidadStatsAdmin from "@/components/admin/PublicidadStatsAdmin";

export default function PublicidadPage() {
  const [activeTab, setActiveTab] = useState<"config" | "stats">("stats");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
            activeTab === "stats"
              ? "border-b-2 border-[#00E5FF] text-[#00E5FF]"
              : "text-gray-500 hover:text-white"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
            activeTab === "config"
              ? "border-b-2 border-[#00E5FF] text-[#00E5FF]"
              : "text-gray-500 hover:text-white"
          }`}
        >
          Configuración
        </button>
      </div>

      {/* Content */}
      <div className="pt-4">
        {activeTab === "stats" ? <PublicidadStatsAdmin /> : <PublicidadAdmin />}
      </div>
    </div>
  );
}
