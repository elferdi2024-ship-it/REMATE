"use client";
// filepath: src/lib/favoritos-context.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useToast } from "./toast-context";

const LOCAL_KEY = "elremate_favoritos";

function loadFavoritosFromStorage(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveFavoritosToStorage(codigos: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(codigos));
  } catch (err) {
    console.error("Error saving favorites to storage:", err);
  }
}

interface FavoritosContextValue {
  favoritos: string[];
  isFavorito: (codigo: string) => boolean;
  toggleFavorito: (codigo: string) => void;
  clearFavoritos: () => void;
}

const FavoritosContext = createContext<FavoritosContextValue | null>(null);

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [favoritos, setFavoritos] = useState<string[]>(() => loadFavoritosFromStorage() || []);
  const toast = useToast();

  useEffect(() => {
    saveFavoritosToStorage(favoritos);
  }, [favoritos]);

  const isFavorito = useCallback(
    (codigo: string) => favoritos.includes(codigo),
    [favoritos]
  );

  const toggleFavorito = useCallback(
    (codigo: string) => {
      setFavoritos((prev) => {
        const index = prev.indexOf(codigo);
        if (index > -1) {
          toast.info("Producto removido de favoritos");
          return prev.filter((c) => c !== codigo);
        } else {
          toast.success("Producto agregado a favoritos");
          return [...prev, codigo];
        }
      });
    },
    [toast]
  );

  const clearFavoritos = useCallback(() => {
    setFavoritos([]);
    toast.info("Favoritos limpiados");
  }, [toast]);

  return (
    <FavoritosContext.Provider
      value={{ favoritos, isFavorito, toggleFavorito, clearFavoritos }}
    >
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos(): FavoritosContextValue {
  const ctx = useContext(FavoritosContext);
  if (!ctx) {
    throw new Error("useFavoritos must be used within a FavoritosProvider");
  }
  return ctx;
}
