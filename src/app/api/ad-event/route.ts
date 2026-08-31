// filepath: src/app/api/ad-event/route.ts
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;
const VALID_TYPES = new Set(["impression", "modal_open", "cta_click"]);

export async function POST(req: NextRequest) {
  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 4096) {
      return NextResponse.json({ ok: false, error: "Payload Too Large" }, { status: 413 });
    }

    const body = await req.json();
    const { brandId, assetId, type = "impression", slot, abVariant } = body;

    // Validación estricta de formato (evita NoSQL key injection)
    if (!brandId || typeof brandId !== "string" || !SAFE_ID_REGEX.test(brandId)) {
      return NextResponse.json({ ok: false, error: "Parámetros inválidos" }, { status: 400 });
    }

    if (!VALID_TYPES.has(type)) {
      return NextResponse.json({ ok: false, error: "Tipo de evento inválido" }, { status: 400 });
    }

    if (assetId && (typeof assetId !== "string" || !SAFE_ID_REGEX.test(assetId))) {
      return NextResponse.json({ ok: false, error: "Asset inválido" }, { status: 400 });
    }

    if (slot && (typeof slot !== "string" || !SAFE_ID_REGEX.test(slot))) {
      return NextResponse.json({ ok: false, error: "Slot inválido" }, { status: 400 });
    }

    if (abVariant && (typeof abVariant !== "string" || !SAFE_ID_REGEX.test(abVariant))) {
      return NextResponse.json({ ok: false, error: "Variant inválido" }, { status: 400 });
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ ok: false, skipped: true }, { status: 200 });
    }

    const month = new Date().toISOString().slice(0, 7);
    const updates: Record<string, unknown> = {
      lastSeen: new Date().toISOString(),
    };

    if (type === "impression") {
      updates.total = FieldValue.increment(1);
      updates[month] = FieldValue.increment(1);
      if (assetId) updates[`asset_${assetId}`] = FieldValue.increment(1);
      if (slot) {
        updates[`slot_${slot}`] = FieldValue.increment(1);
        updates[`slot_${slot}_${month}`] = FieldValue.increment(1);
      }
      if (abVariant) {
        updates[`ab_${abVariant}`] = FieldValue.increment(1);
      }
    } else if (type === "modal_open") {
      updates.modal_opens = FieldValue.increment(1);
      updates[`modal_${month}`] = FieldValue.increment(1);
    } else if (type === "cta_click") {
      updates.cta_clicks = FieldValue.increment(1);
    }

    await db.collection("ads_impressions").doc(brandId).set(updates, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[AD_EVENT_SECURITY]", err instanceof Error ? err.message : "Error procesando evento");
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
