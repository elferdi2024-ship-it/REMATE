// filepath: src/app/admin/productos/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/lib/toast-context";
import imageCompression from 'browser-image-compression';
import Image from "next/image";
import categoriaMapping from "@/lib/categoria_mapping.json";
import { CATEGORIAS } from "@/types";
import type { ImageCandidate } from "@/lib/product-image-finder";

const catMap = (categoriaMapping as any).mapping || categoriaMapping;

interface ProductoRow {
  codigo: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen?: string;
}

export default function AdminProductos() {
  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "activos" | "ocultos">("todos");
  const [imageFilter, setImageFilter] = useState<"todos" | "sin_imagen" | "con_imagen">("todos");
  const [sortBy, setSortBy] = useState<"sin_imagen_primero" | "nombre_asc" | "codigo_asc" | "precio_asc" | "precio_desc">("sin_imagen_primero");
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);
  
  // Estado para edición de precio individual y toggle rápido
  const [editingPrice, setEditingPrice] = useState<{ codigo: string, value: string } | null>(null);
  const [savingPrice, setSavingPrice] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  // Estado para Buscador Automático de Imágenes (Modal 1 clic)
  const [pickerProduct, setPickerProduct] = useState<ProductoRow | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerCandidates, setPickerCandidates] = useState<ImageCandidate[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [applyingCandidateUrl, setApplyingCandidateUrl] = useState<string | null>(null);

  // Estado para Auto-completar en Lote ($0)
  const [batchLimit, setBatchLimit] = useState<number>(20);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchState, setBatchState] = useState<{
    current: number;
    total: number;
    applied: number;
    failed: number;
    currentName: string;
  }>({ current: 0, total: 0, applied: 0, failed: 0, currentName: "" });
  const batchAbortRef = useRef(false);

  // Leer filtro inicial por URL (?filter=sin_imagen) sin usar useSearchParams para evitar bailout SSR
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("filter") === "sin_imagen") {
      setImageFilter("sin_imagen");
      setSortBy("sin_imagen_primero");
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
        if (snap.exists()) {
          const data = snap.data();
          const items = data.items || {};
          const arr = Object.values(items) as ProductoRow[];
          setProductos(arr);
        }
      } catch (e) {
        toast.error("Error cargando productos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, statusFilter, imageFilter, sortBy, itemsPerPage]);

  // Métricas en vivo
  const stats = useMemo(() => {
    const total = productos.length;
    const activos = productos.filter(p => p.precio > 0).length;
    const ocultos = productos.filter(p => p.precio <= 0).length;
    const sinImagen = productos.filter(p => !p.imagen || p.imagen.trim() === "").length;
    return { total, activos, ocultos, sinImagen };
  }, [productos]);

  // Filtrado y ordenado
  const filtrados = useMemo(() => {
    const s = search.toLowerCase().trim();
    let res = productos.filter((p) => 
      p.nombre.toLowerCase().includes(s) || p.codigo.toLowerCase().includes(s)
    );
    
    if (selectedCategory) {
      res = res.filter((p) => p.categoria === selectedCategory);
    }
    
    if (statusFilter === "activos") {
      res = res.filter((p) => p.precio > 0);
    } else if (statusFilter === "ocultos") {
      res = res.filter((p) => p.precio <= 0);
    }

    if (imageFilter === "sin_imagen") {
      res = res.filter((p) => !p.imagen || p.imagen.trim() === "");
    } else if (imageFilter === "con_imagen") {
      res = res.filter((p) => p.imagen && p.imagen.trim() !== "");
    }

    // Sort
    return [...res].sort((a, b) => {
      if (sortBy === "sin_imagen_primero") {
        const aHasImage = !!(a.imagen && a.imagen.trim() !== "");
        const bHasImage = !!(b.imagen && b.imagen.trim() !== "");
        if (aHasImage === bHasImage) {
          return a.nombre.localeCompare(b.nombre);
        }
        return aHasImage ? 1 : -1; // Sin imagen primero
      }
      if (sortBy === "nombre_asc") return a.nombre.localeCompare(b.nombre);
      if (sortBy === "codigo_asc") return a.codigo.localeCompare(b.codigo);
      if (sortBy === "precio_asc") return a.precio - b.precio;
      if (sortBy === "precio_desc") return b.precio - a.precio;
      return 0;
    });
  }, [productos, search, selectedCategory, statusFilter, imageFilter, sortBy]);

  // Items paginados
  const totalPages = Math.max(1, Math.ceil(filtrados.length / itemsPerPage));
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtrados.slice(start, start + itemsPerPage);
  }, [filtrados, currentPage, itemsPerPage]);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const handleUploadImage = async (
    codigo: string,
    file: File,
    silent = false
  ): Promise<boolean> => {
    if (!file.type.startsWith("image/")) {
      if (!silent) toast.error("Solo se permiten imágenes");
      return false;
    }
    setUploadingItem(codigo);
    setProgress(0);

    try {
      const product = productos.find(p => p.codigo === codigo);
      const productName = product ? product.nombre : "producto";

      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };

      const compressedFile = await imageCompression(file, options);
      const extFromName = compressedFile.name.split('.').pop()?.toLowerCase();
      const ext = extFromName && ["jpg", "jpeg", "png", "webp"].includes(extFromName)
        ? extFromName
        : "jpg";
      const fileName = `${slugify(productName)}-${codigo}.${ext}`;
      const storageRef = ref(storage, `productos/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      const downloadURL = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(p);
          },
          (error) => reject(error),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      await setDoc(
        doc(db, "catalogo_activo", "productos"),
        { items: { [codigo]: { imagen: downloadURL } } },
        { merge: true }
      );

      setProductos(prev => prev.map(p => p.codigo === codigo ? { ...p, imagen: downloadURL } : p));
      if (!silent) toast.success("Imagen SEO optimizada cargada");
      return true;
    } catch (error) {
      console.error(error);
      if (!silent) toast.error("Error al procesar o subir la imagen");
      return false;
    } finally {
      setUploadingItem(null);
    }
  };

  // Descarga una imagen candidata usando el proxy propio (sin CORS y sin debilitar CSP)
  const fetchCandidateAsFile = async (
    candidate: ImageCandidate,
    codigo: string
  ): Promise<File | null> => {
    const urlsToTry = [candidate.url, candidate.thumbUrl].filter(
      (u, idx, arr) => Boolean(u) && arr.indexOf(u) === idx
    );

    for (const remoteUrl of urlsToTry) {
      try {
        const res = await fetch(
          `/api/admin/image-proxy?url=${encodeURIComponent(remoteUrl)}`
        );
        if (!res.ok) continue;
        const blob = await res.blob();
        if (!blob.type.startsWith("image/") || blob.size < 1024) continue;
        const ext =
          blob.type.includes("png")
            ? "png"
            : blob.type.includes("webp")
            ? "webp"
            : "jpg";
        return new File([blob], `${codigo}.${ext}`, { type: blob.type });
      } catch {
        // Reintentar con thumbnail
      }
    }
    return null;
  };

  const searchPickerImages = async (
    prod: ProductoRow,
    customQuery?: string
  ) => {
    setPickerLoading(true);
    setPickerError(null);
    setPickerCandidates([]);
    try {
      const res = await fetch("/api/admin/find-product-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: prod.codigo,
          nombre: prod.nombre,
          customQuery: customQuery?.trim() || undefined,
        }),
      });
      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`);
      }
      const data = await res.json();
      setPickerCandidates(Array.isArray(data.candidates) ? data.candidates : []);
      if (!customQuery && data.queryUsed) {
        setPickerQuery(data.queryUsed);
      }
      if (!data.candidates || data.candidates.length === 0) {
        setPickerError("No se encontraron imágenes. Probá editar el nombre de búsqueda arriba.");
      }
    } catch (e: any) {
      setPickerError(e?.message || "No se pudo consultar el buscador de imágenes");
    } finally {
      setPickerLoading(false);
    }
  };

  const openImagePicker = (prod: ProductoRow) => {
    setPickerProduct(prod);
    setPickerQuery(prod.nombre);
    searchPickerImages(prod);
  };

  const applyCandidateToProduct = async (candidate: ImageCandidate) => {
    if (!pickerProduct || applyingCandidateUrl) return;
    setApplyingCandidateUrl(candidate.url);
    try {
      const file = await fetchCandidateAsFile(candidate, pickerProduct.codigo);
      if (!file) {
        toast.error("No se pudo descargar esta foto. Probá con otra opción.");
        return;
      }
      const ok = await handleUploadImage(pickerProduct.codigo, file);
      if (ok) {
        setPickerProduct(null);
      }
    } finally {
      setApplyingCandidateUrl(null);
    }
  };

  const handleBatchAutoFill = async () => {
    const targets = filtrados
      .filter((p) => !p.imagen || p.imagen.trim() === "")
      .slice(0, batchLimit);

    if (targets.length === 0) {
      toast.info("No hay productos sin imagen en la vista filtrada actual.");
      return;
    }

    batchAbortRef.current = false;
    setBatchRunning(true);
    setBatchState({
      current: 0,
      total: targets.length,
      applied: 0,
      failed: 0,
      currentName: targets[0].nombre,
    });

    let applied = 0;
    let failed = 0;

    for (let i = 0; i < targets.length; i++) {
      if (batchAbortRef.current) break;
      const prod = targets[i];
      setBatchState({
        current: i + 1,
        total: targets.length,
        applied,
        failed,
        currentName: prod.nombre,
      });

      try {
        const res = await fetch("/api/admin/find-product-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigo: prod.codigo, nombre: prod.nombre }),
        });

        if (!res.ok) {
          failed++;
          continue;
        }

        const data = await res.json();
        const candidates: ImageCandidate[] = Array.isArray(data.candidates)
          ? data.candidates
          : [];

        let uploaded = false;
        // Probar los primeros 3 candidatos mejor rankeados hasta conseguir una descarga limpia
        for (const cand of candidates.slice(0, 3)) {
          if (batchAbortRef.current) break;
          const file = await fetchCandidateAsFile(cand, prod.codigo);
          if (!file) continue;
          const ok = await handleUploadImage(prod.codigo, file, true);
          if (ok) {
            uploaded = true;
            break;
          }
        }

        if (uploaded) {
          applied++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }

      // Pausa breve para no saturar búsquedas ni Storage
      if (!batchAbortRef.current && i < targets.length - 1) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }

    setBatchState((prev) => ({ ...prev, applied, failed }));
    setBatchRunning(false);

    if (batchAbortRef.current) {
      toast.info(`Lote detenido: ${applied} fotos aplicadas, ${failed} omitidas.`);
    } else {
      toast.success(`Lote finalizado: ${applied} fotos cargadas automáticamente (${failed} sin coincidencia).`);
    }
  };

  const handleSyncCategories = async () => {
    if (!confirm("¿Estás seguro de que deseas sincronizar las categorías de TODO el catálogo con el Excel? Esto sobrescribirá las categorías actuales.")) return;
    
    setSyncing(true);
    try {
      const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
      if (!snap.exists()) throw new Error("No se encontró el documento de productos");
      
      const data = snap.data();
      const items = data.items || {};
      const updatedItems = { ...items };
      let count = 0;

      for (const codigo in updatedItems) {
        if (catMap[codigo]) {
          updatedItems[codigo].categoria = catMap[codigo];
          count++;
        }
      }

      await updateDoc(doc(db, "catalogo_activo", "productos"), {
        items: updatedItems
      });

      setProductos(Object.values(updatedItems) as ProductoRow[]);
      toast.success(`Se actualizaron ${count} productos exitosamente.`);
    } catch (e: any) {
      console.error(e);
      toast.error("Error al sincronizar: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleStatus = async (prod: ProductoRow) => {
    const isCurrentlyActive = prod.precio > 0;
    setTogglingStatus(prod.codigo);
    
    let newPrice = 0;
    if (!isCurrentlyActive) {
      const inputVal = prompt(`Ingresá el precio para activar "${prod.nombre}":`, "100");
      if (!inputVal) {
        setTogglingStatus(null);
        return;
      }
      newPrice = parseFloat(inputVal);
      if (isNaN(newPrice) || newPrice <= 0) {
        toast.error("El precio debe ser un número mayor a 0");
        setTogglingStatus(null);
        return;
      }
    }

    try {
      await updateDoc(doc(db, "catalogo_activo", "productos"), {
        [`items.${prod.codigo}.precio`]: newPrice
      });
      setProductos(prev => prev.map(p => p.codigo === prod.codigo ? { ...p, precio: newPrice } : p));
      toast.success(newPrice > 0 ? "Producto ACTIVADO en web" : "Producto DESACTIVADO (Oculto)");
    } catch (e: any) {
      toast.error("Error al cambiar estado del producto");
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleUpdatePrice = async (codigo: string) => {
    if (!editingPrice || editingPrice.codigo !== codigo) return;
    
    const newPrice = parseFloat(editingPrice.value);
    if (isNaN(newPrice)) {
      toast.error("Precio inválido");
      return;
    }

    setSavingPrice(codigo);
    try {
      await updateDoc(doc(db, "catalogo_activo", "productos"), {
        [`items.${codigo}.precio`]: newPrice
      });
      
      setProductos(prev => prev.map(p => p.codigo === codigo ? { ...p, precio: newPrice } : p));
      setEditingPrice(null);
      toast.success("Precio actualizado");
    } catch (e: any) {
      console.error(e);
      toast.error("Error al actualizar precio");
    } finally {
      setSavingPrice(null);
    }
  };

  const handleUpdateCategory = async (codigo: string, nuevaCategoria: string) => {
    try {
      await updateDoc(doc(db, "catalogo_activo", "productos"), {
        [`items.${codigo}.categoria`]: nuevaCategoria
      });
      
      setProductos(prev => prev.map(p => p.codigo === codigo ? { ...p, categoria: nuevaCategoria } : p));
      toast.success("Categoría actualizada");
    } catch (e: any) {
      console.error(e);
      toast.error("Error al actualizar la categoría");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-[var(--admin-text-hi)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--admin-accent)] border-t-transparent" />
          <p className="text-sm font-semibold tracking-wider uppercase">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[var(--admin-text-mid)]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bebas text-3xl tracking-wider text-[var(--admin-text-hi)] md:text-4xl">
            Gestión de Productos e Imágenes
          </h2>
          <p className="text-xs text-[var(--admin-text-lo)] mt-0.5">
            Administrá precios, imágenes SEO y visibilidad del catálogo en tiempo real
          </p>
        </div>
        <button
          onClick={handleSyncCategories}
          disabled={syncing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--admin-accent)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--admin-sidebar-bg)] transition-all hover:opacity-90 disabled:opacity-50 shadow-md"
        >
          {syncing ? "Sincronizando..." : "🔄 Sincronizar Categorías (Excel)"}
        </button>
      </div>

      {/* Stats Bar / Quick Filters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={() => {
            setStatusFilter("todos");
            setImageFilter("todos");
          }}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            statusFilter === "todos" && imageFilter === "todos"
              ? "border-[var(--admin-accent)] bg-[var(--admin-accent-glow)]/10 shadow-lg"
              : "border-[var(--admin-border)] bg-[var(--admin-card-bg)] hover:bg-[var(--admin-input-bg)]"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">Total Productos</span>
          <span className="font-bebas text-2xl text-[var(--admin-text-hi)] mt-0.5">{stats.total}</span>
        </button>

        <button
          onClick={() => {
            setStatusFilter("activos");
            setImageFilter("todos");
          }}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            statusFilter === "activos"
              ? "border-emerald-500 bg-emerald-500/10 shadow-lg"
              : "border-[var(--admin-border)] bg-[var(--admin-card-bg)] hover:bg-[var(--admin-input-bg)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Activos en Web</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <span className="font-bebas text-2xl text-[var(--admin-text-hi)] mt-0.5">{stats.activos}</span>
        </button>

        <button
          onClick={() => {
            setStatusFilter("ocultos");
            setImageFilter("todos");
          }}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            statusFilter === "ocultos"
              ? "border-red-500 bg-red-500/10 shadow-lg"
              : "border-[var(--admin-border)] bg-[var(--admin-card-bg)] hover:bg-[var(--admin-input-bg)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Ocultos / Desactivados</span>
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <span className="font-bebas text-2xl text-[var(--admin-text-hi)] mt-0.5">{stats.ocultos}</span>
        </button>

        <button
          onClick={() => {
            setImageFilter("sin_imagen");
            setSortBy("sin_imagen_primero");
          }}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            imageFilter === "sin_imagen"
              ? "border-amber-500 bg-amber-500/10 shadow-lg"
              : "border-[var(--admin-border)] bg-[var(--admin-card-bg)] hover:bg-[var(--admin-input-bg)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">⚠️ Sin Imagen</span>
            {stats.sinImagen > 0 && (
              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">FALTAN</span>
            )}
          </div>
          <span className="font-bebas text-2xl text-[var(--admin-text-hi)] mt-0.5">{stats.sinImagen}</span>
        </button>
      </div>

      {/* Barra de Auto-Completado Masivo de Imágenes ($0) */}
      {(stats.sinImagen > 0 || batchRunning) && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-sm space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <h3 className="text-sm font-bold text-[var(--admin-text-hi)]">
                  Auto-completar Imágenes Faltantes (Uruguay · Costo $0)
                </h3>
              </div>
              <p className="text-xs text-[var(--admin-text-lo)] mt-0.5">
                Busca por código EAN (Open Food Facts) y supermercados de Uruguay, descarga, comprime y guarda en tu Firebase Storage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!batchRunning ? (
                <>
                  <select
                    value={batchLimit}
                    onChange={(e) => setBatchLimit(Number(e.target.value))}
                    className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-xs font-bold text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none cursor-pointer"
                  >
                    <option value={10}>Lote de 10</option>
                    <option value={20}>Lote de 20</option>
                    <option value={50}>Lote de 50</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleBatchAutoFill}
                    disabled={uploadingItem !== null}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-black transition-all hover:bg-amber-400 disabled:opacity-50 shadow-md"
                  >
                    ✨ Completar Lote Automático
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    batchAbortRef.current = true;
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition-all hover:bg-red-600 shadow-md"
                >
                  ⏹ Detener Lote
                </button>
              )}
            </div>
          </div>

          {batchRunning && (
            <div className="space-y-2 pt-2 border-t border-amber-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate font-semibold text-[var(--admin-text-hi)] max-w-[70%]">
                  Procesando ({batchState.current}/{batchState.total}): {batchState.currentName}
                </span>
                <span className="font-mono text-[11px] font-bold text-amber-500 shrink-0">
                  ✅ {batchState.applied} · ⚠️ {batchState.failed}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--admin-bg)] border border-[var(--admin-border)]">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{
                    width: `${batchState.total > 0 ? Math.round((batchState.current / batchState.total) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Control Bar (Search, Filters & Sort) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por código o nombre de producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-4 py-3 pl-10 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
          />
          <span className="absolute left-3 top-3.5 text-sm text-[var(--admin-text-lo)]">🔍</span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3.5 text-xs text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2.5 text-xs text-[var(--admin-text-mid)] focus:border-[var(--admin-accent)] focus:outline-none cursor-pointer"
          >
            <option value="">Todas las Categorías</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat} className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">
                {cat}
              </option>
            ))}
          </select>

          {/* Estado de Visibilidad */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2.5 text-xs text-[var(--admin-text-mid)] focus:border-[var(--admin-accent)] focus:outline-none cursor-pointer"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activos">Solo Activos (En Web)</option>
            <option value="ocultos">Solo Ocultos (Desactivados)</option>
          </select>

          {/* Filtro de Imágenes */}
          <select
            value={imageFilter}
            onChange={(e) => setImageFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2.5 text-xs text-[var(--admin-text-mid)] focus:border-[var(--admin-accent)] focus:outline-none cursor-pointer"
          >
            <option value="todos">Todas las Imágenes</option>
            <option value="sin_imagen">⚠️ Solo Sin Imagen</option>
            <option value="con_imagen">🖼️ Solo Con Imagen</option>
          </select>

          {/* Ordenar Por */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2.5 text-xs font-semibold text-[var(--admin-accent)] focus:border-[var(--admin-accent)] focus:outline-none cursor-pointer"
          >
            <option value="sin_imagen_primero">⚠️ Sin Imagen Primero</option>
            <option value="nombre_asc">Nombre (A-Z)</option>
            <option value="codigo_asc">Código (Ascendente)</option>
            <option value="precio_asc">Precio (Menor a Mayor)</option>
            <option value="precio_desc">Precio (Mayor a Menor)</option>
          </select>
        </div>
      </div>

      {/* Header Resumen de Resultados */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
        <span className="text-xs font-medium text-[var(--admin-text-lo)]">
          Encontrados <strong className="text-[var(--admin-text-hi)]">{filtrados.length}</strong> productos
          {imageFilter === "sin_imagen" && " sin imagen"}
          {statusFilter !== "todos" && ` (${statusFilter})`}:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">Mostrar:</span>
          {[24, 48, 96].map((size) => (
            <button
              key={size}
              onClick={() => setItemsPerPage(size)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                itemsPerPage === size
                  ? "bg-[var(--admin-accent)] text-[var(--admin-sidebar-bg)] shadow-sm"
                  : "bg-[var(--admin-card-bg)] text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)] border border-[var(--admin-border)]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      {currentItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--admin-border)] p-12 text-center bg-[var(--admin-card-bg)]">
          <span className="text-4xl mb-2">🔍</span>
          <h3 className="font-bold text-[var(--admin-text-hi)] text-base">No se encontraron productos</h3>
          <p className="text-xs text-[var(--admin-text-lo)] max-w-sm mt-1">
            Probá cambiando los filtros o el término de búsqueda para ver más resultados.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("");
              setStatusFilter("todos");
              setImageFilter("todos");
            }}
            className="mt-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-4 py-2 text-xs font-bold text-[var(--admin-text-hi)] hover:border-[var(--admin-accent)] transition-all"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {currentItems.map((prod) => {
            const isOculto = prod.precio <= 0;
            const hasNoImage = !prod.imagen || prod.imagen.trim() === "";

            return (
              <div 
                key={prod.codigo} 
                className={`flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOculto 
                    ? "border-red-500/40 bg-red-950/10 dark:bg-red-950/20 shadow-sm opacity-85 hover:opacity-100" 
                    : hasNoImage
                    ? "border-amber-500/40 bg-[var(--admin-card-bg)] shadow-md hover:border-amber-500"
                    : "border-[var(--admin-border)] bg-[var(--admin-card-bg)] shadow-md hover:border-[var(--admin-accent)]/50"
                }`}
              >
                {/* Visual Header / Image Container */}
                <div className="relative flex h-44 items-center justify-center bg-[var(--admin-bg)]/40 overflow-hidden group">
                  {prod.imagen ? (
                    <Image 
                      src={prod.imagen} 
                      alt={prod.nombre} 
                      fill
                      className={`object-contain p-3 transition-transform duration-300 group-hover:scale-105 ${isOculto ? "grayscale opacity-60" : ""}`} 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 p-4 text-center">
                      <span className="text-3xl">📦</span>
                      <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-500 tracking-wider">
                        ⚠️ SIN IMAGEN
                      </span>
                    </div>
                  )}

                  {/* Top Status Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                    <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-1 text-[10px] font-mono font-bold text-[var(--admin-accent)] shadow-md border border-white/10">
                      {prod.codigo}
                    </span>
                    
                    {isOculto ? (
                      <span className="rounded-lg bg-red-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white shadow-lg flex items-center gap-1 border border-red-400/30 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                        OCULTO / DESACTIVADO
                      </span>
                    ) : (
                      <span className="rounded-lg bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white shadow-lg flex items-center gap-1 border border-emerald-400/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                        ACTIVO EN WEB
                      </span>
                    )}
                  </div>

                  {/* Upload Progress Overlay */}
                  {uploadingItem === prod.codigo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm z-20">
                      <div className="text-center p-4">
                        <div className="mb-2 h-2.5 w-32 overflow-hidden rounded-full bg-white/20">
                          <div className="h-full bg-[var(--admin-accent)] transition-all duration-150" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-white tracking-widest">{Math.round(progress)}% Subiendo</span>
                      </div>
                    </div>
                  )}

                  {/* Quick Drag/Click Overlay trigger if no image */}
                  {hasNoImage && !uploadingItem && (
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity cursor-pointer z-10">
                      <span className="rounded-xl bg-[var(--admin-accent)] px-3 py-1.5 text-xs font-bold text-[var(--admin-sidebar-bg)] shadow-lg">
                        📸 Cargar Imagen Rápidamente
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleUploadImage(prod.codigo, e.target.files[0]);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
                
                {/* Card Details */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <select
                      value={prod.categoria}
                      onChange={(e) => handleUpdateCategory(prod.codigo, e.target.value)}
                      className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-mid)] focus:border-[var(--admin-accent)] focus:outline-none transition-colors cursor-pointer"
                    >
                      {CATEGORIAS.map((cat) => (
                        <option key={cat} value={cat} className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h3 className={`mb-3 flex-1 text-sm font-semibold line-clamp-2 ${isOculto ? "text-[var(--admin-text-lo)] line-through" : "text-[var(--admin-text-hi)]"}`}>
                    {prod.nombre}
                  </h3>
                  
                  {/* Controls: Price & Quick Toggle */}
                  <div className="mt-auto space-y-3 pt-2 border-t border-[var(--admin-border)]/60">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase tracking-wider">
                        Precio Unitario
                      </label>
                      <button
                        onClick={() => handleToggleStatus(prod)}
                        disabled={togglingStatus === prod.codigo}
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded transition-all ${
                          isOculto 
                            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white" 
                            : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                        }`}
                      >
                        {togglingStatus === prod.codigo 
                          ? "Cambiando..." 
                          : isOculto 
                          ? "⚡ Activar en Web" 
                          : "🚫 Ocultar de Web"}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--admin-text-lo)]">$</span>
                        <input
                          type="number"
                          value={editingPrice?.codigo === prod.codigo ? editingPrice.value : prod.precio}
                          onChange={(e) => setEditingPrice({ codigo: prod.codigo, value: e.target.value })}
                          onFocus={() => {
                            if (editingPrice?.codigo !== prod.codigo) {
                              setEditingPrice({ codigo: prod.codigo, value: prod.precio.toString() });
                            }
                          }}
                          className={`w-full rounded-xl border bg-[var(--admin-bg)] py-2 pl-6 pr-2 text-sm font-bold focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] ${
                            isOculto 
                              ? "border-red-500/30 text-red-400" 
                              : "border-[var(--admin-border)] text-[var(--admin-text-hi)]"
                          }`}
                        />
                      </div>

                      {editingPrice?.codigo === prod.codigo && (
                        <button
                          onClick={() => handleUpdatePrice(prod.codigo)}
                          disabled={savingPrice === prod.codigo}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-accent)] text-[var(--admin-sidebar-bg)] font-bold transition-all hover:opacity-90 disabled:opacity-50 shadow-md"
                          title="Guardar precio"
                        >
                          {savingPrice === prod.codigo ? "..." : "✅"}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openImagePicker(prod)}
                        disabled={batchRunning || uploadingItem === prod.codigo}
                        className={`flex-1 rounded-xl border px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 ${
                          hasNoImage
                            ? "bg-amber-500 text-black border-transparent hover:bg-amber-400 shadow-md"
                            : "bg-[var(--admin-input-bg)] border-[var(--admin-border)] text-[var(--admin-text-hi)] hover:border-amber-500"
                        }`}
                      >
                        ✨ Buscar Foto
                      </button>

                      <label className={`cursor-pointer flex-1 text-center rounded-xl border px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                        hasNoImage
                          ? "bg-[var(--admin-accent)] text-[var(--admin-sidebar-bg)] border-transparent hover:opacity-95 shadow-md"
                          : "bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text-mid)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)]"
                      }`}>
                        {hasNoImage ? "📸 Subir PC" : "🔄 Subir PC"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleUploadImage(prod.codigo, e.target.files[0]);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 sm:flex-row">
          <span className="text-xs text-[var(--admin-text-lo)] font-medium">
            Página <strong className="text-[var(--admin-text-hi)]">{currentPage}</strong> de <strong className="text-[var(--admin-text-hi)]">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-1.5 text-xs font-bold text-[var(--admin-text-mid)] hover:text-[var(--admin-text-hi)] disabled:opacity-40 transition-all"
            >
              « Primera
            </button>

            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-1.5 text-xs font-bold text-[var(--admin-text-mid)] hover:text-[var(--admin-text-hi)] disabled:opacity-40 transition-all"
            >
              ‹ Anterior
            </button>

            <span className="px-2 text-xs font-mono font-bold text-[var(--admin-accent)]">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-1.5 text-xs font-bold text-[var(--admin-text-mid)] hover:text-[var(--admin-text-hi)] disabled:opacity-40 transition-all"
            >
              Siguiente ›
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-1.5 text-xs font-bold text-[var(--admin-text-mid)] hover:text-[var(--admin-text-hi)] disabled:opacity-40 transition-all"
            >
              Última »
            </button>
          </div>
        </div>
      )}
      {/* Modal Selector Rápido de Imágenes ($0) */}
      {pickerProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!applyingCandidateUrl) setPickerProduct(null);
          }}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg)] px-5 py-4">
              <div className="min-w-0">
                <span className="font-mono text-[10px] font-bold text-[var(--admin-accent)]">
                  SKU: {pickerProduct.codigo}
                </span>
                <h3 className="truncate text-base font-bold text-[var(--admin-text-hi)]">
                  {pickerProduct.nombre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPickerProduct(null)}
                disabled={Boolean(applyingCandidateUrl)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-sm text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)] disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            {/* Search bar inside modal */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                searchPickerImages(pickerProduct, pickerQuery);
              }}
              className="flex gap-2 border-b border-[var(--admin-border)] p-4"
            >
              <input
                type="text"
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Editá el texto si el nombre del Excel está muy abreviado..."
                className="flex-1 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3.5 py-2 text-sm text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={pickerLoading || Boolean(applyingCandidateUrl)}
                className="rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[var(--admin-sidebar-bg)] hover:opacity-90 disabled:opacity-50"
              >
                {pickerLoading ? "Buscando..." : "🔍 Buscar"}
              </button>
            </form>

            {/* Modal Body: Candidates Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {pickerLoading ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                  <p className="text-xs font-semibold text-[var(--admin-text-lo)]">
                    Buscando fotos en Open Food Facts y tiendas de Uruguay...
                  </p>
                </div>
              ) : pickerError && pickerCandidates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--admin-border)] p-10 text-center">
                  <p className="text-sm font-semibold text-[var(--admin-text-hi)]">{pickerError}</p>
                  <p className="mt-1 text-xs text-[var(--admin-text-lo)]">
                    Tip: Probá dejar solo la marca y el producto (ej. &quot;Yerba Canarias 1kg&quot;).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {pickerCandidates.map((cand) => {
                    const isApplying = applyingCandidateUrl === cand.url;
                    const previewSrc = `/api/admin/image-proxy?url=${encodeURIComponent(
                      cand.thumbUrl || cand.url
                    )}`;
                    return (
                      <button
                        key={cand.url}
                        type="button"
                        onClick={() => applyCandidateToProduct(cand)}
                        disabled={Boolean(applyingCandidateUrl)}
                        className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-left transition-all hover:border-amber-500 hover:shadow-lg disabled:opacity-60"
                      >
                        <div className="relative flex h-36 w-full items-center justify-center bg-white p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewSrc}
                            alt={cand.title || pickerProduct.nombre}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                          />
                          {isApplying && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-white gap-1">
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                              <span className="text-[10px] font-bold">Guardando...</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 p-2">
                          <span
                            className={`inline-flex w-max rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                              cand.confidence === "exact_ean"
                                ? "bg-emerald-500/20 text-emerald-500"
                                : cand.confidence === "uruguay_store"
                                ? "bg-sky-500/20 text-sky-400"
                                : "bg-[var(--admin-input-bg)] text-[var(--admin-text-lo)]"
                            }`}
                          >
                            {cand.confidence === "exact_ean"
                              ? "✅ EAN Exacto"
                              : cand.confidence === "uruguay_store"
                              ? "🇺🇾 Tienda UY"
                              : "🌐 Web"}
                          </span>
                          <span className="truncate text-[10px] text-[var(--admin-text-lo)]">
                            {cand.domain}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--admin-border)] bg-[var(--admin-bg)] px-5 py-3 text-[11px] text-[var(--admin-text-lo)]">
              <span>Hacé clic en una foto para descargarla, comprimirla y aplicarla en 1 paso.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
