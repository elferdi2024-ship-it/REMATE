// filepath: src/app/api/admin/find-product-images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { findProductImages } from "@/lib/product-image-finder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorizedAdminRequest(req: NextRequest): boolean {
  const host = req.headers.get("host") || "";
  if (host.startsWith("localhost:") || host.startsWith("127.0.0.1:")) {
    return true;
  }
  const session = req.cookies.get("session")?.value;
  return Boolean(session && session.length > 20);
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const codigo = String(body?.codigo ?? "").trim();
    const nombre = String(body?.nombre ?? "").trim();
    const customQuery = typeof body?.customQuery === "string" ? body.customQuery.trim() : undefined;

    if (!nombre && !codigo && !customQuery) {
      return NextResponse.json(
        { error: "Se requiere nombre, código o término de búsqueda" },
        { status: 400 }
      );
    }

    const result = await findProductImages({ codigo, nombre, customQuery });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    console.error("[find-product-images] Error:", err);
    return NextResponse.json(
      { error: "Error buscando imágenes del producto" },
      { status: 500 }
    );
  }
}
