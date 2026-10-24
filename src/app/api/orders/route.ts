import { createHash, randomUUID } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { adminDbOrNull, authorizeCrm, localOrderStatus, publicOrderStatus, spokeStatus } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = authorizeCrm(request);
  if (denied) return denied;

  const db = adminDbOrNull();
  if (!db) return Response.json({ error: "Firebase Admin is not configured" }, { status: 503 });

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? 50);
  const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 50, 1), 200);

  try {
    const snap = await db.collection("pedidos_globales").orderBy("fecha", "desc").limit(limit).get();
    const orders = snap.docs.map((doc) => {
      const data = doc.data() ?? {};
      return {
        id: doc.id,
        publicCode: data.publicCode ?? data.crmPublicCode ?? doc.id,
        status: publicOrderStatus(String(data.crmStatus ?? data.status ?? "PENDING")),
        customerName: data.clienteNombre ?? "Cliente",
        customerPhone: data.clienteTelefono ?? "",
        deliveryAddress: data.clienteDireccion ?? "",
        deliveryType: data.deliveryType ?? (String(data.clienteDireccion ?? "").includes("RETIRO") ? "PICKUP" : "DELIVERY"),
        total: Number(data.total ?? 0),
        itemsCount: Array.isArray(data.items) ? data.items.length : 0,
        createdAt: data.fecha instanceof Timestamp ? data.fecha.toDate().toISOString() : new Date().toISOString(),
      };
    });
    return Response.json({ orders, total: orders.length }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return Response.json({ error: err.message || "Failed to list orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = authorizeCrm(request);
  if (denied) return denied;
  const db = adminDbOrNull();
  if (!db) return Response.json({ error: "Firebase Admin credentials are not configured" }, { status: 503 });

  let input: any;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!Array.isArray(input?.items) || input.items.length < 1 || input.items.length > 100) {
    return Response.json({ error: "items must contain between 1 and 100 entries" }, { status: 400 });
  }
  const items = input.items.map((item: any) => ({
    codigo: String(item.productId ?? item.sku ?? "").slice(0, 128),
    nombre: String(item.name ?? "Producto").slice(0, 240),
    cantidad: Number(item.quantity),
    precioUnitario: Number(item.unitPrice),
  }));
  if (items.some((item: any) => !Number.isFinite(item.cantidad) || item.cantidad <= 0 || !Number.isFinite(item.precioUnitario) || item.precioUnitario < 0)) {
    return Response.json({ error: "Invalid item quantity or unit price" }, { status: 400 });
  }
  const total = items.reduce((sum: number, item: any) => sum + item.cantidad * item.precioUnitario, 0);
  const externalId = String(input.externalCrmOrderId ?? "").trim();
  const firestoreId = externalId
    ? `crm-${createHash("sha256").update(externalId).digest("hex").slice(0, 40)}`
    : `crm-${randomUUID()}`;
  const ref = db.collection("pedidos_globales").doc(firestoreId);
  const now = Timestamp.now();
  const status = spokeStatus(input.status);
  const publicCode = `CN-${createHash("sha256").update(firestoreId).digest("hex").slice(0, 8).toUpperCase()}`;
  const order = {
    uid: null,
    clienteNombre: String(input.customerName ?? "Cliente CRM").slice(0, 160),
    clienteTelefono: String(input.customerPhone ?? "").slice(0, 40),
    clienteDireccion: String(input.deliveryAddress ?? (input.deliveryType === "PICKUP" ? "RETIRO EN LOCAL" : "")).slice(0, 500),
    items,
    total,
    notas: String(input.customerNote ?? input.internalNote ?? "").slice(0, 2000),
    status: localOrderStatus(status),
    crmStatus: status,
    publicCode,
    externalCrmOrderId: externalId || null,
    canal: "crm",
    deliveryType: input.deliveryType === "PICKUP" ? "PICKUP" : "DELIVERY",
    fecha: now,
    updatedAt: now,
  };

  try {
    let idempotent = false;
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);
      if (existing.exists) { idempotent = true; return; }
      transaction.create(ref, order);
    });
    const saved = idempotent ? (await ref.get()).data() : order;
    return Response.json({
      order: { id: firestoreId, publicCode: saved?.publicCode ?? publicCode, status: saved?.crmStatus ?? status },
      idempotent,
    }, { status: idempotent ? 200 : 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Order could not be saved" }, { status: 503 });
  }
}
