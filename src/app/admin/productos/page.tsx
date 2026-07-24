// filepath: src/app/admin/productos/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/lib/toast-context";
import imageCompression from 'browser-image-compression';
import Image from "next/image";
import categoriaMapping from "@/lib/categoria_mapping.json";
import { CATEGORIAS } from "@/types";

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

  const handleUploadImage = async (codigo: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
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
      const ext = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${slugify(productName)}-${codigo}.${ext}`;
      const storageRef = ref(storage, `productos/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
          toast.error("Error al subir la imagen");
          setUploadingItem(null);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateDoc(doc(db, "catalogo_activo", "productos"), {
              [`items.${codigo}.imagen`]: downloadURL
            });
            
            setProductos(prev => prev.map(p => p.codigo === codigo ? { ...p, imagen: downloadURL } : p));
            toast.success("Imagen SEO optimizada cargada");
          } catch (e) {
            toast.error("Error al guardar URL");
          } finally {
            setUploadingItem(null);
          }
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Error al comprimir la imagen");
      setUploadingItem(null);
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

                    <div className="flex items-center justify-between pt-1">
                      <label className={`cursor-pointer w-full text-center rounded-xl border px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                        hasNoImage
                          ? "bg-[var(--admin-accent)] text-[var(--admin-sidebar-bg)] border-transparent hover:opacity-95 shadow-md animate-pulse"
                          : "bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text-mid)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)]"
                      }`}>
                        {hasNoImage ? "📸 Subir Imagen Faltante" : "🔄 Cambiar Imagen"}
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
    </div>
  );
}
