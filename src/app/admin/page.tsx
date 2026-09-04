// filepath: src/app/admin/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from "firebase/firestore";
import { subscribePedidosHoy } from "@/lib/pedidos";
import { CATEGORIAS } from "@/types";
import {
  DashboardHeader,
  BusinessSwitchboard,
  ExpressProductModifier,
  DailyMetricsCard,
  QuickShortcuts,
  type ProductRow,
  type TiendaConfig,
} from "@/components/dashboard";

export default function AdminDashboardPage() {
  // Tienda Config
  const [config, setConfig] = useState<TiendaConfig>({
    pedidosAbiertos: true,
    bannerMensaje: "",
    minimoEnvioGratis: 2500,
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
          setConfig({ pedidosAbiertos: true, bannerMensaje: "", minimoEnvioGratis: 2500 });
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
      await setDoc(doc(db, "config", "tienda"), updatedFields, { merge: true });
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
      {/* Cabecera Editorial & Real-Time Status */}
      <DashboardHeader
        totalPedidosHoy={pedidosStats.totalCount}
        pedidosAbiertos={config.pedidosAbiertos}
      />

      {/* Grid Principal Asimétrico (Swiss Grid) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna 1 y 2: Switchboard Operativo & Modificador Express */}
        <div className="space-y-6 lg:col-span-2">
          <BusinessSwitchboard
            config={config}
            configSaving={configSaving}
            onSaveConfig={handleSaveConfig}
          />

          <ExpressProductModifier
            loadingProducts={loadingProducts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredProducts={filteredProducts}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            editPrice={editPrice}
            setEditPrice={setEditPrice}
            editCategory={editCategory}
            setEditCategory={setEditCategory}
            savingProduct={savingProduct}
            onSaveProduct={handleSaveProduct}
            categoriasDisponibles={CATEGORIAS_DISPONIBLES}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Columna 3: Métricas de Hoy & Atajos del Sistema */}
        <div className="space-y-6">
          <DailyMetricsCard
            pedidosStats={pedidosStats}
            ticketPromedio={ticketPromedio}
            formatCurrency={formatCurrency}
          />

          <QuickShortcuts />
        </div>
      </div>
    </div>
  );
}
