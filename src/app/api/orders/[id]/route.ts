import { adminDbOrNull, authorizeCrm, publicOrderStatus } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const denied = authorizeCrm(request);
  if (denied) return denied;

  const db = adminDbOrNull();
  if (!db) return Response.json({ error: "Firebase Admin is not configured" }, { status: 503 });

  try {
    const doc = await db.collection("pedidos_globales").doc(params.id).get();
    if (!doc.exists) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    const data = doc.data() ?? {};
    const order = {
      id: doc.id,
      publicCode: data.publicCode ?? data.crmPublicCode ?? doc.id,
      status: publicOrderStatus(String(data.crmStatus ?? data.status ?? "PENDING")),
      customerName: data.clienteNombre ?? "Cliente",
      customerPhone: data.clienteTelefono ?? "",
      deliveryAddress: data.clienteDireccion ?? "",
      customerNote: data.notas ?? "",
      deliveryType: data.deliveryType ?? (String(data.clienteDireccion ?? "").includes("RETIRO") ? "PICKUP" : "DELIVERY"),
      total: Number(data.total ?? 0),
      items: Array.isArray(data.items) ? data.items : [],
      createdAt: data.fecha?.toDate ? data.fecha.toDate().toISOString() : new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
    };
    return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return Response.json({ error: err.message || "Failed to fetch order" }, { status: 500 });
  }
}
