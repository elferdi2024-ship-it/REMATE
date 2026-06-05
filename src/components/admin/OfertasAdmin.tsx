// filepath: src/components/admin/OfertasAdmin.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/lib/toast-context";
import type { Producto } from "@/types";
import type { OfertaProducto, OfertaConfig, PremiumPromo } from "@/types/ofertas";

const DEFAULT_CONFIG: OfertaConfig = {
  activa: false,
  titulo: "Ofertas de la Semana",
  subtitulo: "Aprovechá precios únicos por tiempo limitado",
  productos: [],
  premiumPromos: [],
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

  // Premium promos state
  const [newPromoTitle, setNewPromoTitle] = useState("");
  const [newPromoPrice, setNewPromoPrice] = useState<number | "">("");
  const [newPromoQty, setNewPromoQty] = useState<number | "">("");
  const [newPromoImage, setNewPromoImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // Image Upload for Premium Promo
  const handleUploadImage = useCallback(async (file: File) => {
    if (!storage) {
      toast.error("Firebase Storage no está configurado");
      return;
    }
    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `promo-${Date.now()}.${ext}`;
      const storageRef = ref(storage, `ofertas/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          console.error("Error uploading image:", error);
          toast.error("Error al subir la imagen");
          setUploadingImage(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setNewPromoImage(url);
          setUploadingImage(false);
          toast.success("Imagen subida correctamente");
        }
      );
    } catch (e) {
      console.error(e);
      toast.error("Error al procesar archivo");
      setUploadingImage(false);
    }
  }, [toast]);

  // Add Premium Promo
  const handleAddPremiumPromo = useCallback(() => {
    if (!newPromoTitle.trim() || newPromoPrice === "" || newPromoQty === "" || !newPromoImage) {
      toast.error("Por favor completa todos los campos, incluyendo la imagen.");
      return;
    }

    const newPromo: PremiumPromo = {
      id: `PREMIUM-${Date.now()}`,
      titulo: newPromoTitle.trim(),
      cantidad: Number(newPromoQty),
      precio: Number(newPromoPrice),
      imagen: newPromoImage,
      activa: true,
    };

    setConfig((prev) => ({
      ...prev,
      premiumPromos: [...(prev.premiumPromos || []), newPromo],
    }));

    setNewPromoTitle("");
    setNewPromoPrice("");
    setNewPromoQty("");
    setNewPromoImage("");
    toast.success("Promoción premium agregada temporalmente. Guarda cambios para confirmar.");
  }, [newPromoTitle, newPromoPrice, newPromoQty, newPromoImage, toast]);

  // Remove Premium Promo
  const handleRemovePremiumPromo = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      premiumPromos: (prev.premiumPromos || []).filter((p) => p.id !== id),
    }));
    toast.success("Promoción eliminada temporalmente. Guarda cambios para confirmar.");
  }, [toast]);

  // Toggle Premium Promo Active Status
  const handleTogglePremiumPromoActive = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      premiumPromos: (prev.premiumPromos || []).map((p) =>
        p.id === id ? { ...p, activa: !p.activa } : p
      ),
    }));
  }, []);

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
      <div className="flex items-center justify-center py-20 text-[var(--admin-text-hi)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--admin-accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[var(--admin-text-mid)]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--admin-text-hi)] flex items-center gap-2">
            🔥 Ofertas Activas
            {config.activa && (
              <span className="rounded-full bg-green-500/20 px-3 py-0.5 text-xs font-bold text-green-600 dark:text-green-400 border border-green-500/30">
                EN VIVO
              </span>
            )}
          </h2>
          <p className="text-sm text-[var(--admin-text-lo)] mt-1">
            {config.productos.length} producto{config.productos.length !== 1 ? "s" : ""} en oferta
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[var(--admin-accent)] px-6 py-2.5 text-sm font-bold text-[var(--admin-sidebar-bg)] transition-all hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "💾 Guardar Todo"}
          </button>
        </div>
      </div>

      {/* Global Config */}
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--admin-text-lo)] uppercase tracking-widest">
            Configuración General
          </h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-xs font-bold text-[var(--admin-text-lo)]">
              {config.activa ? "Ofertas Activas" : "Ofertas Pausadas"}
            </span>
            <div
              onClick={() => setConfig((p) => ({ ...p, activa: !p.activa }))}
              className={`relative h-7 w-12 rounded-full transition-colors cursor-pointer ${
                config.activa ? "bg-green-500" : "bg-[var(--admin-input-bg)] border border-[var(--admin-border)]"
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
            <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Título</label>
            <input
              type="text"
              value={config.titulo}
              onChange={(e) => setConfig((p) => ({ ...p, titulo: e.target.value }))}
              className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:outline-none focus:border-[var(--admin-accent)]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Subtítulo</label>
            <input
              type="text"
              value={config.subtitulo}
              onChange={(e) => setConfig((p) => ({ ...p, subtitulo: e.target.value }))}
              className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:outline-none focus:border-[var(--admin-accent)]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">
              Fecha de Expiración <span className="text-[var(--admin-text-lo)]/60 font-normal">(countdown)</span>
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
              className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] focus:outline-none focus:border-[var(--admin-accent)]/50"
              style={{ colorScheme: "light" }}
            />
          </div>
        </div>
      </div>

      {/* Promociones Premium Destacadas */}
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-[var(--admin-text-lo)] uppercase tracking-widest flex items-center gap-2">
            ⭐ Promociones Premium Destacadas (Banners)
          </h3>
          <p className="text-xs text-[var(--admin-text-lo)]/80 mt-1">
            Carga imágenes promocionales grandes que aparecerán en el catálogo como productos premium destacados.
          </p>
        </div>

        {/* Formulario de Nueva Promoción Premium */}
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/50 p-4 space-y-4">
          <h4 className="text-xs font-bold text-[var(--admin-text-hi)] uppercase tracking-wider">
            Agregar Nueva Promoción Premium
          </h4>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Título de la Oferta</label>
              <input
                type="text"
                placeholder="Ej. COCA / SPRITE 2 X $250"
                value={newPromoTitle}
                onChange={(e) => setNewPromoTitle(e.target.value)}
                className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:outline-none focus:border-[var(--admin-accent)]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Precio Combo ($)</label>
              <input
                type="number"
                placeholder="Ej. 250"
                value={newPromoPrice}
                onChange={(e) => setNewPromoPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:outline-none focus:border-[var(--admin-accent)]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Cantidad de Producto (ej. 2 para 2x)</label>
              <input
                type="number"
                placeholder="Ej. 2"
                value={newPromoQty}
                onChange={(e) => setNewPromoQty(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:outline-none focus:border-[var(--admin-accent)]/50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
            {/* Selector e indicador de imagen */}
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--admin-bg)] px-4 py-2 text-xs font-bold text-[var(--admin-text-hi)] transition-all hover:bg-[var(--admin-input-bg)] border border-[var(--admin-border)] shrink-0">
                📷 {uploadingImage ? "Subiendo..." : "Subir Imagen Promocional"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0])}
                />
              </label>

              {uploadingImage && (
                <span className="text-xs text-[var(--admin-accent)] font-semibold">
                  Subiendo... {Math.round(uploadProgress)}%
                </span>
              )}

              {newPromoImage && !uploadingImage && (
                <div className="flex items-center gap-2">
                  <div className="relative w-12 h-12 rounded-lg border border-[var(--admin-border)] overflow-hidden">
                    <img src={newPromoImage} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                  <span className="text-xs text-green-500 font-medium">✓ Imagen cargada</span>
                </div>
              )}
            </div>

            <button
              onClick={handleAddPremiumPromo}
              className="rounded-xl bg-[var(--admin-accent)] px-5 py-2.5 text-xs font-bold text-[var(--admin-sidebar-bg)] transition-all hover:opacity-90 shrink-0"
            >
              ＋ Agregar Promoción Premium
            </button>
          </div>
        </div>

        {/* Lista de Promociones Premium Agregadas */}
        {(config.premiumPromos || []).length === 0 ? (
          <p className="text-sm text-[var(--admin-text-lo)] text-center py-6 border border-dashed border-[var(--admin-border)] rounded-xl">
            No hay promociones premium configuradas aún.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(config.premiumPromos || []).map((promo) => (
              <div
                key={promo.id}
                className={`flex flex-col rounded-xl border p-4 bg-[var(--admin-bg)]/30 ${
                  promo.activa ? "border-[var(--admin-border)]" : "border-red-500/20 opacity-60"
                }`}
              >
                {/* Image preview */}
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-[var(--admin-border)] bg-white mb-3">
                  <img src={promo.imagen} alt={promo.titulo} className="object-contain w-full h-full" />
                </div>

                <h5 className="text-sm font-bold text-[var(--admin-text-hi)] truncate">{promo.titulo}</h5>
                
                <div className="flex items-center justify-between text-xs text-[var(--admin-text-lo)] mt-1 mb-3">
                  <span>Cant: {promo.cantidad} un.</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ${promo.precio.toLocaleString("es-UY")}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto border-t border-[var(--admin-border)]/50 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase">
                      {promo.activa ? "Activa" : "Pausada"}
                    </span>
                    <button
                      onClick={() => handleTogglePremiumPromoActive(promo.id)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        promo.activa ? "bg-green-500" : "bg-[var(--admin-input-bg)] border border-[var(--admin-border)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
                          promo.activa ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemovePremiumPromo(promo.id)}
                    className="rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-500/20 transition-all"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Selector Toggle */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="w-full rounded-2xl border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 text-center hover:border-[var(--admin-accent)]/30 hover:bg-[var(--admin-input-bg)]/40 transition-all group"
      >
        <span className="text-lg group-hover:scale-110 inline-block transition-transform">
          {showSelector ? "✕" : "＋"}
        </span>
        <p className="text-sm font-bold text-[var(--admin-text-lo)] mt-1">
          {showSelector ? "Cerrar selector" : "Agregar productos a la oferta"}
        </p>
      </button>

      {/* Product Selector */}
      {showSelector && (
        <div className="rounded-2xl border border-[var(--admin-accent)]/20 bg-[var(--admin-card-bg)] p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-sm font-bold text-[var(--admin-accent)] uppercase tracking-widest">
            Seleccionar Productos del Catálogo
          </h3>

          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="flex-1 min-w-[200px] rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:outline-none focus:border-[var(--admin-accent)]/50"
            />
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] focus:outline-none"
            >
              <option value="" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat} className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {filteredCatalogo.length === 0 ? (
            <p className="text-sm text-[var(--admin-text-lo)] text-center py-6">
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
                  className="flex items-center justify-between gap-3 rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-3 text-left hover:bg-[var(--admin-input-bg)] hover:border-[var(--admin-accent)]/20 transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--admin-text-hi)] truncate">{p.nombre}</p>
                    <p className="text-xs text-[var(--admin-text-lo)]">
                      {p.codigo} · {p.categoria}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-[var(--admin-text-hi)]">
                      ${p.precio.toLocaleString("es-UY")}
                    </span>
                    <span className="rounded-lg bg-[var(--admin-accent)]/10 px-2.5 py-1 text-xs font-bold text-[var(--admin-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] overflow-hidden">
          <div className="border-b border-[var(--admin-border)] px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--admin-text-lo)] uppercase tracking-widest">
              Productos en Oferta ({config.productos.length})
            </h3>
            <div className="flex items-center gap-2 text-xs text-[var(--admin-text-lo)]">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> Destacado
            </div>
          </div>

          <div className="divide-y divide-[var(--admin-border)]">
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
                    p.destacado ? "text-amber-400 scale-110" : "text-[var(--admin-text-lo)] hover:text-amber-400"
                  }`}
                  title="Marcar como destacado"
                >
                  {p.destacado ? "★" : "☆"}
                </button>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--admin-text-hi)] truncate">{p.nombre}</p>
                  <p className="text-xs text-[var(--admin-text-lo)]">{p.codigo} · {p.categoria}</p>
                </div>

                {/* Original price */}
                <div className="text-center shrink-0">
                  <p className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase">Original</p>
                  <p className="text-sm font-bold text-[var(--admin-text-lo)]">
                    ${p.precioOriginal.toLocaleString("es-UY")}
                  </p>
                </div>

                {/* Offer price input */}
                <div className="text-center shrink-0">
                  <p className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase">Oferta</p>
                  <input
                    type="number"
                    value={p.precioOferta}
                    onChange={(e) =>
                      updateProducto(p.codigo, { precioOferta: Number(e.target.value) })
                    }
                    className="w-24 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] px-2 py-1.5 text-sm text-center font-bold text-green-600 dark:text-green-400 focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Discount badge */}
                <div className="shrink-0">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                      p.descuento >= 20
                        ? "bg-red-500/20 text-red-600 dark:text-red-400"
                        : p.descuento >= 10
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                          : "bg-green-500/20 text-green-600 dark:text-green-400"
                    }`}
                  >
                    {p.descuento}% OFF
                  </span>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeProducto(p.codigo)}
                  className="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-all shrink-0"
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
          <h3 className="text-lg font-bold text-[var(--admin-text-lo)]">Sin productos en oferta</h3>
          <p className="text-sm text-[var(--admin-text-lo)]/80 mt-2">
            Usá el botón de arriba para seleccionar productos del catálogo
          </p>
        </div>
      )}
    </div>
  );
}
