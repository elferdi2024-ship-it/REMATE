// filepath: src/app/api/seed-master/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

export const runtime = "nodejs";

function timingSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  // 1. Bloqueo total en producción a menos que se habilite explícitamente
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEEDING !== "true") {
    return NextResponse.json(
      { error: "Endpoint no disponible en este entorno" },
      { status: 403 }
    );
  }

  try {
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get("secret");
    const providedSecret = bearerToken || querySecret;

    const expectedSecret = process.env.ADMIN_SEED_SECRET;

    // Fail-closed: Si la variable de entorno no está configurada o es débil, denegar acceso
    if (!expectedSecret || expectedSecret.length < 32) {
      console.error("[SECURITY] ADMIN_SEED_SECRET no configurada o longitud insuficiente (<32 caracteres).");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!providedSecret || !timingSafeEqual(providedSecret, expectedSecret)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "Servicio no disponible" },
        { status: 503 }
      );
    }

    // 2. Operación controlada de reseteo
    const colRef = db.collection("pedidos_globales");
    const snap = await colRef.limit(500).get();
    const batch = db.batch();
    snap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({
      ok: true,
      mensaje: `Base de datos reseteada con éxito. Documentos eliminados: ${snap.size}`,
    });
  } catch (err: unknown) {
    console.error("[SEED_MASTER_ERROR]", err instanceof Error ? err.message : "Error desconocido");
    return NextResponse.json(
      { error: "Error interno al procesar la solicitud" },
      { status: 500 }
    );
  }
}
