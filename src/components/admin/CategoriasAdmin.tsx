// filepath: src/components/admin/CategoriasAdmin.tsx
"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/lib/toast-context";
import imageCompression from 'browser-image-compression';
import Image from "next/image";
import { CATEGORIAS } from "@/types";

export default function CategoriasAdmin() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "configuracion", "categorias"));
        if (snap.exists()) {
          setConfig(snap.data());
        }
      } catch (e) {
        console.error(e);
        toast.error("Error al cargar configuración de categorías");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

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

  const handleUpload = async (cat: string, file: File) => {
    setUploading(cat);
    setProgress(0);

    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 600,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      const ext = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${slugify(cat)}.${ext}`;
      const storageRef = ref(storage, `categorias/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on("state_changed", 
        (snapshot) => {
          setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          toast.error("Error al subir");
          setUploading(null);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const newConfig = { ...config, [cat]: url };
          
          await setDoc(doc(db, "configuracion", "categorias"), newConfig, { merge: true });
          setConfig(newConfig);
          toast.success(`Imagen de ${cat} actualizada`);
          setUploading(null);
        }
      );
    } catch (e) {
      console.error(e);
      toast.error("Error al procesar imagen");
      setUploading(null);
    }
  };

  if (loading) return <div className="text-[var(--admin-text-hi)] p-8">Cargando categorías...</div>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-[var(--admin-text-mid)]">
      {CATEGORIAS.map((cat) => (
        <div key={cat} className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] shadow-xl">
          <div className="relative aspect-video bg-[var(--admin-bg)] flex items-center justify-center border-b border-[var(--admin-border)]">
            {config[cat] ? (
              <Image src={config[cat]} alt={cat} fill className="object-cover" />
            ) : (
              <div className="text-4xl opacity-20">🖼️</div>
            )}
            
            {uploading === cat && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <div className="w-2/3">
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--admin-accent)] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[10px] text-[var(--admin-accent)] font-bold mt-2 text-center uppercase tracking-widest">
                    Subiendo {Math.round(progress)}%
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="text-xs font-bold text-[var(--admin-text-lo)] uppercase tracking-widest mb-4">{cat}</h3>
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--admin-bg)] py-2.5 text-xs font-bold text-[var(--admin-text-hi)] transition-all hover:bg-[var(--admin-input-bg)] active:scale-95 border border-[var(--admin-border)]">
              <span>{config[cat] ? "Cambiar Imagen" : "Subir Imagen"}</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => e.target.files?.[0] && handleUpload(cat, e.target.files[0])}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
