// filepath: src/app/admin/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { subscribePedidosHoy } from "@/lib/pedidos";
import Link from "next/link";
import { CATEGORIAS } from "@/types";

interface ProductRow {
  codigo: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen?: string;
}

interface TiendaConfig {
  pedidosAbiertos: boolean;
  bannerMensaje: string;
}

export default function AdminDashboardPage() {
  // Tienda Config
  const [config, setConfig] = useState<TiendaConfig>({
    pedidosAbiertos: true,
    bannerMensaje: "",
  });
  const [configSaving, setConfigSaving] = useState(false);

  // Catálogo de Productos para edición rápida
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

  // Estadísticas de Pedidos
  const [pedidosStats, setPedidosStats] = useState({
    totalCount: 0,
    noLeidos: 0,
    pendientes: 0,
    cargados: 0,
    totalVentas: 0,
  });

  // Categorías de la app para el selector
  const CATEGORIAS_DISPONIBLES = CATEGORIAS;

  // 1. Cargar Configuración de Tienda en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "config", "tienda"),
      (snap) => {
        if (snap.exists()) {
          setConfig(snap.data() as TiendaConfig);
        } else {
          // Inicializar si no existe
          setConfig({ pedidosAbiertos: true, bannerMensaje: "" });
        }
      },
      (err) => {
        console.error("Error al escuchar config/tienda en dashboard:", err);
      }
    );
    return () => unsub();
  }, []);

  // 2. Cargar Catálogo para búsqueda rápida
  useEffect(() => {
    async function loadCatalog() {
      try {
        const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
        if (snap.exists()) {
          const itemsMap = snap.data().items || {};
          const itemsArray = Object.values(itemsMap) as ProductRow[];
          setProducts(itemsArray);
        }
      } catch (err) {
        console.error("Error al cargar productos para buscador express:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadCatalog();
  }, []);

  // 3. Suscribirse a pedidos de hoy para estadísticas
  useEffect(() => {
    const unsub = subscribePedidosHoy((pedidosHoy) => {
      const stats = pedidosHoy.reduce(
        (acc, p) => {
          acc.totalCount++;
          if (p.status === "no_leido") acc.noLeidos++;
          else if (p.status === "pendiente") acc.pendientes++;
          else if (p.status === "cargado") acc.cargados++;

          acc.totalVentas += p.total || 0;
          return acc;
        },
        { totalCount: 0, noLeidos: 0, pendientes: 0, cargados: 0, totalVentas: 0 }
      );
      setPedidosStats(stats);
    });

    return () => unsub();
  }, []);

  // Filtrado de productos en memoria para velocidad extrema
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return products
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.codigo.includes(term)
      )
      .slice(0, 5); // Mostrar máximo 5 para mantener la UI limpia y ultra rápida
  }, [searchTerm, products]);

  // Guardar configuración de tienda
  const handleSaveConfig = async (updatedFields: Partial<TiendaConfig>) => {
    setConfigSaving(true);
    try {
      await updateDoc(doc(db, "config", "tienda"), updatedFields);
    } catch (err) {
      console.error("Error al guardar configuración de la tienda:", err);
    } finally {
      setConfigSaving(false);
    }
  };

  // Guardar cambios rápidos del producto
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    const precioNum = parseFloat(editPrice);
    if (isNaN(precioNum) || precioNum < 0) return;

    setSavingProduct(true);
    try {
      const productRef = doc(db, "catalogo_activo", "productos");
      await updateDoc(productRef, {
        [`items.${editingProduct.codigo}.precio`]: precioNum,
        [`items.${editingProduct.codigo}.categoria`]: editCategory,
      });

      // Actualizar estado local
      setProducts((prev) =>
        prev.map((p) =>
          p.codigo === editingProduct.codigo
            ? { ...p, precio: precioNum, categoria: editCategory }
            : p
        )
      );

      setEditingProduct(null);
      setSearchTerm("");
    } catch (err) {
      console.error("Error al actualizar producto:", err);
    } finally {
      setSavingProduct(false);
    }
  };

  function formatCurrency(value: number): string {
    return value.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    });
  }

  const ticketPromedio = useMemo(() => {
    if (pedidosStats.totalCount === 0) return 0;
    return Math.round(pedidosStats.totalVentas / pedidosStats.totalCount);
  }, [pedidosStats]);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 text-[var(--admin-text-mid)]">
      {/* Cabecera */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-bebas text-4xl tracking-wide text-[var(--admin-text-hi)] md:text-5xl">
            CENTRO DE <span className="text-[var(--admin-accent)]">CONTROL</span>
          </h1>
          <p className="text-[var(--admin-text-lo)] mt-1 font-medium">Operaciones, configuraciones de la web y stock express</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-4 py-2 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wider text-emerald-500 uppercase">Sistema en línea</span>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Switchboard (Col 1 y 2 en desktop) */}
        <div className="space-y-6 md:col-span-2">
          {/* Panel de Mandos - Swiss Switchboard */}
          <div className="relative overflow-hidden rounded-[32px] border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-bebas text-2xl tracking-wider text-[var(--admin-text-hi)]">LLAVE DE PASO DEL NEGOCIO</h2>
                <p className="text-xs text-[var(--admin-text-lo)]">Controles rápidos de la web de cara a clientes</p>
              </div>
              <span className="text-2xl">⚙️</span>
            </div>

            <div className="space-y-6">
              {/* Toggle de Recepción de Pedidos */}
              <div className="flex flex-col gap-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-[var(--admin-text-hi)] flex items-center gap-2">
                    🛒 Estado de Toma de Pedidos
                    {config.pedidosAbiertos ? (
                      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-500">ABIERTA</span>
                    ) : (
                      <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-black text-red-500">PAUSADA</span>
                    )}
                  </h3>
                  <p className="text-xs text-[var(--admin-text-lo)] mt-1 max-w-md leading-relaxed">
                    Si desactivas esta opción, los clientes no podrán finalizar pedidos en el carrito. Podrán ver el catálogo pero se les informará que el sistema está temporalmente inactivo.
                  </p>
                </div>
                <button
                  disabled={configSaving}
                  onClick={() => handleSaveConfig({ pedidosAbiertos: !config.pedidosAbiertos })}
                  className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                    config.pedidosAbiertos ? "bg-[var(--admin-accent)]" : "bg-[var(--admin-input-bg)] border-[var(--admin-border)]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-[var(--admin-sidebar-bg)] shadow-lg ring-0 transition duration-300 ease-in-out ${
                      config.pedidosAbiertos ? "translate-x-8" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Banner de Aviso Global */}
              <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-[var(--admin-text-hi)]">📢 Banner de Alerta en Catálogo</h3>
                  <p className="text-xs text-[var(--admin-text-lo)] mt-1">
                    Escribe un mensaje urgente que se mostrará en una barra superior en todo el catálogo de los clientes (deja vacío para ocultar).
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Descuentos del 10% abonando al contado hoy..."
                    value={config.bannerMensaje}
                    onChange={(e) => setConfig({ ...config, bannerMensaje: e.target.value })}
                    className="flex-1 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)] focus:border-[var(--admin-accent)]/50 focus:outline-none"
                  />
                  <button
                    disabled={configSaving}
                    onClick={() => handleSaveConfig({ bannerMensaje: config.bannerMensaje })}
                    className="rounded-xl bg-[var(--admin-accent)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--admin-sidebar-bg)] transition hover:opacity-90 disabled:opacity-50"
                  >
                    Establecer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Buscador de Producto Express - Swiss Knife Inventario */}
          <div className="relative overflow-hidden rounded-[32px] border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="font-bebas text-2xl tracking-wider text-[var(--admin-text-hi)]">MODIFICADOR EXPRESS DE STOCK & PRECIOS</h2>
              <p className="text-xs text-[var(--admin-text-lo)]">Busca cualquier producto del catálogo y cambia su precio o categoría al instante sin Excel</p>
            </div>

            {loadingProducts ? (
              <div className="flex items-center gap-3 text-sm text-[var(--admin-text-lo)] py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--admin-border)] border-t-[var(--admin-text-hi)]"></div>
                Cargando catálogo en caché...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por código o nombre del producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-4 py-3 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)] focus:border-[var(--admin-accent)]/50 focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-3.5 text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Resultados del Buscador */}
                {searchTerm.trim() && filteredProducts.length > 0 && (
                  <div className="divide-y divide-[var(--admin-border)] rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] overflow-hidden">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.codigo}
                        onClick={() => {
                           setEditingProduct(p);
                           setEditPrice(p.precio?.toString() || "0");
                           setEditCategory(p.categoria);
                        }}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--admin-bg)] transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-[var(--admin-text-hi)] text-sm">{p.nombre}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-[var(--admin-accent)]">{p.codigo}</span>
                            <span className="text-[10px] bg-[var(--admin-border)] px-2 py-0.5 rounded text-[var(--admin-text-mid)] uppercase">{p.categoria}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-[var(--admin-text-hi)] text-sm">{formatCurrency(p.precio)}</p>
                          <p className="text-[10px] text-[var(--admin-text-lo)] mt-0.5">Editar ✏️</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchTerm.trim() && filteredProducts.length === 0 && (
                  <p className="text-xs text-[var(--admin-text-lo)] text-center py-2">No se encontraron productos coincidentes.</p>
                )}

                {/* Formulario de Edición de Producto Inline */}
                {editingProduct && (
                  <div className="rounded-2xl border border-[var(--admin-accent)]/20 bg-[var(--admin-accent)]/5 p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-[var(--admin-text-hi)] text-sm">Editar Producto</h4>
                        <p className="text-xs text-[var(--admin-text-lo)] mt-0.5 truncate max-w-[200px] sm:max-w-md">{editingProduct.nombre}</p>
                      </div>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)]"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)] mb-1">Precio Unitario ($)</label>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-sm font-mono text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)]/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)] mb-1">Categoría</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-sm text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)]/50 focus:outline-none"
                        >
                          {CATEGORIAS_DISPONIBLES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="rounded-xl border border-[var(--admin-border)] bg-transparent px-4 py-2 text-xs font-semibold text-[var(--admin-text-lo)] hover:bg-[var(--admin-input-bg)]"
                      >
                        Cancelar
                      </button>
                      <button
                        disabled={savingProduct}
                        onClick={handleSaveProduct}
                        className="rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--admin-sidebar-bg)] transition hover:opacity-90 disabled:opacity-50"
                      >
                        {savingProduct ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas Rápidas e Indicadores (Col 3 en desktop) */}
        <div className="space-y-6">
          {/* Tarjeta de Ventas y Pedidos */}
          <div className="rounded-[32px] border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 space-y-6">
            <h2 className="font-bebas text-2xl tracking-wider text-[var(--admin-text-hi)]">PEDIDOS DE HOY</h2>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">Facturación Estimada</p>
                  <p className="font-bebas text-3xl text-[var(--admin-text-hi)] mt-1">{formatCurrency(pedidosStats.totalVentas)}</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">Pedidos Totales</p>
                  <p className="font-bebas text-3xl text-[var(--admin-text-hi)] mt-1">{pedidosStats.totalCount}</p>
                </div>
                <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">Ticket Promedio</p>
                  <p className="font-bebas text-3xl text-[var(--admin-text-hi)] mt-1">{formatCurrency(ticketPromedio)}</p>
                </div>
              </div>

              {/* Status de Pedidos */}
              <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)] mb-2">Desglose de Estados</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-red-500 font-semibold dark:text-red-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                    </span>
                    No Leídos
                  </span>
                  <span className="font-mono font-bold text-red-500 bg-red-500/10 dark:text-white dark:bg-red-500/20 px-2 py-0.5 rounded-md">{pedidosStats.noLeidos}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-yellow-600 font-semibold dark:text-yellow-400">
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    Pendientes
                  </span>
                  <span className="font-mono font-bold text-yellow-600 bg-yellow-500/10 dark:text-white dark:bg-yellow-500/20 px-2 py-0.5 rounded-md">{pedidosStats.pendientes}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-green-600 font-semibold dark:text-green-400">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Cargados
                  </span>
                  <span className="font-mono font-bold text-green-600 bg-green-500/10 dark:text-white dark:bg-green-500/20 px-2 py-0.5 rounded-md">{pedidosStats.cargados}</span>
                </div>
              </div>

              <Link
                href="/admin/pedidos"
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--admin-accent)]/10 hover:bg-[var(--admin-accent)]/20 border border-[var(--admin-accent)]/20 py-3 text-xs font-bold uppercase tracking-widest text-[var(--admin-accent)] transition-all"
              >
                📦 Ir a Pedidos de Hoy
              </Link>
            </div>
          </div>

          {/* Atajos Rápidos */}
          <div className="rounded-[32px] border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 space-y-4">
            <h3 className="font-bebas text-xl tracking-wider text-[var(--admin-text-hi)]">ATAJOS DEL SISTEMA</h3>
            <div className="grid gap-2">
              {[
                { href: "/admin/precios", label: "Actualizar Precios XLSX", icon: "📋" },
                { href: "/admin/productos", label: "Sincronizar Imágenes", icon: "🖼️" },
                { href: "/admin/publicidad", label: "Administrar Publicidad", icon: "📢" },
                { href: "/admin/ofertas", label: "Gestionar Ofertas", icon: "🔥" },
                { href: "/admin/stats", label: "Estadísticas del Negocio", icon: "📊" },
              ].map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-3 text-xs font-semibold text-[var(--admin-text-mid)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)] transition-colors"
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
