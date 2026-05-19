// filepath: src/app/admin/sucursales/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/lib/toast-context";
import { SUCURSALES } from "@/lib/sucursales";
import { CATEGORIAS } from "@/types";
import Image from "next/image";

interface CustomProducto {
  codigo: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen?: string;
  deshabilitado?: boolean;
}

export default function AdminSucursales() {
  const toast = useToast();
  
  // Selected branch
  const [selectedSucursalId, setSelectedSucursalId] = useState<string>(SUCURSALES[0].id);

  // Catalogs state
  const [masterCatalog, setMasterCatalog] = useState<Record<string, CustomProducto>>({});
  const [branchCatalog, setBranchCatalog] = useState<Record<string, CustomProducto>>({});
  const [hasCustomCatalog, setHasCustomCatalog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  // Load master catalog on mount
  useEffect(() => {
    async function loadMaster() {
      try {
        const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
        if (snap.exists()) {
          setMasterCatalog(snap.data().items || {});
        }
      } catch (e) {
        console.error("Error loading master catalog:", e);
        toast.error("Error al cargar catálogo maestro");
      }
    }
    loadMaster();
  }, [toast]);

  // Load branch custom catalog when selected branch changes
  useEffect(() => {
    async function loadBranchCatalog() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "sucursales_catalogos", selectedSucursalId));
        if (snap.exists()) {
          setBranchCatalog(snap.data().items || {});
          setHasCustomCatalog(true);
        } else {
          // If no custom catalog exists, state starts empty representing fallback
          setBranchCatalog({});
          setHasCustomCatalog(false);
        }
      } catch (e) {
        console.error("Error loading branch catalog:", e);
        toast.error("Error al cargar catálogo de la sucursal");
      } finally {
        setLoading(false);
      }
    }
    loadBranchCatalog();
  }, [selectedSucursalId, toast]);

  // Handle clone/copy master catalog
  const handleCloneMaster = async () => {
    if (
      !confirm(
        `¿Estás seguro de copiar todo el Catálogo Maestro a la sucursal "${
          SUCURSALES.find((s) => s.id === selectedSucursalId)?.nombre
        }"? Esto sobrescribirá cualquier cambio existente.`
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      // De-reference master catalog items
      const clonedItems = JSON.parse(JSON.stringify(masterCatalog));
      
      // Save directly to Firestore branch document
      await setDoc(doc(db, "sucursales_catalogos", selectedSucursalId), {
        items: clonedItems,
        clonedAt: new Date().toISOString(),
      });

      setBranchCatalog(clonedItems);
      setHasCustomCatalog(true);
      toast.success("Catálogo maestro copiado con éxito");
    } catch (e) {
      console.error(e);
      toast.error("Error al clonar catálogo");
    } finally {
      setSaving(false);
    }
  };

  // Handle reset to global
  const handleResetToGlobal = async () => {
    if (
      !confirm(
        `¿Estás seguro de restablecer el catálogo de esta sucursal? Se eliminarán los precios y habilitaciones personalizadas, volviendo a usar el catálogo global.`
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      await deleteDoc(doc(db, "sucursales_catalogos", selectedSucursalId));
      setBranchCatalog({});
      setHasCustomCatalog(false);
      toast.success("Sucursal restablecida al catálogo global");
    } catch (e) {
      console.error(e);
      toast.error("Error al restablecer catálogo");
    } finally {
      setSaving(false);
    }
  };

  // Handle price change in local state
  const handlePriceChange = (codigo: string, value: string) => {
    const numericValue = parseFloat(value);
    setBranchCatalog((prev) => ({
      ...prev,
      [codigo]: {
        ...prev[codigo],
        precio: isNaN(numericValue) ? 0 : numericValue,
      },
    }));
  };

  // Handle status toggle (enable/disable) in local state
  const handleToggleStatus = (codigo: string) => {
    setBranchCatalog((prev) => {
      const currentItem = prev[codigo];
      return {
        ...prev,
        [codigo]: {
          ...currentItem,
          deshabilitado: !currentItem.deshabilitado,
        },
      };
    });
  };

  // Handle batch save changes
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "sucursales_catalogos", selectedSucursalId), {
        items: branchCatalog,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Cambios guardados exitosamente");
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  // Build current display items:
  // If branch custom catalog exists, we display its items.
  // BUT we must also show any NEW products added to the master catalog that are missing in the branch.
  const combinedCatalogList = useMemo(() => {
    const list: CustomProducto[] = [];
    const sourceCatalog = hasCustomCatalog ? branchCatalog : masterCatalog;

    // We iterate over all products in the master catalog to guarantee we show everything
    Object.keys(masterCatalog).forEach((codigo) => {
      const masterItem = masterCatalog[codigo];
      const branchItem = branchCatalog[codigo];

      if (hasCustomCatalog) {
        if (branchItem) {
          list.push({
            ...branchItem,
            nombre: masterItem.nombre, // always get freshest name
            imagen: masterItem.imagen, // always get freshest image
            categoria: masterItem.categoria, // always get freshest category
          });
        } else {
          // Product exists in master but not cloned in branch yet, we show it as disabled or with fallback prices
          list.push({
            ...masterItem,
            deshabilitado: true, // starts disabled since it wasn't customized
          });
        }
      } else {
        // Fallback display (shows global as template)
        list.push({
          ...masterItem,
          deshabilitado: false,
        });
      }
    });

    return list;
  }, [masterCatalog, branchCatalog, hasCustomCatalog]);

  // Filter items by search & category
  const filteredItems = useMemo(() => {
    return combinedCatalogList.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.codigo.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory =
        selectedCategory === "Todas" || p.categoria === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [combinedCatalogList, search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-bebas text-3xl tracking-wider text-white">
            Catálogos por Sucursal
          </h2>
          <p className="text-sm text-gray-400">
            Control independiente de productos habilitados y precios personalizados para cada sucursal.
          </p>
        </div>
      </div>

      {/* Control Top Panel */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Branch Selector */}
        <div className="rounded-xl border border-white/5 bg-[#0A0F1C] p-5 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
            1. Seleccionar Sucursal
          </label>
          <select
            value={selectedSucursalId}
            onChange={(e) => setSelectedSucursalId(e.target.value)}
            disabled={saving}
            className="w-full rounded-lg border border-white/10 bg-[#111625] px-3 py-2.5 text-sm font-bold text-white focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
          >
            {SUCURSALES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} ({s.direccion})
              </option>
            ))}
          </select>
        </div>

        {/* Catalog Status Info */}
        <div className="rounded-xl border border-white/5 bg-[#0A0F1C] p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              2. Estado del Catálogo
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`h-2.5 w-2.5 rounded-full ${hasCustomCatalog ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'}`}></span>
              <span className="text-sm font-bold text-white">
                {hasCustomCatalog ? "Catálogo Personalizado" : "Catálogo Global (Fallback)"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {hasCustomCatalog
                ? "Esta sucursal posee inventario y precios independientes."
                : "Usa de forma directa todos los productos y precios del catálogo general."}
            </p>
          </div>
        </div>

        {/* Actions panel */}
        <div className="rounded-xl border border-white/5 bg-[#0A0F1C] p-5 flex flex-col justify-center gap-2.5">
          {!hasCustomCatalog ? (
            <button
              onClick={handleCloneMaster}
              disabled={saving || loading}
              className="w-full rounded-lg bg-[#00E5FF] py-2.5 text-xs font-extrabold uppercase tracking-wider text-black transition-all hover:scale-[1.02] hover:bg-[#00E5FF]/80 disabled:opacity-50"
            >
              Customizar Sucursal 🏪
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="w-full rounded-lg bg-green-500 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all hover:scale-[1.02] hover:bg-green-600 shadow-[0_4px_12px_rgba(34,197,94,0.2)] disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar Cambios 💾"}
              </button>
              <button
                onClick={handleResetToGlobal}
                disabled={saving}
                className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-xs font-bold uppercase tracking-wider text-red-500 transition-all hover:bg-red-500/20 disabled:opacity-50"
              >
                Restablecer a Global 🔄
              </button>
            </>
          )}
        </div>
      </div>

      {/* Customization Table/Grid Panel */}
      <div className="rounded-xl border border-white/5 bg-[#0A0F1C] p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar producto por código o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#111625] px-4 py-2 pl-10 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#00E5FF] focus:outline-none"
            />
            <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#111625] px-3 py-2 text-xs sm:text-sm font-bold text-white focus:border-[#00E5FF] focus:outline-none"
            >
              <option value="Todas">Todas las Categorías</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Warning if read-only */}
        {!hasCustomCatalog && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-center">
            <p className="text-xs sm:text-sm text-amber-300 font-semibold">
              ⚠️ El catálogo actual es de SOLO LECTURA porque la sucursal usa la configuración Global.
            </p>
            <p className="text-xs text-amber-400/80 mt-1">
              Haz clic en &quot;Customizar Sucursal&quot; arriba para habilitar la edición independiente de precios y productos.
            </p>
          </div>
        )}

        {/* Products Customizable Grid */}
        {loading ? (
          <div className="py-12 text-center text-gray-400">Cargando catálogo de sucursal...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm text-gray-300">
              <thead className="bg-[#111625] text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4 w-20">Foto</th>
                  <th className="py-3 px-4">Código / Nombre</th>
                  <th className="py-3 px-4 w-40">Categoría</th>
                  <th className="py-3 px-4 text-center w-36">Precio Global</th>
                  <th className="py-3 px-4 text-center w-40">Precio Sucursal</th>
                  <th className="py-3 px-4 text-center w-32">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.slice(0, 100).map((prod) => {
                  const masterItem = masterCatalog[prod.codigo] || { precio: 0 };
                  const isOverridden = hasCustomCatalog && prod.precio !== masterItem.precio;
                  const isProductDisabled = prod.deshabilitado;

                  return (
                    <tr
                      key={prod.codigo}
                      className={`hover:bg-white/[0.01] transition-colors ${
                        isProductDisabled ? "opacity-45 bg-red-950/5" : ""
                      }`}
                    >
                      {/* Image */}
                      <td className="py-3 px-4">
                        <div className="relative h-12 w-12 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center">
                          {prod.imagen ? (
                            <Image
                              src={prod.imagen}
                              alt={prod.nombre}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <span className="text-xl">📦</span>
                          )}
                        </div>
                      </td>

                      {/* Name / Barcode */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white line-clamp-1">{prod.nombre}</div>
                        <div className="text-xs font-mono text-[#00E5FF] mt-0.5">{prod.codigo}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {prod.categoria}
                        </span>
                      </td>

                      {/* Global Reference Price */}
                      <td className="py-3 px-4 text-center font-bold text-gray-500">
                        ${masterItem.precio}
                      </td>

                      {/* Branch Price Override Input */}
                      <td className="py-3 px-4">
                        <div className="relative flex justify-center">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">$</span>
                          <input
                            type="number"
                            value={prod.precio}
                            disabled={!hasCustomCatalog || isProductDisabled || saving}
                            onChange={(e) => handlePriceChange(prod.codigo, e.target.value)}
                            className={`w-28 rounded-lg border px-3 py-1.5 pl-6 text-xs font-bold text-white focus:border-[#00E5FF] focus:outline-none ${
                              !hasCustomCatalog || isProductDisabled
                                ? "bg-white/5 border-white/5 text-gray-500 cursor-not-allowed"
                                : isOverridden
                                ? "bg-[#00E5FF]/5 border-[#00E5FF] text-[#00E5FF]"
                                : "bg-white/5 border-white/5"
                            }`}
                          />
                        </div>
                      </td>

                      {/* Enabled / Disabled Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={!hasCustomCatalog || saving}
                          onClick={() => handleToggleStatus(prod.codigo)}
                          className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                            !hasCustomCatalog
                              ? "bg-green-500/10 text-green-500 cursor-not-allowed"
                              : isProductDisabled
                              ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
                              : "bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20"
                          }`}
                        >
                          {isProductDisabled ? "Oculto 🚫" : "Activo 👁️"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredItems.length > 100 && (
          <p className="text-center text-xs text-gray-500 pt-4 font-semibold">
            Mostrando los primeros 100 productos de {filteredItems.length} totales. Usa los buscadores e indicadores de arriba para filtrar.
          </p>
        )}
      </div>
    </div>
  );
}
