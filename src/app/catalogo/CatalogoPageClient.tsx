"use client";

import { useState, useCallback, useMemo, Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { usePedidosLocales } from "@/hooks/usePedidosLocales";
import { usePedidosCloud } from "@/hooks/usePedidosCloud";
import { useOnline } from "@/hooks/useOnline";
import {
  Hero,
  Ticker,
  CatsNav,
  ResultsBar,
  ProductoGrid,
  FloatCartBtn,
  BrandRail,
  OfertasDestacadasRail,
  BrandBannersRail,
  FlashOffersRail,
  CategoryOffersRail,
  SponsoredProductsRail,
  BottomNavBar,
  FilterSheet,
  SmartReorder,
} from "@/components/catalogo";
import { useFavoritos } from "@/lib/favoritos-context";
import { useBrands } from "@/hooks/useBrands";
import type { OfertaConfig } from "@/types/ofertas";

import BranchBar from "@/components/catalogo/BranchBar";
import OnlineBanner from "@/components/ui/OnlineBanner";
import EmptyState from "@/components/ui/EmptyState";
import { AdSlotPlacement } from "@/components/ads";

// Lazy-loaded components para mejorar Performance / First Load JS
const CartPanel = dynamic(() => import("@/components/carrito/CartPanel"), { ssr: false });
const UserPanel = dynamic(() => import("@/components/usuario/UserPanel"), { ssr: false });
const BranchSelectModal = dynamic(() => import("@/components/catalogo/BranchSelectModal"), { ssr: false });
const FacturaModal = dynamic(() => import("@/components/catalogo/FacturaModal"), { ssr: false });
const QuickViewModal = dynamic(() => import("@/components/catalogo/QuickViewModal"), { ssr: false });
import {
  armarMensajeWA,
  enviarWhatsApp,
  enviarFacturaWhatsApp,
} from "@/lib/whatsapp";
import {
  guardarPedidoGlobal,
  guardarPedidoUsuario,
  incrementarStats,
} from "@/lib/pedidos";
import { encodeCartToURL, decodeCartFromURL } from "@/lib/cart-share";
import { haptic } from "@/lib/haptic";
import * as ls from "@/lib/ls";
import { SUCURSALES, type MetodoEntrega } from "@/lib/sucursales";
import { getSucursalWhatsApp } from "@/lib/sucursales-config";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import type { Vista, CartItem, Producto } from "@/types";
import { CATEGORIAS, EMOJI_POR_CATEGORIA } from "@/types";
import categoriaMapping from "@/lib/categoria_mapping.json";

const catMap = (categoriaMapping as any).mapping || categoriaMapping;

import { flyToCart } from "@/lib/flyToCart";
import DesktopCategorySidebar from "@/components/catalogo/DesktopCategorySidebar";
import { BrandHeroCarousel, CustomHeroCarousel } from "@/components/ads";

interface CatalogoPageClientProps {
  // In the future we can pass pre-loaded products from server
}

/* ── Shared cart banner (shown when ?cart= URL param) ── */
function SharedCartBanner({
  sharedCart,
  onLoad,
  onIgnore,
}: {
  sharedCart: CartItem[] | null;
  onLoad: () => void;
  onIgnore: () => void;
}) {
  if (!sharedCart) return null;

  return (
    <div
      style={{
        background: "var(--ambar-pale, rgba(248,150,30,0.14))",
        border: "1.5px solid rgba(248,150,30,0.35)",
        borderRadius: "var(--r-md, 12px)",
        margin: "12px 16px",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>
        Se carg\u00f3 un pedido compartido ({sharedCart.length} productos)
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onLoad}
          style={{
            background: "var(--oscuro, #1A1410)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--r-sm, 8px)",
            padding: "6px 14px",
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cargar este pedido
        </button>
        <button
          onClick={onIgnore}
          style={{
            background: "transparent",
            color: "var(--muted, #9C8570)",
            border: "1.5px solid var(--border, #E8DDD0)",
            borderRadius: "var(--r-sm, 8px)",
            padding: "6px 14px",
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Ignorar
        </button>
      </div>
    </div>
  );
}

/**
 * Suspense-wrapped component that reads useSearchParams.
 * Must be rendered inside a Suspense boundary.
 */
function SharedCartWatcher({
  onLoadCart,
}: {
  onLoadCart: (cart: CartItem[]) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const cartParam = searchParams?.get("cart");
    if (cartParam) {
      const decoded = decodeCartFromURL(cartParam);
      if (decoded && decoded.length > 0) {
        onLoadCart(decoded);
      }
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

/* ── Client Component with pre-loaded productos ── */
import { ProductoSkeleton } from "@/components/catalogo/ProductoSkeleton";

type SemanticDomain =
  | "sweet_dessert"
  | "savory_meat"
  | "savory_complement"
  | "beverages"
  | "cleaning_hygiene"
  | "mate_culture"
  | "sweet_snacks"
  | "general_food";

function getSemanticDomain(product: Producto): SemanticDomain {
  const name = product.nombre.toLowerCase();
  const category = (product.categoria || "").toLowerCase();

  // 1. Cleaning & Hygiene (Strict separation)
  if (
    category.includes("limpieza") || 
    category.includes("higiene") || 
    category.includes("perfumeria") ||
    name.includes("jabon") || 
    name.includes("detergente") || 
    name.includes("desinfectante") || 
    name.includes("lavavajilla") || 
    name.includes("limpiador") || 
    name.includes("shampoo") || 
    name.includes("suavizante") || 
    name.includes("papel higienico") || 
    name.includes("rollo") || 
    name.includes("servilleta")
  ) {
    return "cleaning_hygiene";
  }

  // 2. Mate culture
  if (
    name.includes("yerba") || 
    name.includes("mate") || 
    name.includes("termo") || 
    name.includes("bombilla")
  ) {
    return "mate_culture";
  }

  // 3. Savory Meat
  if (
    name.includes("hamburguesa") || 
    name.includes("carne") || 
    name.includes("churrasco") || 
    name.includes("milanesa") || 
    name.includes("pancho") || 
    name.includes("salchicha") || 
    name.includes("nugget") || 
    name.includes("lomo")
  ) {
    return "savory_meat";
  }

  // 4. Savory complements (High affinity with meat!)
  if (
    name.includes("pan de") || 
    name.includes("queso") || 
    name.includes("jamon") || 
    name.includes("fiambre") || 
    name.includes("papas fritas") || 
    name.includes("ketchup") || 
    name.includes("mostaza") || 
    name.includes("mayonesa") || 
    name.includes("salsa") || 
    name.includes("aderezo") || 
    name.includes("cheddar")
  ) {
    return "savory_complement";
  }

  // 5. Sweet desserts (Ice creams, etc.)
  if (
    category.includes("helado") || 
    name.includes("helado") || 
    name.includes("crema helada") || 
    name.includes("postre")
  ) {
    return "sweet_dessert";
  }

  // 6. Sweet snacks (Alfajor, chocolate, biscuits)
  if (
    name.includes("alfajor") || 
    name.includes("chocolate") || 
    name.includes("dulce de leche") || 
    name.includes("galleta") || 
    name.includes("bombon") || 
    name.includes("caramelo") || 
    name.includes("chicle")
  ) {
    return "sweet_snacks";
  }

  // 7. Beverages (soft drinks, alcohol, water)
  if (
    category.includes("bebida") || 
    category.includes("refresco") || 
    category.includes("cerveza") || 
    name.includes("coca") || 
    name.includes("pepsi") || 
    name.includes("fanta") || 
    name.includes("refresco") || 
    name.includes("cerveza") || 
    name.includes("agua ") || 
    name.includes("jugo") || 
    name.includes("whisky") || 
    name.includes("vino") || 
    name.includes("gin") || 
    name.includes("tónica") || 
    name.includes("energy") || 
    name.includes("monster")
  ) {
    return "beverages";
  }

  return "general_food";
}

function PremiumCountdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (remaining <= 0) return null;

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const isUrgent = remaining < 3600;

  return (
    <span
      className={`inline-flex items-center gap-1 bg-[#E8302A]/10 border border-[#E8302A]/25 rounded-lg px-2.5 py-1 text-xs font-black text-[#E8302A] tracking-wider font-mono shrink-0 ${
        isUrgent ? "animate-pulse" : ""
      }`}
    >
      ⏱ {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

export default function CatalogoPageClient(_props: CatalogoPageClientProps) {
  // Refs para Auto-Scroll
  const gridRef = useRef<HTMLDivElement>(null);
  
  const scrollToGrid = () => {
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - 100; // offset sticky navigation bar
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth"
      });
    }
  };

  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";
  const urlCategoria = searchParams?.get("categoria") || "";
  const urlSort = searchParams?.get("sort") || "relevancia";
  const urlMarcas = useMemo(() => {
    const m = searchParams?.get("marcas");
    return m ? m.split(",") : [];
  }, [searchParams]);
  const urlMinPrecio = Number(searchParams?.get("minPrecio")) || 0;
  const urlMaxPrecio = Number(searchParams?.get("maxPrecio")) || 0;
  const urlSoloOfertas = searchParams?.get("ofertas") === "true";

  const { items: cartItems, addItem, removeItem, updateQty, clearCart, total, totalQty } = useCart();
  const { brands } = useBrands();

  const { user, signOut } = useAuth();
  const toast = useToast();
  const isOnline = useOnline();
  const { favoritos } = useFavoritos();

  // Local state
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Producto | null>(null);
  const [vista, setVista] = useState<Vista>("grilla");
  const [alias, setAlias] = useState("");
  const [telefono, setTelefono] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");

  // Hydration fix: Load client-only data after mount
  const [mounted, setMounted] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVista(ls.getVista());
    setAlias(ls.getAlias());
    setTelefono(ls.getTelefono());
    setDireccion(ls.getDireccion());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1000);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [clientNotes, setClientNotes] = useState("");
  const [sharedCart, setSharedCart] = useState<CartItem[] | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [facturaModalOpen, setFacturaModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntrega>('envio');
  const [sucursalId, setSucursalId] = useState<string | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  // Search state for instant feedback on input, synced with URL
  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  const activeBrands = useMemo(() => {
    return brands.filter(b => b.active === true && ["oro", "plata"].includes(b.tier));
  }, [brands]);

  // Tienda Config
  const [tiendaConfig, setTiendaConfig] = useState<{ pedidosAbiertos: boolean; bannerMensaje: string }>({
    pedidosAbiertos: true,
    bannerMensaje: "",
  });
  const [ofertasConfig, setOfertasConfig] = useState<OfertaConfig | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "config", "tienda"),
      (snap) => {
        if (snap.exists()) {
          setTiendaConfig(snap.data() as any);
        }
      },
      (err) => {
        console.error("Error en listener config/tienda:", err);
      }
    );
    const unsubOfertas = onSnapshot(
      doc(db, "configuracion", "ofertas"),
      (snap) => {
        if (snap.exists()) {
          setOfertasConfig(snap.data() as OfertaConfig);
        }
      },
      (err) => {
        console.error("Error en listener configuracion/ofertas:", err);
      }
    );
    return () => {
      unsub();
      unsubOfertas();
    };
  }, []);

  // Sync state if URL changes from outside (e.g., back button or banners)
  useEffect(() => {
    setSearch(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]);

  const categoria = urlCategoria; // Categoria is entirely derived from URL

  // Load branch from URL or localStorage (no redirect - branch is optional for browsing)
  useEffect(() => {
    if (!mounted) return;

    const urlSucursal = searchParams?.get("sucursal");
    const savedSucursal = ls.getSelectedSucursal();

    if (urlSucursal) {
      const valid = SUCURSALES.some((s) => s.id === urlSucursal);
      if (valid) {
        setSucursalId(urlSucursal);
        if (savedSucursal !== urlSucursal) ls.setSelectedSucursal(urlSucursal);
      }
    } else if (savedSucursal) {
      setSucursalId(savedSucursal);
    }
  }, [mounted, searchParams, router]);

  // Sync tab, search focus and cart parameters from URL
  useEffect(() => {
    if (!mounted) return;
    const tab = searchParams?.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
    const openCart = searchParams?.get("openCart");
    if (openCart === "true") {
      setCartOpen(true);
      const params = new URLSearchParams(window.location.search);
      params.delete("openCart");
      router.replace(`/catalogo?${params.toString()}`, { scroll: false });
    }
    const focusSearch = searchParams?.get("focusSearch");
    if (focusSearch === "true") {
      setActiveTab("buscar");
      setTimeout(() => {
        const searchInput = document.querySelector(".results-search-input") as HTMLInputElement;
        if (searchInput) {
          const rect = searchInput.getBoundingClientRect();
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const targetY = rect.top + scrollTop - (window.innerHeight / 2) + (rect.height / 2);
          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: "smooth"
          });
          searchInput.focus();
        }
      }, 300);
      const params = new URLSearchParams(window.location.search);
      params.delete("focusSearch");
      router.replace(`/catalogo?${params.toString()}`, { scroll: false });
    }
  }, [mounted, searchParams, router]);


  // Fetch branch-specific or global productos
  useEffect(() => {
    const currentId = sucursalId;
    let cancelled = false;

    async function fetchProductos() {
      try {
        setLoading(true);
        setLoadingError(null);
        let data: Producto[] = [];
        let loadedFromBranch = false;
        
        try {
          if (currentId) {
            const branchSnap = await getDoc(doc(db, "sucursales_catalogos", currentId));
            if (branchSnap.exists()) {
              const branchData = branchSnap.data();
              const items = branchData.items || {};
              const itemsList = Object.values(items) as Producto[];
              const activeItems = itemsList.filter((item) => !item.deshabilitado);
              if (activeItems.length > 0) {
                data = activeItems;
                loadedFromBranch = true;
                console.log(`🏪 Catálogo personalizado cargado para sucursal: ${currentId} (${data.length} productos)`);
              }
            }
          }
        } catch (e) {
          console.error("❌ Falló la carga desde Firestore para la sucursal.", e);
        }

        if (!loadedFromBranch) {
          try {
            const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
            if (snap.exists()) {
              const docData = snap.data();
              data = Object.values(docData.items || {}) as Producto[];
              console.log(`📦 Catálogo global cargado desde Firestore (${data.length} productos)`);
            } else {
              console.warn("⚠️ Documento de Firestore 'catalogo_activo/productos' no existe.");
            }
          } catch (e) {
            console.error("❌ Falló la carga global desde Firestore.", e);
          }
        }

        if (data.length === 0) {
          console.info("🔄 Intentando cargar desde fallback local (productos.json)...");
          const res = await fetch("/productos.json");
          if (!res.ok) throw new Error(`HTTP ${res.status}: failed to load productos`);
          data = (await res.json()) as Producto[];
          console.log(`🏠 Catálogo cargado desde local JSON (${data.length} productos)`);
        }

        // Aplicar mapping de categorías del Excel
        data = data.map(p => {
          const barcode = String(p.codigo || "").trim();
          if (catMap[barcode]) {
            return { ...p, categoria: catMap[barcode] };
          }
          return p;
        });

        if (!cancelled) {
          setProductos(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setLoadingError(err.message || "Error al cargar productos");
          setLoading(false);
        }
      }
    }

    fetchProductos();
    return () => {
      cancelled = true;
    };
  }, [sucursalId, mounted]);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search (400ms) for grid filtering and URL updates to prevent layout thrashing
  const setSearchDebounced = useCallback((term: string) => {
    setSearch(term);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(term);
      const params = new URLSearchParams(window.location.search);
      if (term) params.set("search", term);
      else params.delete("search");
      router.replace(`/catalogo?${params.toString()}`, { scroll: false });
    }, 400); // 400ms for stable URL updates
  }, [router]);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  useEffect(() => {
    setRecentSearches(ls.getBusquedas());
  }, []);

  const handleSelectSuggestion = useCallback((term: string) => {
    setSearch(term);
    setDebouncedSearch(term);
    ls.addBusqueda(term);
    setRecentSearches(ls.getBusquedas());
    const params = new URLSearchParams(window.location.search);
    if (term) params.set("search", term);
    else params.delete("search");
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
    scrollToGrid();
  }, [router]);

  // Direct brand filter from ad banners (bypasses debounce)
  const handleBrandFilter = useCallback((brandName: string) => {
    setSearch(brandName);
    setDebouncedSearch(brandName);
    const params = new URLSearchParams(window.location.search);
    params.set("search", brandName);
    params.delete("categoria"); // Clear category to show all matches
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
    scrollToGrid();
  }, [router]);

  // Cloud orders (when logged in)
  const { pedidos: cloudPedidos } = usePedidosCloud();
  // Local orders (guest)
  const { pedidos: localPedidos, savePedido: saveLocalPedido } = usePedidosLocales();

  // Derive unique categories from ALL products (not just enriched or filtered)
  // This ensures categories don't disappear when searching
  const categorias = useMemo(() => {
    return [...CATEGORIAS];
  }, []);

  // Filter by search, category, activeTab (favorites), brand, price and offers (memoized for performance)
  const filtrados = useMemo(() => {
    let result = productos.filter((p) => (p.precio || 0) > 0);

    // 1. Filtrar por pestaña "Favoritos" en el BottomNav
    if (activeTab === "favoritos") {
      result = result.filter((p) => favoritos.includes(p.codigo));
    }

    // 2. Filtrar por categoría (URL)
    if (categoria) {
      result = result.filter((p) => p.categoria === categoria);
    }

    // 3. Filtrar por marcas seleccionadas (Filtros Avanzados)
    if (urlMarcas.length > 0) {
      result = result.filter((p) => p.marca && urlMarcas.includes(p.marca));
    }

    // 4. Filtrar por rango de precios
    if (urlMinPrecio > 0) {
      result = result.filter((p) => p.precio >= urlMinPrecio);
    }
    if (urlMaxPrecio > 0) {
      result = result.filter((p) => p.precio <= urlMaxPrecio);
    }

    // 5. Filtrar por solo ofertas
    if (urlSoloOfertas) {
      result = result.filter((p) => p.precioAnterior && p.precioAnterior > p.precio);
    }

    // 6. Filtrar por búsqueda de texto
    if (debouncedSearch.trim()) {
      const normalize = (s: string) =>
        s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
      const searchTerms = normalize(debouncedSearch.trim()).split(/\s+/);
      
      result = result.filter((p) => {
        const searchableText = normalize(`${p.nombre} ${p.codigo} ${p.categoria} ${p.marca || ""}`);
        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    // 7. Ordenamiento (Sort)
    if (urlSort === "precio-asc") {
      result.sort((a, b) => a.precio - b.precio);
    } else if (urlSort === "precio-desc") {
      result.sort((a, b) => b.precio - a.precio);
    } else if (urlSort === "nombre-asc") {
      result.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    } else if (urlSort === "oferta-desc") {
      result.sort((a, b) => {
        const descA = a.precioAnterior && a.precioAnterior > a.precio ? (a.precioAnterior - a.precio) / a.precioAnterior : 0;
        const descB = b.precioAnterior && b.precioAnterior > b.precio ? (b.precioAnterior - b.precio) / b.precioAnterior : 0;
        return descB - descA;
      });
    }

    return result;
  }, [productos, categoria, debouncedSearch, activeTab, favoritos, urlMarcas, urlMinPrecio, urlMaxPrecio, urlSoloOfertas, urlSort]);

  // Marcas únicas disponibles para la categoría actual
  const marcasDisponibles = useMemo(() => {
    let items = productos;
    if (categoria) {
      items = items.filter((p) => p.categoria === categoria);
    }
    const marcasUnicas = new Set<string>();
    items.forEach((p) => {
      if (p.marca && p.marca.trim()) {
        marcasUnicas.add(p.marca.trim());
      }
    });
    return Array.from(marcasUnicas).sort();
  }, [productos, categoria]);

  // Contador de filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (urlMarcas.length > 0) count += urlMarcas.length;
    if (urlMinPrecio > 0) count += 1;
    if (urlMaxPrecio > 0) count += 1;
    if (urlSoloOfertas) count += 1;
    return count;
  }, [urlMarcas, urlMinPrecio, urlMaxPrecio, urlSoloOfertas]);

  // Instant suggestions filter for ultra-responsive live search autocomplete
  const instantSuggestions = useMemo(() => {
    if (!search.trim()) return [];
    const normalize = (s: string) =>
      s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      
    const searchTerms = normalize(search.trim()).split(/\s+/);
    let result = productos.filter((p) => (p.precio || 0) > 0);
    
    if (categoria) {
      result = result.filter((p) => p.categoria === categoria);
    }
    
    result = result.filter((p) => {
      const searchableText = normalize(`${p.nombre} ${p.codigo} ${p.categoria}`);
      return searchTerms.every((term) => searchableText.includes(term));
    });
    
    return result.slice(0, 5);
  }, [productos, categoria, search]);

  // Qty map for product grid
  const qtyMap = useMemo(() => {
    const map: Record<string, number> = {};
    cartItems.forEach((i) => {
      map[i.codigo] = i.cantidad;
    });
    return map;
  }, [cartItems]);

  // Handlers
  const handleAddProduct = useCallback(
    (producto: Producto, e?: React.MouseEvent) => {
      addItem(producto);
      if (e) {
        flyToCart(e, producto.imagen, EMOJI_POR_CATEGORIA[producto.categoria] || "⭐");
      }
    },
    [addItem]
  );

  const handleQtyChange = useCallback(
    (codigo: string, qty: number) => {
      if (qty <= 0) {
        removeItem(codigo);
      } else {
        const current = qtyMap[codigo] || 0;
        const delta = qty - current;
        if (delta > 0) {
          let nombre = "";
          let precio = 0;
          if (codigo.startsWith("PROMO-")) {
            const promoId = codigo.replace("PROMO-", "");
            const promo = ofertasConfig?.premiumPromos?.find((p) => p.id === promoId);
            if (promo) {
              nombre = promo.titulo;
              precio = promo.precio ?? 0;
            }
          } else {
            const prod = productos.find((p) => p.codigo === codigo);
            if (prod) {
              nombre = prod.nombre;
              precio = prod.precio;
            }
          }
          for (let i = 0; i < delta; i++) addItem({ codigo, nombre, precio });
        } else {
          for (let i = 0; i < -delta; i++) updateQty(codigo, -1);
        }
      }
    },
    [qtyMap, addItem, removeItem, updateQty, ofertasConfig, productos]
  );


  const handleToggleVista = useCallback((v: Vista) => {
    setVista(v);
    ls.setVista(v);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    const params = new URLSearchParams(window.location.search);
    if (sort && sort !== "relevancia") params.set("sort", sort);
    else params.delete("sort");
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
  }, [router]);

  const handleMarcasChange = useCallback((marcas: string[]) => {
    const params = new URLSearchParams(window.location.search);
    if (marcas.length > 0) params.set("marcas", marcas.join(","));
    else params.delete("marcas");
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
  }, [router]);

  const handlePrecioRangeChange = useCallback((min: number, max: number) => {
    const params = new URLSearchParams(window.location.search);
    if (min > 0) params.set("minPrecio", String(min));
    else params.delete("minPrecio");
    
    if (max > 0 && max !== Infinity) params.set("maxPrecio", String(max));
    else params.delete("maxPrecio");
    
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
  }, [router]);

  const handleSoloOfertasChange = useCallback((val: boolean) => {
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("ofertas", "true");
    else params.delete("ofertas");
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
  }, [router]);

  const handleClearAllFilters = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("marcas");
    params.delete("minPrecio");
    params.delete("maxPrecio");
    params.delete("ofertas");
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
  }, [router]);

  const handleSaveAlias = useCallback((a: string) => {
    setAlias(a);
    ls.setAlias(a);
  }, []);

  const handleSaveTelefono = useCallback((t: string) => {
    setTelefono(t);
    ls.setTelefono(t);
  }, []);

  const handleSaveDireccion = useCallback((d: string) => {
    setDireccion(d);
    ls.setDireccion(d);
  }, []);

  const handleClearData = useCallback(() => {
    ls.setAlias("");
    ls.setTelefono("");
    ls.setDireccion("");
    ls.setHistory([]);
    ls.setBusquedas([]);
    setAlias("");
    setTelefono("");
    setDireccion("");
    toast.info("Datos locales limpiados");
  }, [toast]);

  const handleLogout = useCallback(async () => {
    await signOut();
    toast.info("Sesi\u00f3n cerrada");
  }, [signOut, toast]);

  const handleReorder = useCallback(
    (pedido: { items: { codigo: string; nombre: string; cantidad: number; precioUnitario?: number; precio?: number }[]; total: number }) => {
      if (totalQty === 0) {
        pedido.items.forEach((item) => {
          for (let i = 0; i < item.cantidad; i++) {
            addItem({ codigo: item.codigo, nombre: item.nombre, precio: item.precioUnitario ?? item.precio ?? 0 });
          }
        });
        setUserPanelOpen(false);
        toast.success("Cargado. Revis\u00e1 antes de enviar.");
      } else {
        pedido.items.forEach((item) => {
          for (let i = 0; i < item.cantidad; i++) {
            addItem({ codigo: item.codigo, nombre: item.nombre, precio: item.precioUnitario ?? item.precio ?? 0 });
          }
        });
        setUserPanelOpen(false);
        toast.success("Productos agregados al carrito.");
      }
    },
    [totalQty, addItem, toast]
  );

  // Agregar solo items seleccionados (historial granular)
  const handleReorderItems = useCallback(
    (items: { codigo: string; nombre: string; cantidad: number; precioUnitario: number }[]) => {
      items.forEach((item) => {
        for (let i = 0; i < item.cantidad; i++) {
          addItem({ codigo: item.codigo, nombre: item.nombre, precio: item.precioUnitario ?? 0 });
        }
      });
      setUserPanelOpen(false);
      toast.success(`${items.length} producto${items.length > 1 ? "s" : ""} agregado${items.length > 1 ? "s" : ""} al pedido.`);
    },
    [addItem, toast]
  );

  const handleShareCart = useCallback(() => {
    const encoded = encodeCartToURL(cartItems);
    if (!encoded) return;
    const url = `${window.location.origin}/catalogo?cart=${encoded}`;
    setShareLink(url);
    toast.info("Link generado. Copialo desde el carrito.");
  }, [cartItems, toast]);

  const handleCopyShareLink = useCallback(() => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink).then(() => {
        toast.success("Link copiado al portapapeles");
      });
    }
  }, [shareLink, toast]);

  const handleFinalizado = useCallback(() => {
    clearCart();
    setClientNotes("");
    toast.success("¡Pedido enviado correctamente! 🚀");
  }, [clearCart, toast]);

  const handleConfirmSend = useCallback(async () => {
    setCartOpen(false);
    setActiveOrderId(null); // Reset anterior

    const nombre = alias || "Cliente";
    const tel = telefono || "No proporcionado";

    // Build delivery info based on method
    let deliveryDireccion = direccion || "";
    let deliveryNotas = clientNotes || "";
    const selectedSucursal = SUCURSALES.find((s) => s.id === sucursalId);

    if (metodoEntrega === 'retiro' && selectedSucursal) {
      deliveryDireccion = `RETIRO EN LOCAL: ${selectedSucursal.nombre} — ${selectedSucursal.direccion} (Tel: ${selectedSucursal.telefono})`;
      // Prepend delivery method to notes
      const retiroLine = `🏪 RETIRO EN SUCURSAL: ${selectedSucursal.nombre} (${selectedSucursal.direccion})`;
      deliveryNotas = deliveryNotas ? `${retiroLine}\n${deliveryNotas}` : retiroLine;
    } else {
      if (deliveryDireccion) {
        const envioLine = `🏠 ENVÍO A DOMICILIO: ${deliveryDireccion}`;
        deliveryNotas = deliveryNotas ? `${envioLine}\n${deliveryNotas}` : envioLine;
      }
    }

    // 1. Guardar pedido en Firebase (Global y Local) + Incrementar Stats
    const pedidoItems = cartItems.map((i) => ({
      codigo: i.codigo,
      nombre: i.nombre,
      cantidad: i.cantidad,
      precioUnitario: i.precio,
    }));

    try {
      setIsProcessing(true);
      
      let orderId = `L-${Date.now().toString().slice(-6)}`; // Fallback ID
      
      // 1. Guardar pedido en Firebase Global (admin-visible)
      try {
        const generatedId = await guardarPedidoGlobal({
          uid: user?.uid ?? null,
          clienteNombre: nombre,
          clienteTelefono: tel,
          clienteDireccion: deliveryDireccion || undefined,
          items: pedidoItems,
          total,
          notas: deliveryNotas || undefined,
          status: "no_leido",
          sucursalId: sucursalId || null,
        });
        orderId = generatedId;
        setActiveOrderId(orderId);
      } catch (fErr) {
        console.error("❌ Firestore: Error al guardar pedido global:", fErr);
        // No bloqueamos el flujo completo si falla el guardado global, 
        // pero avisamos en consola. El cliente igual querr\u00e1 enviar el WA.
      }

      // Stats (No bloqueante)
      const codigos = cartItems.map((i) => i.codigo);
      incrementarStats(codigos).catch((err) =>
        console.warn("⚠️ Stats: Error al incrementar stats:", err)
      );
      
      // 2. Si hay usuario, guardar en su historial privado (Cloud)
      if (user) {
        guardarPedidoUsuario(user.uid, {
          items: pedidoItems,
          total,
          notas: deliveryNotas || undefined,
          mensajeWA: "", 
        }).catch((err) => console.error("❌ Firestore: Error al guardar pedido usuario:", err));
      }

      // 3. Guardar siempre en local (resiliencia total)
      try {
        saveLocalPedido(cartItems, total, deliveryNotas || undefined);
      } catch (lErr) {
        console.error("❌ LocalStorage: Error al guardar historial local:", lErr);
      }

      // 4. GENERAR Y ENVIAR POR WHATSAPP (Lo más importante)
      try {
        // Routing dinámico: lee el teléfono WA de Firestore por sucursal, fallback a env var (Canelones)
        const telefonoWhatsApp = await getSucursalWhatsApp(sucursalId);

        await enviarFacturaWhatsApp(
          telefonoWhatsApp,
          nombre,
          tel,
          cartItems,
          deliveryNotas || undefined,
          "/logo.png",
          orderId,
          deliveryDireccion,
          false // skipRedirect = false: descarga la factura e inicia la redirección a WhatsApp para enviar el pedido
        );
      } catch (waErr) {
        console.error("❌ WhatsApp: Error al enviar factura:", waErr);
        throw new Error("No se pudo descargar el comprobante del pedido.");
      }

      // Reset delivery state after success
      setMetodoEntrega('envio');
      setSucursalId(null);
      handleFinalizado();
    } catch (err: any) {
      console.error("🚨 Error crítico en flujo de pedido:", err);
      toast.error(err.message || "Hubo un problema al procesar el pedido");
    } finally {
      setIsProcessing(false);
    }
  }, [alias, telefono, direccion, metodoEntrega, sucursalId, cartItems, clientNotes, total, user, saveLocalPedido, handleFinalizado, toast]);

  // Send WA flow
  const handleSendWA = useCallback(() => {
    handleConfirmSend();
  }, [handleConfirmSend]);

  const handleSucursalChange = useCallback((newId: string) => {
    if (cartItems.length > 0) {
      const confirmacion = confirm(
        "Al cambiar de sucursal se vaciará tu carrito actual para evitar inconsistencias en precios y disponibilidad de stock. ¿Deseas cambiar?"
      );
      if (!confirmacion) return;
      clearCart();
    }
    setSucursalId(newId);
    ls.setSelectedSucursal(newId);
    
    // Sincronizar URL
    const params = new URLSearchParams(window.location.search);
    params.set("sucursal", newId);
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
  }, [cartItems, clearCart, router]);


  const handleLoadSharedCart = useCallback(() => {
    if (sharedCart) {
      sharedCart.forEach((item) => {
        for (let i = 0; i < item.cantidad; i++) {
          addItem({ codigo: item.codigo, nombre: item.nombre, precio: item.precio });
        }
      });
      setSharedCart(null);
      toast.success("Pedido compartido cargado al carrito.");
    }
  }, [sharedCart, addItem, toast]);

  const handleIgnoreSharedCart = useCallback(() => {
    setSharedCart(null);
  }, []);

  // Use cloud pedidos when logged in, local when guest
  const pedidos = user ? cloudPedidos : localPedidos;

  // Determine active category for CatsNav
  // Corregido: Si categoria es "" (Todos), activeCat debe ser "Todos"
  const activeCat = categoria === "" ? "Todos" : categoria;

  // Motor Heurístico de Cross-Selling con Dominios Semánticos (Afinidad Premium)
  const getRelatedProducts = useCallback((product: Producto | null) => {
    if (!product) return [];

    const sourceDomain = getSemanticDomain(product);

    // Filtrar productos excluyendo el actual y marcas/nombres vacíos si aplica
    let candidates = productos.filter(p => p.codigo !== product.codigo);

    // REGLA DE AISLAMIENTO: Los productos de limpieza no se mezclan con comida, y viceversa
    if (sourceDomain === "cleaning_hygiene") {
      candidates = candidates.filter(p => getSemanticDomain(p) === "cleaning_hygiene");
    } else {
      candidates = candidates.filter(p => getSemanticDomain(p) !== "cleaning_hygiene");
    }

    // Calcular puntaje de afinidad para cada candidato
    const scoredCandidates = candidates.map(p => {
      const targetDomain = getSemanticDomain(p);
      let score = 0;

      // 1. Compatibilidad de Dominio Semántico (Afinidades lógicas)
      if (sourceDomain === "sweet_dessert") {
        if (targetDomain === "sweet_dessert") score += 50;
        else if (targetDomain === "sweet_snacks") score += 30;
        else if (targetDomain === "beverages") score += 10;
        else score = -999; // Incompatible
      }
      else if (sourceDomain === "savory_meat") {
        if (targetDomain === "savory_complement") score += 50;
        else if (targetDomain === "beverages") score += 30;
        else if (targetDomain === "savory_meat") score += 20;
        else score = -999; // Incompatible
      }
      else if (sourceDomain === "savory_complement") {
        if (targetDomain === "savory_meat") score += 50;
        else if (targetDomain === "savory_complement") score += 30;
        else if (targetDomain === "beverages") score += 20;
        else score = -999; // Incompatible
      }
      else if (sourceDomain === "mate_culture") {
        if (targetDomain === "mate_culture") score += 50;
        else if (targetDomain === "sweet_snacks") score += 40;
        else score = -999; // Incompatible
      }
      else if (sourceDomain === "sweet_snacks") {
        if (targetDomain === "sweet_snacks") score += 50;
        else if (targetDomain === "mate_culture") score += 40;
        else if (targetDomain === "sweet_dessert") score += 20;
        else score = -999; // Incompatible
      }
      else if (sourceDomain === "beverages") {
        if (targetDomain === "beverages") score += 40;
        else if (targetDomain === "savory_complement") score += 30;
        else if (targetDomain === "savory_meat") score += 20;
        else if (targetDomain === "sweet_snacks") score += 10;
        else score = -999; // Incompatible
      }
      else if (sourceDomain === "cleaning_hygiene") {
        if (targetDomain === "cleaning_hygiene") score += 50;
        else score = -999; // Incompatible
      }

      // 2. Afinidad por Marca
      if (p.marca && product.marca && p.marca === product.marca && score !== -999) {
        score += 25;
      }

      // 3. Afinidad por Categoría oficial
      if (p.categoria && product.categoria && p.categoria === product.categoria && score !== -999) {
        score += 15;
      }

      // 4. Nombre similar (coincidencia de palabra clave)
      const firstWord = product.nombre.split(' ')[0].toLowerCase();
      if (firstWord.length > 2 && p.nombre.toLowerCase().includes(firstWord) && score !== -999) {
        score += 20;
      }

      return { product: p, score };
    });

    // Ordenar de mayor a menor puntaje
    const sorted = scoredCandidates
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    return sorted.slice(0, 8);
  }, [productos]);

  // Recomendaciones semánticas del carrito (Cross-Selling con Dominios Semánticos)
  const cartRecommendations = useMemo(() => {
    if (cartItems.length === 0 || productos.length === 0) return [];
    // Tomar el último producto agregado al carrito como ancla
    const lastItem = cartItems[cartItems.length - 1];
    const anchorProduct = productos.find(p => p.codigo === lastItem.codigo) || null;
    return getRelatedProducts(anchorProduct).slice(0, 4);
  }, [cartItems, productos, getRelatedProducts]);

  // Render clear loading shell to prevent hydration mismatches
  if (!mounted) {
    return (
      <div className="catalogo-page pb-24 md:pb-0" style={{ fontFamily: "var(--font-body, sans-serif)" }}>
        <OnlineBanner />
        <Suspense fallback={null}>
          <SharedCartWatcher onLoadCart={() => {}} />
        </Suspense>
        <div className="page-wrapper" style={{ marginTop: "16px", marginBottom: "8px" }}>
          {/* Guía Marti movida al Hero por estética y minimalismo */}
        </div>
        <Hero
          onOpenCart={() => {}}
          cartQty={0}
          cartTotal={0}
          onOpenUser={() => {}}
          isLoggedIn={false}
          searchQuery=""
          onSearchChange={() => {}}
          onSearchSubmit={() => {}}
          suggestedProducts={[]}
          recentSearches={[]}
          onSelectSuggestion={() => {}}
          sucursalId={sucursalId}
          onChangeBranch={() => setIsBranchModalOpen(true)}
        />
        <div className="page-wrapper">
          <AdSlotPlacement slot="hero" onBrandFilter={() => {}} />
        </div>
        <Ticker />
        <div className="page-wrapper">
          <OfertasDestacadasRail />
        </div>
        <div className="page-wrapper">
          <div ref={gridRef}>
            <ResultsBar
              showing={0}
              total={0}
              vista="grilla"
              onToggleVista={() => {}}
              searchQuery=""
              onSearchChange={() => {}}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3" style={{ marginTop: "16px" }}>
            {[...Array(12)].map((_, i) => (
              <ProductoSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state if failed to load
  if (loadingError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          background: "var(--bg, #F5F0E8)",
          padding: "20px",
        }}
      >
        <span style={{ fontSize: "3rem" }}>⚠️</span>
        <h2 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "2rem", color: "var(--texto)" }}>
          Error al cargar productos
        </h2>
        <p style={{ color: "var(--muted)", textAlign: "center" }}>{loadingError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "var(--rojo, #E8302A)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--r-md, 12px)",
            padding: "12px 24px",
            fontFamily: "var(--font-body), sans-serif",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="catalogo-page-wrapper">
      <OnlineBanner />

      {/* Banners dinámicos premium controlados desde el panel de administración (Reloj Suizo) */}
      {tiendaConfig.bannerMensaje && (
        <div className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black font-bold text-center text-xs sm:text-sm py-2.5 px-4 shadow-[0_4px_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 z-40 transition-all duration-300">
          <span className="text-sm">📢</span>
          <span>{tiendaConfig.bannerMensaje}</span>
        </div>
      )}

      {!tiendaConfig.pedidosAbiertos && (
        <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white font-bold text-center text-xs sm:text-sm py-3 px-4 shadow-[0_4px_25px_rgba(220,38,38,0.3)] flex items-center justify-center gap-2 z-40 transition-all duration-300 border-b border-red-500/20">
          <span className="text-sm animate-pulse">⚠️</span>
          <span>TOMA DE PEDIDOS PAUSADA TEMPORALMENTE. Podés armar tu carrito, pero la confirmación está inactiva.</span>
        </div>
      )}

      {/* Shared cart watcher (reads URL params inside Suspense) */}
      <Suspense fallback={null}>
        <SharedCartWatcher onLoadCart={(cart) => setSharedCart(cart)} />
      </Suspense>

      {/* Shared cart banner */}
      <SharedCartBanner
        sharedCart={sharedCart}
        onLoad={handleLoadSharedCart}
        onIgnore={handleIgnoreSharedCart}
      />

      {/* Branch Selector Premium (Mobile Top / Desktop Flow) */}
      <BranchBar
        sucursalName={SUCURSALES.find(s => s.id === sucursalId)?.nombre || null}
        onClick={() => setIsBranchModalOpen(true)}
      />

      <div className="page-wrapper" style={{ marginTop: "16px", marginBottom: "8px" }}>
        {/* Guía Marti movida al Hero por estética y minimalismo */}
      </div>

      <Hero
        onOpenCart={() => setCartOpen(true)}
        cartQty={totalQty}
        cartTotal={total}
        onOpenUser={() => setUserPanelOpen(true)}
        onShareCart={cartItems.length > 0 ? handleShareCart : undefined}
        isLoggedIn={!!user}
        userDisplayName={user?.displayName || alias || undefined}
        searchQuery={search}
        onSearchChange={setSearchDebounced}
        onSearchSubmit={handleSelectSuggestion}
        suggestedProducts={instantSuggestions}
        recentSearches={recentSearches}
        onSelectSuggestion={handleSelectSuggestion}
        sucursalId={sucursalId}
        onChangeBranch={() => setIsBranchModalOpen(true)}
      />

      {/* ── SECCIÓN DE OFERTAS PREMIUM SÚPER DESTACADAS (BANNERS) ── */}
      {(() => {
        const promosVisibles = (ofertasConfig?.premiumPromos || [])
          .filter(p => p.activa)
          .filter(p => !p.sucursalId || p.sucursalId === sucursalId);

        if (promosVisibles.length === 0) return null;

        return (
          <div className="page-wrapper" style={{ marginTop: "16px", marginBottom: "20px" }}>
            {/* Ocultar barra de scroll para el carrusel de móvil */}
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", width: "100%", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "20px" }}>⭐</span>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--oscuro, #1A1410)", fontFamily: "var(--font-display)" }}>
                  Ofertas Súper Destacadas Premium
                </h3>
                {ofertasConfig?.expiresAt && <PremiumCountdown expiresAt={ofertasConfig.expiresAt} />}
              </div>
              <span className="md:hidden text-[9px] font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse flex items-center gap-1 shrink-0">
                Deslizar ➔
              </span>
            </div>

            {/* Carrusel flexible en móvil (snap-start y ancho 76vw para que asome la siguiente), grilla en desktop */}
            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 no-scrollbar snap-x snap-mandatory">
              {promosVisibles.map((promo) => {
                const inCartQty = qtyMap[`PROMO-${promo.id}`] || 0;
                const hasPrice = promo.precio !== null && promo.precio !== undefined && promo.precio > 0;
                return (
                  <div
                    key={promo.id}
                    className="flex-shrink-0 w-[76vw] sm:w-[48vw] md:w-auto snap-start rounded-2xl overflow-hidden border border-amber-500/20 bg-white dark:bg-zinc-900 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-amber-500/40 relative aspect-square flex flex-col group"
                  >
                    {/* Badge de Oferta Premium */}
                    <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg shadow-md animate-pulse">
                      {hasPrice ? "🔥 SUPER OFERTA" : "⭐ DESTACADO"}
                    </div>

                    {/* Imagen 1:1 Completa con Zoom al Hover */}
                    <div className="relative w-full h-full overflow-hidden bg-white">
                      <Image
                        src={promo.imagen}
                        alt={promo.titulo}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Barra de control flotante inferior traslúcida */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 pt-12 flex items-center justify-between z-10">
                      <div className="flex flex-col min-w-0 pr-2">
                        {hasPrice && (
                          <span className="text-white font-black text-xl tracking-tight leading-none">
                            ${promo.precio!.toLocaleString("es-UY")}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider mt-1 truncate max-w-[150px] sm:max-w-none">
                          {promo.titulo}
                        </span>
                      </div>

                      {/* Botón de compra / Control de cantidad */}
                      {hasPrice && (
                        inCartQty > 0 ? (
                          <div className="flex items-center gap-3.5 bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-3 py-2 text-white font-bold shrink-0 shadow-lg">
                            <button
                              onClick={() => handleQtyChange(`PROMO-${promo.id}`, inCartQty - 1)}
                              className="hover:text-red-500 text-sm font-black px-1.5 transition-colors"
                            >
                              -
                            </button>
                            <span className="text-xs tracking-tight font-black">{inCartQty}</span>
                            <button
                              onClick={() => handleQtyChange(`PROMO-${promo.id}`, inCartQty + 1)}
                              className="hover:text-green-500 text-sm font-black px-1.5 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleAddProduct({
                              codigo: `PROMO-${promo.id}`,
                              nombre: promo.titulo,
                              precio: promo.precio!,
                              categoria: "OFERTAS PREMIUM",
                              imagen: promo.imagen,
                            }, e)}
                            className="bg-gradient-to-r from-[#E8302A] to-[#B91C1C] hover:from-[#FF4D47] hover:to-[#D32F2F] text-white font-extrabold text-[10px] px-4 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(232,48,42,0.35)] transition-all hover:scale-105 active:scale-95 uppercase tracking-wider shrink-0"
                          >
                            Llevar
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="page-wrapper">
        <div className="mb-4 mt-2">
          {ofertasConfig?.mainCarousel && ofertasConfig.mainCarousel.filter(s => s.activo).length > 0 ? (
            <CustomHeroCarousel slides={ofertasConfig.mainCarousel.filter(s => s.activo)} />
          ) : (
            <BrandHeroCarousel brands={activeBrands} />
          )}
        </div>
        <AdSlotPlacement slot="hero" category={activeCat === "Todos" ? undefined : activeCat} onBrandFilter={handleBrandFilter} />
        {ofertasConfig?.brandBanners && (
          <BrandBannersRail banners={ofertasConfig.brandBanners} />
        )}
      </div>


      {/* Ticker */}
      <Ticker />

      <div className="page-wrapper">
        <OfertasDestacadasRail />
        {ofertasConfig?.flashOffers && (
          <div style={{ marginTop: "16px" }}>
            <FlashOffersRail flashOffers={ofertasConfig.flashOffers} />
          </div>
        )}
        {ofertasConfig?.sponsoredProducts && (
          <div style={{ marginTop: "16px" }}>
            <SponsoredProductsRail products={ofertasConfig.sponsoredProducts} />
          </div>
        )}
      </div>

      {/* Contenido del catálogo — max-width desktop */}
      <div className="page-wrapper">
        {/* Tus Compras Frecuentes / Reorder Express */}
        <SmartReorder
          productos={productos}
          pedidos={pedidos}
          qtyMap={qtyMap}
          onAddProduct={handleAddProduct}
          onQtyChange={handleQtyChange}
        />

        {/* Category nav */}
        {ofertasConfig?.categoryOffers && (
          <CategoryOffersRail
            categoryOffers={ofertasConfig.categoryOffers}
            catalogo={productos}
            qtyMap={qtyMap}
            onAddProduct={handleAddProduct}
            onQtyChange={handleQtyChange}
          />
        )}

        {categorias.length > 0 && (
          <div className="lg:hidden">
            <CatsNav
              categorias={["Todos", ...categorias]}
              activeCat={activeCat}
              onSelect={(cat) => {
                const params = new URLSearchParams(window.location.search);
                if (cat === "Todos") params.delete("categoria");
                else params.set("categoria", cat);
                router.replace(`/catalogo?${params.toString()}`, { scroll: false });
                scrollToGrid();
              }}
            />
          </div>
        )}

        <div className="flex gap-6 relative" style={{ alignItems: "flex-start", marginTop: "16px" }}>
          {/* Desktop Sidebar */}
          {categorias.length > 0 && (
            <div className="hidden lg:block">
              <DesktopCategorySidebar
                categorias={["Todos", ...categorias]}
                activeCat={activeCat}
                onSelect={(cat) => {
                  const params = new URLSearchParams(window.location.search);
                  if (cat === "Todos") params.delete("categoria");
                  else params.set("categoria", cat);
                  router.replace(`/catalogo?${params.toString()}`, { scroll: false });
                  scrollToGrid();
                }}
              />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0 pb-[100px]">
            {/* Results bar */}
            <div ref={gridRef}>
              <ResultsBar
                showing={filtrados.length}
                total={filtrados.length}
                vista={vista}
                onToggleVista={handleToggleVista}
                searchQuery={search}
                onSearchChange={setSearchDebounced}
                marketAd={<AdSlotPlacement slot="results" category={activeCat === "Todos" ? undefined : activeCat} onBrandFilter={handleBrandFilter} />}
                ofertasCount={ofertasConfig?.activa && ofertasConfig.productos ? ofertasConfig.productos.length : 0}
                sortBy={urlSort}
                onSortChange={handleSortChange}
                onOpenFilters={() => setFilterSheetOpen(true)}
                activeFiltersCount={activeFiltersCount}
                suggestedProducts={instantSuggestions}
                onSelectSuggestion={handleSelectSuggestion}
              />
            </div>

            {/* Product grid/list */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {[...Array(12)].map((_, i) => (
                  <ProductoSkeleton key={i} />
                ))}
              </div>
            ) : filtrados.length === 0 ? (
              <div className="w-full py-12 flex flex-col items-center">
                <EmptyState
                  icon="🔎"
                  title="No encontramos resultados"
                  description={`No hay productos que coincidan con "${search}". Intentá con otro término o limpiá los filtros.`}
                  actionText="Limpiar Búsqueda"
                  onAction={() => {
                    setSearchDebounced("");
                    const params = new URLSearchParams(window.location.search);
                    params.delete("categoria");
                    params.delete("search");
                    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
                  }}
                  minHeight="30vh"
                />
                <AdSlotPlacement slot="empty-search" category={activeCat === "Todos" ? undefined : activeCat} onBrandFilter={handleBrandFilter} />
              </div>
            ) : (
              <ProductoGrid
                productos={filtrados}
                vista={vista}
                qtyMap={qtyMap}
                searchTerm={search}
                onAdd={handleAddProduct}
                onQtyChange={handleQtyChange}
                onQuickView={(p) => setQuickViewProduct(p)}
                onSelectBrand={handleBrandFilter}
                onSelectCategory={(cat) => {
                  const params = new URLSearchParams(window.location.search);
                  if (cat === "Todos") params.delete("categoria");
                  else params.set("categoria", cat);
                  router.replace(`/catalogo?${params.toString()}`, { scroll: false });
                  scrollToGrid();
                }}
              />
            )}
          </div>
        </div>
        </div>


      {/* Float cart button */}
      <FloatCartBtn
        totalQty={totalQty}
        total={total}
        onClick={() => setCartOpen(true)}
      />

      {/* Cart Panel */}
      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        total={total}
        onSendWA={handleSendWA}
        alias={alias}
        onAliasChange={handleSaveAlias}
        telefono={telefono}
        onTelefonoChange={handleSaveTelefono}
        onShare={handleShareCart}
        onClear={() => {
          clearCart();
          toast.info("Carrito limpiado");
        }}
        shareLink={shareLink}
        onCopyShareLink={handleCopyShareLink}
        clientNotes={clientNotes}
        onClientNotesChange={setClientNotes}
        direccion={direccion}
        onDireccionChange={handleSaveDireccion}
        isProcessing={isProcessing}
        metodoEntrega={metodoEntrega}
        onMetodoEntregaChange={setMetodoEntrega}
        sucursalId={sucursalId}
        onSucursalChange={handleSucursalChange}
        isTiendaCerrada={!tiendaConfig.pedidosAbiertos}
        relatedProducts={cartRecommendations}
        onAddProduct={handleAddProduct}
      />

      {/* User Panel */}
      <UserPanel
        isOpen={userPanelOpen}
        onClose={() => setUserPanelOpen(false)}
        alias={alias}
        user={user}
        pedidos={pedidos}
        onAliasSave={handleSaveAlias}
        onReorder={handleReorder}
        onReorderItems={handleReorderItems}
        onLogout={handleLogout}
        onClearData={handleClearData}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        producto={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAdd={handleAddProduct}
        qty={quickViewProduct ? (qtyMap[quickViewProduct.codigo] || 0) : 0}
        onQtyChange={handleQtyChange}
        relatedProducts={getRelatedProducts(quickViewProduct)}
        getQty={(codigo) => qtyMap[codigo] || 0}
        onQuickView={(p) => setQuickViewProduct(p)}
      />

      {/* Filter Sheet (Mobile Bottom Sheet) */}
      <FilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        marcasDisponibles={marcasDisponibles}
        marcasSeleccionadas={urlMarcas}
        onMarcasChange={handleMarcasChange}
        minPrecio={urlMinPrecio}
        maxPrecio={urlMaxPrecio}
        onPrecioRangeChange={handlePrecioRangeChange}
        soloOfertas={urlSoloOfertas}
        onSoloOfertasChange={handleSoloOfertasChange}
        onClearAll={handleClearAllFilters}
        totalFiltrados={filtrados.length}
      />

      {/* Bottom Nav Bar (Mobile) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabSelect={(tab: string) => {
          setActiveTab(tab);
          if (tab === "buscar") {
            const searchInput = document.querySelector(".results-search-input") as HTMLInputElement;
            if (searchInput) {
              const rect = searchInput.getBoundingClientRect();
              const scrollTop = window.scrollY || document.documentElement.scrollTop;
              const targetY = rect.top + scrollTop - (window.innerHeight / 2) + (rect.height / 2);
              window.scrollTo({
                top: Math.max(0, targetY),
                behavior: "smooth"
              });
              searchInput.focus();
            }
          } else if (tab === "inicio") {
            const params = new URLSearchParams(window.location.search);
            params.delete("categoria");
            params.delete("search");
            params.delete("marcas");
            params.delete("minPrecio");
            params.delete("maxPrecio");
            params.delete("ofertas");
            router.replace(`/catalogo?${params.toString()}`, { scroll: false });
          }
        }}
        cartQty={totalQty}
        onOpenCart={() => setCartOpen(true)}
        onOpenUser={() => setUserPanelOpen(true)}
      />

      {/* Scroll to Top FAB */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`scroll-to-top-btn ${totalQty > 0 ? "has-cart" : ""}`}
          style={{
            position: "fixed",
            bottom: "calc(env(safe-area-inset-bottom, 12px) + 72px)",
            right: "20px",
            zIndex: 90,
            background: "var(--oscuro, #111)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            cursor: "pointer",
            transition: "bottom 0.3s ease, opacity 0.2s ease, transform 0.2s ease",
            animation: "fadeIn 0.2s ease-in-out",
          }}
          aria-label="Volver arriba"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      {/* Branch Select Modal */}
      <BranchSelectModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        currentSucursalId={sucursalId}
        onSelect={handleSucursalChange}
      />
    </div>
  );
}




