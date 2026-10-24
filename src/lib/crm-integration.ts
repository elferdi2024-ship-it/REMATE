import { createHmac, timingSafeEqual } from "node:crypto";
import { getAdminDb } from "@/lib/firebase-admin";

export function authorizeCrm(request: Request): Response | null {
  const expected = process.env.EL_REMATE_CRM_API_KEY?.trim();
  if (!expected) return Response.json({ error: "CRM integration is not configured" }, { status: 503 });
  const received = request.headers.get("x-crm-api-key") ?? "";
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function adminDbOrNull() {
  return getAdminDb();
}

export function crmTenant() {
  return {
    id: process.env.EL_REMATE_TENANT_ID?.trim() || "ER-CANELONES",
    slug: "el-remate-canelones",
    name: process.env.NEXT_PUBLIC_NEGOCIO_NOMBRE?.trim() || "El Remate Canelones",
  };
}

export function spokeStatus(status: unknown): string {
  const value = String(status ?? "PENDING").trim().toUpperCase();
  if (["PREPARING", "READY", "OUT_DELIVERY", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"].includes(value)) return value;
  return value === "CONFIRMED" ? "CONFIRMED" : "PENDING";
}

export function localOrderStatus(status: string): "no_leido" | "pendiente" | "cargado" {
  if (status === "PREPARING") return "pendiente";
  if (["READY", "OUT_DELIVERY", "SHIPPED", "DELIVERED", "COMPLETED"].includes(status)) return "cargado";
  return "no_leido";
}

export async function sendCrmEvent(event: string, data: Record<string, unknown>, id: string) {
  const db = adminDbOrNull();
  const saved = db ? (await db.collection("crm_private").doc("webhook_config").get()).data() : null;
  const target = String(saved?.webhookUrl ?? process.env.CRM_WEBHOOK_URL ?? "").trim();
  const secret = String(saved?.webhookSecret ?? process.env.CRM_WEBHOOK_SECRET ?? "").trim();
  if (saved?.enabled === false) return { sent: false, reason: "webhook_disabled" as const };
  if (Array.isArray(saved?.events) && !saved.events.includes(event)) return { sent: false, reason: "event_not_enabled" as const };
  if (!target || !secret) return { sent: false, reason: "webhook_not_configured" as const };

  const body = JSON.stringify({
    id,
    event,
    tenant: crmTenant(),
    timestamp: new Date().toISOString(),
    data,
  });
  const signature = createHmac("sha256", secret).update(body, "utf8").digest("hex");
  const response = await fetch(target, {
    method: "POST",
    headers: { "content-type": "application/json", "x-webhook-signature": `sha256=${signature}` },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  return { sent: response.ok, status: response.status };
}

export function publicOrderStatus(status: string) {
  const map: Record<string, string> = {
    no_leido: "PENDING",
    pendiente: "PREPARING",
    cargado: "READY",
    pending: "PENDING",
    confirmed: "CONFIRMED",
    preparing: "PREPARING",
    ready: "READY",
    out_for_delivery: "OUT_DELIVERY",
    delivered: "DELIVERED",
    cancelled: "CANCELLED",
  };
  return map[status.toLowerCase()] ?? "PENDING";
}

export function crmOrderPayload(order: Record<string, any>) {
  return {
    id: String(order.id),
    publicCode: String(order.publicCode ?? order.crmPublicCode ?? order.id),
    status: publicOrderStatus(String(order.crmStatus ?? order.status ?? "PENDING")),
    deliveryType: String(order.deliveryType ?? (String(order.clienteDireccion ?? "").includes("RETIRO") ? "PICKUP" : "DELIVERY")),
    customerName: String(order.clienteNombre ?? "Cliente"),
    customerPhone: String(order.clienteTelefono ?? ""),
    deliveryAddress: String(order.clienteDireccion ?? ""),
    customerNote: String(order.notas ?? ""),
    total: Number(order.total ?? 0),
    items: Array.isArray(order.items) ? order.items.map((item: any) => ({
      productId: String(item.codigo ?? ""), name: String(item.nombre ?? "Producto"),
      quantity: Number(item.cantidad ?? 0), unitPrice: Number(item.precioUnitario ?? 0), unit: "UNIT",
    })) : [],
  };
}
