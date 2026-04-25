"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
} from "@/components/catalogo";
import CartPanel from "@/components/carrito/CartPanel";
import UserPanel from "@/components/usuario/UserPanel";
import FacturaModal from "@/components/catalogo/FacturaModal";
import OnlineBanner from "@/components/ui/OnlineBanner";
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
import { doc, getDoc } from "firebase/firestore";
import type { Vista, CartItem, Producto } from "@/types";
import { CATEGORIAS } from "@/types";

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

export default function CatalogoPageClient(_props: CatalogoPageClientProps) {
  // Hooks
  const { items: cartItems, addItem, removeItem, updateQty, clearCart, total, totalQty } = useCart();
  const { user, signOut } = useAuth();
  const toast = useToast();
  const isOnline = useOnline();

  // Local state
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [vista, setVista] = useState<Vista>("grilla");
  const [alias, setAlias] = useState("");
  const [telefono, setTelefono] = useState("");

  // Hydration fix: Load client-only data after mount
  useEffect(() => {
    setVista(ls.getVista());
    setAlias(ls.getAlias());
    setTelefono(ls.getTelefono());
  }, []);
  const [clientNotes, setClientNotes] = useState("");
  const [sharedCart, setSharedCart] = useState<CartItem[] | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [facturaModalOpen, setFacturaModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [direccion, setDireccion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntrega>('envio');
  const [sucursalId, setSucursalId] = useState<string | null>(null);

  // Search & filter state (client-side only)
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Fetch productos on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchProductos() {
      try {
        setLoading(true);
        setLoadingError(null);
        let data: Producto[] = [];
        
        try {
          const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
          if (snap.exists()) {
            const docData = snap.data();
            data = Object.values(docData.items || {}) as Producto[];
            console.log(`📦 Catálogo cargado desde Firestore (${data.length} productos)`);
          } else {
            console.warn("⚠️ Documento de Firestore 'catalogo_activo/productos' no existe.");
          }
        } catch (e: any) {
          console.error("❌ Falló la carga desde Firestore. Verificá reglas o conexión.", e);
          if (e.code === 'permission-denied') {
            console.error("⛔ Error de Permisos: El catálogo no es público en Firestore.");
          }
        }

        if (data.length === 0) {
          console.info("🔄 Intentando cargar desde fallback local (productos.json)...");
          const res = await fetch("/productos.json");
          if (!res.ok) throw new Error(`HTTP ${res.status}: failed to load productos`);
          data = (await res.json()) as Producto[];
          console.log(`🏠 Catálogo cargado desde local JSON (${data.length} productos)`);
        }

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
  }, []);

  // Debounce search (200ms)
  const setSearchDebounced = useCallback((term: string) => {
    setSearch(term);
    const timer = setTimeout(() => setDebouncedSearch(term), 200);
    return () => clearTimeout(timer);
  }, []);

  // Cloud orders (when logged in)
  const { pedidos: cloudPedidos } = usePedidosCloud();
  // Local orders (guest)
  const { pedidos: localPedidos, savePedido: saveLocalPedido } = usePedidosLocales();

  // Category correction logic (centralized)
  const getCorrectedCategory = useCallback((p: Producto) => {
    // Si ya tiene una categoría que no sea "Otros", la respetamos (viene del Excel/Admin)
    if (p.categoria && p.categoria !== "Otros") return p.categoria;

    const CATEGORY_CORRECTIONS: Record<string, string> = {
      "ALFAJOR": "Golosinas y Dulces",
      "PILAS": "Otros",
      "LAMPARA": "Otros",
      "SHAMPOO": "Higiene Personal",
      "ACONDICIONADOR": "Higiene Personal",
      "JABON TOCADOR": "Higiene Personal",
      "DENTAL": "Higiene Personal",
      "AFEITADORA": "Higiene Personal",
      "ACEITUNAS": "Aceites y Aderezos",
      "CHOCLO": "Harinas, Pastas y Legumbres",
      "ARVEJAS": "Harinas, Pastas y Legumbres",
      "POROTOS": "Harinas, Pastas y Legumbres",
      "LENTEJAS": "Harinas, Pastas y Legumbres",
      "PAN DULCE": "Panadería",
      "BUDIN": "Panadería",
    };

    const nombreUpper = p.nombre.toUpperCase();
    for (const [key, corrected] of Object.entries(CATEGORY_CORRECTIONS)) {
      if (nombreUpper.includes(key)) {
        return corrected;
      }
    }
    return p.categoria || "Otros";
  }, []);

  // Enrich productos with corrected categories (only for items marked as "Otros" or missing)
  const productosEnriquecidos = useMemo(() => {
    return productos.map(p => ({
      ...p,
      categoria: getCorrectedCategory(p)
    }));
  }, [productos, getCorrectedCategory]);

  // Derive unique categories from ALL products (not just enriched or filtered)
  // This ensures categories don't disappear when searching
  const categorias = useMemo(() => {
    // ALWAYS use CATEGORIAS from types as the baseline
    // This prevents categories from disappearing while loading or filtering
    return Array.from(CATEGORIAS);
  }, []);

  // Filter by search and category (memoized for performance)
  const filtrados = useMemo(() => {
    let result = productosEnriquecidos;

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
  }, [productosEnriquecidos, categoria, debouncedSearch]);

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
    (producto: Producto) => {
      addItem(producto);
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

  const handleClearData = useCallback(() => {
    ls.setAlias("");
    ls.setTelefono("");
    ls.setHistory([]);
    ls.setBusquedas([]);
    setAlias("");
    setTelefono("");
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
      const orderId = await guardarPedidoGlobal({
        uid: user?.uid ?? null,
        clienteNombre: nombre,
        clienteTelefono: tel,
        clienteDireccion: deliveryDireccion || undefined,
        items: pedidoItems,
        total,
        notas: deliveryNotas || undefined,
        status: "no_leido",
      });
      setActiveOrderId(orderId);

      const codigos = cartItems.map((i) => i.codigo);
      incrementarStats(codigos).catch((err) =>
        console.warn("Failed to increment stats:", err)
      );

      // 2. Si hay usuario, guardar en su historial privado (Cloud)
      if (user) {
        guardarPedidoUsuario(user.uid, {
          items: pedidoItems,
          total,
          notas: deliveryNotas || undefined,
          mensajeWA: "", 
        }).catch((err) => console.warn("Failed to save user pedido cloud:", err));
      }

      // 3. Guardar siempre en local (para usuarios invitados)
      saveLocalPedido(cartItems, total, deliveryNotas || undefined);

      // 4. GENERAR Y ENVIAR AUTOMÁTICAMENTE
      await enviarFacturaWhatsApp(
        process.env.NEXT_PUBLIC_WA_NUMBER!,
        nombre,
        tel,
        cartItems,
        deliveryNotas || undefined,
        "/logo.png",
        orderId,
        deliveryDireccion
      );

      // Reset delivery state after success
      setMetodoEntrega('envio');
      setSucursalId(null);
      handleFinalizado();
    } catch (err) {
      console.error("Error en flujo de confirmación:", err);
      toast.error("Hubo un problema al procesar el pedido");
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
  const activeCat = categoria || (categorias.length > 0 ? categorias[0] : "");

  // Loading state
  // El estado de carga (loading) ahora se maneja directamente en el JSX principal 
  // debajo del ResultsBar mediante Skeleton Loaders para evitar el flicker.


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

      {/* Hero */}
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
      />

      {/* Ticker */}
      <Ticker />

      {/* Contenido del catálogo — max-width desktop */}
      <div className="page-wrapper">
        {/* Category nav */}
        {categorias.length > 0 && (
          <CatsNav
            categorias={["Todos", ...categorias]}
            activeCat={activeCat}
            onSelect={(cat) => setCategoria(cat === "Todos" ? "" : cat)}
          />
        )}

        {/* Results bar */}
        <ResultsBar
          showing={filtrados.length}
          total={filtrados.length}
          vista={vista}
          onToggleVista={handleToggleVista}
          searchQuery={search}
          onSearchChange={setSearchDebounced}
        />

        {/* Product grid/list */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <ProductoSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ProductoGrid
            productos={filtrados}
            vista={vista}
            qtyMap={qtyMap}
            searchTerm={search}
            onAdd={handleAddProduct}
            onQtyChange={handleQtyChange}
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
        onDireccionChange={setDireccion}
        isProcessing={isProcessing}
        metodoEntrega={metodoEntrega}
        onMetodoEntregaChange={setMetodoEntrega}
        sucursalId={sucursalId}
        onSucursalChange={setSucursalId}
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

      {/* User Panel */}

      {/* Factura Modal (Preview & WhatsApp send) */}
      {/* El modal de factura ya no es necesario como paso intermedio */}
    </>
  );
}
