"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { type WorkBook } from "xlsx";
import * as XLSX from "xlsx";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import categoryData from "@/lib/categoria_mapping.json";

const CATEGORY_MAPPING = categoryData.mapping as Record<string, string>;

interface ProductRow {
  codigo: string;
  nombre: string;
  precio: number;
  categoria: string;
}

export default function PreciosUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ProductRow[]>([]);
  const [parsed, setParsed] = useState<ProductRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const KEYWORDS: Record<string, string[]> = {
    "ACEITES Y GRASAS": ["aceite", "grasa", "manteca"],
    "BEBIDAS ALCOHÓLICAS": ["cerveza", "vino", "fernet", "whisky", "sidra", "espumante"],
    "BEBIDAS SIN ALCOHOL": ["agua", "jugo", "gaseosa", "refresco", "pepsi", "coca", "sprite"],
    "CARNES Y EMBUTIDOS": ["jamon", "bondiola", "salchicha", "pancho", "chorizo", "morcilla", "fiambre", "carne", "arrollado", "mortadela"],
    "CONSERVAS Y ENLATADOS": ["atun", "sardina", "choclo", "arveja", "poroto", "lenteja", "garbanzo", "lomito", "grated"],
    "GOLOSINAS Y SNACKS": ["alfajor", "caramelo", "chocolate", "gomita", "chicle", "papas", "lay", "snack"],
    "HARINAS, PASTAS Y CEREALES": ["harina", "fideo", "arroz", "pasta", "polenta", "avena", "cereal", "copos"],
    "HIGIENE PERSONAL": ["jabon", "shampoo", "shampu", "dental", "afeitar", "desodorante", "pañal", "toallita"],
    "LÁCTEOS Y HUEVOS": ["leche", "queso", "yogur", "crema", "manteca", "huevo", "ricota", "muzzarel", "conaprole"],
    "LIMPIEZA DEL HOGAR": ["lavandina", "detergente", "limpiador", "suavizante", "jabon polvo", "desinfectante"],
    "PANADERÍA Y REPOSTERÍA": ["pan ", "tostada", "galleta", "bizcocho", "budin", "reposteria"],
    "YERBA, TÉ Y CAFÉ": ["yerba", "te ", "cafe", "nescafe", "bracafe"],
  };

  function categorizar(codigo: string, nombre: string): string {
    // 1. Prioridad: Mapping exacto por código del Excel
    if (CATEGORY_MAPPING[codigo]) {
      return CATEGORY_MAPPING[codigo];
    }

    // 2. Fallback: Palabras clave por nombre
    const n = nombre.toLowerCase();
    for (const [cat, kws] of Object.entries(KEYWORDS)) {
      if (kws.some((k) => n.includes(k))) return cat;
    }
    return "OTROS";
  }

  function parseWorkbook(workbook: WorkBook): ProductRow[] {
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const products: ProductRow[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 6) continue;
      const codigo = String(row[0] ?? "").trim();
      const nombre = String(row[2] ?? "").trim().toUpperCase();
      const precio = parseFloat(String(row[5] ?? ""));
      if (!nombre || isNaN(precio)) continue;
      products.push({
        codigo,
        nombre,
        precio,
        categoria: categorizar(codigo, nombre),
      });
    }
    return products;
  }

  function handleFile(fileObj: File) {
    setFile(fileObj);
    setError(null);
    setSuccess(false);
    setPreview([]);
    setParsed([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const products = parseWorkbook(workbook);

        if (products.length === 0) {
          setError("No se encontraron productos válidos en el archivo.");
          return;
        }

        setParsed(products);
        setPreview(products.slice(0, 10));
      } catch {
        setError("Error al leer el archivo. Verificá que sea un .xlsx válido.");
      }
    };
    reader.readAsArrayBuffer(fileObj);
  }

  async function handleConfirm() {
    if (parsed.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
      const currentData = snap.exists() ? snap.data().items || {} : {};

      const batchSize = 50;
      const catalogoActivo: Record<string, ProductRow & { imagen?: string }> = {};
      for (let i = 0; i < parsed.length; i++) {
        const codigo = parsed[i].codigo;
        catalogoActivo[codigo] = {
          ...parsed[i],
          ...(currentData[codigo]?.imagen ? { imagen: currentData[codigo].imagen } : {})
        };
        if ((i + 1) % batchSize === 0) {
          setUploadProgress(Math.round(((i + 1) / parsed.length) * 100));
          await new Promise((r) => setTimeout(r, 10));
        }
      }
      setUploadProgress(100);
      await setDoc(doc(db, "catalogo_activo", "productos"), {
        items: catalogoActivo,
        actualizadoEn: new Date().toISOString(),
        totalProductos: parsed.length,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        setPreview([]);
        setParsed([]);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 3000);
    } catch {
      setError("Error al actualizar los precios en la base de datos.");
    } finally {
      setUploading(false);
    }
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });
  }

  return (
    <div className="space-y-6">
      {!file && (
        <div
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))) {
              handleFile(droppedFile);
            } else {
              setError("Solo se aceptan archivos .xlsx o .xls");
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-20 transition-all duration-300 ${
            isDragOver
              ? "border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_30px_rgba(0,229,255,0.1)]"
              : "border-white/20 bg-[#0A0F1C] hover:border-[#00E5FF]/50 hover:bg-white/5"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00E5FF]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="mb-6 rounded-2xl bg-white/5 p-4 text-5xl shadow-xl transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">
              📊
            </span>
            <h3 className="text-xl font-bold text-white">Arrastrá el archivo aquí</h3>
            <p className="mt-2 text-sm text-gray-400">o hacé click para explorar tus carpetas</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
        </div>
      )}

      {file && !success && (
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0A0F1C] p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-2xl text-green-400">
              📄
            </div>
            <div>
              <p className="font-semibold text-white">{file.name}</p>
              <p className="text-sm text-gray-400">{parsed.length} productos detectados listos para importar</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setParsed([]);
              setPreview([]);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-medium text-red-400">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-6 text-center shadow-[0_0_30px_rgba(0,229,255,0.1)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00E5FF] text-3xl text-black shadow-lg">
            ✓
          </div>
          <h3 className="font-bebas text-3xl tracking-wide text-white">Catálogo Actualizado</h3>
          <p className="text-[#00E5FF] font-medium mt-1">Los productos se sincronizaron con éxito.</p>
        </div>
      )}

      {preview.length > 0 && !success && (
        <div className="animate-in slide-in-from-bottom-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0F1C] shadow-xl">
          <div className="border-b border-white/10 bg-white/5 px-6 py-4">
            <h3 className="font-bold text-white">Vista Previa</h3>
            <p className="text-xs text-gray-400">Mostrando los primeros {preview.length} resultados</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {preview.map((p) => (
                  <tr key={p.codigo} className="transition-colors hover:bg-white/5">
                    <td className="px-6 py-3 font-mono text-xs text-[#00E5FF]">{p.codigo}</td>
                    <td className="px-6 py-3 font-medium text-gray-200">{p.nombre}</td>
                    <td className="px-6 py-3 text-gray-400">
                      <span className="inline-flex rounded-md bg-white/5 px-2 py-1 text-xs">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-white">
                      {formatCurrency(p.precio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {uploading && (
        <div className="rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/5 p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-white">Actualizando Base de Datos...</span>
            <span className="font-bold text-[#00E5FF]">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-[#00E5FF] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {parsed.length > 0 && !uploading && !success && (
        <button
          onClick={handleConfirm}
          className="group relative w-full overflow-hidden rounded-xl bg-white p-[1px] font-bold uppercase tracking-widest text-black transition-transform hover:scale-[1.02] active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] via-blue-500 to-[#00E5FF] opacity-100 transition-opacity duration-300 group-hover:opacity-80" />
          <div className="relative flex items-center justify-center gap-2 bg-white px-8 py-4 text-sm transition-colors group-hover:bg-transparent group-hover:text-white">
            Confirmar Importación <span>→</span>
          </div>
        </button>
      )}
    </div>
  );
}
