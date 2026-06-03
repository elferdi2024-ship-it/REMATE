// filepath: src/app/admin/productos/page.tsx
"use client";

import { useState, useEffect } from "react";
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
  const [filtrados, setFiltrados] = useState<ProductoRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);
  
  // Estado para edición de precio individual
  const [editingPrice, setEditingPrice] = useState<{ codigo: string, value: string } | null>(null);
  const [savingPrice, setSavingPrice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
        if (snap.exists()) {
          const data = snap.data();
          const items = data.items || {};
          const arr = Object.values(items) as ProductoRow[];
          setProductos(arr);
          setFiltrados(arr);
        }
      } catch (e) {
        toast.error("Error cargando productos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  useEffect(() => {
    const s = search.toLowerCase();
    let res = productos.filter((p) => p.nombre.toLowerCase().includes(s) || p.codigo.toLowerCase().includes(s));
    
    if (selectedCategory) {
      res = res.filter((p) => p.categoria === selectedCategory);
    }
    
    if (statusFilter === "activos") {
      res = res.filter((p) => p.precio > 0);
    } else if (statusFilter === "ocultos") {
      res = res.filter((p) => p.precio <= 0);
    }
    
    setFiltrados(res);
  }, [search, productos, selectedCategory, statusFilter]);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
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
      
      // Opciones de compresión: max 800x800, max 1MB
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      const ext = compressedFile.name.split('.').pop() || 'jpg';
      
      // SEO: Nombre amigable (slug) + codigo para evitar duplicados
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
            // Actualizar Firestore
            await updateDoc(doc(db, "catalogo_activo", "productos"), {
              [`items.${codigo}.imagen`]: downloadURL
            });
            
            // Actualizar estado local
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
    return <div className="p-8 text-[var(--admin-text-hi)]">Cargando catálogo...</div>;
  }

  return (
    <div className="space-y-6 text-[var(--admin-text-mid)]">
      <div className="flex items-center justify-between">
        <h2 className="font-bebas text-3xl tracking-wider text-[var(--admin-text-hi)]">Gestión de Productos</h2>
        <button
          onClick={handleSyncCategories}
          disabled={syncing}
          className="rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-bold text-[var(--admin-sidebar-bg)] transition-all hover:opacity-95 disabled:opacity-50"
        >
          {syncing ? "Sincronizando..." : "🔄 Sincronizar Categorías (Excel)"}
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-4 py-3 pl-10 text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all"
          />
          <span className="absolute left-3 top-3.5 text-[var(--admin-text-lo)]">🔍</span>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-4 py-3 text-sm text-[var(--admin-text-mid)] focus:border-[var(--admin-accent)] focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">Todas las Categorías</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat} className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-4 py-3 text-sm text-[var(--admin-text-mid)] focus:border-[var(--admin-accent)] focus:outline-none transition-colors cursor-pointer"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activos">Solo Activos (En Web)</option>
            <option value="ocultos">Solo Ocultos (Fuera de Web)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtrados.slice(0, 50).map((prod) => (
          <div key={prod.codigo} className="flex flex-col overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] shadow-lg">
            <div className="relative flex h-40 items-center justify-center bg-[var(--admin-bg)]/20 overflow-hidden">
              {prod.imagen ? (
                <Image 
                  src={prod.imagen} 
                  alt={prod.nombre} 
                  fill
                  className="object-contain p-2" 
                />
              ) : (
                <span className="text-4xl">📦</span>
              )}
              {prod.precio <= 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <span className="rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-bold text-white shadow-lg">OCULTO EN WEB</span>
                </div>
              )}
              {uploadingItem === prod.codigo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-center">
                    <div className="mb-2 h-2 w-24 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full bg-[var(--admin-accent)] transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-[var(--admin-accent)]">{prod.codigo}</span>
                <select
                  value={prod.categoria}
                  onChange={(e) => handleUpdateCategory(prod.codigo, e.target.value)}
                  className="rounded border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--admin-text-mid)] focus:border-[var(--admin-accent)] focus:outline-none transition-colors"
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat} className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <h3 className="mb-3 flex-1 text-sm font-semibold text-[var(--admin-text-hi)] line-clamp-2">{prod.nombre}</h3>
              
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase tracking-wider">Precio Individual</label>
                  {prod.precio <= 0 && <span className="text-[9px] font-bold text-red-500 italic">Poner {">"} 0 para mostrar</span>}
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
                      className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] py-1.5 pl-6 pr-2 text-sm font-bold text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                    />
                  </div>
                  {editingPrice?.codigo === prod.codigo && (
                    <button
                      onClick={() => handleUpdatePrice(prod.codigo)}
                      disabled={savingPrice === prod.codigo}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--admin-accent)] text-[var(--admin-sidebar-bg)] transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {savingPrice === prod.codigo ? "..." : "✅"}
                    </button>
                  )}
                  {prod.precio > 0 ? (
                    <button
                      onClick={() => {
                        if (confirm(`¿Ocultar "${prod.nombre}" de la web? (Se pondrá el precio en $0)`)) {
                          setEditingPrice({ codigo: prod.codigo, value: "0" });
                          setTimeout(() => handleUpdatePrice(prod.codigo), 0);
                        }
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                      title="Ocultar de la web"
                    >
                      🚫
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const val = prompt("Ingresa el precio para mostrar el producto:", "1");
                        if (val && !isNaN(parseFloat(val))) {
                          setEditingPrice({ codigo: prod.codigo, value: val });
                          setTimeout(() => handleUpdatePrice(prod.codigo), 0);
                        }
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
                      title="Mostrar en la web"
                    >
                      👁️
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end border-t border-[var(--admin-border)] pt-3">
                <label className="cursor-pointer rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)] transition-colors hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)]">
                  {prod.imagen ? "Cambiar Imagen" : "Subir Imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleUploadImage(prod.codigo, e.target.files[0]);
                      }
                      e.target.value = ''; // reset
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtrados.length > 50 && (
        <p className="text-center text-sm text-[var(--admin-text-lo)]">Mostrando los primeros 50 resultados. Usá el buscador para encontrar más.</p>
      )}
    </div>
  );
}
