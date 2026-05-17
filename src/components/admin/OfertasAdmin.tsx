// filepath: src/components/admin/OfertasAdmin.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/lib/toast-context";
import type { Producto } from "@/types";
import type { OfertaProducto, OfertaConfig } from "@/types/ofertas";

const DEFAULT_CONFIG: OfertaConfig = {
  activa: false,
  titulo: "Ofertas de la Semana",
  subtitulo: "Aprovechá precios únicos por tiempo limitado",
  productos: [],
  updatedAt: new Date().toISOString(),
};

export default function OfertasAdmin() {
  const toast = useToast();
  const [config, setConfig] = useState<OfertaConfig>(DEFAULT_CONFIG);
  const [catalogo, setCatalogo] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  // Load config + catalogo
  useEffect(() => {
    async function load() {
      try {
        // Load ofertas config
        const configSnap = await getDoc(doc(db, "configuracion", "ofertas"));
        if (configSnap.exists()) {
          const data = configSnap.data() as OfertaConfig;
          setConfig({ ...DEFAULT_CONFIG, ...data });
        }

        // Load catalogo for product selector
        const catSnap = await getDoc(doc(db, "catalogo_activo", "productos"));
        if (catSnap.exists()) {
          const items = Object.values(catSnap.data().items || {}) as Producto[];
          setCatalogo(items.filter((p) => (p.precio || 0) > 0));
        }
      } catch (e) {
        console.error("Error loading ofertas config:", e);
        toast.error("Error al cargar configuración");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  // Categories from catalogo
  const categorias = useMemo(() => {
    const cats = new Set(catalogo.map((p) => p.categoria).filter(Boolean));
    return Array.from(cats).sort();
  }, [catalogo]);

  // Filtered catalogo for selector
  const filteredCatalogo = useMemo(() => {
    const selectedCodes = new Set(config.productos.map((p) => p.codigo));
    let results = catalogo.filter((p) => !selectedCodes.has(p.codigo));

    if (catFilter) {
      results = results.filter((p) => p.categoria === catFilter);
    }

    if (searchTerm.trim()) {
      const normalize = (s: string) =>
        s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const terms = normalize(searchTerm).split(/\s+/);
      results = results.filter((p) => {
        const text = normalize(`${p.nombre} ${p.codigo}`);
        return terms.every((t) => text.includes(t));
      });
    }

    return results.slice(0, 50); // Limit for performance
  }, [catalogo, config.productos, searchTerm, catFilter]);

  // Add product to ofertas
  const addProducto = useCallback((producto: Producto) => {
    const oferta: OfertaProducto = {
      codigo: producto.codigo,
      nombre: producto.nombre,
      precioOriginal: producto.precio,
      precioOferta: Math.round(producto.precio * 0.9), // Default 10% off
      descuento: 10,
      imagen: producto.imagen,
      categoria: producto.categoria,
      destacado: false,
    };
    setConfig((prev) => ({
      ...prev,
      productos: [...prev.productos, oferta],
    }));
  }, []);

  // Remove product
  const removeProducto = useCallback((codigo: string) => {
    setConfig((prev) => ({
      ...prev,
      productos: prev.productos.filter((p) => p.codigo !== codigo),
    }));
  }, []);

  // Update product field
  const updateProducto = useCallback((codigo: string, updates: Partial<OfertaProducto>) => {
    setConfig((prev) => ({
      ...prev,
      productos: prev.productos.map((p) => {
        if (p.codigo !== codigo) return p;
        const updated = { ...p, ...updates };
        // Auto-calc descuento when precioOferta changes
        if (updates.precioOferta !== undefined && updated.precioOriginal > 0) {
          updated.descuento = Math.round(
            ((updated.precioOriginal - updated.precioOferta) / updated.precioOriginal) * 100
          );
        }
        return updated;
      }),
    }));
  }, []);

  // Toggle destacado
  const toggleDestacado = useCallback((codigo: string) => {
    updateProducto(codigo, {
      destacado: !config.productos.find((p) => p.codigo === codigo)?.destacado,
    });
  }, [config.productos, updateProducto]);

  // Save to Firestore
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "configuracion", "ofertas"), {
        ...config,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Ofertas guardadas correctamente");
    } catch (e) {
      console.error("Error saving ofertas:", e);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [config, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🔥 Ofertas Activas
            {config.activa && (
              <span className="rounded-full bg-green-500/20 px-3 py-0.5 text-xs font-bold text-green-400 border border-green-500/30">
                EN VIVO
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {config.productos.length} producto{config.productos.length !== 1 ? "s" : ""} en oferta
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#00E5FF] px-6 py-2.5 text-sm font-bold text-[#050914] transition-all hover:bg-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "💾 Guardar Todo"}
          </button>
        </div>
      </div>

      {/* Global Config */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Configuración General
          </h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-xs font-bold text-gray-500">
              {config.activa ? "Ofertas Activas" : "Ofertas Pausadas"}
            </span>
            <div
              onClick={() => setConfig((p) => ({ ...p, activa: !p.activa }))}
              className={`relative h-7 w-12 rounded-full transition-colors cursor-pointer ${
                config.activa ? "bg-green-500" : "bg-white/10"
              }`}
            >
              <div
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                  config.activa ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Título</label>
            <input
              type="text"
              value={config.titulo}
              onChange={(e) => setConfig((p) => ({ ...p, titulo: e.target.value }))}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Subtítulo</label>
            <input
              type="text"
              value={config.subtitulo}
              onChange={(e) => setConfig((p) => ({ ...p, subtitulo: e.target.value }))}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">
              Fecha de Expiración <span className="text-gray-600 font-normal">(countdown)</span>
            </label>
            <input
              type="datetime-local"
              value={config.expiresAt ? config.expiresAt.slice(0, 16) : ""}
              onChange={(e) =>
                setConfig((p) => ({
                  ...p,
                  expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                }))
              }
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]/40"
              style={{ colorScheme: "dark" }}
            />
          </div>
        </div>
      </div>

      {/* Product Selector Toggle */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] p-4 text-center hover:border-[#00E5FF]/30 hover:bg-white/[0.02] transition-all group"
      >
        <span className="text-lg group-hover:scale-110 inline-block transition-transform">
          {showSelector ? "✕" : "＋"}
        </span>
        <p className="text-sm font-bold text-gray-400 mt-1">
          {showSelector ? "Cerrar selector" : "Agregar productos a la oferta"}
        </p>
      </button>

      {/* Product Selector */}
      {showSelector && (
        <div className="rounded-2xl border border-[#00E5FF]/20 bg-[#0A0F1C] p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-sm font-bold text-[#00E5FF] uppercase tracking-widest">
            Seleccionar Productos del Catálogo
          </h3>

          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="flex-1 min-w-[200px] rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]/40"
            />
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none"
            >
              <option value="" className="bg-[#0A0F1C]">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0A0F1C]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {filteredCatalogo.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-6">
              {searchTerm || catFilter
                ? "Sin resultados para esa búsqueda"
                : "Todos los productos ya están en la oferta"}
            </p>
          ) : (
            <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredCatalogo.map((p) => (
                <button
                  key={p.codigo}
                  onClick={() => addProducto(p)}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3 text-left hover:bg-white/[0.06] hover:border-[#00E5FF]/20 transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {p.codigo} · {p.categoria}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-white">
                      ${p.precio.toLocaleString("es-UY")}
                    </span>
                    <span className="rounded-lg bg-[#00E5FF]/10 px-2.5 py-1 text-xs font-bold text-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity">
                      + Agregar
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Products Table */}
      {config.productos.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Productos en Oferta ({config.productos.length})
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> Destacado
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {config.productos.map((p) => (
              <div
                key={p.codigo}
                className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                  p.destacado ? "bg-amber-500/[0.04]" : ""
                }`}
              >
                {/* Star toggle */}
                <button
                  onClick={() => toggleDestacado(p.codigo)}
                  className={`text-lg transition-all ${
                    p.destacado ? "text-amber-400 scale-110" : "text-gray-700 hover:text-amber-400"
                  }`}
                  title="Marcar como destacado"
                >
                  {p.destacado ? "★" : "☆"}
                </button>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-500">{p.codigo} · {p.categoria}</p>
                </div>

                {/* Original price */}
                <div className="text-center shrink-0">
                  <p className="text-[10px] font-bold text-gray-600 uppercase">Original</p>
                  <p className="text-sm font-bold text-gray-400">
                    ${p.precioOriginal.toLocaleString("es-UY")}
                  </p>
                </div>

                {/* Offer price input */}
                <div className="text-center shrink-0">
                  <p className="text-[10px] font-bold text-gray-600 uppercase">Oferta</p>
                  <input
                    type="number"
                    value={p.precioOferta}
                    onChange={(e) =>
                      updateProducto(p.codigo, { precioOferta: Number(e.target.value) })
                    }
                    className="w-24 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-center font-bold text-green-400 focus:outline-none focus:border-green-400/40"
                  />
                </div>

                {/* Discount badge */}
                <div className="shrink-0">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                      p.descuento >= 20
                        ? "bg-red-500/20 text-red-400"
                        : p.descuento >= 10
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {p.descuento}% OFF
                  </span>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeProducto(p.codigo)}
                  className="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {config.productos.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">🏷️</span>
          <h3 className="text-lg font-bold text-gray-400">Sin productos en oferta</h3>
          <p className="text-sm text-gray-600 mt-2">
            Usá el botón de arriba para seleccionar productos del catálogo
          </p>
        </div>
      )}
    </div>
  );
}
