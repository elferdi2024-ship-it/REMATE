// filepath: src/components/admin/OfertasAdmin.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/lib/toast-context";
import { SUCURSALES } from "@/lib/sucursales";
import type { Producto } from "@/types";
import type {
  OfertaProducto,
  OfertaConfig,
  PremiumPromo,
  BrandBanner,
  SponsoredProduct,
  CategoryOffer,
  FlashOffer,
} from "@/types/ofertas";

const DEFAULT_CONFIG: OfertaConfig = {
  activa: false,
  titulo: "Ofertas de la Semana",
  subtitulo: "Aprovechá precios únicos por tiempo limitado",
  productos: [],
  premiumPromos: [],
  brandBanners: [],
  sponsoredProducts: [],
  categoryOffers: [],
  flashOffers: [],
  updatedAt: new Date().toISOString(),
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatCountdown(target: string): string {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return "Expirada";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  return `${h}h ${m}m`;
}

// ─── Collapsible Section ────────────────────────────────────────────────────
function CollapsibleSection({
  icon,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--admin-input-bg)]/30 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-sm font-bold text-[var(--admin-text-lo)] uppercase tracking-widest flex items-center gap-2">
            {icon} {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[var(--admin-text-lo)]/80 mt-0.5">{subtitle}</p>
          )}
        </div>
        <span
          className={`text-[var(--admin-text-lo)] text-lg transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {open && <div className="px-6 pb-6 space-y-6">{children}</div>}
    </div>
  );
}

// ─── Reusable input class constant ──────────────────────────────────────────
const INPUT_CLS =
  "w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:outline-none focus:border-[var(--admin-accent)]/50";
const LABEL_CLS = "block text-xs font-bold text-[var(--admin-text-lo)] mb-1";

export default function OfertasAdmin() {
  const toast = useToast();
  const { error: toastError } = toast;
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
  const [newPromoBranch, setNewPromoBranch] = useState<string>("todas");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const loadedRef = useRef(false);

  // ── Brand Banners state ─────────────────────────────────────────────────
  const [bbMarca, setBbMarca] = useState("");
  const [bbTitulo, setBbTitulo] = useState("");
  const [bbSubtitulo, setBbSubtitulo] = useState("");
  const [bbImagen, setBbImagen] = useState("");
  const [bbCtaTexto, setBbCtaTexto] = useState("");
  const [bbCtaLink, setBbCtaLink] = useState("");
  const [bbColorFondo, setBbColorFondo] = useState("#1a1a2e");
  const [bbColorTexto, setBbColorTexto] = useState("#ffffff");
  const [bbFechaInicio, setBbFechaInicio] = useState("");
  const [bbFechaFin, setBbFechaFin] = useState("");
  const [bbUploading, setBbUploading] = useState(false);
  const [bbUploadProgress, setBbUploadProgress] = useState(0);

  // ── Sponsored Products state ────────────────────────────────────────────
  const [spSearch, setSpSearch] = useState("");
  const [spMarca, setSpMarca] = useState("");
  const [spBadge, setSpBadge] = useState("Patrocinado");
  const [spPrecioPromo, setSpPrecioPromo] = useState<number | "">("");
  const [spMode, setSpMode] = useState<"catalogo" | "manual">("catalogo");
  const [spManualNombre, setSpManualNombre] = useState("");
  const [spManualMarca, setSpManualMarca] = useState("");
  const [spManualBadge, setSpManualBadge] = useState("Patrocinado");
  const [spManualImagen, setSpManualImagen] = useState("");
  const [spManualUploading, setSpManualUploading] = useState(false);
  const [spManualUploadProgress, setSpManualUploadProgress] = useState(0);

  // ── Category Offers state ───────────────────────────────────────────────
  const [coTitulo, setCoTitulo] = useState("");
  const [coDescripcion, setCoDescripcion] = useState("");
  const [coCategoria, setCoCategoria] = useState("");
  const [coColor, setCoColor] = useState("#6366f1");
  const [coFechaInicio, setCoFechaInicio] = useState("");
  const [coFechaFin, setCoFechaFin] = useState("");
  const [coImagen, setCoImagen] = useState("");
  const [coUploading, setCoUploading] = useState(false);
  const [coUploadProgress, setCoUploadProgress] = useState(0);

  // ── Flash Offers state ──────────────────────────────────────────────────
  const [foTitulo, setFoTitulo] = useState("");
  const [foDescripcion, setFoDescripcion] = useState("");
  const [foFechaInicio, setFoFechaInicio] = useState("");
  const [foFechaFin, setFoFechaFin] = useState("");
  const [foColor, setFoColor] = useState("#ef4444");
  const [foShowProductSelector, setFoShowProductSelector] = useState(false);
  const [foProductSearch, setFoProductSearch] = useState("");
  const [foStagedProducts, setFoStagedProducts] = useState<OfertaProducto[]>([]);

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
        toastError("Error al cargar configuración");
      } finally {
        setLoading(false);
        setTimeout(() => {
          loadedRef.current = true;
        }, 300);
      }
    }
    load();
  }, [toastError]);

  // Auto-save to Firestore on config change (with debounce)
  useEffect(() => {
    if (!loadedRef.current) return;

    const timer = setTimeout(async () => {
      try {
        await setDoc(doc(db, "configuracion", "ofertas"), {
          ...config,
          updatedAt: new Date().toISOString(),
        });
        console.log("Configuración auto-guardada en Firestore");
      } catch (e) {
        console.error("Error en auto-guardado de ofertas:", e);
      }
    }, 1200); // 1.2s debounce to prevent firestore spam

    return () => clearTimeout(timer);
  }, [config]);

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

  // Filtered catalogo for sponsored products selector
  const spFilteredCatalogo = useMemo(() => {
    const existingCodes = new Set(
      (config.sponsoredProducts || []).map((sp) => sp.codigoProducto)
    );
    let results = catalogo.filter((p) => !existingCodes.has(p.codigo));
    if (spSearch.trim()) {
      const normalize = (s: string) =>
        s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const terms = normalize(spSearch).split(/\s+/);
      results = results.filter((p) => {
        const text = normalize(`${p.nombre} ${p.codigo}`);
        return terms.every((t) => text.includes(t));
      });
    }
    return results.slice(0, 20);
  }, [catalogo, config.sponsoredProducts, spSearch]);

  // Filtered catalogo for flash offer product selector
  const foFilteredCatalogo = useMemo(() => {
    const stagedCodes = new Set(foStagedProducts.map((p) => p.codigo));
    let results = catalogo.filter((p) => !stagedCodes.has(p.codigo));
    if (foProductSearch.trim()) {
      const normalize = (s: string) =>
        s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const terms = normalize(foProductSearch).split(/\s+/);
      results = results.filter((p) => {
        const text = normalize(`${p.nombre} ${p.codigo}`);
        return terms.every((t) => text.includes(t));
      });
    }
    return results.slice(0, 20);
  }, [catalogo, foStagedProducts, foProductSearch]);

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
  const removeProducto = useCallback((codigo: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
  const toggleDestacado = useCallback((codigo: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    updateProducto(codigo, {
      destacado: !config.productos.find((p) => p.codigo === codigo)?.destacado,
    });
  }, [config.productos, updateProducto]);

  // ── Generic image uploader ────────────────────────────────────────────────
  const uploadGenericImage = useCallback(
    async (
      file: File,
      folder: string,
      onProgress: (p: number) => void,
      onDone: (url: string) => void,
      setUploading: (v: boolean) => void
    ) => {
      if (!storage) {
        toast.error("Firebase Storage no está configurado");
        return;
      }
      setUploading(true);
      onProgress(0);
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${folder}-${Date.now()}.${ext}`;
        const storageRef = ref(storage, `ofertas/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            onProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          },
          (error) => {
            console.error("Error uploading image:", error);
            toast.error("Error al subir la imagen");
            setUploading(false);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            onDone(url);
            setUploading(false);
            toast.success("Imagen subida correctamente");
          }
        );
      } catch (e) {
        console.error(e);
        toast.error("Error al procesar archivo");
        setUploading(false);
      }
    },
    [toast]
  );

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
  const handleAddPremiumPromo = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newPromoTitle.trim() || !newPromoImage) {
      toast.error("Por favor completa el título y la imagen.");
      return;
    }

    const newPromo: PremiumPromo = {
      id: `PREMIUM-${Date.now()}`,
      titulo: newPromoTitle.trim(),
      cantidad: newPromoQty === "" ? null : Number(newPromoQty),
      precio: newPromoPrice === "" ? null : Number(newPromoPrice),
      imagen: newPromoImage,
      activa: true,
      sucursalId: newPromoBranch === "todas" ? null : newPromoBranch,
    };

    setConfig((prev) => ({
      ...prev,
      premiumPromos: [...(prev.premiumPromos || []), newPromo],
    }));

    setNewPromoTitle("");
    setNewPromoPrice("");
    setNewPromoQty("");
    setNewPromoImage("");
    setNewPromoBranch("todas");
    toast.success("Promoción premium agregada temporalmente. Guarda cambios para confirmar.");
  }, [newPromoTitle, newPromoPrice, newPromoQty, newPromoImage, newPromoBranch, toast]);

  // Remove Premium Promo
  const handleRemovePremiumPromo = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setConfig((prev) => ({
      ...prev,
      premiumPromos: (prev.premiumPromos || []).filter((p) => p.id !== id),
    }));
    toast.success("Promoción eliminada temporalmente. Guarda cambios para confirmar.");
  }, [toast]);

  // Toggle Premium Promo Active Status
  const handleTogglePremiumPromoActive = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setConfig((prev) => ({
      ...prev,
      premiumPromos: (prev.premiumPromos || []).map((p) =>
        p.id === id ? { ...p, activa: !p.activa } : p
      ),
    }));
  }, []);

  // ── Brand Banner handlers ───────────────────────────────────────────────
  const handleUploadBbImage = useCallback(
    (file: File) =>
      uploadGenericImage(file, "brand-banner", setBbUploadProgress, setBbImagen, setBbUploading),
    [uploadGenericImage]
  );

  const handleAddBrandBanner = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!bbMarca.trim() || !bbTitulo.trim() || !bbImagen) {
        toast.error("Marca, título e imagen son obligatorios.");
        return;
      }
      const banner: BrandBanner = {
        id: `BB-${Date.now()}`,
        marcaNombre: bbMarca.trim(),
        titulo: bbTitulo.trim(),
        subtitulo: bbSubtitulo.trim(),
        imagen: bbImagen,
        ctaTexto: bbCtaTexto.trim() || "Ver más",
        ctaLink: bbCtaLink.trim(),
        colorFondo: bbColorFondo,
        colorTexto: bbColorTexto,
        activo: true,
        orden: (config.brandBanners || []).length,
        fechaInicio: bbFechaInicio || undefined,
        fechaFin: bbFechaFin || undefined,
      };
      setConfig((prev) => ({
        ...prev,
        brandBanners: [...(prev.brandBanners || []), banner],
      }));
      setBbMarca("");
      setBbTitulo("");
      setBbSubtitulo("");
      setBbImagen("");
      setBbCtaTexto("");
      setBbCtaLink("");
      setBbColorFondo("#1a1a2e");
      setBbColorTexto("#ffffff");
      setBbFechaInicio("");
      setBbFechaFin("");
      toast.success("Banner de marca agregado.");
    },
    [
      bbMarca, bbTitulo, bbSubtitulo, bbImagen, bbCtaTexto, bbCtaLink,
      bbColorFondo, bbColorTexto, bbFechaInicio, bbFechaFin, config.brandBanners, toast,
    ]
  );

  const handleToggleBrandBanner = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      brandBanners: (prev.brandBanners || []).map((b) =>
        b.id === id ? { ...b, activo: !b.activo } : b
      ),
    }));
  }, []);

  const handleRemoveBrandBanner = useCallback(
    (id: string) => {
      setConfig((prev) => ({
        ...prev,
        brandBanners: (prev.brandBanners || []).filter((b) => b.id !== id),
      }));
      toast.success("Banner eliminado.");
    },
    [toast]
  );

  // ── Sponsored Products handlers ─────────────────────────────────────────
  const handleAddSponsoredProduct = useCallback(
    (producto: Producto) => {
      const sp: SponsoredProduct = {
        id: `SP-${Date.now()}`,
        codigoProducto: producto.codigo,
        nombreProducto: producto.nombre,
        marcaNombre: spMarca.trim(),
        precioOriginal: producto.precio,
        precioPromo: spPrecioPromo === "" ? undefined : Number(spPrecioPromo),
        imagen: producto.imagen,
        badgeTexto: spBadge.trim() || "Patrocinado",
        activo: true,
        orden: (config.sponsoredProducts || []).length,
      };
      setConfig((prev) => ({
        ...prev,
        sponsoredProducts: [...(prev.sponsoredProducts || []), sp],
      }));
      setSpSearch("");
      setSpMarca("");
      setSpBadge("Patrocinado");
      setSpPrecioPromo("");
      toast.success("Producto patrocinado agregado.");
    },
    [spMarca, spBadge, spPrecioPromo, config.sponsoredProducts, toast]
  );

  const handleToggleSponsoredProduct = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      sponsoredProducts: (prev.sponsoredProducts || []).map((sp) =>
        sp.id === id ? { ...sp, activo: !sp.activo } : sp
      ),
    }));
  }, []);

  const handleRemoveSponsoredProduct = useCallback(
    (id: string) => {
      setConfig((prev) => ({
        ...prev,
        sponsoredProducts: (prev.sponsoredProducts || []).filter((sp) => sp.id !== id),
      }));
      toast.success("Producto patrocinado eliminado.");
    },
    [toast]
  );

  const handleUploadSpManualImage = useCallback(
    (file: File) =>
      uploadGenericImage(
        file,
        "sponsored-manual",
        setSpManualUploadProgress,
        setSpManualImagen,
        setSpManualUploading
      ),
    [uploadGenericImage]
  );

  const handleAddSponsoredManual = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!spManualNombre.trim() || !spManualImagen) {
        toast.error("El nombre y la imagen son obligatorios para el patrocinado manual.");
        return;
      }
      const sp: SponsoredProduct = {
        id: `SP-MANUAL-${Date.now()}`,
        nombreProducto: spManualNombre.trim(),
        marcaNombre: spManualMarca.trim(),
        imagen: spManualImagen,
        badgeTexto: spManualBadge.trim() || "Patrocinado",
        activo: true,
        orden: (config.sponsoredProducts || []).length,
      };
      setConfig((prev) => ({
        ...prev,
        sponsoredProducts: [...(prev.sponsoredProducts || []), sp],
      }));
      setSpManualNombre("");
      setSpManualMarca("");
      setSpManualBadge("Patrocinado");
      setSpManualImagen("");
      toast.success("Publicidad patrocinada agregada.");
    },
    [spManualNombre, spManualMarca, spManualBadge, spManualImagen, config.sponsoredProducts, toast]
  );

  // ── Category Offers handlers ────────────────────────────────────────────
  const handleUploadCoImage = useCallback(
    (file: File) =>
      uploadGenericImage(file, "cat-offer", setCoUploadProgress, setCoImagen, setCoUploading),
    [uploadGenericImage]
  );

  const handleAddCategoryOffer = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!coTitulo.trim() || !coCategoria) {
        toast.error("Título y categoría son obligatorios.");
        return;
      }
      const offer: CategoryOffer = {
        id: `CO-${Date.now()}`,
        titulo: coTitulo.trim(),
        descripcion: coDescripcion.trim(),
        categoria: coCategoria,
        imagen: coImagen,
        colorAccent: coColor,
        productos: [],
        activa: true,
        fechaInicio: coFechaInicio || undefined,
        fechaFin: coFechaFin || undefined,
      };
      setConfig((prev) => ({
        ...prev,
        categoryOffers: [...(prev.categoryOffers || []), offer],
      }));
      setCoTitulo("");
      setCoDescripcion("");
      setCoCategoria("");
      setCoColor("#6366f1");
      setCoFechaInicio("");
      setCoFechaFin("");
      setCoImagen("");
      toast.success("Oferta por categoría agregada.");
    },
    [coTitulo, coDescripcion, coCategoria, coColor, coFechaInicio, coFechaFin, coImagen, toast]
  );

  const handleToggleCategoryOffer = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      categoryOffers: (prev.categoryOffers || []).map((co) =>
        co.id === id ? { ...co, activa: !co.activa } : co
      ),
    }));
  }, []);

  const handleRemoveCategoryOffer = useCallback(
    (id: string) => {
      setConfig((prev) => ({
        ...prev,
        categoryOffers: (prev.categoryOffers || []).filter((co) => co.id !== id),
      }));
      toast.success("Oferta por categoría eliminada.");
    },
    [toast]
  );

  // ── Flash Offers handlers ───────────────────────────────────────────────
  const handleAddFlashOffer = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!foTitulo.trim() || !foFechaInicio || !foFechaFin) {
        toast.error("Título, fecha inicio y fecha fin son obligatorios.");
        return;
      }
      if (foStagedProducts.length === 0) {
        toast.error("Agrega al menos un producto a la oferta flash.");
        return;
      }
      const flash: FlashOffer = {
        id: `FO-${Date.now()}`,
        titulo: foTitulo.trim(),
        descripcion: foDescripcion.trim(),
        productos: foStagedProducts,
        fechaInicio: new Date(foFechaInicio).toISOString(),
        fechaFin: new Date(foFechaFin).toISOString(),
        activa: true,
        colorAccent: foColor,
      };
      setConfig((prev) => ({
        ...prev,
        flashOffers: [...(prev.flashOffers || []), flash],
      }));
      setFoTitulo("");
      setFoDescripcion("");
      setFoFechaInicio("");
      setFoFechaFin("");
      setFoColor("#ef4444");
      setFoStagedProducts([]);
      setFoShowProductSelector(false);
      toast.success("Oferta flash creada.");
    },
    [foTitulo, foDescripcion, foFechaInicio, foFechaFin, foColor, foStagedProducts, toast]
  );

  const handleAddFlashProduct = useCallback((producto: Producto) => {
    const oferta: OfertaProducto = {
      codigo: producto.codigo,
      nombre: producto.nombre,
      precioOriginal: producto.precio,
      precioOferta: Math.round(producto.precio * 0.85),
      descuento: 15,
      imagen: producto.imagen,
      categoria: producto.categoria,
      destacado: false,
    };
    setFoStagedProducts((prev) => [...prev, oferta]);
  }, []);

  const handleRemoveFlashProduct = useCallback((codigo: string) => {
    setFoStagedProducts((prev) => prev.filter((p) => p.codigo !== codigo));
  }, []);

  const handleToggleFlashOffer = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      flashOffers: (prev.flashOffers || []).map((fo) =>
        fo.id === id ? { ...fo, activa: !fo.activa } : fo
      ),
    }));
  }, []);

  const handleRemoveFlashOffer = useCallback(
    (id: string) => {
      setConfig((prev) => ({
        ...prev,
        flashOffers: (prev.flashOffers || []).filter((fo) => fo.id !== id),
      }));
      toast.success("Oferta flash eliminada.");
    },
    [toast]
  );

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

  // ── Metrics computed ────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const bannersActivos = (config.brandBanners || []).filter((b) => b.activo).length;
    const sponsoredActivos = (config.sponsoredProducts || []).filter((s) => s.activo).length;
    const ofertasActivas = (config.categoryOffers || []).filter((c) => c.activa).length;
    const premiumActivas = (config.premiumPromos || []).filter((p) => p.activa).length;
    const flashActivas = (config.flashOffers || []).filter((f) => f.activa).length;
    return { bannersActivos, sponsoredActivos, ofertasActivas, premiumActivas, flashActivas };
  }, [config.brandBanners, config.sponsoredProducts, config.categoryOffers, config.premiumPromos, config.flashOffers]);

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
            <label className={LABEL_CLS}>Título</label>
            <input
              type="text"
              value={config.titulo}
              onChange={(e) => setConfig((p) => ({ ...p, titulo: e.target.value }))}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Subtítulo</label>
            <input
              type="text"
              value={config.subtitulo}
              onChange={(e) => setConfig((p) => ({ ...p, subtitulo: e.target.value }))}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>
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
              className={INPUT_CLS}
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={LABEL_CLS}>Título de la Oferta</label>
              <input
                type="text"
                placeholder="Ej. COCA / SPRITE 2 X $250"
                value={newPromoTitle}
                onChange={(e) => setNewPromoTitle(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Precio Combo ($)</label>
              <input
                type="number"
                placeholder="Ej. 250"
                value={newPromoPrice}
                onChange={(e) => setNewPromoPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Cantidad de Producto (ej. 2 para 2x)</label>
              <input
                type="number"
                placeholder="Ej. 2"
                value={newPromoQty}
                onChange={(e) => setNewPromoQty(e.target.value === "" ? "" : Number(e.target.value))}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>
                📍 Sucursal Destino <span className="text-[var(--admin-text-lo)]/60 font-normal">(Exclusivo)</span>
              </label>
              <select
                value={newPromoBranch}
                onChange={(e) => setNewPromoBranch(e.target.value)}
                className={INPUT_CLS}
              >
                <option value="todas">🌍 Todas las Sucursales</option>
                {SUCURSALES.map((suc) => (
                  <option key={suc.id} value={suc.id}>
                    📍 {suc.nombre} ({suc.direccion})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
            {/* Selector e indicador de imagen */}
            <div className="flex flex-col gap-1.5">
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
              <span className="text-[10px] text-[var(--admin-text-lo)]/70">
                💡 <b>Diseño óptimo:</b> Proporción <b>1:1 (cuadrada)</b>. Mínimo 800x800 px recomendado. Se recortará a 1:1.
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => handleAddPremiumPromo(e)}
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
                <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-[var(--admin-border)] bg-white mb-3">
                  <img src={promo.imagen} alt={promo.titulo} className="object-contain w-full h-full" />
                </div>

                <h5 className="text-sm font-bold text-[var(--admin-text-hi)] truncate">{promo.titulo}</h5>
                
                <div className="text-[10px] font-semibold text-[var(--admin-text-lo)] mt-1 flex items-center gap-1">
                  <span>📍</span>
                  <span>
                    {promo.sucursalId
                      ? SUCURSALES.find((s) => s.id === promo.sucursalId)?.nombre || "Sucursal desconocida"
                      : "Todas las sucursales"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--admin-text-lo)] mt-2 mb-3">
                  <span>Cant: {promo.cantidad !== null && promo.cantidad !== undefined ? `${promo.cantidad} un.` : "-"}</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {promo.precio !== null && promo.precio !== undefined ? `$${promo.precio.toLocaleString("es-UY")}` : "Sin precio"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto border-t border-[var(--admin-border)]/50 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase">
                      {promo.activa ? "Activa" : "Pausada"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleTogglePremiumPromoActive(promo.id, e)}
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
                    type="button"
                    onClick={(e) => handleRemovePremiumPromo(promo.id, e)}
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

      {/* ================================================================== */}
      {/* SECTION 1: 📢 BANNERS PUBLICITARIOS DE MARCA                       */}
      {/* ================================================================== */}
      <CollapsibleSection
        icon="📢"
        title="Banners Publicitarios de Marca"
        subtitle="Espacios premium full-width para marcas destacadas"
      >
        {/* Form */}
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/50 p-4 space-y-4">
          <h4 className="text-xs font-bold text-[var(--admin-text-hi)] uppercase tracking-wider">
            Nuevo Banner de Marca
          </h4>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={LABEL_CLS}>Nombre de Marca</label>
              <input type="text" placeholder="Ej. Coca-Cola" value={bbMarca} onChange={(e) => setBbMarca(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Título del Banner</label>
              <input type="text" placeholder="Ej. Promo Verano" value={bbTitulo} onChange={(e) => setBbTitulo(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Subtítulo</label>
              <input type="text" placeholder="Ej. Hasta 30% OFF" value={bbSubtitulo} onChange={(e) => setBbSubtitulo(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Texto del CTA</label>
              <input type="text" placeholder="Ej. Ver productos" value={bbCtaTexto} onChange={(e) => setBbCtaTexto(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Link del CTA</label>
              <input type="text" placeholder="Ej. /catalogo?marca=coca-cola" value={bbCtaLink} onChange={(e) => setBbCtaLink(e.target.value)} className={INPUT_CLS} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Color Fondo</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bbColorFondo} onChange={(e) => setBbColorFondo(e.target.value)} className="h-10 w-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent" />
                  <span className="text-xs text-[var(--admin-text-lo)] font-mono">{bbColorFondo}</span>
                </div>
              </div>
              <div>
                <label className={LABEL_CLS}>Color Texto</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bbColorTexto} onChange={(e) => setBbColorTexto(e.target.value)} className="h-10 w-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent" />
                  <span className="text-xs text-[var(--admin-text-lo)] font-mono">{bbColorTexto}</span>
                </div>
              </div>
            </div>
            <div>
              <label className={LABEL_CLS}>Fecha Inicio</label>
              <input type="datetime-local" value={bbFechaInicio} onChange={(e) => setBbFechaInicio(e.target.value)} className={INPUT_CLS} style={{ colorScheme: "light" }} />
            </div>
            <div>
              <label className={LABEL_CLS}>Fecha Fin</label>
              <input type="datetime-local" value={bbFechaFin} onChange={(e) => setBbFechaFin(e.target.value)} className={INPUT_CLS} style={{ colorScheme: "light" }} />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--admin-bg)] px-4 py-2 text-xs font-bold text-[var(--admin-text-hi)] transition-all hover:bg-[var(--admin-input-bg)] border border-[var(--admin-border)] shrink-0">
                  📷 {bbUploading ? "Subiendo..." : "Subir Imagen del Banner"}
                  <input type="file" className="hidden" accept="image/*" disabled={bbUploading} onChange={(e) => e.target.files?.[0] && handleUploadBbImage(e.target.files[0])} />
                </label>
                {bbUploading && (
                  <span className="text-xs text-[var(--admin-accent)] font-semibold">
                    Subiendo... {Math.round(bbUploadProgress)}%
                  </span>
                )}
                {bbImagen && !bbUploading && (
                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12 rounded-lg border border-[var(--admin-border)] overflow-hidden">
                      <img src={bbImagen} alt="Preview" className="object-cover w-full h-full" />
                    </div>
                    <span className="text-xs text-green-500 font-medium">✓ Imagen cargada</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[var(--admin-text-lo)]/70">
                💡 <b>Diseño óptimo:</b> Proporción <b>1:1 (cuadrada/logo)</b>. Recomendado PNG transparente. Se muestra contenido a la derecha.
              </span>
            </div>
            <button type="button" onClick={(e) => handleAddBrandBanner(e)} className="rounded-xl bg-[var(--admin-accent)] px-5 py-2.5 text-xs font-bold text-[var(--admin-sidebar-bg)] transition-all hover:opacity-90 shrink-0">
              ＋ Agregar Banner de Marca
            </button>
          </div>
        </div>

        {/* Banner Grid */}
        {(config.brandBanners || []).length === 0 ? (
          <p className="text-sm text-[var(--admin-text-lo)] text-center py-6 border border-dashed border-[var(--admin-border)] rounded-xl">
            No hay banners de marca configurados aún.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(config.brandBanners || []).map((banner) => (
              <div
                key={banner.id}
                className={`rounded-xl border overflow-hidden ${
                  banner.activo ? "border-[var(--admin-border)]" : "border-red-500/20 opacity-60"
                }`}
              >
                {/* Preview */}
                <div
                  className="relative p-5 flex items-center gap-4 min-h-[120px]"
                  style={{ backgroundColor: banner.colorFondo, color: banner.colorTexto }}
                >
                  {banner.imagen && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-white/20">
                      <img src={banner.imagen} alt={banner.titulo} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{banner.marcaNombre}</p>
                    <p className="text-base font-black truncate">{banner.titulo}</p>
                    {banner.subtitulo && <p className="text-xs opacity-80 truncate">{banner.subtitulo}</p>}
                    {banner.ctaTexto && (
                      <span className="inline-block mt-2 px-3 py-1 rounded-lg text-[10px] font-bold bg-white/20 backdrop-blur-sm">
                        {banner.ctaTexto} →
                      </span>
                    )}
                  </div>
                </div>
                {/* Controls */}
                <div className="flex items-center justify-between px-4 py-3 bg-[var(--admin-bg)]/50">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase">
                      {banner.activo ? "Activo" : "Pausado"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleBrandBanner(banner.id)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        banner.activo ? "bg-green-500" : "bg-[var(--admin-input-bg)] border border-[var(--admin-border)]"
                      }`}
                    >
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform ${banner.activo ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--admin-text-lo)]">
                    {banner.fechaFin && <span>Hasta: {new Date(banner.fechaFin).toLocaleDateString("es-UY")}</span>}
                    <button
                      type="button"
                      onClick={() => handleRemoveBrandBanner(banner.id)}
                      className="rounded-lg bg-red-500/10 px-2 py-1 font-bold text-red-500 hover:bg-red-500/20 transition-all"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* ================================================================== */}
      {/* SECTION 2: 🎯 PRODUCTOS PATROCINADOS                              */}
      {/* ================================================================== */}
      <CollapsibleSection
        icon="🎯"
        title="Productos Patrocinados"
        subtitle="Posición preferencial en la grilla del catálogo"
      >
        {/* Form */}
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/50 p-4 space-y-4">
          <div className="flex gap-4 border-b border-[var(--admin-border)]/50 pb-2">
            <button
              type="button"
              onClick={() => setSpMode("catalogo")}
              className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all ${
                spMode === "catalogo"
                  ? "text-[var(--admin-accent)] border-b-2 border-[var(--admin-accent)]"
                  : "text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
              }`}
            >
              Seleccionar del Catálogo
            </button>
            <button
              type="button"
              onClick={() => setSpMode("manual")}
              className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all ${
                spMode === "manual"
                  ? "text-[var(--admin-accent)] border-b-2 border-[var(--admin-accent)]"
                  : "text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
              }`}
            >
              Crear Patrocinado Manual (Sin Precio / Publicidad)
            </button>
          </div>

          {spMode === "catalogo" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[var(--admin-text-hi)] uppercase tracking-wider">
                Agregar Producto Patrocinado desde Catálogo
              </h4>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLS}>Nombre de Marca</label>
                  <input type="text" placeholder="Marca patrocinadora" value={spMarca} onChange={(e) => setSpMarca(e.target.value)} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Texto del Badge</label>
                  <input type="text" placeholder="Patrocinado" value={spBadge} onChange={(e) => setSpBadge(e.target.value)} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Precio Promo (opcional)</label>
                  <input
                    type="number"
                    placeholder="Dejar vacío para precio original"
                    value={spPrecioPromo}
                    onChange={(e) => setSpPrecioPromo(e.target.value === "" ? "" : Number(e.target.value))}
                    className={INPUT_CLS}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Buscar Producto del Catálogo</label>
                <input type="text" placeholder="Buscar por nombre o código..." value={spSearch} onChange={(e) => setSpSearch(e.target.value)} className={INPUT_CLS} />
              </div>

              {spSearch.trim() && spFilteredCatalogo.length > 0 && (
                <div className="grid gap-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                  {spFilteredCatalogo.map((p) => (
                    <button
                      key={p.codigo}
                      onClick={() => handleAddSponsoredProduct(p)}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-3 text-left hover:bg-[var(--admin-input-bg)] hover:border-[var(--admin-accent)]/20 transition-all group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--admin-text-hi)] truncate">{p.nombre}</p>
                        <p className="text-xs text-[var(--admin-text-lo)]">{p.codigo} · {p.categoria}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-[var(--admin-text-hi)]">${p.precio.toLocaleString("es-UY")}</span>
                        <span className="rounded-lg bg-[var(--admin-accent)]/10 px-2.5 py-1 text-xs font-bold text-[var(--admin-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                          + Patrocinar
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {spMode === "manual" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[var(--admin-text-hi)] uppercase tracking-wider">
                Agregar Producto Patrocinado Manual (Sin Precio / Publicidad)
              </h4>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLS}>Nombre de la Publicidad / Producto</label>
                  <input type="text" placeholder="Ej. Coca-Cola 1.5L Promo" value={spManualNombre} onChange={(e) => setSpManualNombre(e.target.value)} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Marca Patrocinadora</label>
                  <input type="text" placeholder="Ej. Coca-Cola" value={spManualMarca} onChange={(e) => setSpManualMarca(e.target.value)} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Texto del Badge</label>
                  <input type="text" placeholder="Patrocinado" value={spManualBadge} onChange={(e) => setSpManualBadge(e.target.value)} className={INPUT_CLS} />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--admin-bg)] px-4 py-2 text-xs font-bold text-[var(--admin-text-hi)] transition-all hover:bg-[var(--admin-input-bg)] border border-[var(--admin-border)] shrink-0">
                      📷 {spManualUploading ? "Subiendo..." : "Subir Imagen Publicitaria"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        disabled={spManualUploading}
                        onChange={(e) => e.target.files?.[0] && handleUploadSpManualImage(e.target.files[0])}
                      />
                    </label>
                    {spManualUploading && (
                      <span className="text-xs text-[var(--admin-accent)] font-semibold">
                        Subiendo... {Math.round(spManualUploadProgress)}%
                      </span>
                    )}
                    {spManualImagen && !spManualUploading && (
                      <div className="flex items-center gap-2">
                        <div className="relative w-12 h-12 rounded-lg border border-[var(--admin-border)] overflow-hidden">
                          <img src={spManualImagen} alt="Preview" className="object-cover w-full h-full" />
                        </div>
                        <span className="text-xs text-green-500 font-medium">✓ Imagen cargada</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleAddSponsoredManual(e)}
                  className="rounded-xl bg-[var(--admin-accent)] px-5 py-2.5 text-xs font-bold text-[var(--admin-sidebar-bg)] transition-all hover:opacity-90 shrink-0"
                >
                  ＋ Agregar Patrocinado Manual
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sponsored Products List */}
        {(config.sponsoredProducts || []).length === 0 ? (
          <p className="text-sm text-[var(--admin-text-lo)] text-center py-6 border border-dashed border-[var(--admin-border)] rounded-xl">
            No hay productos patrocinados aún.
          </p>
        ) : (
          <div className="space-y-2">
            {(config.sponsoredProducts || []).map((sp) => (
              <div
                key={sp.id}
                className={`flex items-center gap-4 rounded-xl border px-4 py-3 bg-[var(--admin-bg)]/30 ${
                  sp.activo ? "border-[var(--admin-border)]" : "border-red-500/20 opacity-60"
                }`}
              >
                {sp.imagen && (
                  <div className="w-10 h-10 rounded-lg border border-[var(--admin-border)] overflow-hidden shrink-0 bg-white">
                    <img src={sp.imagen} alt={sp.nombreProducto} className="object-contain w-full h-full" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--admin-text-hi)] truncate">{sp.nombreProducto}</p>
                  <p className="text-xs text-[var(--admin-text-lo)]">
                    {sp.codigoProducto ? `${sp.codigoProducto} · ` : ""}{sp.marcaNombre && <span className="text-[var(--admin-accent)]">{sp.marcaNombre}</span>}
                  </p>
                </div>
                <span className="rounded-lg bg-purple-500/15 px-2.5 py-1 text-[10px] font-black text-purple-500 shrink-0 uppercase">
                  {sp.badgeTexto}
                </span>
                <div className="text-center shrink-0">
                  <p className="text-[10px] font-bold text-[var(--admin-text-lo)]">Precio</p>
                  <p className="text-sm font-bold text-[var(--admin-text-hi)]">
                    {sp.precioOriginal !== undefined && sp.precioOriginal !== null ? (
                      `$${(sp.precioPromo ?? sp.precioOriginal).toLocaleString("es-UY")}`
                    ) : (
                      "Sin precio"
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleSponsoredProduct(sp.id)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      sp.activo ? "bg-green-500" : "bg-[var(--admin-input-bg)] border border-[var(--admin-border)]"
                    }`}
                  >
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform ${sp.activo ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSponsoredProduct(sp.id)}
                    className="rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-500/20 transition-all"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* ================================================================== */}
      {/* SECTION 3: 📊 MÉTRICAS DE PUBLICIDAD (Resumen)                     */}
      {/* ================================================================== */}
      <CollapsibleSection
        icon="📊"
        title="Métricas de Publicidad"
        subtitle="Resumen del estado actual de módulos publicitarios"
        defaultOpen
      >
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Banners Activos", value: metrics.bannersActivos, total: (config.brandBanners || []).length, icon: "📢", color: "bg-blue-500/15 text-blue-500" },
            { label: "Patrocinados", value: metrics.sponsoredActivos, total: (config.sponsoredProducts || []).length, icon: "🎯", color: "bg-purple-500/15 text-purple-500" },
            { label: "Ofertas x Cat.", value: metrics.ofertasActivas, total: (config.categoryOffers || []).length, icon: "🏷️", color: "bg-indigo-500/15 text-indigo-500" },
            { label: "Promos Premium", value: metrics.premiumActivas, total: (config.premiumPromos || []).length, icon: "⭐", color: "bg-amber-500/15 text-amber-500" },
            { label: "Ofertas Flash", value: metrics.flashActivas, total: (config.flashOffers || []).length, icon: "⏰", color: "bg-red-500/15 text-red-500" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/50 p-4 text-center"
            >
              <span className="text-2xl block mb-1">{kpi.icon}</span>
              <p className={`text-2xl font-black ${kpi.color.split(" ")[1]}`}>{kpi.value}</p>
              <p className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase tracking-wider mt-1">
                {kpi.label}
              </p>
              <p className="text-[10px] text-[var(--admin-text-lo)]/70 mt-0.5">
                de {kpi.total} total{kpi.total !== 1 ? "es" : ""}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/30 p-4">
          <h4 className="text-xs font-bold text-[var(--admin-text-lo)] uppercase tracking-wider mb-3">
            Resumen General
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--admin-text-lo)]">Total productos en oferta</span>
              <span className="font-bold text-[var(--admin-text-hi)]">{config.productos.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--admin-text-lo)]">Total módulos activos</span>
              <span className="font-bold text-[var(--admin-text-hi)]">
                {metrics.bannersActivos + metrics.sponsoredActivos + metrics.ofertasActivas + metrics.premiumActivas + metrics.flashActivas}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--admin-text-lo)]">Estado general</span>
              <span className={`font-bold ${config.activa ? "text-green-500" : "text-red-500"}`}>
                {config.activa ? "🟢 Activo" : "🔴 Pausado"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--admin-text-lo)]">Productos flash en proceso</span>
              <span className="font-bold text-[var(--admin-text-hi)]">
                {(config.flashOffers || []).reduce((acc, fo) => acc + fo.productos.length, 0)}
              </span>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* ================================================================== */}
      {/* SECTION 4: 🏷️ OFERTAS POR CATEGORÍA                               */}
      {/* ================================================================== */}
      <CollapsibleSection
        icon="🏷️"
        title="Ofertas por Categoría"
        subtitle="Ofertas temáticas agrupadas por categoría del catálogo"
      >
        {/* Form */}
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/50 p-4 space-y-4">
          <h4 className="text-xs font-bold text-[var(--admin-text-hi)] uppercase tracking-wider">
            Nueva Oferta por Categoría
          </h4>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={LABEL_CLS}>Título</label>
              <input type="text" placeholder="Ej. Festival de Bebidas" value={coTitulo} onChange={(e) => setCoTitulo(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Descripción</label>
              <input type="text" placeholder="Descripción breve" value={coDescripcion} onChange={(e) => setCoDescripcion(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Categoría</label>
              <select value={coCategoria} onChange={(e) => setCoCategoria(e.target.value)} className={INPUT_CLS}>
                <option value="">Seleccionar categoría...</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Color Accent</label>
              <div className="flex items-center gap-2">
                <input type="color" value={coColor} onChange={(e) => setCoColor(e.target.value)} className="h-10 w-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent" />
                <span className="text-xs text-[var(--admin-text-lo)] font-mono">{coColor}</span>
              </div>
            </div>
            <div>
              <label className={LABEL_CLS}>Fecha Inicio</label>
              <input type="datetime-local" value={coFechaInicio} onChange={(e) => setCoFechaInicio(e.target.value)} className={INPUT_CLS} style={{ colorScheme: "light" }} />
            </div>
            <div>
              <label className={LABEL_CLS}>Fecha Fin</label>
              <input type="datetime-local" value={coFechaFin} onChange={(e) => setCoFechaFin(e.target.value)} className={INPUT_CLS} style={{ colorScheme: "light" }} />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--admin-bg)] px-4 py-2 text-xs font-bold text-[var(--admin-text-hi)] transition-all hover:bg-[var(--admin-input-bg)] border border-[var(--admin-border)] shrink-0">
                  📷 {coUploading ? "Subiendo..." : "Subir Imagen"}
                  <input type="file" className="hidden" accept="image/*" disabled={coUploading} onChange={(e) => e.target.files?.[0] && handleUploadCoImage(e.target.files[0])} />
                </label>
                {coUploading && (
                  <span className="text-xs text-[var(--admin-accent)] font-semibold">
                    Subiendo... {Math.round(coUploadProgress)}%
                  </span>
                )}
                {coImagen && !coUploading && (
                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12 rounded-lg border border-[var(--admin-border)] overflow-hidden">
                      <img src={coImagen} alt="Preview" className="object-cover w-full h-full" />
                    </div>
                    <span className="text-xs text-green-500 font-medium">✓ Imagen cargada</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[var(--admin-text-lo)]/70">
                💡 <b>Diseño óptimo:</b> Proporción <b>3:2 (rectangular)</b>. Ej: 600x400 px. Se recortará para encajar a la derecha.
              </span>
            </div>
            <button type="button" onClick={(e) => handleAddCategoryOffer(e)} className="rounded-xl bg-[var(--admin-accent)] px-5 py-2.5 text-xs font-bold text-[var(--admin-sidebar-bg)] transition-all hover:opacity-90 shrink-0">
              ＋ Agregar Oferta por Categoría
            </button>
          </div>
        </div>

        {/* Category Offers Grid */}
        {(config.categoryOffers || []).length === 0 ? (
          <p className="text-sm text-[var(--admin-text-lo)] text-center py-6 border border-dashed border-[var(--admin-border)] rounded-xl">
            No hay ofertas por categoría configuradas aún.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(config.categoryOffers || []).map((offer) => (
              <div
                key={offer.id}
                className={`rounded-xl border overflow-hidden ${
                  offer.activa ? "border-[var(--admin-border)]" : "border-red-500/20 opacity-60"
                }`}
              >
                {/* Color accent bar */}
                <div className="h-2" style={{ backgroundColor: offer.colorAccent }} />

                <div className="p-4 bg-[var(--admin-bg)]/30 space-y-2">
                  {offer.imagen && (
                    <div className="w-full h-24 rounded-lg overflow-hidden border border-[var(--admin-border)] mb-2">
                      <img src={offer.imagen} alt={offer.titulo} className="object-cover w-full h-full" />
                    </div>
                  )}

                  <h5 className="text-sm font-bold text-[var(--admin-text-hi)] truncate">{offer.titulo}</h5>
                  {offer.descripcion && (
                    <p className="text-xs text-[var(--admin-text-lo)] line-clamp-2">{offer.descripcion}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-lg px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: offer.colorAccent }}
                    >
                      {offer.categoria}
                    </span>
                    {offer.fechaFin && (
                      <span className="text-[10px] text-[var(--admin-text-lo)]">
                        Hasta {new Date(offer.fechaFin).toLocaleDateString("es-UY")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--admin-border)]/50 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase">
                        {offer.activa ? "Activa" : "Pausada"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleCategoryOffer(offer.id)}
                        className={`relative h-5 w-9 rounded-full transition-colors ${
                          offer.activa ? "bg-green-500" : "bg-[var(--admin-input-bg)] border border-[var(--admin-border)]"
                        }`}
                      >
                        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform ${offer.activa ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategoryOffer(offer.id)}
                      className="rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-500/20 transition-all"
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* ================================================================== */}
      {/* SECTION 5: ⏰ OFERTAS FLASH / RELÁMPAGO                            */}
      {/* ================================================================== */}
      <CollapsibleSection
        icon="⏰"
        title="Ofertas Flash / Relámpago"
        subtitle="Ofertas de corta duración con countdown de urgencia"
      >
        {/* Form */}
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/50 p-4 space-y-4">
          <h4 className="text-xs font-bold text-[var(--admin-text-hi)] uppercase tracking-wider">
            Nueva Oferta Flash
          </h4>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={LABEL_CLS}>Título</label>
              <input type="text" placeholder="Ej. ⚡ MEGA FLASH 2 HORAS" value={foTitulo} onChange={(e) => setFoTitulo(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Descripción</label>
              <input type="text" placeholder="Descripción de la oferta" value={foDescripcion} onChange={(e) => setFoDescripcion(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Color Accent</label>
              <div className="flex items-center gap-2">
                <input type="color" value={foColor} onChange={(e) => setFoColor(e.target.value)} className="h-10 w-10 rounded-lg border border-[var(--admin-border)] cursor-pointer bg-transparent" />
                <span className="text-xs text-[var(--admin-text-lo)] font-mono">{foColor}</span>
              </div>
            </div>
            <div>
              <label className={LABEL_CLS}>Inicio (fecha y hora)</label>
              <input type="datetime-local" value={foFechaInicio} onChange={(e) => setFoFechaInicio(e.target.value)} className={INPUT_CLS} style={{ colorScheme: "light" }} />
            </div>
            <div>
              <label className={LABEL_CLS}>Fin (fecha y hora)</label>
              <input type="datetime-local" value={foFechaFin} onChange={(e) => setFoFechaFin(e.target.value)} className={INPUT_CLS} style={{ colorScheme: "light" }} />
            </div>
          </div>

          {/* Flash product selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={LABEL_CLS}>
                Productos de esta Oferta Flash ({foStagedProducts.length} seleccionados)
              </label>
              <button
                type="button"
                onClick={() => setFoShowProductSelector((v) => !v)}
                className="text-xs font-bold text-[var(--admin-accent)] hover:underline"
              >
                {foShowProductSelector ? "Cerrar selector" : "＋ Agregar productos"}
              </button>
            </div>

            {foShowProductSelector && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={foProductSearch}
                  onChange={(e) => setFoProductSearch(e.target.value)}
                  className={INPUT_CLS}
                />
                {foProductSearch.trim() && foFilteredCatalogo.length > 0 && (
                  <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {foFilteredCatalogo.map((p) => (
                      <button
                        key={p.codigo}
                        onClick={() => handleAddFlashProduct(p)}
                        className="flex items-center justify-between gap-3 rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-left hover:bg-[var(--admin-input-bg)] hover:border-[var(--admin-accent)]/20 transition-all group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--admin-text-hi)] truncate">{p.nombre}</p>
                          <p className="text-xs text-[var(--admin-text-lo)]">{p.codigo}</p>
                        </div>
                        <span className="text-sm font-bold text-[var(--admin-text-hi)]">${p.precio.toLocaleString("es-UY")}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Staged products */}
            {foStagedProducts.length > 0 && (
              <div className="space-y-1">
                {foStagedProducts.map((p) => (
                  <div
                    key={p.codigo}
                    className="flex items-center justify-between gap-3 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--admin-text-hi)] truncate">{p.nombre}</p>
                    </div>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 shrink-0">
                      ${p.precioOferta.toLocaleString("es-UY")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFlashProduct(p.codigo)}
                      className="text-red-500 text-xs font-bold hover:text-red-400 shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={(e) => handleAddFlashOffer(e)} className="rounded-xl bg-[var(--admin-accent)] px-5 py-2.5 text-xs font-bold text-[var(--admin-sidebar-bg)] transition-all hover:opacity-90 shrink-0">
              ⚡ Crear Oferta Flash
            </button>
          </div>
        </div>

        {/* Flash Offers Grid */}
        {(config.flashOffers || []).length === 0 ? (
          <p className="text-sm text-[var(--admin-text-lo)] text-center py-6 border border-dashed border-[var(--admin-border)] rounded-xl">
            No hay ofertas flash configuradas aún.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(config.flashOffers || []).map((flash) => (
              <div
                key={flash.id}
                className={`rounded-xl border overflow-hidden ${
                  flash.activa ? "border-[var(--admin-border)]" : "border-red-500/20 opacity-60"
                }`}
              >
                {/* Header with accent */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: flash.colorAccent }}
                >
                  <div>
                    <h5 className="text-sm font-black text-white truncate">⚡ {flash.titulo}</h5>
                    {flash.descripcion && (
                      <p className="text-[10px] text-white/80 truncate">{flash.descripcion}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-white/70 uppercase">Countdown</p>
                    <p className="text-xs font-black text-white">{formatCountdown(flash.fechaFin)}</p>
                  </div>
                </div>

                {/* Products list */}
                <div className="p-4 bg-[var(--admin-bg)]/30 space-y-2">
                  <p className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase tracking-wider">
                    {flash.productos.length} producto{flash.productos.length !== 1 ? "s" : ""} en la oferta
                  </p>
                  <div className="space-y-1 max-h-[120px] overflow-y-auto custom-scrollbar">
                    {flash.productos.map((p) => (
                      <div key={p.codigo} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-[var(--admin-bg)]/50">
                        <span className="text-[var(--admin-text-hi)] truncate flex-1 min-w-0">{p.nombre}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[var(--admin-text-lo)] line-through">${p.precioOriginal.toLocaleString("es-UY")}</span>
                          <span className="font-bold text-green-500">${p.precioOferta.toLocaleString("es-UY")}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[var(--admin-text-lo)] pt-1">
                    <span>
                      {new Date(flash.fechaInicio).toLocaleString("es-UY", { dateStyle: "short", timeStyle: "short" })} → {new Date(flash.fechaFin).toLocaleString("es-UY", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--admin-border)]/50">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase">
                        {flash.activa ? "Activa" : "Pausada"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleFlashOffer(flash.id)}
                        className={`relative h-5 w-9 rounded-full transition-colors ${
                          flash.activa ? "bg-green-500" : "bg-[var(--admin-input-bg)] border border-[var(--admin-border)]"
                        }`}
                      >
                        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform ${flash.activa ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFlashOffer(flash.id)}
                      className="rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-500/20 transition-all"
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

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
                  type="button"
                  onClick={(e) => toggleDestacado(p.codigo, e)}
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
                  type="button"
                  onClick={(e) => removeProducto(p.codigo, e)}
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
