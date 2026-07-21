"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export interface TiendaConfig {
  pedidosAbiertos: boolean;
  bannerMensaje: string;
  minimoEnvioGratis: number;
}

export function useTiendaConfig() {
  const [config, setConfig] = useState<TiendaConfig>({
    pedidosAbiertos: true,
    bannerMensaje: "",
    minimoEnvioGratis: 3000,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "config", "tienda"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setConfig({
            pedidosAbiertos: data.pedidosAbiertos ?? true,
            bannerMensaje: data.bannerMensaje ?? "",
            minimoEnvioGratis: data.minimoEnvioGratis ?? 3000,
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
