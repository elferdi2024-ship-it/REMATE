// filepath: src/components/admin/PreciosUploader.tsx
"use client";

import { useState, useRef } from "react";
import { type WorkBook } from "xlsx";
import * as XLSX from "xlsx";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import categoryData from "@/lib/categoria_mapping.json";

const RAW_MAPPING = categoryData as unknown as Record<string, string>;
// Normalizar mapping para búsqueda rápida e insensible a espacios/casos
const CATEGORY_MAPPING: Record<string, string> = {};
Object.entries(RAW_MAPPING).forEach(([code, cat]) => {
  CATEGORY_MAPPING[code.trim()] = cat.trim().toUpperCase();
});

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
    const cleanCode = codigo.trim();
    if (CATEGORY_MAPPING[cleanCode]) {
      return CATEGORY_MAPPING[cleanCode];
    }

    // 2. Fallback: Palabras clave por nombre
    const n = nombre.toLowerCase();
    for (const [cat, kws] of Object.entries(KEYWORDS)) {
      if (kws.some((k) => n.includes(k))) return cat;
    }
    return "OTROS";
  }

  function cleanString(str: string): string {
    return str.replace(/^[\s\u00A0]+|[\s\u00A0]+$/g, "").trim();
  }

  function cleanCode(str: string): string {
    return str.replace(/[\s\u00A0]+/g, "");
  }

  function parseWorkbook(workbook: WorkBook): ProductRow[] {
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const products: ProductRow[] = [];

    // Determinar formato del Excel analizando las primeras filas con datos
    let isCompactFormat = false;
    let startRow = 1;

    // Buscamos una fila representativa (no vacía) para analizar la estructura
    for (let i = 0; i < Math.min(10, rows.length); i++) {
      const row = rows[i];
      if (row && row.length >= 3) {
        const valCol0 = String(row[0] ?? "");
        const valCol1 = String(row[1] ?? "");
        const valCol2 = String(row[2] ?? "");
        
        const price2 = parseFloat(valCol2.replace(/[\s\u00A0]+/g, "").replace(",", "."));
        // Si la columna 2 es un número válido y la columna 0 y 1 tienen texto, es formato compacto
        if (cleanCode(valCol0) && cleanString(valCol1) && !isNaN(price2)) {
          isCompactFormat = true;
          // Si la fila 0 ya tiene un producto válido, empezamos desde la fila 0
          if (i === 0) {
            startRow = 0;
          }
          break;
        }
      }
    }

    console.log(`[Excel Parser] Detectado formato: ${isCompactFormat ? "Compacto (3 columnas)" : "Clásico (7 columnas)"}. Fila de inicio: ${startRow}`);

    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 3) continue;

      let codigo = "";
      let nombre = "";
      let precio = NaN;

      if (isCompactFormat) {
        codigo = cleanCode(String(row[0] ?? ""));
        nombre = cleanString(String(row[1] ?? "")).toUpperCase();
        const rawPrecio = String(row[2] ?? "").replace(/[\s\u00A0]+/g, "").replace(",", ".");
        precio = parseFloat(rawPrecio);
      } else {
        if (row.length < 6) continue;
        codigo = cleanCode(String(row[0] ?? ""));
        nombre = cleanString(String(row[2] ?? "")).toUpperCase();
        const rawPrecio = String(row[5] ?? "").replace(/[\s\u00A0]+/g, "").replace(",", ".");
        precio = parseFloat(rawPrecio);
      }

      if (!nombre || isNaN(precio) || !codigo) continue;

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
        const currentProd = currentData[codigo];
        
        let precioFinal = parsed[i].precio;
        if (currentProd && currentProd.precio <= 0) {
          // Si ya estaba desactivado (precio <= 0), no activarlo (mantener su precio actual)
          precioFinal = currentProd.precio;
        }

        catalogoActivo[codigo] = {
          ...parsed[i],
          precio: precioFinal,
          ...(currentProd?.imagen ? { imagen: currentProd.imagen } : {})
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
    <div className="space-y-6 text-[var(--admin-text-mid)]">
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
              ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10 shadow-[0_0_30px_var(--admin-accent-glow)]"
              : "border-[var(--admin-border)] bg-[var(--admin-card-bg)] hover:border-[var(--admin-accent)]/50 hover:bg-[var(--admin-input-bg)]"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--admin-accent)]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="mb-6 rounded-2xl bg-[var(--admin-bg)] border border-[var(--admin-border)] p-4 text-5xl shadow-xl transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">
              📊
            </span>
            <h3 className="text-xl font-bold text-[var(--admin-text-hi)]">Arrastrá el archivo aquí</h3>
            <p className="mt-2 text-sm text-[var(--admin-text-lo)]">o hacé click para explorar tus carpetas</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
        </div>
      )}

      {file && !success && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-2xl text-green-500">
              📄
            </div>
            <div>
              <p className="font-semibold text-[var(--admin-text-hi)]">{file.name}</p>
              <p className="text-sm text-[var(--admin-text-lo)]">{parsed.length} productos detectados listos para importar</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setParsed([]);
              setPreview([]);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--admin-bg)] text-[var(--admin-text-lo)] transition-colors hover:bg-red-500/20 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-medium text-red-500">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-[var(--admin-accent)]/20 bg-[var(--admin-accent)]/10 p-6 text-center shadow-[0_0_30px_var(--admin-accent-glow)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--admin-accent)] text-3xl text-[var(--admin-sidebar-bg)] shadow-lg font-bold">
            ✓
          </div>
          <h3 className="font-bebas text-3xl tracking-wide text-[var(--admin-text-hi)]">Catálogo Actualizado</h3>
          <p className="text-[var(--admin-accent)] font-medium mt-1">Los productos se sincronizaron con éxito.</p>
        </div>
      )}

      {preview.length > 0 && !success && (
        <div className="animate-in slide-in-from-bottom-4 overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] shadow-xl">
          <div className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)] px-6 py-4">
            <h3 className="font-bold text-[var(--admin-text-hi)]">Vista Previa</h3>
            <p className="text-xs text-[var(--admin-text-lo)]">Mostrando los primeros {preview.length} resultados</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-lo)]">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {preview.map((p) => (
                  <tr key={p.codigo} className="transition-colors hover:bg-[var(--admin-input-bg)]/40 text-[var(--admin-text-mid)]">
                    <td className="px-6 py-3 font-mono text-xs text-[var(--admin-accent)]">{p.codigo}</td>
                    <td className="px-6 py-3 font-medium text-[var(--admin-text-hi)]">{p.nombre}</td>
                    <td className="px-6 py-3 text-[var(--admin-text-lo)]">
                      <span className="inline-flex rounded-md bg-[var(--admin-bg)] border border-[var(--admin-border)] px-2 py-1 text-xs">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-[var(--admin-text-hi)]">
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
        <div className="rounded-2xl border border-[var(--admin-accent)]/20 bg-[var(--admin-accent)]/5 p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-[var(--admin-text-hi)]">Actualizando Base de Datos...</span>
            <span className="font-bold text-[var(--admin-accent)]">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--admin-bg)] border border-[var(--admin-border)]">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-[var(--admin-accent)] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {parsed.length > 0 && !uploading && !success && (
        <button
          onClick={handleConfirm}
          className="group relative w-full overflow-hidden rounded-xl bg-[var(--admin-accent)] p-[1px] font-bold uppercase tracking-widest text-[var(--admin-sidebar-bg)] transition-transform hover:scale-[1.02] active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--admin-accent)] via-blue-500 to-[var(--admin-accent)] opacity-100 transition-opacity duration-300 group-hover:opacity-80" />
          <div className="relative flex items-center justify-center gap-2 bg-[var(--admin-accent)] text-[var(--admin-sidebar-bg)] px-8 py-4 text-sm font-black tracking-widest">
            Confirmar Importación <span>→</span>
          </div>
        </button>
      )}
    </div>
  );
}
