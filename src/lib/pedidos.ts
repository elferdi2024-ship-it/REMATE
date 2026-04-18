import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  Timestamp,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Types ───────────────────────────────────────────────────────────────

export interface PedidoItem {
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PedidoGlobal {
  uid: string | null;
  clienteNombre: string;
  clienteTelefono?: string;
  items: PedidoItem[];
  total: number;
  notas?: string;
  status: "no_leido" | "pendiente" | "cargado";
}

export interface PedidoUsuario {
  items: PedidoItem[];
  total: number;
  notas?: string;
  mensajeWA: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function pedidosFromSnapshots(
  snapshot: QuerySnapshot<DocumentData>
): Array<DocumentData & { id: string }> {
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// ── Pedido Global (admin-visible) ──────────────────────────────────────

/**
 * Save an order to /pedidos_globales (visible to admin).
 * Anyone can create; only admin can read.
 */
export async function guardarPedidoGlobal(
  pedido: PedidoGlobal
): Promise<string> {
  const ref = collection(db, "pedidos_globales");
  const docRef = await addDoc(ref, {
    uid: pedido.uid ?? null,
    clienteNombre: pedido.clienteNombre,
    clienteTelefono: pedido.clienteTelefono ?? "",
    items: pedido.items,
    total: pedido.total,
    notas: pedido.notas ?? "",
    status: pedido.status || "no_leido",
    fecha: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Update the status of an order.
 */
export async function actualizarEstadoPedido(
  id: string,
  status: "no_leido" | "pendiente" | "cargado"
): Promise<void> {
  const ref = doc(db, "pedidos_globales", id);
  await updateDoc(ref, { status });
}

/**
 * Delete an order from /pedidos_globales.
 */
export async function eliminarPedido(id: string): Promise<void> {
  const ref = doc(db, "pedidos_globales", id);
  await deleteDoc(ref);
}

// ── Pedido Usuario (private, per-user) ─────────────────────────────────

/**
 * Save an order to /usuarios/{uid}/pedidos.
 */
export async function guardarPedidoUsuario(
  uid: string,
  pedido: PedidoUsuario
): Promise<string> {
  const ref = collection(db, "usuarios", uid, "pedidos");
  const docRef = await addDoc(ref, {
    items: pedido.items,
    total: pedido.total,
    notas: pedido.notas ?? "",
    mensajeWA: pedido.mensajeWA,
    fecha: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Get all orders for a user, ordered by date desc, limited to 50.
 */
export async function getPedidosUsuario(uid: string): Promise<any[]> {
  const ref = collection(db, "usuarios", uid, "pedidos");
  const q = query(ref, orderBy("fecha", "desc"), limit(50));
  const snap = await getDocs(q);
  return pedidosFromSnapshots(snap);
}

// ── Admin helpers ──────────────────────────────────────────────────────

/**
 * Get today's orders from /pedidos_globales.
 */
export async function getPedidosHoy(): Promise<any[]> {
  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);
  const ref = collection(db, "pedidos_globales");
  const q = query(
    ref,
    where("fecha", ">=", Timestamp.fromDate(hoyInicio)),
    orderBy("fecha", "desc")
  );
  const snap = await getDocs(q);
  return pedidosFromSnapshots(snap);
}

/**
 * Subscribe to today's orders in real time.
 * Returns an unsubscribe function.
 */
export function subscribePedidosHoy(
  callback: (pedidos: any[]) => void
): () => void {
  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);
  const ref = collection(db, "pedidos_globales");
  const q = query(
    ref,
    where("fecha", ">=", Timestamp.fromDate(hoyInicio)),
    orderBy("fecha", "desc")
  );

  return onSnapshot(q, (snap) => {
    callback(pedidosFromSnapshots(snap));
  });
}

// ── Stats ──────────────────────────────────────────────────────────────

/**
 * Increment counters for each product codigo in /stats/productos.
 */
export async function incrementarStats(codigos: string[]): Promise<void> {
  const ref = doc(db, "stats", "productos");
  // Build an update map: { "7730124002903": increment(1), ... }
  const updates: Record<string, ReturnType<typeof increment>> = {};
  for (const codigo of codigos) {
    updates[codigo] = increment(1);
  }
  if (Object.keys(updates).length > 0) {
    await updateDoc(ref, updates);
  }
}
