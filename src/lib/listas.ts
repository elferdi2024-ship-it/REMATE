import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Types ───────────────────────────────────────────────────────────────

export interface ListaItem {
  codigo: string;
  nombre: string;
  cantidad: number;
}

export interface ListaCreate {
  nombre: string;
  items: ListaItem[];
}

// ── Helpers ─────────────────────────────────────────────────────────────

function listasFromSnapshots(
  snapshot: QuerySnapshot<DocumentData>
): Array<DocumentData & { id: string }> {
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// ── CRUD ────────────────────────────────────────────────────────────────

/**
 * Create a new list for a user.
 */
export async function crearLista(
  uid: string,
  lista: ListaCreate
): Promise<string> {
  const ref = collection(db, "usuarios", uid, "listas");
  const docRef = await addDoc(ref, {
    nombre: lista.nombre,
    items: lista.items,
    actualizadaEn: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Get all lists for a user, ordered by actualizadaEn desc.
 */
export async function getListas(uid: string): Promise<any[]> {
  const ref = collection(db, "usuarios", uid, "listas");
  const q = query(ref, orderBy("actualizadaEn", "desc"));
  const snap = await getDocs(q);
  return listasFromSnapshots(snap);
}

/**
 * Get a single list by ID.
 */
export async function getLista(
  uid: string,
  listaId: string
): Promise<any | null> {
  const ref = doc(db, "usuarios", uid, "listas", listaId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Update a list.
 */
export async function actualizarLista(
  uid: string,
  listaId: string,
  data: { nombre?: string; items?: ListaItem[] }
): Promise<void> {
  const ref = doc(db, "usuarios", uid, "listas", listaId);
  await updateDoc(ref, {
    ...data,
    actualizadaEn: Timestamp.now(),
  });
}

/**
 * Delete a list.
 */
export async function eliminarLista(
  uid: string,
  listaId: string
): Promise<void> {
  const ref = doc(db, "usuarios", uid, "listas", listaId);
  await deleteDoc(ref);
}
