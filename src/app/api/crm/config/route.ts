import { adminDbOrNull, authorizeCrm } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const denied = authorizeCrm(request);
  if (denied) return denied;
  const db = adminDbOrNull();
  if (!db) return Response.json({ error: "Firebase Admin credentials are not configured" }, { status: 503 });
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  let webhookUrl: URL;
  try { webhookUrl = new URL(String(body?.webhookUrl ?? "")); } catch { return Response.json({ error: "A valid webhookUrl is required" }, { status: 422 }); }
  if (!["http:", "https:"].includes(webhookUrl.protocol) || (webhookUrl.protocol === "http:" && !["localhost", "127.0.0.1"].includes(webhookUrl.hostname))) {
    return Response.json({ error: "Webhook URL must use HTTPS (HTTP is allowed only for localhost)" }, { status: 422 });
  }
  const secret = String(body?.webhookSecret ?? "").trim();
  if (secret && secret.length < 32) return Response.json({ error: "Webhook secret must contain at least 32 characters" }, { status: 422 });
  const config = {
    webhookUrl: webhookUrl.toString(),
    webhookSecret: secret || null,
    events: Array.isArray(body.events) ? body.events.map((value: unknown) => String(value)).filter((value: string) => ["order.created", "order.status_changed", "customer.upserted"].includes(value)) : ["order.created", "order.status_changed", "customer.upserted"],
    enabled: body.enabled !== false,
    updatedAt: new Date().toISOString(),
  };
  try {
    await db.collection("crm_private").doc("webhook_config").set(config, { merge: true });
    return Response.json({ configured: true, enabled: config.enabled, webhookUrl: config.webhookUrl, events: config.events }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Webhook configuration could not be saved" }, { status: 503 });
  }
}
