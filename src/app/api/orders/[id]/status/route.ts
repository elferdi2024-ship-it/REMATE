import { Timestamp } from "firebase-admin/firestore";
import { adminDbOrNull, authorizeCrm, localOrderStatus, spokeStatus } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED"]);

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const denied = authorizeCrm(request);
  if (denied) return denied;
  const db = adminDbOrNull();
  if (!db) return Response.json({ error: "Firebase Admin credentials are not configured" }, { status: 503 });
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const rawStatus = String(body?.status ?? "").trim().toUpperCase();
  if (!ALLOWED.has(rawStatus)) return Response.json({ error: "Unsupported status" }, { status: 422 });
  const status = spokeStatus(rawStatus);

  const ref = db.collection("pedidos_globales").doc(context.params.id);
  try {
    const snapshot = await ref.get();
    if (!snapshot.exists) return Response.json({ error: "Order not found" }, { status: 404 });
    const update = {
      crmStatus: status,
      status: localOrderStatus(status),
      updatedAt: Timestamp.now(),
      ...(body?.note ? { notas: String(body.note).slice(0, 2000) } : {}),
      ...(body?.cancelReason ? { cancelReason: String(body.cancelReason).slice(0, 500) } : {}),
    };
    await ref.update(update);
    const current = snapshot.data() ?? {};
    return Response.json({ order: {
      id: snapshot.id,
      publicCode: current.publicCode ?? current.crmPublicCode ?? snapshot.id,
      status,
      confirmedAt: status === "CONFIRMED" ? new Date().toISOString() : null,
      deliveredAt: ["DELIVERED", "COMPLETED"].includes(status) ? new Date().toISOString() : null,
      cancelledAt: status === "CANCELLED" ? new Date().toISOString() : null,
      cancelReason: body?.cancelReason ?? null,
    } }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Order status could not be updated" }, { status: 503 });
  }
}
