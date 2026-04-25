"use client";

import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/lib/toast-context";

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
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

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
    setFiltrados(
      productos.filter((p) => p.nombre.toLowerCase().includes(s) || p.codigo.toLowerCase().includes(s))
    );
  }, [search, productos]);

  const handleUploadImage = (codigo: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    setUploadingItem(codigo);
    setProgress(0);

    const ext = file.name.split('.').pop() || 'jpg';
    const storageRef = ref(storage, `productos/${codigo}.${ext}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

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
          toast.success("Imagen actualizada");
        } catch (e) {
          toast.error("Error al guardar URL");
        } finally {
          setUploadingItem(null);
        }
      }
    );
  };

  if (loading) {
    return <div className="p-8 text-white">Cargando catálogo...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bebas text-3xl tracking-wider text-white">Gestión de Imágenes</h2>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#0A0F1C] px-4 py-3 pl-10 text-white placeholder-gray-500 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
        />
        <span className="absolute left-3 top-3 text-gray-400">🔍</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtrados.slice(0, 50).map((prod) => (
          <div key={prod.codigo} className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0A0F1C] shadow-lg">
            <div className="relative flex h-40 items-center justify-center bg-white/5">
              {prod.imagen ? (
                <img src={prod.imagen} alt={prod.nombre} className="h-full w-full object-contain p-2" />
              ) : (
                <span className="text-4xl">📦</span>
              )}
              {uploadingItem === prod.codigo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-center">
                    <div className="mb-2 h-2 w-24 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full bg-[#00E5FF] transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-1 text-xs font-mono text-[#00E5FF]">{prod.codigo}</div>
              <h3 className="mb-2 flex-1 text-sm font-semibold text-white line-clamp-2">{prod.nombre}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{prod.categoria}</span>
                <label className="cursor-pointer rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#00E5FF] hover:text-black">
                  {prod.imagen ? "Cambiar" : "Subir Imagen"}
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
        <p className="text-center text-sm text-gray-400">Mostrando los primeros 50 resultados. Usá el buscador para encontrar más.</p>
      )}
    </div>
  );
}
