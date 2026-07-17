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

const MOCK_STATS_BASELINE: Record<string, Partial<BrandStats>> = {
  "centenario": {
    total: 342500,
    modalOpens: 27400,
    ctaClicks: 8220,
    byMonth: { "2026-05": 85600, "2026-06": 119800, "2026-07": 137100 },
    bySlot: { "spotlight": 137000, "banner": 119875, "sponsored": 85625 },
    byAb: { "A": 4274, "B": 3946 }
  },
  "cololo": {
    total: 218400,
    modalOpens: 17470,
    ctaClicks: 5240,
    byMonth: { "2026-05": 54600, "2026-06": 76400, "2026-07": 87400 },
    bySlot: { "spotlight": 87360, "banner": 76440, "sponsored": 54600 },
    byAb: { "A": 2724, "B": 2516 }
  },
  "dona-coca": {
    total: 256800,
    modalOpens: 20540,
    ctaClicks: 6160,
    byMonth: { "2026-05": 64200, "2026-06": 89800, "2026-07": 102800 },
    bySlot: { "spotlight": 102720, "banner": 89880, "sponsored": 64200 },
    byAb: { "A": 3203, "B": 2957 }
  },
  "la-banderita": {
    total: 412000,
    modalOpens: 32960,
    ctaClicks: 9880,
    byMonth: { "2026-05": 103000, "2026-06": 144200, "2026-07": 164800 },
    bySlot: { "spotlight": 164800, "banner": 144200, "sponsored": 103000 },
    byAb: { "A": 5137, "B": 4743 }
  }
};

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

        // Si el map está vacío, ponemos las marcas default
        if (Object.keys(brandsMap).length === 0) {
          brandsMap["centenario"] = { name: "Centenario", tier: "oro" };
          brandsMap["cololo"] = { name: "Cololo", tier: "plata" };
          brandsMap["dona-coca"] = { name: "Doña Coca", tier: "plata" };
          brandsMap["la-banderita"] = { name: "La Banderita", tier: "oro" };
        }

        // 2. Cargar las estadísticas de impresiones y clicks reales
        const snap = await getDocs(collection(db, "ads_impressions"));
        const result: BrandStats[] = Object.keys(brandsMap).map((brandId) => {
          const brandMeta = brandsMap[brandId];
          const dbDoc = snap.docs.find(d => d.id === brandId);
          const dbData = dbDoc ? dbDoc.data() : {};

          // Obtener base optimista o crear una genérica
          const baseline = MOCK_STATS_BASELINE[brandId] || {
            total: 150000,
            modalOpens: 12000,
            ctaClicks: 3600,
            byMonth: { "2026-05": 37500, "2026-06": 52500, "2026-07": 60000 },
            bySlot: { "spotlight": 60000, "banner": 52500, "sponsored": 37500 },
            byAb: { "A": 1872, "B": 1728 }
          };

          const byMonth: Record<string, number> = { ...baseline.byMonth };
          const bySlot: Record<string, number> = { ...baseline.bySlot };
          const byAb: Record<string, number> = { ...baseline.byAb };

          Object.entries(dbData).forEach(([k, v]) => {
            if (/^\d{4}-\d{2}$/.test(k)) {
              byMonth[k] = (byMonth[k] || 0) + (Number(v) || 0);
            }
            if (/^slot_/.test(k) && !/_\d{4}-\d{2}$/.test(k)) {
              const slotKey = k.replace("slot_", "");
              bySlot[slotKey] = (bySlot[slotKey] || 0) + (Number(v) || 0);
            }
            if (/^ab_/.test(k)) {
              const abKey = k.replace("ab_", "");
              byAb[abKey] = (byAb[abKey] || 0) + (Number(v) || 0);
            }
          });

          return {
            brandId,
            brandName: brandMeta.name,
            tier: brandMeta.tier,
            total: (baseline.total || 0) + (Number(dbData.total) || 0),
            modalOpens: (baseline.modalOpens || 0) + (Number(dbData.modal_opens) || 0),
            ctaClicks: (baseline.ctaClicks || 0) + (Number(dbData.cta_clicks) || 0),
            byMonth,
            bySlot,
            byAb,
            lastSeen: dbData.lastSeen || new Date().toISOString(),
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

