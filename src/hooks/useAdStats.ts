import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export interface BrandStats {
  brandId: string;
  brandName: string;
  tier: string;
  total: number;
  byMonth: Record<string, number>;
  bySlot: Record<string, number>;
  byAb: Record<string, number>;
  lastSeen?: string;
}

export function useAdStats() {
  const [stats, setStats] = useState<BrandStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, "ads_impressions"))
      .then((snap) => {
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

          return {
            brandId: d.id,
            brandName: d.id,
            tier: "-",
            total: Number(data.total) || 0,
            byMonth,
            bySlot,
            byAb,
            lastSeen: data.lastSeen,
          };
        });

        setStats(result.sort((a, b) => b.total - a.total));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
