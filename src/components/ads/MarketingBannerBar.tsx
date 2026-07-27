// filepath: src/components/ads/MarketingBannerBar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { MarketingCampaign } from "@/types/campaigns";

interface MarketingBannerBarProps {
  selectedSucursal?: string;
  selectedSucursalNombre?: string;
}

export default function MarketingBannerBar({ selectedSucursal, selectedSucursalNombre }: MarketingBannerBarProps) {
  const [activeCampaign, setActiveCampaign] = useState<MarketingCampaign | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "campanas"),
      where("tipo", "==", "top_bar"),
      where("activa", "==", true)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const validCampaigns = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MarketingCampaign))
        .filter((camp) => {
          const start = new Date(camp.fechaInicio);
          const end = new Date(camp.fechaFin);
          const matchesBranch =
            !camp.sucursalIds ||
            camp.sucursalIds.length === 0 ||
            (selectedSucursal && camp.sucursalIds.includes(selectedSucursal));
          return now >= start && now <= end && matchesBranch;
        })
        .sort((a, b) => a.prioridad - b.prioridad);

      setActiveCampaign(validCampaigns[0] || null);
    });

    return () => unsub();
  }, [selectedSucursal]);

  useEffect(() => {
    if (!activeCampaign?.fechaFin) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(activeCampaign.fechaFin).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        setTimeLeft({
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCampaign]);

  if (!activeCampaign) return null;

  return (
    <div
      className="w-full py-2.5 px-4 text-xs md:text-sm font-medium flex items-center justify-between gap-3 border-b transition-all z-40 relative shadow-sm"
      style={{
        backgroundColor: activeCampaign.colorFondo || "#1A1410",
        color: activeCampaign.colorTexto || "#FFFFFF",
        borderColor: activeCampaign.colorAccent || "rgba(255,255,255,0.15)",
      }}
    >
      <div className="max-w-[1200px] mx-auto w-full flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span 
            className="font-extrabold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider shadow-xs"
            style={{ backgroundColor: activeCampaign.colorAccent || "#E53935", color: "#FFFFFF" }}
          >
            PROMO
          </span>
          <span className="font-semibold tracking-wide">{activeCampaign.titulo}</span>
          {selectedSucursalNombre && (
            <span className="hidden md:inline-block text-white/70 text-xs">
              • Válido en {selectedSucursalNombre}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto md:ml-0">
          {timeLeft && (
            <div className="flex items-center gap-1.5 font-mono text-xs bg-black/40 px-2.5 py-1 rounded-md border border-white/10">
              <span className="text-white/70">Finaliza en:</span>
              <span className="font-bold text-[#FFB300]">
                {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          )}

          {activeCampaign.ctaTexto && activeCampaign.ctaUrl && (
            <Link
              href={activeCampaign.ctaUrl}
              className="bg-white text-[#111111] hover:bg-gray-100 font-bold px-3 py-1 rounded text-xs transition-transform active:scale-95 no-underline shadow-xs"
            >
              {activeCampaign.ctaTexto} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
