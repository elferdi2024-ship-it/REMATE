// filepath: src/app/api/ad-event/route.ts
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandId, assetId, type = "impression", slot, abVariant } = body;

    if (!brandId || typeof brandId !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const db = getAdminDb();
    if (!db) {
      // Keep UX working even without server credentials.
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
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
