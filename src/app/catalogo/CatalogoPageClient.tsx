"use client";

import { useState, useCallback, useMemo, Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  MarketingRail,
  ConversionStrip,
  BrandRail,
} from "@/components/catalogo";
import { useBrands } from "@/hooks/useBrands";
import type { OfertaConfig } from "@/types/ofertas";

import CartPanel from "@/components/carrito/CartPanel";
import UserPanel from "@/components/usuario/UserPanel";
import FacturaModal from "@/components/catalogo/FacturaModal";
import OnlineBanner from "@/components/ui/OnlineBanner";
import QuickViewModal from "@/components/catalogo/QuickViewModal";
import { AdSlotPlacement } from "@/components/ads";
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
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import type { Vista, CartItem, Producto } from "@/types";
import { CATEGORIAS, EMOJI_POR_CATEGORIA } from "@/types";
import categoriaMapping from "@/lib/categoria_mapping.json";

const catMap = (categoriaMapping as any).mapping || categoriaMapping;

import { flyToCart } from "@/lib/flyToCart";

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


export default function CatalogoPageClient(_props: CatalogoPageClientProps) {
  // Refs para Auto-Scroll
  const gridRef = useRef<HTMLDivElement>(null);
  
  const scrollToGrid = () => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";
  const urlCategoria = searchParams?.get("categoria") || "";

  const { items: cartItems, addItem, removeItem, updateQty, clearCart, total, totalQty } = useCart();
  const { brands } = useBrands();

  const { user, signOut } = useAuth();
  const toast = useToast();
  const isOnline = useOnline();

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

  // Hydration fix: Load client-only data after mount
  const [mounted, setMounted] = useState(false);
  const [direccion, setDireccion] = useState("");
  useEffect(() => {
    setMounted(true);
    setVista(ls.getVista());
    setAlias(ls.getAlias());
    setTelefono(ls.getTelefono());
    setDireccion(ls.getDireccion());
  }, []);
  const [clientNotes, setClientNotes] = useState("");
  const [sharedCart, setSharedCart] = useState<CartItem[] | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [facturaModalOpen, setFacturaModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntrega>('envio');
  const [sucursalId, setSucursalId] = useState<string | null>(null);

  // Search state for instant feedback on input, synced with URL
  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

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

  // Enforce branch selection from URL or local storage
  useEffect(() => {
    if (!mounted) return;

    const urlSucursal = searchParams?.get("sucursal");
    const savedSucursal = ls.getSelectedSucursal();

    if (urlSucursal) {
      const valid = SUCURSALES.some((s) => s.id === urlSucursal);
      if (valid) {
        setSucursalId(urlSucursal);
        if (savedSucursal !== urlSucursal) ls.setSelectedSucursal(urlSucursal);
      } else {
        const searchStr = typeof window !== "undefined" ? window.location.search : "";
        router.replace(`/seleccionar-sucursal${searchStr}`);
      }
    } else if (savedSucursal) {
      const params = new URLSearchParams(window.location.search);
      params.set("sucursal", savedSucursal);
      router.replace(`/catalogo?${params.toString()}`);
      setSucursalId(savedSucursal);
    } else {
      const searchStr = typeof window !== "undefined" ? window.location.search : "";
      router.replace(`/seleccionar-sucursal${searchStr}`);
    }
  }, [mounted, searchParams, router]);

  // Fetch branch-specific or global productos
  useEffect(() => {
    if (!sucursalId) return;
    const currentId = sucursalId;
    let cancelled = false;

    async function fetchProductos() {
      try {
        setLoading(true);
        setLoadingError(null);
        let data: Producto[] = [];
        let loadedFromBranch = false;
        
        try {
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
  }, [sucursalId]);

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
      if (term) scrollToGrid();
    }, 400); // 400ms for stable grid and URL updates
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

  // Filter by search and category (memoized for performance)
  const filtrados = useMemo(() => {
    let result = productos.filter((p) => (p.precio || 0) > 0);

    if (categoria) {
      result = result.filter((p) => p.categoria === categoria);
    }

    if (debouncedSearch.trim()) {
      const normalize = (s: string) =>
        s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
      const searchTerms = normalize(debouncedSearch.trim()).split(/\s+/);
      
      result = result.filter((p) => {
        // Buscamos en nombre, codigo y tambien en la categoria (que funciona como filtro extra)
        // Como la DB actual no tiene el campo "marca", las marcas suelen estar en el "nombre"
        const searchableText = normalize(`${p.nombre} ${p.codigo} ${p.categoria}`);
        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    return result;
  }, [productos, categoria, debouncedSearch]);

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
        flyToCart(e, producto.imagen, EMOJI_POR_CATEGORIA[producto.categoria]);
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
          for (let i = 0; i < delta; i++) addItem({ codigo, nombre: "", precio: 0 });
        } else {
          for (let i = 0; i < -delta; i++) updateQty(codigo, -1);
        }
      }
    },
    [qtyMap, addItem, removeItem, updateQty]
  );

  const handleToggleVista = useCallback((v: Vista) => {
    setVista(v);
    ls.setVista(v);
  }, []);

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
        await enviarFacturaWhatsApp(
          process.env.NEXT_PUBLIC_WA_NUMBER!,
          nombre,
          tel,
          cartItems,
          deliveryNotas || undefined,
          "/logo.png",
          orderId,
          deliveryDireccion,
          true // skipRedirect = true: descarga el comprobante y no redirige a WhatsApp
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
      <>
        <OnlineBanner />
        <Hero
          onOpenCart={() => {}}
          cartQty={0}
          cartTotal={0}
          onOpenUser={() => {}}
          isLoggedIn={false}
          searchQuery=""
          onSearchChange={() => {}}
          suggestedProducts={[]}
          recentSearches={[]}
          onSelectSuggestion={() => {}}
          sucursalId={sucursalId}
        />
        <div className="page-wrapper">
          <AdSlotPlacement slot="hero" onBrandFilter={() => {}} />
        </div>
        <Ticker />
        <div className="page-wrapper">
          <ConversionStrip />
        </div>
        <div className="page-wrapper">
          <MarketingRail cartQty={0} isLoggedIn={false} />
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
      </>
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
    <>
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

      <div className="page-wrapper" style={{ marginTop: "12px", marginBottom: "4px" }}>
        <Link
          href="/tutorial"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(232, 48, 42, 0.06)",
            border: "1.5px dashed rgba(232, 48, 42, 0.3)",
            borderRadius: "16px",
            padding: "10px 18px",
            textDecoration: "none",
            color: "inherit",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>🔨</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--rojo, #D62828)" }}>
              ¿Primera vez comprando? Mirá la guía interactiva explicada con VOZ por &quot;Marti&quot;.
            </span>
          </div>
          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--rojo, #D62828)", textTransform: "uppercase" }}>
            Ver Guía ➡️
          </span>
        </Link>
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
        suggestedProducts={instantSuggestions}
        recentSearches={recentSearches}
        onSelectSuggestion={handleSelectSuggestion}
        sucursalId={sucursalId}
      />

      <div className="page-wrapper">
        <AdSlotPlacement slot="hero" category={activeCat === "Todos" ? undefined : activeCat} onBrandFilter={handleBrandFilter} />
      </div>

      {/* ── BANNER PREMIUM DE OFERTAS DE LA SEMANA ── */}
      {ofertasConfig?.activa && ofertasConfig.productos && ofertasConfig.productos.length > 0 && (
        <div className="page-wrapper" style={{ marginTop: "8px", marginBottom: "16px" }}>
          <Link
            href="/ofertas"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #E8302A 0%, #B91C1C 100%)",
              color: "#fff",
              borderRadius: "16px",
              padding: "16px 20px",
              textDecoration: "none",
              boxShadow: "0 10px 25px rgba(232, 48, 42, 0.25)",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px) scale(1.005)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(232, 48, 42, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(232, 48, 42, 0.25)";
            }}
          >
            {/* Ambient background glow */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 2 }}>
              <span style={{ fontSize: "24px" }}>🔥</span>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 900, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {ofertasConfig.titulo || "Ofertas de la Semana"}
                </h4>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                  {ofertasConfig.subtitulo || `Aprovechá precios únicos en ${ofertasConfig.productos.length} productos seleccionados.`}
                </p>
              </div>
            </div>
            
            <span style={{
              background: "rgba(255,255,255,0.2)",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              zIndex: 2,
              flexShrink: 0,
            }}>
              Ver Todo →
            </span>
          </Link>
        </div>
      )}

      {/* Ticker */}
      <Ticker />

      <div className="page-wrapper">
        <ConversionStrip />
      </div>

      <div className="page-wrapper">
        <MarketingRail cartQty={totalQty} isLoggedIn={!!user} />
      </div>

      {/* Contenido del catálogo — max-width desktop */}
      <div className="page-wrapper">

        {/* Category nav */}

        {categorias.length > 0 && (
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
        )}

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
          />
        </div>

        {/* Product grid/list */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <ProductoSkeleton key={i} />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="no-results" style={{ background: "var(--bg2)", padding: "48px 24px", borderRadius: "var(--r-xl)", maxWidth: "500px", margin: "0 auto 24px", boxShadow: "var(--shadow-sm)" }}>
              <span className="no-results-icon" style={{ fontSize: "4rem", marginBottom: "16px", display: "block" }}>&#128269;</span>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px", color: "var(--oscuro)", fontFamily: "var(--font-display), sans-serif" }}>No encontramos resultados</h3>
              <p style={{ color: "var(--muted)", marginBottom: "24px" }}>No hay productos que coincidan con <strong>&quot;{search}&quot;</strong>. Intentá con otro término o limpiá los filtros.</p>
              <button 
                onClick={() => {
                  setSearchDebounced("");
                  const params = new URLSearchParams(window.location.search);
                  params.delete("categoria");
                  params.delete("search");
                  router.replace(`/catalogo?${params.toString()}`, { scroll: false });
                }} 
                style={{ background: "var(--rojo)", color: "white", fontWeight: 700, padding: "12px 24px", borderRadius: "var(--r-md)", border: "none", cursor: "pointer", boxShadow: "0 4px 12px var(--rojo-glow)" }}
              >
                Limpiar Búsqueda
              </button>
            </div>
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
          />
        )}
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
        onSucursalChange={setSucursalId}
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

      {/* User Panel */}

      {/* Factura Modal (Preview & WhatsApp send) */}
      {/* El modal de factura ya no es necesario como paso intermedio */}
    </>
  );
}




