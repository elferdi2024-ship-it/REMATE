"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import categoriaMapping from "@/lib/categoria_mapping.json";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { haptic } from "@/lib/haptic";
import { Producto } from "@/types";
import { flyToCart } from "@/lib/flyToCart";
import CartPanel from "@/components/carrito/CartPanel";

const catMap = (categoriaMapping as any).mapping || categoriaMapping;

type FiestaTab = "bebidas" | "parrilla" | "picada" | "extras";
type Accent = "blue" | "red" | "yellow" | "neutral";

const tabs: Array<{ id: FiestaTab; label: string; eyebrow: string; accent: Accent }> = [
  { id: "bebidas", label: "Barra", eyebrow: "Bebidas", accent: "blue" },
  { id: "parrilla", label: "Parrilla", eyebrow: "Fuego", accent: "red" },
  { id: "picada", label: "Picada", eyebrow: "Tabla", accent: "yellow" },
  { id: "extras", label: "Extras", eyebrow: "Final", accent: "neutral" },
];

const accentStyles: Record<
  Accent,
  {
    badge: string;
    glow: string;
    price: string;
    ring: string;
    button: string;
    title: string;
  }
> = {
  blue: {
    badge: "bg-[#d9c39a] text-[#17110b]",
    glow: "from-white/[0.07] to-transparent",
    price: "from-[#f2e3c5] to-[#d7a84f]",
    ring: "border-white/10",
    button: "bg-[#f3ead9] text-[#17110b] shadow-[0_12px_28px_rgba(0,0,0,0.20)]",
    title: "from-[#f2e3c5] to-[#d7a84f]",
  },
  red: {
    badge: "bg-[#d9c39a] text-[#17110b]",
    glow: "from-white/[0.07] to-transparent",
    price: "from-[#f2e3c5] to-[#c8845d]",
    ring: "border-white/10",
    button: "bg-[#f3ead9] text-[#17110b] shadow-[0_12px_28px_rgba(0,0,0,0.20)]",
    title: "from-[#f2e3c5] to-[#c8845d]",
  },
  yellow: {
    badge: "bg-[#d9c39a] text-[#17110b]",
    glow: "from-white/[0.07] to-transparent",
    price: "from-[#f2e3c5] to-[#d7a84f]",
    ring: "border-white/10",
    button: "bg-[#f3ead9] text-[#17110b] shadow-[0_12px_28px_rgba(0,0,0,0.20)]",
    title: "from-[#f2e3c5] to-[#d7a84f]",
  },
  neutral: {
    badge: "bg-[#d9c39a] text-[#17110b]",
    glow: "from-white/18 to-transparent",
    price: "from-[#f2e3c5] to-[#b9ad9a]",
    ring: "border-white/10",
    button: "bg-[#f3ead9] text-[#17110b] shadow-[0_12px_28px_rgba(0,0,0,0.20)]",
    title: "from-[#f2e3c5] to-[#b9ad9a]",
  },
};

const fiestaKeywords = [
  "hamburguesa",
  "cerveza",
  "whisky",
  "vodka",
  "fernet",
  "pancho",
  "chorizo",
  "hielo",
  "refresco",
  "coca",
  "pepsi",
  "sprite",
  "vino",
  "gin",
  "ron",
  "servilleta",
  "vaso",
  "descartable",
  "plato",
  "cubierto",
  "snack",
  "papas fritas",
  "mani",
  "maní",
  "chisitos",
  "doritos",
  "jamon",
  "jamón",
  "queso",
  "fiambre",
  "salame",
  "bondiola",
  "aceituna",
];

const INITIAL_VISIBLE_PRODUCTS = 8;
const VISIBLE_PRODUCTS_STEP = 8;
const SEARCH_VISIBLE_PER_SECTION = 4;

function normalize(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-UY", {
    maximumFractionDigits: 0,
  }).format(value);
}

function getProductAccent(producto: Producto): Accent {
  const text = `${normalize(producto.nombre)} ${normalize(producto.categoria)}`;
  if (text.includes("cerveza") || text.includes("whisky") || text.includes("vodka") || text.includes("fernet") || text.includes("vino") || text.includes("gin") || text.includes("ron")) {
    return "blue";
  }
  if (text.includes("hamburguesa") || text.includes("pancho") || text.includes("chorizo")) {
    return "red";
  }
  if (text.includes("snack") || text.includes("queso") || text.includes("papas") || text.includes("mani")) {
    return "yellow";
  }
  return "neutral";
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
      <path d="m21 21-4.35-4.35" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}

function PremiumProductCard({ producto }: { producto: Producto }) {
  const { items, addItem, removeItem } = useCart();
  const toast = useToast();
  const cartItem = items.find((item) => item.codigo === producto.codigo);
  const qty = cartItem ? cartItem.cantidad : 0;
  const accent = accentStyles[getProductAccent(producto)];

  const handleAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    haptic.add();
    addItem(producto);
    flyToCart(event, producto.imagen, "+");
    toast.success(`Agregado: ${producto.nombre}`);
  };

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    haptic.remove();
    removeItem(producto.codigo);
  };

  return (
    <article className={`group flex h-full min-h-[258px] flex-col overflow-hidden rounded-[1.2rem] border ${accent.ring} bg-[#14110f]/78 shadow-[0_14px_44px_rgba(0,0,0,0.22)] backdrop-blur transition-transform duration-200 active:scale-[0.99] md:min-h-[342px] md:rounded-[1.55rem] md:hover:-translate-y-0.5`}>
      <div className="relative h-32 overflow-hidden border-b border-white/[0.06] bg-white/[0.035] md:h-48">
        <div className={`absolute inset-0 bg-gradient-to-br ${accent.glow}`} />
        <div className="absolute left-2 top-2 z-10 rounded-full border border-white/10 bg-black/28 px-2.5 py-1 font-body text-[0.54rem] font-black uppercase tracking-[0.18em] text-white/58 backdrop-blur md:left-3 md:top-3">
          Mayorista
        </div>
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 25vw"
            className="object-contain p-4 drop-shadow-[0_14px_22px_rgba(0,0,0,0.30)] transition-transform duration-300 group-hover:scale-[1.03] md:p-6"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center font-serif text-2xl italic tracking-[-0.03em] text-white/35">
            El Remate
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 md:p-5">
        <p className="mb-2 truncate font-body text-[0.56rem] font-black uppercase tracking-[0.22em] text-white/38 md:text-[0.62rem]">
          {producto.marca || producto.categoria || "Fiesta"}
        </p>
        <h3 className="line-clamp-2 font-body text-[0.92rem] font-black uppercase leading-[1.18] tracking-[0.025em] text-white md:text-[1.05rem]">
          {producto.nombre}
        </h3>

        <div className="mt-auto pt-3 md:pt-4">
          <div className="mb-2.5 flex items-end justify-between gap-2 md:mb-3">
            <div>
              <p className="font-body text-[0.56rem] font-black uppercase tracking-[0.2em] text-white/38">Precio</p>
              <div className={`bg-gradient-to-r ${accent.price} bg-clip-text font-serif text-[1.85rem] leading-none tracking-[-0.07em] text-transparent md:text-[2.38rem]`}>
                ${formatPrice(producto.precio)}
              </div>
            </div>
            {producto.precioAnterior && producto.precioAnterior > producto.precio ? (
              <span className="mb-1 text-xs font-bold text-white/35 line-through">${formatPrice(producto.precioAnterior)}</span>
            ) : null}
          </div>

          {qty > 0 ? (
            <div className="grid min-h-12 grid-cols-[48px_1fr_48px] items-center rounded-2xl border border-white/10 bg-white/[0.075] p-1">
              <button
                onClick={handleRemove}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl font-black text-white transition-colors active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcf33]"
                aria-label={`Quitar ${producto.nombre}`}
              >
                -
              </button>
              <span className="text-center font-serif text-2xl leading-none text-white" aria-live="polite">
                {qty}
              </span>
              <button
                onClick={handleAdd}
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent.button} transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcf33]`}
                aria-label={`Agregar otra unidad de ${producto.nombre}`}
              >
                <PlusIcon />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl ${accent.button} font-body text-[0.72rem] font-black uppercase tracking-[0.18em] transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcf33] md:min-h-12`}
              aria-label={`Agregar ${producto.nombre} al pedido`}
            >
              Agregar
              <PlusIcon />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function FiestaBgFX() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      <div className="absolute left-[-18%] top-[18%] h-80 w-80 rounded-full bg-[#7b3a24]/10 blur-3xl" />
      <div className="absolute bottom-[14%] right-[-18%] h-96 w-96 rounded-full bg-[#d7a84f]/8 blur-3xl" />
    </div>
  );
}

function FiestaCartBtn({ totalQty, total, onClick }: { totalQty: number; total: number; onClick: () => void }) {
  if (totalQty <= 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom,0px)+16px)] z-[100] mx-auto flex min-h-16 max-w-[390px] items-center justify-between rounded-[1.25rem] border border-white/12 bg-[#f3ead9] px-4 text-[#17110b] shadow-[0_18px_50px_rgba(0,0,0,0.34)] transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a84f] md:bottom-6"
      aria-label="Abrir pedido de fiesta"
    >
      <span className="flex items-center gap-3 font-body text-sm font-black uppercase tracking-[0.18em]">
        Ver pedido
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-black/10 px-2 text-base font-black">{totalQty}</span>
      </span>
      <span className="rounded-full bg-black/10 px-3 py-1.5 font-serif text-2xl leading-none tracking-[-0.05em]">${formatPrice(total)}</span>
    </button>
  );
}

function FiestaNav({ activeTab, setActiveTab }: { activeTab: FiestaTab; setActiveTab: (tab: FiestaTab) => void }) {
  return (
    <div className="sticky top-[82px] z-40 mx-auto mb-5 mt-1 max-w-5xl px-4 md:top-[92px] md:mb-8">
      <div className="flex gap-2 overflow-x-auto rounded-[1.15rem] border border-white/10 bg-[#11100f]/88 p-1.5 shadow-[0_14px_44px_rgba(0,0,0,0.26)] backdrop-blur-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const accent = accentStyles[tab.accent];

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-14 min-w-[7.25rem] rounded-2xl px-4 text-left transition-[background-color,color,box-shadow,transform] duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a84f] ${
                isActive ? "bg-[#f3ead9] text-[#17110b]" : "bg-white/[0.035] text-white/84 hover:bg-white/[0.07]"
              }`}
              aria-pressed={isActive}
            >
              <span className={`block font-body text-[0.58rem] font-black uppercase tracking-[0.2em] ${isActive ? "opacity-75" : "text-white/42"}`}>
                {tab.eyebrow}
              </span>
              <span className="mt-1 block font-serif text-[1.45rem] leading-none tracking-[-0.04em]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  count,
  accent,
  visibleCount,
}: {
  title: string;
  count: number;
  accent: Accent;
  visibleCount?: number;
}) {
  const styles = accentStyles[accent];

  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="mb-2 font-body text-[0.68rem] font-black uppercase tracking-[0.28em] text-white/38">Selección para tu fiesta</p>
        <h2 className={`bg-gradient-to-r ${styles.title} bg-clip-text font-serif text-5xl leading-none tracking-[-0.08em] text-transparent md:text-6xl`}>
          {title}
        </h2>
      </div>
      <span className={`mb-1 shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${styles.badge}`}>
        {visibleCount && visibleCount < count ? `${visibleCount}/${count}` : count}
      </span>
    </div>
  );
}

function PremiumLimitNotice({
  hiddenCount,
  onShowMore,
}: {
  hiddenCount: number;
  onShowMore?: () => void;
}) {
  if (hiddenCount <= 0) return null;

  return (
    <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,207,51,0.12),transparent_48%),rgba(255,255,255,0.055)] p-4 text-center shadow-[0_18px_70px_rgba(0,0,0,0.24)] backdrop-blur md:p-5">
      <p className="mx-auto max-w-xl font-serif text-[1.05rem] leading-7 text-white/72">
        Te mostramos una selección premium para que la página no sea eterna. Hay {hiddenCount} producto{hiddenCount === 1 ? "" : "s"} más disponibles.
      </p>
      {onShowMore ? (
        <button
          onClick={onShowMore}
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 font-body text-xs font-black uppercase tracking-[0.2em] text-[#10090c] transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcf33]"
        >
          Mostrar más
        </button>
      ) : null}
    </div>
  );
}

function getGroups(products: Producto[]) {
  const parrilla = products.filter((product) => {
    const name = normalize(product.nombre);
    return name.includes("hamburguesa") || name.includes("pancho") || name.includes("chorizo");
  });

  const picada = products.filter((product) => {
    const name = normalize(product.nombre);
    const category = normalize(product.categoria);
    return (
      name.includes("jamon") ||
      name.includes("queso") ||
      name.includes("fiambre") ||
      name.includes("salame") ||
      name.includes("bondiola") ||
      name.includes("aceituna") ||
      name.includes("snack") ||
      name.includes("papas") ||
      name.includes("mani") ||
      category.includes("snack") ||
      category.includes("fiambre") ||
      category.includes("queso")
    );
  });

  const extras = products.filter((product) => {
    const name = normalize(product.nombre);
    const category = normalize(product.categoria);
    return (
      (name.includes("vaso") ||
        name.includes("servilleta") ||
        name.includes("descartable") ||
        name.includes("plato") ||
        name.includes("cubierto") ||
        category.includes("descartable")) &&
      !picada.includes(product)
    );
  });

  const bebidas = products.filter((product) => !parrilla.includes(product) && !picada.includes(product) && !extras.includes(product));

  return { bebidas, parrilla, picada, extras };
}

export default function FiestaClient() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FiestaTab>("bebidas");
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PRODUCTS);
  const { items, totalQty, total, updateQty, removeItem } = useCart();

  useEffect(() => {
    setMounted(true);

    async function loadProducts() {
      try {
        let data: Producto[] = [];
        let loadedFromBranch = false;
        const currentId = typeof window !== "undefined" ? localStorage.getItem("remate_sucursalId") : null;

        if (currentId) {
          try {
            const branchSnap = await getDoc(doc(db, "sucursales_catalogos", currentId));
            if (branchSnap.exists()) {
              const branchData = branchSnap.data();
              data = (Object.values(branchData.items || {}) as Producto[]).filter((item) => !item.deshabilitado);
              loadedFromBranch = true;
            }
          } catch (error) {
            console.error("Error cargando sucursal en Fiesta:", error);
          }
        }

        if (!loadedFromBranch) {
          const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
          if (snap.exists()) {
            const docData = snap.data();
            data = (Object.values(docData.items || {}) as Producto[]).filter((item) => !item.deshabilitado);
          } else {
            const response = await fetch("/productos.json");
            if (response.ok) {
              data = await response.json();
            }
          }
        }

        const normalizedData = data.map((product) => {
          const barcode = String(product.codigo || "").trim();
          return catMap[barcode] ? { ...product, categoria: catMap[barcode] } : product;
        });

        const fiestaProducts = normalizedData
          .filter((product) => {
            if (!product.precio || product.precio <= 0 || product.deshabilitado) return false;
            const searchable = `${normalize(product.nombre)} ${normalize(product.categoria)}`;
            return fiestaKeywords.some((keyword) => searchable.includes(normalize(keyword)));
          })
          .sort((a, b) => b.precio - a.precio);

        setProductos(fiestaProducts);
      } catch (error) {
        console.error("Error loading products for fiesta:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return productos;
    const query = normalize(searchQuery);
    return productos.filter((product) => `${normalize(product.nombre)} ${normalize(product.categoria)} ${normalize(product.marca)}`.includes(query));
  }, [productos, searchQuery]);

  const groups = useMemo(() => getGroups(filteredProducts), [filteredProducts]);
  const activeProducts = groups[activeTab];
  const visibleActiveProducts = activeProducts.slice(0, visibleCount);
  const activeMeta = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_PRODUCTS);
  }, [activeTab, searchQuery]);

  return (
    <div className="relative mx-auto max-w-6xl pb-28 pt-6 md:pb-24 md:pt-10">
      <FiestaBgFX />

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center px-4">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#ff3d5a] border-t-transparent" />
        </div>
      ) : productos.length === 0 ? (
        <div className="mx-4 rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-8 text-center">
          <h2 className="font-serif text-4xl tracking-[-0.06em]">Estamos preparando la góndola</h2>
          <p className="mt-2 text-white/65">No encontramos productos de fiesta disponibles en este momento.</p>
        </div>
      ) : (
        <>
          <div className="px-4">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-2.5 backdrop-blur md:p-4">
              <label htmlFor="fiesta-search" className="sr-only">
                Buscar productos para fiesta
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">
                  <SearchIcon />
                </span>
                <input
                  id="fiesta-search"
                  type="search"
                  name="fiesta-search"
                  inputMode="search"
                  autoComplete="off"
                  placeholder="Buscar fernet, hielo, vasos…"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="min-h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-12 font-body text-[0.95rem] font-extrabold tracking-[-0.02em] text-white outline-none transition-colors placeholder:text-white/34 focus:border-[#d7a84f] focus:bg-black/30 focus:ring-4 focus:ring-[#d7a84f]/10"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/10 text-lg font-black text-white/70 transition-colors active:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a84f]"
                    aria-label="Limpiar búsqueda"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <FiestaNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {searchQuery ? (
            <div className="px-4">
              <p className="mb-5 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-bold text-white/70">
                {filteredProducts.length} resultado{filteredProducts.length === 1 ? "" : "s"} para “{searchQuery}”
              </p>
            </div>
          ) : null}

          {searchQuery && filteredProducts.length === 0 ? (
            <div className="mx-4 rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-8 text-center">
              <h2 className="font-serif text-4xl tracking-[-0.06em]">Sin resultados</h2>
              <p className="mt-2 text-white/65">Probá con “hielo”, “vasos”, “fernet” o “hamburguesa”.</p>
            </div>
          ) : searchQuery ? (
            <div className="space-y-12 px-4">
              {tabs.map((tab) => {
                const sectionProducts = groups[tab.id];
                if (sectionProducts.length === 0) return null;
                const visibleSectionProducts = sectionProducts.slice(0, SEARCH_VISIBLE_PER_SECTION);
                const hiddenCount = sectionProducts.length - visibleSectionProducts.length;

                return (
                  <section key={tab.id}>
                    <SectionHeader
                      title={tab.label}
                      count={sectionProducts.length}
                      accent={tab.accent}
                      visibleCount={visibleSectionProducts.length}
                    />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-5">
                      {visibleSectionProducts.map((product) => (
                        <PremiumProductCard key={product.codigo} producto={product} />
                      ))}
                    </div>
                    <PremiumLimitNotice hiddenCount={hiddenCount} />
                  </section>
                );
              })}
            </div>
          ) : (
            <section className="px-4">
              <SectionHeader
                title={activeMeta.label}
                count={activeProducts.length}
                accent={activeMeta.accent}
                visibleCount={visibleActiveProducts.length}
              />
              {activeProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-5">
                    {visibleActiveProducts.map((product) => (
                      <PremiumProductCard key={product.codigo} producto={product} />
                    ))}
                  </div>
                  <PremiumLimitNotice
                    hiddenCount={activeProducts.length - visibleActiveProducts.length}
                    onShowMore={() => setVisibleCount((current) => current + VISIBLE_PRODUCTS_STEP)}
                  />
                </>
              ) : (
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-8 text-center text-white/65">
                  No hay productos cargados en esta categoría.
                </div>
              )}
            </section>
          )}
        </>
      )}

      {mounted ? (
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
            alias=""
            onAliasChange={() => {}}
            onShare={() => {}}
            onClear={() => {}}
            shareLink={null}
            onCopyShareLink={() => {}}
            telefono=""
            onTelefonoChange={() => {}}
            metodoEntrega="envio"
            onMetodoEntregaChange={() => {}}
            sucursalId={null}
            onSucursalChange={() => {}}
            isProcessing={false}
          />
        </>
      ) : null}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .side-panel .panel-close {
              min-width: 44px !important;
              min-height: 44px !important;
            }
          `,
        }}
      />
    </div>
  );
}
