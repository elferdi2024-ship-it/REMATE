"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import * as listasLib from "@/lib/listas";
import type { ListaItem } from "@/lib/listas";

interface UseListasReturn {
  listas: any[];
  loading: boolean;
  crearLista: (nombre: string, items: ListaItem[]) => Promise<void>;
  actualizarLista: (
    listaId: string,
    data: { nombre?: string; items?: ListaItem[] }
  ) => Promise<void>;
  eliminarLista: (listaId: string) => Promise<void>;
}

/**
 * Lists hook.
 * Fetches lists from Firestore when authenticated.
 * Returns CRUD operations.
 */
export function useListas(): UseListasReturn {
  const { user } = useAuth();
  const [listas, setListas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch lists when user is authenticated
  useEffect(() => {
    if (!user) {
      setListas([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    listasLib
      .getListas(user.uid)
      .then((result) => {
        if (!cancelled) {
          setListas(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Error fetching listas:", err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const crearListaFn = useCallback(
    async (nombre: string, items: ListaItem[]) => {
      if (!user) return;
      const id = await listasLib.crearLista(user.uid, { nombre, items });
      // Refresh lists
      const updated = await listasLib.getListas(user.uid);
      setListas(updated);
    },
    [user]
  );

  const actualizarListaFn = useCallback(
    async (
      listaId: string,
      data: { nombre?: string; items?: ListaItem[] }
    ) => {
      if (!user) return;
      await listasLib.actualizarLista(user.uid, listaId, data);
      // Refresh lists
      const updated = await listasLib.getListas(user.uid);
      setListas(updated);
    },
    [user]
  );

  const eliminarListaFn = useCallback(
    async (listaId: string) => {
      if (!user) return;
      await listasLib.eliminarLista(user.uid, listaId);
      // Refresh lists
      const updated = await listasLib.getListas(user.uid);
      setListas(updated);
    },
    [user]
  );

  return {
    listas,
    loading,
    crearLista: crearListaFn,
    actualizarLista: actualizarListaFn,
    eliminarLista: eliminarListaFn,
  };
}
