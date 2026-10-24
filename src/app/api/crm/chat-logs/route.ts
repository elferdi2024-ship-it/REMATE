import { authorizeCrm } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = authorizeCrm(request);
  if (denied) return denied;

  return Response.json(
    {
      sessions: [],
      total: 0,
      node: "ER-CANELONES",
      message: "Sesiones de chat gestionadas centralizadamente por Hub WAHA",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
