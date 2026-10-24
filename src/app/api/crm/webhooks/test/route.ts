import { randomUUID } from "node:crypto";
import { authorizeCrm, sendCrmEvent } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = authorizeCrm(request);
  if (denied) return denied;
  try {
    const result = await sendCrmEvent("webhook.test", { message: "El Remate Canelones CRM webhook test" }, `test-${randomUUID()}`);
    return Response.json(result, { status: result.sent ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ sent: false, error: "Webhook test failed" }, { status: 502 });
  }
}
