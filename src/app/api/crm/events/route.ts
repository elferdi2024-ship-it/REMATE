import { randomUUID } from "node:crypto";
import { sendCrmEvent } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = String(body?.event ?? "").trim();
  const data = body?.data;
  if (!event || !data || typeof data !== "object") {
    return Response.json({ error: "Missing event or data object" }, { status: 400 });
  }

  const eventId = String(body?.id ?? `evt_${Date.now()}_${randomUUID().slice(0, 8)}`);

  try {
    const result = await sendCrmEvent(event, data, eventId);
    return Response.json({ success: result.sent, result }, { status: 200 });
  } catch (err: any) {
    console.error("[crm-events] Error sending event to Hub:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
