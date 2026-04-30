import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export interface BrandStats {
  brandId: string;
  brandName: string;
  tier: string;
  total: number;
  byMonth: Record<string, number>; // "2026-04": 312
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
          Object.entries(data).forEach(([k, v]) => {
            if (/^\d{4}-\d{2}$/.test(k)) byMonth[k] = v as number;
          });
          return {
            brandId: d.id,
            brandName: d.id, // We'll map the name in the dashboard if we have the config
            tier: "—",
            total: data.total || 0,
            byMonth,
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
