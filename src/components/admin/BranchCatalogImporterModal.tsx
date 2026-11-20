// filepath: src/components/admin/BranchCatalogImporterModal.tsx
"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { SUCURSALES } from "@/lib/sucursales";
import {
  parseCatalogWorkbook,
  parseManualProductLines,
  type ImportedProductRow,
} from "@/lib/catalog-importer";
import {
  loadBaseCatalogMap,
  loadBranchCatalogForAdmin,
  type CatalogItemsMap,
} from "@/lib/branch-catalog";
import type { Producto } from "@/types";

type ImportTab = "excel" | "manual" | "clone";
type ImportMode = "merge" | "replace";

interface BranchCatalogImporterModalProps {
  isOpen: boolean;
  sucursalId: string;
  sucursalNombre: string;
  currentBranchItems: CatalogItemsMap;
  masterCatalog: CatalogItemsMap;
  onClose: () => void;
  onApplyItems: (nextItems: CatalogItemsMap, sourceLabel: string) => Promise<void>;
}

export default function BranchCatalogImporterModal({
  isOpen,
  sucursalId,
  sucursalNombre,
  currentBranchItems,
  masterCatalog,
  onClose,
  onApplyItems,
}: BranchCatalogImporterModalProps) {
  const [activeTab, setActiveTab] = useState<ImportTab>("excel");
  const [importMode, setImportMode] = useState<ImportMode>("merge");

  // Excel state
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ImportedProductRow[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Manual text state
  const [manualText, setManualText] = useState("");
  const [manualRows, setManualRows] = useState<ImportedProductRow[]>([]);

  // Clone state
  const [cloneSource, setCloneSource] = useState<string>("base");

  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExcelFile = (file: File) => {
    setError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: "array" });
        const rows = parseCatalogWorkbook(workbook);
        if (rows.length === 0) {
          setError("No se encontraron productos válidos en el archivo.");
          setParsedRows([]);
          return;
        }
        setParsedRows(rows);
      } catch {
        setError("Error al leer el archivo. Verificá que sea un .xlsx, .xls o .csv válido.");
        setParsedRows([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleManualTextChange = (text: string) => {
    setManualText(text);
    setError(null);
    setManualRows(parseManualProductLines(text));
  };

  const buildMergedMap = (rows: ImportedProductRow[]): CatalogItemsMap => {
    const baseTarget: CatalogItemsMap =
      importMode === "merge" ? { ...currentBranchItems } : {};

    for (const row of rows) {
      const existingBranch = currentBranchItems[row.codigo];
      const existingMaster = masterCatalog[row.codigo];
      const refProd = existingBranch || existingMaster;

      const item: Producto = {
        codigo: row.codigo,
        nombre: row.nombre,
        precio: row.precio,
        categoria: row.categoria,
        deshabilitado: existingBranch?.deshabilitado ?? false,
        ...(refProd?.imagen ? { imagen: refProd.imagen } : {}),
        ...(refProd?.marca ? { marca: refProd.marca } : {}),
        ...(refProd?.contenido ? { contenido: refProd.contenido } : {}),
        ...(refProd?.escalaPrecios ? { escalaPrecios: refProd.escalaPrecios } : {}),
        ...(refProd?.destacado !== undefined ? { destacado: refProd.destacado } : {}),
        ...(refProd?.precioAnterior !== undefined
          ? { precioAnterior: refProd.precioAnterior }
          : {}),
      };

      baseTarget[row.codigo] = item;
    }

    return baseTarget;
  };

  const handleConfirmImport = async () => {
    setError(null);
    setApplying(true);
    try {
      if (activeTab === "excel") {
        if (parsedRows.length === 0) {
          setError("Primero cargá un archivo válido.");
          return;
        }
        const nextMap = buildMergedMap(parsedRows);
        await onApplyItems(nextMap, `archivo (${parsedRows.length} productos)`);
        onClose();
        return;
      }

      if (activeTab === "manual") {
        if (manualRows.length === 0) {
          setError("Ingresá al menos una línea válida con formato CODIGO; NOMBRE; PRECIO.");
          return;
        }
        const nextMap = buildMergedMap(manualRows);
        await onApplyItems(nextMap, `carga manual (${manualRows.length} productos)`);
        onClose();
        return;
      }

      // Clone tab
      if (cloneSource === "empty") {
        await onApplyItems({}, "catálogo vacío");
        onClose();
        return;
      }

      if (cloneSource === "base") {
        const { items } = await loadBaseCatalogMap();
        await onApplyItems(
          JSON.parse(JSON.stringify(items)),
          `catálogo base (${Object.keys(items).length} productos)`
        );
        onClose();
        return;
      }

      const sourceBranch = await loadBranchCatalogForAdmin(cloneSource);
      if (!sourceBranch.hasCustomCatalog || Object.keys(sourceBranch.items).length === 0) {
        setError("La sucursal origen aún no tiene un catálogo propio cargado.");
        return;
      }
      await onApplyItems(
        JSON.parse(JSON.stringify(sourceBranch.items)),
        `copia de ${SUCURSALES.find((s) => s.id === cloneSource)?.nombre || cloneSource}`
      );
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar el catálogo.");
    } finally {
      setApplying(false);
    }
  };

  const activePreview = activeTab === "excel" ? parsedRows : manualRows;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!applying) onClose();
      }}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] shadow-2xl text-[var(--admin-text-mid)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-bg)] px-6 py-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-accent)]">
              Sucursal {sucursalNombre}
            </span>
            <h3 className="font-bebas text-2xl tracking-wider text-[var(--admin-text-hi)]">
              Cargar Catálogo de Sucursal
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={applying}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-sm font-bold text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50 px-6 py-3">
          {[
            { id: "excel", label: "📊 Subir Excel / CSV" },
            { id: "manual", label: "✍️ Pegar Lista Manual" },
            { id: "clone", label: "📋 Clonar / Inicializar" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as ImportTab);
                setError(null);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--admin-accent)] text-[var(--admin-sidebar-bg)] shadow-sm"
                  : "border border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-500">
              ⚠️ {error}
            </div>
          )}

          {(activeTab === "excel" || activeTab === "manual") && (
            <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
                Modo de carga para {sucursalNombre}
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-xs transition-all ${
                    importMode === "merge"
                      ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10"
                      : "border-[var(--admin-border)] bg-[var(--admin-card-bg)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === "merge"}
                    onChange={() => setImportMode("merge")}
                    className="mt-0.5 accent-[var(--admin-accent)]"
                  />
                  <div>
                    <strong className="block text-[var(--admin-text-hi)]">
                      Combinar y actualizar
                    </strong>
                    <span className="text-[11px] text-[var(--admin-text-lo)]">
                      Mantiene los productos existentes y agrega o actualiza los de esta carga.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-xs transition-all ${
                    importMode === "replace"
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-[var(--admin-border)] bg-[var(--admin-card-bg)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === "replace"}
                    onChange={() => setImportMode("replace")}
                    className="mt-0.5 accent-amber-500"
                  />
                  <div>
                    <strong className="block text-[var(--admin-text-hi)]">
                      Reemplazar catálogo completo
                    </strong>
                    <span className="text-[11px] text-[var(--admin-text-lo)]">
                      Deja únicamente los productos cargados ahora en esta sucursal.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === "excel" && (
            <div className="space-y-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-bg)]/60 p-8 text-center hover:border-[var(--admin-accent)] transition-colors"
              >
                <span className="text-4xl mb-2">📊</span>
                <p className="text-sm font-bold text-[var(--admin-text-hi)]">
                  {fileName ? `Archivo: ${fileName}` : "Hacé clic para seleccionar Excel (.xlsx, .xls) o CSV"}
                </p>
                <p className="text-xs text-[var(--admin-text-lo)] mt-1">
                  Acepta formato compacto (Código | Nombre | Precio | Categoría) o formato clásico de lista de precios.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleExcelFile(f);
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "manual" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
                  Pegá o escribí productos (1 por línea: Código; Nombre; Precio; Categoría)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleManualTextChange(
                      "773090000101; YERBA CANARIAS 1KG; 235; YERBA, TÉ Y CAFÉ\n773090000102; ACEITE OPTIMO 900ML; 110; ACEITES Y GRASAS\n773090000103; COCA COLA 2.25L; 165; BEBIDAS SIN ALCOHOL"
                    )
                  }
                  className="text-[11px] font-bold text-[var(--admin-accent)] hover:underline"
                >
                  Insertar ejemplo
                </button>
              </div>
              <textarea
                rows={7}
                value={manualText}
                onChange={(e) => handleManualTextChange(e.target.value)}
                placeholder={"773090000101; YERBA CANARIAS 1KG; 235; YERBA, TÉ Y CAFÉ\n773090000102; ACEITE OPTIMO 900ML; 110"}
                className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3.5 font-mono text-xs text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
              />
            </div>
          )}

          {activeTab === "clone" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
                Elegí qué catálogo copiar hacia {sucursalNombre}
              </label>
              <select
                value={cloneSource}
                onChange={(e) => setCloneSource(e.target.value)}
                className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-3 text-sm font-bold text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
              >
                <option value="base">🌐 Catálogo Base Existente (Productos completos actuales)</option>
                {SUCURSALES.filter((s) => s.id !== sucursalId).map((s) => (
                  <option key={s.id} value={s.id}>
                    🏪 Copiar catálogo actual de Sucursal {s.nombre}
                  </option>
                ))}
                <option value="empty">🆕 Iniciar Catálogo Vacío (para cargar todo desde cero)</option>
              </select>
              <p className="text-xs text-[var(--admin-text-lo)]">
                Esto creará una copia independiente en Firestore para {sucursalNombre}. Cualquier cambio futuro solo afectará a esta sucursal.
              </p>
            </div>
          )}

          {/* Preview table for excel / manual */}
          {(activeTab === "excel" || activeTab === "manual") && activePreview.length > 0 && (
            <div className="rounded-xl border border-[var(--admin-border)] overflow-hidden">
              <div className="bg-[var(--admin-bg)] px-4 py-2.5 text-xs font-bold text-[var(--admin-text-hi)] flex justify-between">
                <span>Vista previa ({activePreview.length} productos detectados)</span>
                <span className="text-[var(--admin-text-lo)]">Mostrando primeros {Math.min(10, activePreview.length)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50 text-[10px] uppercase text-[var(--admin-text-lo)]">
                    <tr>
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Nombre</th>
                      <th className="px-3 py-2">Categoría</th>
                      <th className="px-3 py-2 text-right">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--admin-border)]">
                    {activePreview.slice(0, 10).map((r) => (
                      <tr key={r.codigo}>
                        <td className="px-3 py-2 font-mono text-[var(--admin-accent)]">{r.codigo}</td>
                        <td className="px-3 py-2 font-semibold text-[var(--admin-text-hi)]">{r.nombre}</td>
                        <td className="px-3 py-2 text-[var(--admin-text-lo)]">{r.categoria}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-[var(--admin-text-hi)]">
                          ${r.precio}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-bg)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={applying}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--admin-text-mid)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={applying}
            className="rounded-xl bg-[var(--admin-accent)] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[var(--admin-sidebar-bg)] hover:opacity-90 disabled:opacity-50 shadow-md"
          >
            {applying ? "Aplicando..." : `Confirmar en ${sucursalNombre} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
