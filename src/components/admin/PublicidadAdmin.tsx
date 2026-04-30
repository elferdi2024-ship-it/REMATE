// filepath: src/components/admin/PublicidadAdmin.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/lib/toast-context";
import Image from "next/image";
import type { BrandConfig, BrandAsset, BrandTier } from "@/types/brands";
import { TIER_COLORS, TIER_WEIGHTS } from "@/types/brands";
import { DEFAULT_BRANDS } from "@/lib/brands";
import { differenceInDays, format, isPast, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const TIERS: BrandTier[] = ["bronce", "plata", "oro"];

export default function PublicidadAdmin() {
  const [brands, setBrands] = useState<BrandConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingBrand, setEditingBrand] = useState<BrandConfig | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const toast = useToast();

  // Load brands
  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "configuracion", "publicidad"));
        if (snap.exists()) {
          const data = snap.data();
          setBrands(data.brands || []);
        } else {
          // Seed with defaults
          setBrands(DEFAULT_BRANDS);
          await setDoc(doc(db, "configuracion", "publicidad"), {
            brands: DEFAULT_BRANDS,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Error al cargar marcas publicitarias");
        setBrands(DEFAULT_BRANDS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  // Save to Firestore
  const handleSave = useCallback(
    async (updatedBrands: BrandConfig[]) => {
      setSaving(true);
      try {
        await setDoc(
          doc(db, "configuracion", "publicidad"),
          { brands: updatedBrands, updatedAt: new Date().toISOString() },
          { merge: true }
        );
        setBrands(updatedBrands);
        // Clear cache
        try { sessionStorage.removeItem("__brands_cache"); } catch {}
        toast.success("Marcas actualizadas");
      } catch (e) {
        console.error(e);
        toast.error("Error al guardar");
      } finally {
        setSaving(false);
      }
    },
    [toast]
  );

  // Toggle brand active
  const toggleActive = (brandId: string) => {
    const updated = brands.map((b) =>
      b.id === brandId ? { ...b, active: !b.active } : b
    );
    handleSave(updated);
  };

  // Change tier
  const changeTier = (brandId: string, tier: BrandTier) => {
    const updated = brands.map((b) =>
      b.id === brandId ? { ...b, tier } : b
    );
    handleSave(updated);
  };

  // Update expiration
  const updateExpiration = (brandId: string, expiresAt: string) => {
    const updated = brands.map((b) =>
      b.id === brandId ? { ...b, expiresAt } : b
    );
    handleSave(updated);
  };

  // Delete brand
  const deleteBrand = (brandId: string) => {
    if (!confirm("¿Eliminar esta marca publicitaria?")) return;
    const updated = brands.filter((b) => b.id !== brandId);
    handleSave(updated);
  };

  // Delete asset
  const deleteAsset = (brandId: string, assetId: string) => {
    const updated = brands.map((b) => {
      if (b.id !== brandId) return b;
      return { ...b, assets: b.assets.filter((a) => a.id !== assetId) };
    });
    handleSave(updated);
  };

  // Upload asset
  const handleUploadAsset = async (brandId: string, file: File, type: "image" | "video") => {
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;

    setUploading(brandId);
    setUploadProgress(0);

    try {
      const ext = file.name.split(".").pop() || (type === "video" ? "mp4" : "jpg");
      const fileName = `${brand.slug}-${Date.now()}.${ext}`;
      const path = `marcas/${brand.slug}/${type === "video" ? "videos" : "images"}/${fileName}`;
      const storageRef = ref(storage, path);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          toast.error("Error al subir archivo");
          setUploading(null);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const newAsset: BrandAsset = {
            id: `${brand.slug}-${type}-${Date.now()}`,
            type,
            src: url,
            alt: `${brand.name} ${type} ${brand.assets.length + 1}`,
          };

          const updated = brands.map((b) => {
            if (b.id !== brandId) return b;
            return { ...b, assets: [...b.assets, newAsset] };
          });

          await handleSave(updated);
          setUploading(null);
          toast.success(`${type === "video" ? "Video" : "Imagen"} subida correctamente`);
        }
      );
    } catch (e) {
      console.error(e);
      toast.error("Error al procesar archivo");
      setUploading(null);
    }
  };

  // Upload logo
  const handleUploadLogo = async (brandId: string, file: File) => {
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;

    setUploading(`logo-${brandId}`);
    setUploadProgress(0);

    try {
      const ext = file.name.split(".").pop() || "png";
      const fileName = `${brand.slug}-logo.${ext}`;
      const storageRef = ref(storage, `marcas/${brand.slug}/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        () => {
          toast.error("Error al subir logo");
          setUploading(null);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const updated = brands.map((b) => (b.id === brandId ? { ...b, logo: url } : b));
          await handleSave(updated);
          setUploading(null);
          toast.success("Logo actualizado");
        }
      );
    } catch (e) {
      console.error(e);
      setUploading(null);
    }
  };

  // Add new brand
  const handleAddBrand = (formData: { name: string; color: string; categories: string; tier: BrandTier; expiresAt: string }) => {
    const slug = formData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    const newBrand: BrandConfig = {
      id: slug,
      name: formData.name,
      slug,
      color: formData.color,
      categories: formData.categories.split(",").map((c) => c.trim()).filter(Boolean),
      tier: formData.tier,
      active: true,
      assets: [],
      createdAt: new Date().toISOString(),
      expiresAt: formData.expiresAt || undefined,
    };

    handleSave([...brands, newBrand]);
    setShowNewForm(false);
  };

  // Calculate upcoming expirations
  const upcomingExpirations = useMemo(() => {
    return brands.filter(b => {
      if (!b.expiresAt || !b.active) return false;
      const days = differenceInDays(parseISO(b.expiresAt), new Date());
      return days <= 15 && days >= 0;
    });
  }, [brands]);

  const expiredCampaigns = useMemo(() => {
    return brands.filter(b => b.active && b.expiresAt && isPast(parseISO(b.expiresAt)));
  }, [brands]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-3xl tracking-widest text-white">
            PUBLICIDAD <span className="text-[#00E5FF]">& MARCAS</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestioná las marcas patrocinantes y sus assets publicitarios
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="rounded-xl bg-[#00E5FF]/10 px-5 py-2.5 text-sm font-bold text-[#00E5FF] transition-all hover:bg-[#00E5FF]/20 border border-[#00E5FF]/20"
        >
          + Nueva Marca
        </button>
      </div>

      {/* Alerts Section */}
      {(upcomingExpirations.length > 0 || expiredCampaigns.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {expiredCampaigns.length > 0 && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
              <h3 className="font-bebas text-xl text-red-400 mb-3 flex items-center gap-2">
                <span>⚠️</span> Campañas Vencidas
              </h3>
              <ul className="space-y-2">
                {expiredCampaigns.map(b => (
                  <li key={b.id} className="flex justify-between text-sm text-white bg-black/20 p-2 rounded-lg">
                    <span className="font-bold">{b.name}</span>
                    <span className="text-red-400">Venció: {format(parseISO(b.expiresAt!), "dd MMM yyyy", { locale: es })}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {upcomingExpirations.length > 0 && (
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5">
              <h3 className="font-bebas text-xl text-yellow-400 mb-3 flex items-center gap-2">
                <span>⏱</span> Próximas a Vencer
              </h3>
              <ul className="space-y-2">
                {upcomingExpirations.map(b => {
                  const days = differenceInDays(parseISO(b.expiresAt!), new Date());
                  return (
                    <li key={b.id} className="flex justify-between text-sm text-white bg-black/20 p-2 rounded-lg">
                      <span className="font-bold">{b.name}</span>
                      <span className="text-yellow-400">Vence en {days} días</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* New brand form */}
      {showNewForm && (
        <NewBrandForm onSubmit={handleAddBrand} onCancel={() => setShowNewForm(false)} />
      )}

      {/* Brands list */}
      {brands.map((brand) => {
        const tierStyle = TIER_COLORS[brand.tier];
        const images = brand.assets.filter((a) => a.type === "image");
        const videos = brand.assets.filter((a) => a.type === "video");
        
        let statusColor = brand.active ? "text-green-400" : "text-gray-500";
        let statusText = brand.active ? "ACTIVA" : "PAUSADA";

        if (brand.active && brand.expiresAt && isPast(parseISO(brand.expiresAt))) {
          statusColor = "text-red-400";
          statusText = "VENCIDA";
        }

        return (
          <div
            key={brand.id}
            className="overflow-hidden rounded-2xl border bg-[#0A0F1C] shadow-xl"
            style={{ borderColor: brand.active ? tierStyle.border : "rgba(255,255,255,0.05)" }}
          >
            {/* Brand header */}
            <div className="flex flex-col gap-4 border-b border-white/5 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {/* Logo */}
                <div
                  className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                  style={{
                    background: brand.logo ? "#fff" : `${brand.color}20`,
                    border: `1px solid ${brand.color}40`,
                  }}
                >
                  {brand.logo ? (
                    <Image src={brand.logo} alt={brand.name} fill className="object-contain p-1" />
                  ) : (
                    <span className="text-2xl font-bold" style={{ color: brand.color }}>
                      {brand.name[0]}
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {brand.name}
                    <span className={`text-[10px] uppercase tracking-widest font-black ${statusColor}`}>
                      • {statusText}
                    </span>
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: tierStyle.bg, color: tierStyle.text, border: `1px solid ${tierStyle.border}` }}
                    >
                      {brand.tier}
                    </span>
                    <span className="text-xs text-gray-500">
                      {images.length} imgs · {videos.length} videos
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Expiration date */}
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 border border-white/10">
                  <span className="text-xs text-gray-500">Vence:</span>
                  <input
                    type="date"
                    value={brand.expiresAt ? brand.expiresAt.split("T")[0] : ""}
                    onChange={(e) => updateExpiration(brand.id, e.target.value ? new Date(e.target.value).toISOString() : "")}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                {/* Tier selector */}
                <select
                  value={brand.tier}
                  onChange={(e) => changeTier(brand.id, e.target.value as BrandTier)}
                  className="rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white border border-white/10"
                >
                  {TIERS.map((t) => (
                    <option key={t} value={t} className="bg-[#0A0F1C]">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Toggle active */}
                <button
                  onClick={() => toggleActive(brand.id)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                    brand.active
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {brand.active ? "✓ Activa" : "✗ Pausada"}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteBrand(brand.id)}
                  className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20"
                >
                  🗑
                </button>
              </div>
            </div>

            {/* Upload buttons */}
            <div className="flex flex-wrap gap-3 border-b border-white/5 p-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 border border-white/5">
                📷 Subir Imagen
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleUploadAsset(brand.id, e.target.files[0], "image")}
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 border border-white/5">
                🎬 Subir Video
                <input
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => e.target.files?.[0] && handleUploadAsset(brand.id, e.target.files[0], "video")}
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 border border-white/5">
                🏷️ Subir Logo
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleUploadLogo(brand.id, e.target.files[0])}
                />
              </label>

              {/* Upload progress */}
              {uploading === brand.id && (
                <div className="flex items-center gap-2 ml-auto">
                  <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00E5FF] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#00E5FF] font-bold">{Math.round(uploadProgress)}%</span>
                </div>
              )}
            </div>

            {/* Assets grid */}
            <div className="p-4">
              {brand.assets.length === 0 ? (
                <p className="text-center text-sm text-gray-600 py-8">
                  Sin assets. Subí imágenes o videos para esta marca.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {brand.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-white/5"
                    >
                      {asset.type === "image" ? (
                        <Image
                          src={asset.src}
                          alt={asset.alt}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-black/50">
                          <span className="text-2xl">🎬</span>
                        </div>
                      )}

                      {/* Type badge */}
                      <div
                        className="absolute top-1 left-1 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase"
                        style={{
                          background: asset.type === "video" ? "rgba(139,92,246,0.8)" : "rgba(0,0,0,0.5)",
                          color: "#fff",
                        }}
                      >
                        {asset.type === "video" ? "VID" : "IMG"}
                      </div>

                      {/* Delete overlay */}
                      <button
                        onClick={() => deleteAsset(brand.id, asset.id)}
                        className="absolute inset-0 flex items-center justify-center bg-red-500/50 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <span className="text-white text-lg">✕</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="border-t border-white/5 p-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Categorías asociadas
              </p>
              <div className="flex flex-wrap gap-1">
                {brand.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-semibold text-gray-400 border border-white/5"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── New Brand Form ─────────────────────────────────────────────────────────

function NewBrandForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { name: string; color: string; categories: string; tier: BrandTier; expiresAt: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#D62828");
  const [categories, setCategories] = useState("");
  const [tier, setTier] = useState<BrandTier>("bronce");
  const [expiresAt, setExpiresAt] = useState("");

  return (
    <div className="rounded-2xl border border-[#00E5FF]/20 bg-[#0A0F1C] p-6 shadow-xl">
      <h3 className="text-sm font-bold text-[#00E5FF] uppercase tracking-widest mb-4">
        Nueva Marca Publicitaria
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Centenario"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]/40"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Nivel</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as BrandTier)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="bronce" className="bg-[#0A0F1C]">🥉 Bronce</option>
            <option value="plata" className="bg-[#0A0F1C]">🥈 Plata</option>
            <option value="oro" className="bg-[#0A0F1C]">🥇 Oro</option>
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="block text-xs font-bold text-gray-400 mb-1">
            Categorías (separadas por coma)
          </label>
          <input
            type="text"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="BEBIDAS ALCOHÓLICAS, CONSERVAS Y ENLATADOS"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]/40"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">
            Fecha de Fin (Opcional)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]/40"
            style={{ colorScheme: "dark" }}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => name.trim() && onSubmit({ name, color, categories, tier, expiresAt: expiresAt ? new Date(expiresAt).toISOString() : "" })}
          disabled={!name.trim()}
          className="rounded-xl bg-[#00E5FF]/10 px-6 py-2.5 text-sm font-bold text-[#00E5FF] transition-all hover:bg-[#00E5FF]/20 disabled:opacity-30 border border-[#00E5FF]/20"
        >
          Crear Marca
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl bg-white/5 px-6 py-2.5 text-sm font-bold text-gray-400 transition-all hover:bg-white/10 border border-white/5"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
