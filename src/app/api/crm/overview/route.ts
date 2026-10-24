import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Timestamp } from "firebase-admin/firestore";
import { adminDbOrNull, authorizeCrm, crmTenant, publicOrderStatus } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = authorizeCrm(request);
  if (denied) return denied;
  const db = adminDbOrNull();
  if (!db) return Response.json({ error: "Firebase Admin credentials are not configured" }, { status: 503 });

  try {
    const [ordersSnap, productsRaw] = await Promise.all([
      db.collection("pedidos_globales").orderBy("fecha", "desc").limit(500).get(),
      readFile(join(process.cwd(), "public", "productos.json"), "utf8"),
    ]);
    const products: unknown = JSON.parse(productsRaw);
    const orders = ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const recentOrders = orders.slice(0, 20).map((order: any) => ({
      id: order.id,
      publicCode: order.publicCode ?? order.crmPublicCode ?? order.id,
      customerName: order.clienteNombre ?? "Cliente",
      customerPhone: order.clienteTelefono ?? "",
      status: publicOrderStatus(String(order.crmStatus ?? order.status ?? "PENDING")),
      paymentStatus: order.paymentStatus ?? "UNPAID",
      channel: order.canal ?? "web",
      deliveryMethod: String(order.clienteDireccion ?? "").includes("RETIRO") ? "PICKUP" : "DELIVERY",
      total: Number(order.total ?? 0),
      createdAt: order.fecha instanceof Timestamp ? order.fecha.toDate().toISOString() : new Date().toISOString(),
    }));
    const sum = orders.reduce((total: number, order: any) => total + Number(order.total ?? 0), 0);
    const counts = orders.reduce((acc: Record<string, number>, order: any) => {
      const status = publicOrderStatus(String(order.crmStatus ?? order.status ?? "PENDING"));
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    }, {});

    return Response.json({
      tenant: { ...crmTenant(), status: "active", timezone: "America/Montevideo", currency: "UYU" },
      kpis: {
        totalRevenue: sum,
        paidRevenue: orders.filter((o: any) => ["DELIVERED", "COMPLETED"].includes(publicOrderStatus(String(o.crmStatus ?? o.status)))).reduce((n: number, o: any) => n + Number(o.total ?? 0), 0),
        totalOrders: orders.length,
        pendingOrders: (counts.PENDING ?? 0) + (counts.CONFIRMED ?? 0),
        preparingOrders: (counts.PREPARING ?? 0) + (counts.READY ?? 0),
        completedOrders: (counts.DELIVERED ?? 0) + (counts.COMPLETED ?? 0),
        cancelledOrders: counts.CANCELLED ?? 0,
        totalProducts: Array.isArray(products) ? products.length : 0,
        lowStockCount: 0,
        totalCustomers: new Set(orders.map((o: any) => String(o.clienteTelefono ?? "")).filter(Boolean)).size,
      },
      recentOrders,
      lowStockAlerts: [],
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "CRM overview unavailable" }, { status: 503 });
  }
}
