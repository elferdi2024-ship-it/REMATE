// filepath: src/hooks/useTiendaConfig.ts
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export interface TiendaConfig {
  pedidosAbiertos: boolean;
  bannerMensaje: string;
  minimoEnvioGratis: number;
  modoHalloween?: boolean;
}

export function useTiendaConfig() {
  const [config, setConfig] = useState<TiendaConfig>({
    pedidosAbiertos: true,
    bannerMensaje: "",
    minimoEnvioGratis: 2500,
    modoHalloween: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "config", "tienda"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const rawMinimo = Number(data.minimoEnvioGratis);
          setConfig({
            pedidosAbiertos: data.pedidosAbiertos ?? true,
            bannerMensaje: data.bannerMensaje ?? "",
            minimoEnvioGratis: !isNaN(rawMinimo) && rawMinimo >= 2500 ? rawMinimo : 2500,
            modoHalloween: false,
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error al cargar config de tienda:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { config, loading };
}
