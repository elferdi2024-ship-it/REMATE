"use client";

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
import { type WorkBook } from "xlsx";
import * as XLSX from "xlsx";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface ProductRow {
  codigo: string;
  nombre: string;
  precio: number;
  categoria: string;
}

interface PreciosUploaderProps {
  onSuccess?: () => void;
}

export default function PreciosUploader({ onSuccess }: PreciosUploaderProps) {
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
    "Aceites y Aderezos": ["aceite", "aceituna", "aderezo", "mayonesa", "ketchup", "mostaza", "barbacoa", "vinagre", "salsa"],
    "Bebidas": ["agua", "jugo", "gaseosa", "cerveza", "vino", "refresco", "bebida", "sidra", "fernet", "whisky", "sprite", "pepsi", "coca"],
    "Caf\u00E9, T\u00E9 y Yerba": ["cafe", "te ", "yerba", "bracafe", "nescafe"],
    "Cereales y Granola": ["avena", "copos", "granola", "cereal"],
    "Congelados": ["cong", "mccain", "boreal", "nugget", "espinaca", "brocoli"],
    "Conservas de Pescado": ["atun", "sardina", "lomito", "pescado", "grated"],
    "Descartables y Embalaje": ["descart", "tenedor", "cuchara", "vaso plast", "bandeja", "caja", "bolsa"],
    "Especias y Condimentos": ["sal ", "azucar", "oregano", "pimenton", "adobo", "ajo", "caldo", "condimento", "harina "],
    "Fiambres y Carnes": ["jamon", "mortadela", "salchicha", "pancho", "chorizo", "bondiola", "morcilla", "fiambre", "carne", "arrollado"],
    "Golosinas y Dulces": ["alfajor", "caramelo", "chocolate", "gomita", "chicle", "dulce de membrillo", "galleta rellena", "fini", "barrita"],
    "Harinas, Pastas y Legumbres": ["harina", "faina", "fideo", "arroz", "lenteja", "garbanzo", "almidon", "pasta", "polenta"],
    "L\u00E1cteos": ["leche", "queso", "yogur", "crema de leche", "manteca", "ricota", "dulce de leche", "muzzarel", "conaprole"],
    "Limpieza": ["jabon en polvo", "jabon liquido", "lavandina", "desinfectante", "limpiador", "detergente", "amoniaco"],
    "Mermeladas y Conservas Dulces": ["mermelada", "anana en alm", "membrillo", "miel", "dulce de fruta", "conserva"],
    "Panader\u00EDa": ["pan de molde", "pan catalan", "pan de viena", "pan rallado", "tostada"],
    "Papel e Higiene": ["papel higien", "servilleta", "toalla de cocina", "rollo"],
    "Higiene Personal": ["jabon de manos", "afeitar", "desodorante", "shampoo", "pa\u00F1al", "toallita"],
  };

  function categorizar(nombre: string): string {
    const n = nombre.toLowerCase();
    for (const [cat, kws] of Object.entries(KEYWORDS)) {
      if (kws.some((k) => n.includes(k))) return cat;
    }
    return "Otros";
  }

  function parseWorkbook(workbook: WorkBook): ProductRow[] {
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Skip header row, map expected columns: codigo, _, nombre, _, _, precio, _
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
        categoria: categorizar(nombre),
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
          setError("No se encontraron productos v\u00E1lidos en el archivo.");
          return;
        }

        setParsed(products);
        setPreview(products.slice(0, 10));
      } catch {
        setError("Error al leer el archivo. Verific\u00E1 que sea un .xlsx v\u00E1lido.");
      }
    };
    reader.readAsArrayBuffer(fileObj);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))) {
      handleFile(droppedFile);
    } else {
      setError("Solo se aceptan archivos .xlsx o .xls");
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  }

  async function handleConfirm() {
    if (parsed.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Write in batches to show progress
      const batchSize = 50;
      const batches = Math.ceil(parsed.length / batchSize);

      // Build the full catalog object
      const catalogoActivo: Record<string, ProductRow> = {};
      for (let i = 0; i < parsed.length; i++) {
        catalogoActivo[parsed[i].codigo] = parsed[i];
        if ((i + 1) % batchSize === 0) {
          setUploadProgress(Math.round(((i + 1) / parsed.length) * 100));
          // Yield to the event loop for UI update
          await new Promise((r) => setTimeout(r, 10));
        }
      }

      setUploadProgress(100);

      // Write to Firestore /catalogo_activo
      await setDoc(doc(db, "catalogo_activo", "productos"), {
        items: catalogoActivo,
        actualizadoEn: new Date().toISOString(),
        totalProductos: parsed.length,
      });

      setSuccess(true);
      onSuccess?.();

      // Reset after 3s
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        setPreview([]);
        setParsed([]);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 3000);
    } catch {
      setError("Error al actualizar los precios. Intent\u00E1 de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Drop zone */}
      {!file && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors"
          style={{
            borderColor: isDragOver ? "var(--rojo)" : "var(--border2)",
            background: isDragOver ? "rgba(76, 201, 240, 0.04)" : "transparent",
          }}
        >
          <span className="mb-3 text-4xl">\uD83D\uDCCB</span>
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Arrastr\u00E1 la lista de precios ac\u00E1
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            o hac\u00E9 click para seleccionar
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* File info */}
      {file && !success && (
        <div
          className="flex items-center justify-between rounded-lg px-4 py-3"
          style={{ background: "var(--bg2)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">\uD83D\uDCC4</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{file.name}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {parsed.length} productos encontrados
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setParsed([]);
              setPreview([]);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="rounded-md px-2 py-1 text-xs font-bold text-gray-500 hover:text-red-500"
          >
            \u2715
          </button>
        </div>
      )}

      {/* Preview table */}
      {preview.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Vista previa (primeros {preview.length} de {parsed.length})
          </p>
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--oscuro)" }}>
                  <th className="px-3 py-2 text-left font-semibold text-gray-300">C\u00F3digo</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-300">Producto</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-300">Categor\u00EDa</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-300">Precio</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p, i) => (
                  <tr
                    key={p.codigo}
                    className="border-t"
                    style={{
                      borderColor: "var(--border)",
                      background: i % 2 === 0 ? "var(--white)" : "var(--bg)",
                    }}
                  >
                    <td className="px-3 py-2 font-mono" style={{ color: "var(--text2)" }}>{p.codigo}</td>
                    <td className="px-3 py-2 font-medium" style={{ color: "var(--text)" }}>{p.nombre}</td>
                    <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{p.categoria}</td>
                    <td className="px-3 py-2 text-right font-bold" style={{ color: "var(--oscuro)" }}>
                      {formatCurrency(p.precio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: "var(--text2)" }}>
              Actualizando precios...
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--rojo)" }}>
              {uploadProgress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg3)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${uploadProgress}%`,
                background: "var(--rojo)",
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-center text-sm font-semibold"
          style={{
            background: "rgba(239, 35, 60, 0.08)",
            color: "var(--rojo)",
            border: "1px solid rgba(239, 35, 60, 0.2)",
          }}
        >
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          className="rounded-lg px-4 py-3 text-center text-sm font-semibold"
          style={{
            background: "rgba(34, 197, 94, 0.08)",
            color: "var(--verde)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
          }}
        >
          Precios actualizados \u2713
        </div>
      )}

      {/* Confirm button */}
      {parsed.length > 0 && !uploading && !success && (
        <button
          onClick={handleConfirm}
          className="w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wider text-white transition-all"
          style={{
            background: "var(--rojo)",
            boxShadow: "0 4px 18px rgba(239, 35, 60, 0.28)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--rojo-dark)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--rojo)";
          }}
        >
          Confirmar actualizaci\u00F3n ({parsed.length} productos)
        </button>
      )}
    </div>
  );
}
