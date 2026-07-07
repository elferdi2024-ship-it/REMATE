"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import categoriaMapping from "@/lib/categoria_mapping.json";

const catMap = (categoriaMapping as any).mapping || categoriaMapping;

import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { haptic } from "@/lib/haptic";
import { EMOJI_POR_CATEGORIA, Producto } from "@/types";
import { flyToCart } from "@/lib/flyToCart";
import CartPanel from "@/components/carrito/CartPanel";

// Tarjeta Exclusiva Neon para la Fiesta
function PremiumProductCard({ producto }: { producto: Producto }) {
  const { items, addItem, removeItem } = useCart();
  const toast = useToast();
  
  const cartItem = items.find((i) => i.codigo === producto.codigo);
  const qty = cartItem ? cartItem.cantidad : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    haptic.add();
    addItem(producto);
    flyToCart(e, producto.imagen, EMOJI_POR_CATEGORIA[producto.categoria] || "🛒");
    toast.success(`Agregado: ${producto.nombre}`);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    haptic.remove();
    removeItem(producto.codigo);
  };

  // Determinar color de acento según categoría
  const isAlcohol = producto.categoria?.toLowerCase().includes("alcohol") || producto.nombre.toLowerCase().includes("cerveza") || producto.nombre.toLowerCase().includes("whisky");
  const accentColor = isAlcohol ? "from-[#00B0FF] to-[#0081CB]" : "from-[#E53935] to-[#D32F2F]";
  const shadowColor = isAlcohol ? "rgba(0, 176, 255, 0.4)" : "rgba(229, 57, 53, 0.4)";
  const borderColor = isAlcohol ? "border-[#00B0FF]/30" : "border-[#E53935]/30";

  return (
    <div className={`relative group bg-[#111] rounded-[16px] md:rounded-2xl overflow-hidden border ${borderColor} transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-[0_15px_30px_${shadowColor}] flex flex-col h-full`}>
      {/* Etiqueta Oferta / Precio Especial */}
      <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20">
        <span className={`bg-gradient-to-r ${accentColor} text-white text-[8px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full uppercase tracking-[1px] shadow-lg`}>
          Mayorista
        </span>
      </div>

      {/* Contenedor de Imagen */}
      <div className="relative h-[130px] md:h-[200px] w-full p-4 md:p-6 bg-gradient-to-b from-white/[0.08] to-transparent flex items-center justify-center overflow-hidden">
        {/* Glow de fondo para la imagen */}
        <div className={`absolute inset-0 bg-gradient-to-tr ${accentColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className="object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500 p-4"
          />
        ) : (
          <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {EMOJI_POR_CATEGORIA[producto.categoria] || "📦"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 md:p-5 flex-1 flex flex-col bg-gradient-to-t from-black/40 to-transparent">
        <h4 className="font-bebas text-lg md:text-2xl leading-[1.1] md:leading-tight mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors line-clamp-2">
          {producto.nombre}
        </h4>
        
        {/* Precios y Botón */}
        <div className="mt-auto pt-3 md:pt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
          <div className="min-w-0 flex-shrink w-full">
            <p className="text-white/50 text-[9px] md:text-xs font-light tracking-[1px] uppercase mb-0.5 md:mb-1 truncate">Precio Especial</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={`font-bebas text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r ${accentColor} leading-none drop-shadow-md`}>
                ${producto.precio}
              </span>
              {producto.precioAnterior && producto.precioAnterior > producto.precio && (
                <span className="text-white/30 line-through text-[10px] md:text-sm font-semibold">
                  ${producto.precioAnterior}
                </span>
              )}
            </div>
          </div>

          {/* Botón Agregar - alineado a la derecha en mobile */}
          <div className="self-end sm:self-auto w-full sm:w-auto flex justify-end">
            {qty > 0 ? (
              <div className="flex items-center gap-2 md:gap-3 bg-white/10 rounded-full px-1.5 md:px-2 py-1 md:py-1 border border-white/20 shadow-inner">
                <button onClick={handleRemove} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-colors text-sm md:text-base">
                  -
                </button>
                <span className="font-bebas text-lg md:text-xl w-4 md:w-4 text-center leading-none mt-0.5">{qty}</span>
                <button onClick={handleAdd} className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r ${accentColor} flex items-center justify-center text-white shadow-[0_0_10px_${shadowColor}] transition-transform active:scale-95 text-sm md:text-base`}>
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={`w-9 h-9 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-gradient-to-r ${accentColor} flex items-center justify-center text-white shadow-[0_0_15px_${shadowColor}] transition-transform hover:scale-110 active:scale-95`}
              >
                <svg width="20" height="20" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EFECTOS DE FONDO FANTÁSTICOS ──
function FiestaBgFX() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div className="absolute top-[10%] left-[5%] w-64 h-64 md:w-96 md:h-96 bg-[#E53935]/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[5%] w-72 h-72 md:w-[500px] md:h-[500px] bg-[#FFCA28]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[50%] left-[60%] w-48 h-48 md:w-80 md:h-80 bg-[#00B0FF]/15 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}

// ── BOTÓN FLOTANTE EXCLUSIVO PARA FIESTA ──
function FiestaCartBtn({ totalQty, total, onClick }: { totalQty: number, total: number, onClick: () => void }) {
  const hasItems = totalQty > 0;
  if (!hasItems) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-between w-[92%] max-w-[320px] md:max-w-[360px] bg-gradient-to-r from-[#E53935] to-[#FF9800] px-4 md:px-6 py-2.5 md:py-3 rounded-full shadow-[0_0_30px_rgba(229,57,53,0.5)] hover:scale-105 active:scale-95 transition-all border border-white/20 animate-bounce"
      style={{ animationDuration: '2s' }}
    >
      <div className="flex items-center gap-2 text-white font-bebas text-xl md:text-2xl leading-none pt-1 whitespace-nowrap overflow-hidden">
        <span>🛒</span>
        <span className="truncate">VER PEDIDO</span>
      </div>
      <div className="flex items-center gap-1.5 md:gap-2 bg-black/40 rounded-full px-2.5 md:px-3 py-1 shadow-inner shrink-0 ml-2">
        <span className="text-white font-bold text-[11px] md:text-sm bg-white/20 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">{totalQty}</span>
        <span className="text-white font-bebas text-lg md:text-xl pt-0.5 md:pt-1 leading-none">${total}</span>
      </div>
    </button>
  );
}

// ── NAVEGACIÓN STICKY (SISTEMA DE PESTAÑAS) ──
function FiestaNav({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const getBtnClass = (tab: string, baseColor: string) => {
    const isActive = activeTab === tab;
    return `whitespace-nowrap px-4 py-2 rounded-full font-bebas text-lg md:text-xl transition-all duration-300 ${
      isActive 
        ? `bg-${baseColor}/20 text-${baseColor} shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-${baseColor}/50 scale-105` 
        : `text-white/70 hover:text-white hover:bg-white/10 border border-transparent`
    }`;
  };

  return (
    <div className="sticky top-[70px] md:top-[80px] z-[60] flex justify-center mt-2 mb-8 px-4 md:px-0">
      <div className="flex items-center gap-2 md:gap-4 bg-black/60 backdrop-blur-xl p-1.5 md:p-2 rounded-full border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-x-auto scrollbar-none w-full max-w-max justify-start sm:justify-center">
        <button onClick={() => setActiveTab('bebidas')} className={getBtnClass('bebidas', '[#00B0FF]')}>
          🍸 BARRA LIBRE
        </button>
        <button onClick={() => setActiveTab('parrilla')} className={getBtnClass('parrilla', '[#E53935]')}>
          🥩 PARRILLA
        </button>
        <button onClick={() => setActiveTab('picada')} className={getBtnClass('picada', '[#FFCA28]')}>
          🧀 PICADA
        </button>
        <button onClick={() => setActiveTab('descartables')} className={getBtnClass('descartables', 'white')}>
          🥡 EXTRAS
        </button>
      </div>
    </div>
  );
}

export default function FiestaClient() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("bebidas");
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { items, totalQty, total, updateQty, removeItem } = useCart();

  useEffect(() => {
    setMounted(true);
    async function loadProducts() {
      try {
        let data: Producto[] = [];
        let loadedFromBranch = false;

        // 1. Intentar cargar desde la sucursal seleccionada (igual que el catálogo principal)
        const currentId = typeof window !== "undefined" ? localStorage.getItem("remate_sucursalId") : null;
        if (currentId) {
          try {
            const branchSnap = await getDoc(doc(db, "sucursales_catalogos", currentId));
            if (branchSnap.exists()) {
              const branchData = branchSnap.data();
              const itemsList = Object.values(branchData.items || {}) as Producto[];
              data = itemsList.filter((item) => !item.deshabilitado);
              loadedFromBranch = true;
            }
          } catch (e) {
            console.error("Error cargando sucursal en Fiesta:", e);
          }
        }

        // 2. Fallback a catálogo global
        if (!loadedFromBranch) {
          const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
          if (snap.exists()) {
            const docData = snap.data();
            data = Object.values(docData.items || {}) as Producto[];
            data = data.filter((item) => !item.deshabilitado); // Aplicar también filtro global
          } else {
            const res = await fetch("/productos.json");
            if (res.ok) {
              data = await res.json();
            }
          }
        }

        // Aplicar mapping de categorías del Excel (crucial para que coincida con el catálogo principal)
        data = data.map(p => {
          const barcode = String(p.codigo || "").trim();
          if (catMap[barcode]) {
            return { ...p, categoria: catMap[barcode] };
          }
          return p;
        });

        // Filtrar productos relevantes para la fiesta
        const keywords = [
          "hamburguesa", "cerveza", "whisky", "vodka", "fernet", "pancho", "chorizo", "hielo", 
          "refresco", "coca", "pepsi", "sprite", "vino", "gin", "ron",
          "servilleta", "vaso", "descartable", "plato", "cubierto", 
          "snack", "papas fritas", "mani", "chisitos", "doritos", "jamon", "queso", "fiambre", "salame", "bondiola", "aceituna"
        ];
        
        const fiestaProducts = data.filter(p => {
          if (!p.precio || p.precio <= 0) return false;
          if (p.deshabilitado) return false;
          
          const searchName = p.nombre.toLowerCase();
          const searchCat = (p.categoria || "").toLowerCase();
          
          return keywords.some(kw => searchName.includes(kw) || searchCat.includes(kw));
        });

        // Ordenar por "exclusividad" simulada (primero alcohol caro y hamburguesas)
        fiestaProducts.sort((a, b) => b.precio - a.precio);

        setProductos(fiestaProducts); // Cargar todos los productos referidos sin límite
      } catch (err) {
        console.error("Error loading products for fiesta:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = productos.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.nombre.toLowerCase().includes(q) || (p.categoria || "").toLowerCase().includes(q);
  });

  const hamburguesas = filteredProducts.filter(p => {
    const n = p.nombre.toLowerCase();
    return n.includes("hamburguesa") || n.includes("pancho") || n.includes("chorizo");
  });

  const picada = filteredProducts.filter(p => {
    const n = p.nombre.toLowerCase();
    const c = (p.categoria || "").toLowerCase();
    return n.includes("jamon") || n.includes("queso") || n.includes("fiambre") || n.includes("salame") || 
           n.includes("bondiola") || n.includes("aceituna") || n.includes("snack") || n.includes("papas") || 
           n.includes("mani") || c.includes("snack") || c.includes("fiambre") || c.includes("queso");
  });
  
  const descartables = filteredProducts.filter(p => {
    const n = p.nombre.toLowerCase();
    const c = (p.categoria || "").toLowerCase();
    return (n.includes("vaso") || n.includes("servilleta") || n.includes("descartable") || n.includes("plato") || n.includes("cubierto") || c.includes("descartable")) 
           && !picada.includes(p); // Evitar superposición si un vaso de algo dice snack
  });

  const bebidas = filteredProducts.filter(p => !hamburguesas.includes(p) && !descartables.includes(p) && !picada.includes(p));

  return (
    <div className="max-w-[1200px] mx-auto pt-10 pb-20 relative">
      <FiestaBgFX />
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-[#E53935] border-t-transparent rounded-full" />
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center text-white py-20 font-bebas text-2xl">
          Cargando productos exclusivos...
        </div>
      ) : (
        <>
          {/* Carrusel Top Ventas / Destacados */}
          {!searchQuery && (
            <div className="mb-8 overflow-hidden">
              <div className="flex items-center gap-2 mb-4 px-4 md:px-0">
                <span className="text-2xl">🔥</span>
                <h2 className="font-bebas text-3xl md:text-4xl tracking-[2px] text-transparent bg-clip-text bg-gradient-to-r from-[#FF512F] to-[#F09819]">
                  TOP VENTAS
                </h2>
              </div>
              <div className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-0 pb-6 scrollbar-none snap-x">
                {productos.slice(0, 6).map(p => (
                  <div key={p.codigo} className="w-[160px] md:w-[240px] flex-shrink-0 snap-start">
                    <PremiumProductCard producto={p} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <FiestaNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Buscador de Productos */}
          <div className="mb-10 px-4 md:px-0">
            <div className="relative max-w-xl mx-auto group">
              <input
                type="text"
                placeholder="Buscar hielo, vasos, fernet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-full py-3 md:py-4 px-12 md:px-14 text-white placeholder-white/50 focus:outline-none focus:border-[#00B0FF] focus:bg-black/60 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] font-body text-base md:text-lg"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5 md:w-6 md:h-6 group-focus-within:text-[#00B0FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Si no hay resultados de búsqueda */}
          {searchQuery && filteredProducts.length === 0 && (
            <div className="text-center text-white/70 py-20 font-body text-xl">
              No encontramos &quot;{searchQuery}&quot; para tu fiesta.
            </div>
          )}

          {/* Grillas con animación de fade-in */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sección Barra Libre (Bebidas) */}
            {(searchQuery ? bebidas.length > 0 : activeTab === 'bebidas') && (
              <div className="mb-20 pt-4 px-4 md:px-0">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-bebas text-4xl md:text-5xl tracking-[2px] text-transparent bg-clip-text bg-gradient-to-r from-[#00B0FF] to-white">
                    BARRA LIBRE
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {bebidas.map(p => (
                    <PremiumProductCard key={p.codigo} producto={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Sección Hamburguesas / Parrilla */}
            {(searchQuery ? hamburguesas.length > 0 : activeTab === 'parrilla') && (
              <div className="mb-20 pt-4 px-4 md:px-0">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-bebas text-4xl md:text-5xl tracking-[2px] text-transparent bg-clip-text bg-gradient-to-r from-[#E53935] to-white">
                    PARA LA PARRILLA
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {hamburguesas.map(p => (
                    <PremiumProductCard key={p.codigo} producto={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Sección Picada */}
            {(searchQuery ? picada.length > 0 : activeTab === 'picada') && (
              <div className="mb-20 pt-4 px-4 md:px-0">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-bebas text-4xl md:text-5xl tracking-[2px] text-transparent bg-clip-text bg-gradient-to-r from-[#FFCA28] to-white">
                    PICADA & SNACKS
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {picada.map(p => (
                    <PremiumProductCard key={p.codigo} producto={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Sección Descartables */}
            {(searchQuery ? descartables.length > 0 : activeTab === 'descartables') && (
              <div className="mb-20 pt-4 px-4 md:px-0">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-bebas text-4xl md:text-5xl tracking-[2px] text-transparent bg-clip-text bg-gradient-to-r from-[#9E9E9E] to-white">
                    DESCARTABLES
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {descartables.map(p => (
                    <PremiumProductCard key={p.codigo} producto={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Botón Flotante del Carrito Exclusivo y Panel (sólo client-side) */}
      {mounted && (
        <>
          <FiestaCartBtn onClick={() => setCartOpen(true)} totalQty={totalQty} total={total} />
          
          <CartPanel
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            items={items}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            total={total}
            onSendWA={() => {
              setCartOpen(false);
              window.location.href = "/catalogo?openCart=true";
            }}
            alias={""}
            onAliasChange={() => {}}
            onShare={() => {}}
            onClear={() => {}}
            shareLink={null}
            onCopyShareLink={() => {}}
            telefono={""}
            onTelefonoChange={() => {}}
            metodoEntrega={"envio"}
            onMetodoEntregaChange={() => {}}
            sucursalId={null}
            onSucursalChange={() => {}}
            isProcessing={false}
          />
        </>
      )}
    </div>
  );
}
