import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Producto } from "@/types";

interface UseProductosReturn {
  productos: Producto[];
  loading: boolean;
  error: string | null;
  filtrados: Producto[];
  categorias: string[];
  search: string;
  setSearch: (term: string) => void;
  categoria: string;
  setCategoria: (cat: string) => void;
}

export function useProductos(): UseProductosReturn {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");

  // Fetch productos from static JSON
  useEffect(() => {
    let cancelled = false;

    async function fetchProductos() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/productos.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}: failed to load productos`);
        const data = (await res.json()) as Producto[];
        if (!cancelled) {
          setProductos(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Error al cargar productos");
          setLoading(false);
        }
      }
    }

    fetchProductos();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce search term (200ms)
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearchDebounced = useCallback((term: string) => {
    setSearch(term);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(term), 200);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Derive unique categories from loaded productos
  const categorias = useMemo(() => {
    const cats = new Set(productos.map((p) => p.categoria).filter(Boolean));
    return Array.from(cats).sort();
  }, [productos]);

  // Filter by search and category
  const filtrados = useMemo(() => {
    let result = productos;

    if (categoria) {
      result = result.filter((p) => p.categoria === categoria);
    }

    if (debouncedSearch.trim()) {
      const term = debouncedSearch.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.codigo.toLowerCase().includes(term)
      );
    }

    return result;
  }, [productos, categoria, debouncedSearch]);

  return {
    productos,
    loading,
    error,
    filtrados,
    categorias,
    search,
    setSearch: setSearchDebounced,
    categoria,
    setCategoria,
  };
}
