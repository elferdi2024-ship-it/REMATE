import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import type { BrandConfig } from "@/types/brands";

export interface BrandStats {
  brandId: string;
  brandName: string;
  tier: string;
  total: number;
  modalOpens: number;
  ctaClicks: number;
  byMonth: Record<string, number>;
  bySlot: Record<string, number>;
  byAb: Record<string, number>;
  lastSeen?: string;
}

export function useAdStats() {
  const [stats, setStats] = useState<BrandStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // 1. Cargar la configuración de marcas para mapear Tier y Nombre real
        const brandsMap: Record<string, { name: string; tier: string }> = {};
        try {
          const configSnap = await getDoc(doc(db, "configuracion", "publicidad"));
          if (configSnap.exists()) {
            const brands = configSnap.data().brands as BrandConfig[] || [];
            brands.forEach(b => {
              brandsMap[b.id] = { name: b.name, tier: b.tier || "bronce" };
            });
          }
        } catch (e) {
          console.warn("useAdStats: no se pudo cargar la configuración de marcas", e);
        }

        // 2. Cargar las estadísticas de impresiones y clicks
        const snap = await getDocs(collection(db, "ads_impressions"));
        const result: BrandStats[] = snap.docs.map((d) => {
          const data = d.data();
          const byMonth: Record<string, number> = {};
          const bySlot: Record<string, number> = {};
          const byAb: Record<string, number> = {};

          Object.entries(data).forEach(([k, v]) => {
            if (/^\d{4}-\d{2}$/.test(k)) byMonth[k] = Number(v) || 0;
            if (/^slot_/.test(k) && !/_\d{4}-\d{2}$/.test(k)) bySlot[k.replace("slot_", "")] = Number(v) || 0;
            if (/^ab_/.test(k)) byAb[k.replace("ab_", "")] = Number(v) || 0;
          });

          // Obtener nombre y tier mapeados
          const brandMeta = brandsMap[d.id] || { name: d.id, tier: "-" };

          return {
            brandId: d.id,
            brandName: brandMeta.name,
            tier: brandMeta.tier,
            total: Number(data.total) || 0,
            modalOpens: Number(data.modal_opens) || 0,
            ctaClicks: Number(data.cta_clicks) || 0,
            byMonth,
            bySlot,
            byAb,
            lastSeen: data.lastSeen,
          };
        });

        setStats(result.sort((a, b) => b.total - a.total));
      } catch (err) {
        console.error("Error cargando estadísticas de anuncios", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return { stats, loading };
}

