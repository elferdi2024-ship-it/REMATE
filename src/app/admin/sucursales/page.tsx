// filepath: src/app/admin/sucursales/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useToast } from "@/lib/toast-context";
import { SUCURSALES } from "@/lib/sucursales";
import {
  getAllSucursalConfigs,
  setSucursalWhatsApp,
  type SucursalConfig,
} from "@/lib/sucursales-config";
import {
  loadBaseCatalogMap,
  loadBranchCatalogForAdmin,
  saveBranchCatalog,
  resetBranchCatalogToGlobal,
  getAllBranchesCatalogSummary,
  initAllBranchesFromBase,
  type CatalogItemsMap,
  type BranchCatalogSummary,
} from "@/lib/branch-catalog";
import { CATEGORIAS, type Producto } from "@/types";
import BranchProductModal from "@/components/admin/BranchProductModal";
import BranchCatalogImporterModal from "@/components/admin/BranchCatalogImporterModal";

type AdminTab = "catalogos" | "whatsapp";
type StatusFilter = "todos" | "activos" | "ocultos" | "personalizados";

export default function AdminSucursales() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>("catalogos");
  const [selectedSucursalId, setSelectedSucursalId] = useState<string>(SUCURSALES[0].id);

  // Catalogs state
  const [masterCatalog, setMasterCatalog] = useState<CatalogItemsMap>({});
  const [branchCatalog, setBranchCatalog] = useState<CatalogItemsMap>({});
  const [hasCustomCatalog, setHasCustomCatalog] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [summaries, setSummaries] = useState<Record<string, BranchCatalogSummary>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [initializingAll, setInitializingAll] = useState<boolean>(false);

  // Modals
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [importerOpen, setImporterOpen] = useState<boolean>(false);

  // Filters & Pagination
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  // WhatsApp phone config state
  const [waConfigs, setWaConfigs] = useState<Record<string, SucursalConfig>>({});
  const [waEditing, setWaEditing] = useState<Record<string, string>>({});
  const [waSaving, setWaSaving] = useState<string | null>(null);

  const selectedSucursalObj = useMemo(
    () => SUCURSALES.find((s) => s.id === selectedSucursalId) || SUCURSALES[0],
    [selectedSucursalId]
  );

  const refreshSummaries = useCallback(async () => {
    try {
      const res = await getAllBranchesCatalogSummary();
      setSummaries(res.branches);
    } catch (e) {
      console.warn("Error cargando resumen de sucursales:", e);
    }
  }, []);

  // Load WA configs, master catalog & branch summaries on mount
  useEffect(() => {
    getAllSucursalConfigs().then(setWaConfigs).catch(console.error);
    refreshSummaries();

    loadBaseCatalogMap()
      .then(({ items }) => setMasterCatalog(items))
      .catch((e) => {
        console.error("Error loading base catalog:", e);
        toast.error("Error al cargar catálogo base");
      });
  }, [toast, refreshSummaries]);

  // Load branch custom catalog when selected branch changes
  const reloadSelectedBranch = useCallback(async () => {
    setLoading(true);
    setHasUnsavedChanges(false);
    try {
      const res = await loadBranchCatalogForAdmin(selectedSucursalId);
      setBranchCatalog(res.items);
      setHasCustomCatalog(res.hasCustomCatalog);
    } catch (e) {
      console.error("Error loading branch catalog:", e);
      toast.error("Error al cargar catálogo de la sucursal");
    } finally {
      setLoading(false);
    }
  }, [selectedSucursalId, toast]);

  useEffect(() => {
    reloadSelectedBranch();
  }, [reloadSelectedBranch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, statusFilter, itemsPerPage, selectedSucursalId]);

  const missingCustomCount = useMemo(
    () => SUCURSALES.filter((s) => !summaries[s.id]?.hasCustomCatalog).length,
    [summaries]
  );

  // Initialize all missing branches from base catalog
  const handleInitAllBranches = async (overwrite: boolean) => {
    const confirmMsg = overwrite
      ? "¿Sobrescribir TODAS las 6 sucursales con una copia nueva del catálogo base actual? Se perderán las personalizaciones previas."
      : `Se creará un catálogo independiente basado en el catálogo actual para las ${missingCustomCount} sucursales que aún no tienen uno propio. ¿Continuar?`;

    if (!confirm(confirmMsg)) return;

    setInitializingAll(true);
    try {
      const res = await initAllBranchesFromBase(overwrite);
      await Promise.all([refreshSummaries(), reloadSelectedBranch()]);
      toast.success(
        `✅ ${res.initialized.length} sucursales inicializadas con ${res.totalProducts} productos.`
      );
    } catch (e: unknown) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Error al inicializar sucursales");
    } finally {
      setInitializingAll(false);
    }
  };

  // Clone base catalog to selected branch
  const handleCloneMaster = async () => {
    if (
      hasCustomCatalog &&
      !confirm(
        `¿Copiar todo el Catálogo Base a "${selectedSucursalObj.nombre}"? Esto sobrescribirá los cambios actuales de esta sucursal.`
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const baseItems =
        Object.keys(masterCatalog).length > 0
          ? masterCatalog
          : (await loadBaseCatalogMap()).items;
      const clonedItems: CatalogItemsMap = JSON.parse(JSON.stringify(baseItems));

      await saveBranchCatalog(selectedSucursalId, clonedItems, {
        strictEmpty: false,
        source: "base_clone",
      });
      setBranchCatalog(clonedItems);
      setHasCustomCatalog(true);
      setHasUnsavedChanges(false);
      await refreshSummaries();
      toast.success(`Catálogo independiente creado para ${selectedSucursalObj.nombre}`);
    } catch (e) {
      console.error(e);
      toast.error("Error al clonar catálogo base");
    } finally {
      setSaving(false);
    }
  };

  // Reset selected branch to global fallback
  const handleResetToGlobal = async () => {
    if (
      !confirm(
        `¿Restablecer "${selectedSucursalObj.nombre}" al catálogo global? Se eliminará su inventario personalizado.`
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      await resetBranchCatalogToGlobal(selectedSucursalId);
      setBranchCatalog({});
      setHasCustomCatalog(false);
      setHasUnsavedChanges(false);
      await refreshSummaries();
      toast.success("Sucursal restablecida al catálogo global");
    } catch (e) {
      console.error(e);
      toast.error("Error al restablecer catálogo");
    } finally {
      setSaving(false);
    }
  };

  // Inline edits
  const handlePriceChange = (codigo: string, value: string) => {
    const numericValue = parseFloat(value);
    setBranchCatalog((prev) => ({
      ...prev,
      [codigo]: {
        ...prev[codigo],
        precio: isNaN(numericValue) ? 0 : numericValue,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleToggleStatus = (codigo: string) => {
    setBranchCatalog((prev) => {
      const currentItem = prev[codigo];
      if (!currentItem) return prev;
      return {
        ...prev,
        [codigo]: {
          ...currentItem,
          deshabilitado: !currentItem.deshabilitado,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      await saveBranchCatalog(selectedSucursalId, branchCatalog, {
        strictEmpty: Object.keys(branchCatalog).length === 0,
        source: "manual_edit",
      });
      setHasUnsavedChanges(false);
      await refreshSummaries();
      toast.success(`Cambios guardados en ${selectedSucursalObj.nombre}`);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  // Manual Add / Edit single product (auto-initializes branch from base if needed)
  const handleSaveSingleProduct = async (producto: Producto, isEdit: boolean) => {
    let workingMap: CatalogItemsMap;
    if (!hasCustomCatalog) {
      const base =
        Object.keys(masterCatalog).length > 0
          ? masterCatalog
          : (await loadBaseCatalogMap()).items;
      workingMap = JSON.parse(JSON.stringify(base));
    } else {
      workingMap = { ...branchCatalog };
    }

    workingMap[producto.codigo] = producto;
    await saveBranchCatalog(selectedSucursalId, workingMap, {
      strictEmpty: false,
      source: "manual_product",
    });

    setBranchCatalog(workingMap);
    setHasCustomCatalog(true);
    setHasUnsavedChanges(false);
    await refreshSummaries();
    toast.success(
      isEdit
        ? `Producto ${producto.nombre} actualizado`
        : `Producto ${producto.nombre} agregado a ${selectedSucursalObj.nombre}`
    );
  };

  const handleDeleteProduct = async (prod: Producto) => {
    if (!hasCustomCatalog) return;
    if (!confirm(`¿Eliminar "${prod.nombre}" (${prod.codigo}) del catálogo de ${selectedSucursalObj.nombre}?`)) {
      return;
    }

    const nextMap = { ...branchCatalog };
    delete nextMap[prod.codigo];

    setSaving(true);
    try {
      await saveBranchCatalog(selectedSucursalId, nextMap, {
        strictEmpty: Object.keys(nextMap).length === 0,
        source: "manual_delete",
      });
      setBranchCatalog(nextMap);
      setHasUnsavedChanges(false);
      await refreshSummaries();
      toast.success("Producto eliminado de la sucursal");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo eliminar el producto");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyImportedCatalog = async (
    nextItems: CatalogItemsMap,
    sourceLabel: string
  ) => {
    await saveBranchCatalog(selectedSucursalId, nextItems, {
      strictEmpty: Object.keys(nextItems).length === 0,
      source: "manual_import",
    });
    setBranchCatalog(nextItems);
    setHasCustomCatalog(true);
    setHasUnsavedChanges(false);
    await refreshSummaries();
    toast.success(
      `Catálogo de ${selectedSucursalObj.nombre} actualizado desde ${sourceLabel}`
    );
  };

  // WhatsApp handlers
  const handleWaPhoneChange = (sucursalId: string, value: string) => {
    setWaEditing((prev) => ({ ...prev, [sucursalId]: value }));
  };

  const handleWaPhoneSave = async (sucursalId: string) => {
    const raw = waEditing[sucursalId];
    if (!raw?.trim()) return;

    let phone = raw.replace(/[\s+\-]/g, "");
    if (phone.startsWith("0")) {
      phone = "598" + phone.slice(1);
    } else if (!phone.startsWith("598")) {
      phone = "598" + phone;
    }

    setWaSaving(sucursalId);
    try {
      await setSucursalWhatsApp(sucursalId, phone);
      setWaConfigs((prev) => ({ ...prev, [sucursalId]: { telefonoWhatsApp: phone } }));
      setWaEditing((prev) => {
        const n = { ...prev };
        delete n[sucursalId];
        return n;
      });
      toast.success(
        `Teléfono WhatsApp actualizado para ${SUCURSALES.find((s) => s.id === sucursalId)?.nombre}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar teléfono");
    } finally {
      setWaSaving(null);
    }
  };

  // Display list: shows independent branch catalog items (including branch-exclusive items)
  // or base catalog preview when branch is still using global fallback.
  const displayItems = useMemo(() => {
    if (hasCustomCatalog) {
      return Object.values(branchCatalog)
        .map((branchItem) => {
          const masterItem = masterCatalog[branchItem.codigo];
          return {
            ...branchItem,
            imagen: branchItem.imagen || masterItem?.imagen,
          };
        })
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    }

    return Object.values(masterCatalog)
      .map((m) => ({ ...m, deshabilitado: Boolean(m.deshabilitado) }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [hasCustomCatalog, branchCatalog, masterCatalog]);

  const branchStats = useMemo(() => {
    const total = displayItems.length;
    const activos = displayItems.filter((p) => !p.deshabilitado && p.precio > 0).length;
    const ocultos = total - activos;
    const personalizados = hasCustomCatalog
      ? displayItems.filter((p) => {
          const m = masterCatalog[p.codigo];
          return !m || m.precio !== p.precio || m.nombre !== p.nombre;
        }).length
      : 0;
    return { total, activos, ocultos, personalizados };
  }, [displayItems, hasCustomCatalog, masterCatalog]);

  const filteredItems = useMemo(() => {
    const s = search.toLowerCase().trim();
    return displayItems.filter((p) => {
      const matchesSearch =
        !s ||
        p.nombre.toLowerCase().includes(s) ||
        p.codigo.toLowerCase().includes(s) ||
        (p.marca || "").toLowerCase().includes(s);

      const matchesCategory =
        selectedCategory === "Todas" || p.categoria === selectedCategory;

      let matchesStatus = true;
      if (statusFilter === "activos") {
        matchesStatus = !p.deshabilitado && p.precio > 0;
      } else if (statusFilter === "ocultos") {
        matchesStatus = Boolean(p.deshabilitado) || p.precio <= 0;
      } else if (statusFilter === "personalizados") {
        const m = masterCatalog[p.codigo];
        matchesStatus = !m || m.precio !== p.precio || m.nombre !== p.nombre;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [displayItems, search, selectedCategory, statusFilter, masterCatalog]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const existingCodesSet = useMemo(
    () =>
      new Set(
        hasCustomCatalog ? Object.keys(branchCatalog) : Object.keys(masterCatalog)
      ),
    [hasCustomCatalog, branchCatalog, masterCatalog]
  );

  return (
    <div className="space-y-6 text-[var(--admin-text-mid)]">
      {/* Page Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-bebas text-3xl sm:text-4xl tracking-wider text-[var(--admin-text-hi)]">
            Sucursales &amp; <span className="text-[var(--admin-accent)]">Catálogos Independientes</span>
          </h1>
          <p className="text-sm text-[var(--admin-text-lo)]">
            Cargá, editá y administrá de forma manual e independiente el listado de productos y WhatsApp de cada sucursal.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("catalogos")}
            className={`rounded-lg px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
              activeTab === "catalogos"
                ? "bg-[var(--admin-accent)] text-[var(--admin-sidebar-bg)] shadow-sm"
                : "text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
            }`}
          >
            🏪 Catálogos ({SUCURSALES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("whatsapp")}
            className={`rounded-lg px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
              activeTab === "whatsapp"
                ? "bg-[var(--admin-accent)] text-[var(--admin-sidebar-bg)] shadow-sm"
                : "text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
            }`}
          >
            📱 WhatsApp
          </button>
        </div>
      </div>

      {/* ── TAB 1: CATÁLOGOS INDEPENDIENTES POR SUCURSAL ──────────────────────── */}
      {activeTab === "catalogos" && (
        <div className="space-y-6">
          {/* Resumen Global + Inicialización de las 6 Sucursales */}
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-5 sm:p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="font-bebas text-2xl tracking-wider text-[var(--admin-text-hi)]">
                  Estado de los 6 Catálogos
                </h2>
                <p className="text-xs text-[var(--admin-text-lo)]">
                  Tocá cualquier sucursal para cargar o editar su catálogo. Cada sucursal almacena su propio listado independiente.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {missingCustomCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleInitAllBranches(false)}
                    disabled={initializingAll || saving}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all shadow-md disabled:opacity-50"
                  >
                    {initializingAll
                      ? "Inicializando..."
                      : `⚡ Inicializar ${missingCustomCount} Pendientes con Catálogo Actual`}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleInitAllBranches(true)}
                  disabled={initializingAll || saving}
                  className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] hover:border-[var(--admin-accent)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--admin-text-hi)] transition-all disabled:opacity-50"
                >
                  🔄 Clonar Base a las 6 Sucursales
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SUCURSALES.map((s) => {
                const sum = summaries[s.id];
                const isSelected = selectedSucursalId === s.id;
                const isCustom = Boolean(sum?.hasCustomCatalog);

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSucursalId(s.id)}
                    className={`text-left rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10 ring-1 ring-[var(--admin-accent)] shadow-md"
                        : "border-[var(--admin-border)] bg-[var(--admin-bg)]/60 hover:border-[var(--admin-accent)]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-sm text-[var(--admin-text-hi)]">
                          🏪 {s.nombre}
                        </p>
                        <p className="text-[11px] text-[var(--admin-text-lo)]">{s.direccion}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                          isCustom
                            ? "bg-emerald-500/20 text-emerald-500"
                            : "bg-amber-500/20 text-amber-500"
                        }`}
                      >
                        {isCustom ? "Independiente" : "Base Global"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--admin-border)]/60">
                      <span className="font-semibold text-[var(--admin-text-mid)]">
                        {sum ? `${sum.activeCount} activos / ${sum.totalCount} tot.` : "Cargando..."}
                      </span>
                      {sum?.updatedAt && (
                        <span className="text-[10px] text-[var(--admin-text-lo)]">
                          {new Date(sum.updatedAt).toLocaleDateString("es-UY")}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel de Acciones de la Sucursal Seleccionada */}
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-5 sm:p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[var(--admin-border)]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bebas text-3xl tracking-wider text-[var(--admin-text-hi)]">
                    Catálogo: {selectedSucursalObj.nombre}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                      hasCustomCatalog
                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                    }`}
                  >
                    {hasCustomCatalog ? "Catálogo Independiente Activo" : "Usando Catálogo Global (Fallback)"}
                  </span>
                  {hasUnsavedChanges && (
                    <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black animate-pulse">
                      Cambios sin guardar
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--admin-text-lo)] mt-1">
                  {branchStats.activos} activos · {branchStats.ocultos} ocultos ·{" "}
                  {branchStats.total} productos en total
                  {hasCustomCatalog && branchStats.personalizados > 0
                    ? ` · ${branchStats.personalizados} personalizados`
                    : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductModalOpen(true);
                  }}
                  disabled={saving || loading}
                  className="rounded-xl bg-[var(--admin-accent)] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[var(--admin-sidebar-bg)] hover:opacity-90 disabled:opacity-50 shadow-sm"
                >
                  ➕ Agregar Producto Manual
                </button>

                <button
                  type="button"
                  onClick={() => setImporterOpen(true)}
                  disabled={saving || loading}
                  className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] hover:border-[var(--admin-accent)] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[var(--admin-text-hi)] transition-all disabled:opacity-50"
                >
                  📥 Cargar Catálogo (Excel / Lista)
                </button>

                {!hasCustomCatalog ? (
                  <button
                    type="button"
                    onClick={handleCloneMaster}
                    disabled={saving || loading}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all disabled:opacity-50"
                  >
                    🏪 Crear Copia Independiente
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      disabled={saving || !hasUnsavedChanges}
                      className={`rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all ${
                        hasUnsavedChanges
                          ? "bg-emerald-600 hover:bg-emerald-500 shadow-md"
                          : "bg-emerald-600/40 cursor-not-allowed"
                      }`}
                    >
                      {saving ? "Guardando..." : "💾 Guardar Cambios"}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToGlobal}
                      disabled={saving}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Restablecer a Global
                    </button>
                  </>
                )}
              </div>
            </div>

            {!hasCustomCatalog && (
              <div className="rounded-xl border border-amber-500/35 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">
                  ⚠️ Esta sucursal todavía muestra el catálogo base como plantilla. Podés hacer clic en{" "}
                  <strong>&quot;Crear Copia Independiente&quot;</strong>,{" "}
                  <strong>&quot;Agregar Producto Manual&quot;</strong> o{" "}
                  <strong>&quot;Cargar Catálogo&quot;</strong> para independizarla.
                </p>
              </div>
            )}

            {/* Filtros */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative sm:col-span-2">
                <input
                  type="text"
                  placeholder="Buscar por código, nombre o marca..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-2.5 pl-10 text-xs sm:text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:border-[var(--admin-accent)] focus:outline-none"
                />
                <span className="absolute left-3.5 top-3 text-sm text-[var(--admin-text-lo)]">🔍</span>
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-3 text-xs text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2.5 text-xs font-bold text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
              >
                <option value="Todas">Todas las Categorías</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2.5 text-xs font-bold text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
              >
                <option value="todos">Todos los Estados</option>
                <option value="activos">Solo Activos</option>
                <option value="ocultos">Solo Ocultos / $0</option>
                {hasCustomCatalog && (
                  <option value="personalizados">Modificados / Exclusivos</option>
                )}
              </select>
            </div>

            {/* Tabla de Productos */}
            {loading ? (
              <div className="py-14 text-center text-sm text-[var(--admin-text-lo)]">
                Cargando catálogo de {selectedSucursalObj.nombre}...
              </div>
            ) : paginatedItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--admin-border)] p-12 text-center space-y-3">
                <span className="text-4xl block">📦</span>
                <h3 className="font-bold text-[var(--admin-text-hi)]">
                  {displayItems.length === 0
                    ? "Esta sucursal aún no tiene productos cargados"
                    : "No hay productos que coincidan con el filtro"}
                </h3>
                <p className="text-xs text-[var(--admin-text-lo)]">
                  Podés agregar productos manualmente o importar una lista desde Excel / CSV.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)]">
                <table className="w-full min-w-[820px] text-left text-sm text-[var(--admin-text-mid)]">
                  <thead className="bg-[var(--admin-bg)] text-xs font-bold uppercase tracking-wider text-[var(--admin-text-lo)] border-b border-[var(--admin-border)]">
                    <tr>
                      <th className="py-3 px-4 w-16">Foto</th>
                      <th className="py-3 px-4">Código / Nombre</th>
                      <th className="py-3 px-4 w-44">Categoría</th>
                      <th className="py-3 px-4 text-center w-28">Precio Base</th>
                      <th className="py-3 px-4 text-center w-36">Precio Sucursal</th>
                      <th className="py-3 px-4 text-center w-28">Estado</th>
                      <th className="py-3 px-4 text-right w-28">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--admin-border)]">
                    {paginatedItems.map((prod) => {
                      const masterItem = masterCatalog[prod.codigo];
                      const isExclusive = hasCustomCatalog && !masterItem;
                      const isPriceOverridden =
                        hasCustomCatalog && masterItem && prod.precio !== masterItem.precio;
                      const isProductDisabled = Boolean(prod.deshabilitado) || prod.precio <= 0;

                      return (
                        <tr
                          key={prod.codigo}
                          className={`hover:bg-[var(--admin-input-bg)]/30 transition-colors ${
                            isProductDisabled ? "opacity-55 bg-red-950/5" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="relative h-11 w-11 rounded-lg bg-white overflow-hidden flex items-center justify-center border border-[var(--admin-border)]">
                              {prod.imagen ? (
                                <Image
                                  src={prod.imagen}
                                  alt={prod.nombre}
                                  fill
                                  className="object-contain p-1"
                                />
                              ) : (
                                <span className="text-lg">📦</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[var(--admin-text-hi)] line-clamp-1">
                                {prod.nombre}
                              </span>
                              {isExclusive && (
                                <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-blue-500 shrink-0">
                                  Exclusivo
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono text-[var(--admin-accent)] mt-0.5">
                              {prod.codigo}
                              {prod.marca ? ` · ${prod.marca}` : ""}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-block rounded-full bg-[var(--admin-bg)] border border-[var(--admin-border)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--admin-text-lo)] uppercase tracking-wider">
                              {prod.categoria}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center font-bold text-[var(--admin-text-lo)]">
                            {masterItem ? `$${masterItem.precio}` : "—"}
                          </td>

                          <td className="py-3 px-4">
                            <div className="relative flex justify-center">
                              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--admin-text-lo)]">
                                $
                              </span>
                              <input
                                type="number"
                                value={prod.precio}
                                disabled={!hasCustomCatalog || saving}
                                onChange={(e) => handlePriceChange(prod.codigo, e.target.value)}
                                className={`w-28 rounded-lg border px-3 py-1.5 pl-6 text-xs font-bold text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none ${
                                  !hasCustomCatalog
                                    ? "bg-[var(--admin-input-bg)]/50 border-[var(--admin-border)] text-[var(--admin-text-lo)]/50 cursor-not-allowed"
                                    : isPriceOverridden
                                    ? "bg-[var(--admin-accent)]/5 border-[var(--admin-accent)] text-[var(--admin-accent)]"
                                    : "bg-[var(--admin-bg)] border-[var(--admin-border)]"
                                }`}
                              />
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              disabled={!hasCustomCatalog || saving}
                              onClick={() => handleToggleStatus(prod.codigo)}
                              className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                                !hasCustomCatalog
                                  ? "bg-green-500/10 text-green-600 cursor-not-allowed"
                                  : prod.deshabilitado
                                  ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
                                  : "bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20"
                              }`}
                            >
                              {prod.deshabilitado ? "Oculto 🚫" : "Activo 👁️"}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setProductModalOpen(true);
                                }}
                                title="Editar producto"
                                className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2.5 py-1.5 text-xs font-bold hover:border-[var(--admin-accent)] transition-colors"
                              >
                                ✏️
                              </button>
                              {hasCustomCatalog && (
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => handleDeleteProduct(prod)}
                                  title="Eliminar de esta sucursal"
                                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-colors"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {filteredItems.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-[var(--admin-text-lo)]">
                  <span>
                    Mostrando{" "}
                    <strong className="text-[var(--admin-text-hi)]">
                      {(currentPage - 1) * itemsPerPage + 1}–
                      {Math.min(currentPage * itemsPerPage, filteredItems.length)}
                    </strong>{" "}
                    de <strong className="text-[var(--admin-text-hi)]">{filteredItems.length}</strong>
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2 py-1 text-xs font-bold text-[var(--admin-text-hi)]"
                  >
                    <option value={25}>25 / pág</option>
                    <option value={50}>50 / pág</option>
                    <option value={100}>100 / pág</option>
                  </select>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2.5 py-1.5 text-xs font-bold disabled:opacity-40"
                    >
                      «
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <span className="px-2 text-xs font-mono font-bold text-[var(--admin-accent)]">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2.5 py-1.5 text-xs font-bold disabled:opacity-40"
                    >
                      »
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: WHATSAPP POR SUCURSAL ──────────────────────────────────────── */}
      {activeTab === "whatsapp" && (
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 space-y-4">
          <div>
            <h2 className="font-bebas text-3xl tracking-wider text-[var(--admin-text-hi)]">
              📱 WhatsApp por Sucursal
            </h2>
            <p className="text-sm text-[var(--admin-text-lo)] mt-1">
              Configurá el número de WhatsApp donde cada sucursal recibe los pedidos.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUCURSALES.map((s) => {
              const currentPhone = waConfigs[s.id]?.telefonoWhatsApp || "";
              const editValue = waEditing[s.id];
              const isEditing = editValue !== undefined;
              const isSaving = waSaving === s.id;
              const displayPhone = currentPhone
                ? `+${currentPhone.slice(0, 3)} ${currentPhone.slice(3, 5)} ${currentPhone.slice(5, 8)} ${currentPhone.slice(8)}`
                : "No configurado";

              return (
                <div
                  key={s.id}
                  className={`rounded-xl border p-4 space-y-3 transition-all ${
                    currentPhone
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-amber-500/30 bg-amber-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[var(--admin-text-hi)]">
                        🏪 {s.nombre}
                      </h3>
                      <p className="text-xs text-[var(--admin-text-lo)]">{s.direccion}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        currentPhone
                          ? "bg-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {currentPhone ? "Activo" : "Pendiente"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg">📲</span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        currentPhone ? "text-green-600 dark:text-green-400" : "text-amber-500"
                      }`}
                    >
                      {displayPhone}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="Ej: 094611400"
                      value={isEditing ? editValue : ""}
                      onChange={(e) => handleWaPhoneChange(s.id, e.target.value)}
                      disabled={isSaving}
                      className="flex-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-xs font-mono text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:border-[var(--admin-accent)] focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleWaPhoneSave(s.id)}
                      disabled={!isEditing || !editValue?.trim() || isSaving}
                      className="rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[var(--admin-sidebar-bg)] transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isSaving ? "..." : "Guardar"}
                    </button>
                  </div>

                  <p className="text-[10px] text-[var(--admin-text-lo)]">
                    Tel. actual en sistema: {s.telefono}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 <strong>Formato:</strong> Podés ingresar el número con o sin código de país. Ejemplos válidos:{" "}
              <code className="bg-blue-500/10 px-1 rounded">094611400</code>,{" "}
              <code className="bg-blue-500/10 px-1 rounded">59894611400</code>
            </p>
          </div>
        </div>
      )}

      {/* Modales */}
      <BranchProductModal
        isOpen={productModalOpen}
        sucursalNombre={selectedSucursalObj.nombre}
        initialProduct={editingProduct}
        existingCodes={existingCodesSet}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveSingleProduct}
      />

      <BranchCatalogImporterModal
        isOpen={importerOpen}
        sucursalId={selectedSucursalId}
        sucursalNombre={selectedSucursalObj.nombre}
        currentBranchItems={hasCustomCatalog ? branchCatalog : masterCatalog}
        masterCatalog={masterCatalog}
        onClose={() => setImporterOpen(false)}
        onApplyItems={handleApplyImportedCatalog}
      />
    </div>
  );
}
