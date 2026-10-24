import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { authorizeCrm } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = authorizeCrm(request);
  if (denied) return denied;

  try {
    const raw = await readFile(join(process.cwd(), "public", "productos.json"), "utf8");
    const list = JSON.parse(raw);
    const products = Array.isArray(list)
      ? list.map((p: any) => ({
          sku: String(p.codigo ?? p.sku ?? ""),
          codigo: String(p.codigo ?? p.sku ?? ""),
          name: String(p.nombre ?? "Producto"),
          nombre: String(p.nombre ?? "Producto"),
          category: String(p.categoria ?? "GENERAL"),
          categoria: String(p.categoria ?? "GENERAL"),
          price: Number(p.precio ?? 0),
          precio: Number(p.precio ?? 0),
          currency: "UYU",
          active: true,
          unit: "UNIT",
        }))
      : [];

    return Response.json(
      { products, total: products.length, currency: "UYU" },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return Response.json({ error: "Catalog unavailable" }, { status: 503 });
  }
}
