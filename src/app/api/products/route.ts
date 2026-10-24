import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { authorizeCrm } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = authorizeCrm(request);
  if (denied) return denied;

  const limitParam = Number(new URL(request.url).searchParams.get("limit") ?? 5000);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.trunc(limitParam), 1), 5000) : 5000;
  try {
    const raw = await readFile(join(process.cwd(), "public", "productos.json"), "utf8");
    const data: unknown = JSON.parse(raw);
    const products = Array.isArray(data) ? data.slice(0, limit) : [];
    return Response.json({ products, total: products.length, currency: "UYU" }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return Response.json({ error: "Catalog unavailable" }, { status: 503 });
  }
}
