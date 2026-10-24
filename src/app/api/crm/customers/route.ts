import { adminDbOrNull, authorizeCrm } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function customerKey(phone: string) {
  return phone.replace(/\D/g, "").slice(-15);
}

export async function GET(request: Request) {
  const denied = authorizeCrm(request);
  if (denied) return denied;
  const db = adminDbOrNull();
  if (!db) return Response.json({ error: "Firebase Admin credentials are not configured" }, { status: 503 });
  const params = new URL(request.url).searchParams;
  const search = (params.get("search") ?? "").trim().toLocaleLowerCase("es-UY");
  const segment = (params.get("segment") ?? "").trim();
  try {
    const snapshot = await db.collection("crm_customers").limit(500).get();
    const customers = snapshot.docs
      .map((doc) => ({ key: doc.id, ...doc.data() }))
      .filter((customer: any) => (!segment || customer.segment === segment) && (!search || `${customer.name ?? ""} ${customer.phone ?? ""}`.toLocaleLowerCase("es-UY").includes(search)));
    return Response.json({ total: customers.length, customers }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Customer list unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const denied = authorizeCrm(request);
  if (denied) return denied;
  const db = adminDbOrNull();
  if (!db) return Response.json({ error: "Firebase Admin credentials are not configured" }, { status: 503 });
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const name = String(body?.name ?? "").trim().slice(0, 160);
  const phone = String(body?.phone ?? "").trim().slice(0, 40);
  const key = customerKey(phone);
  if (!name || key.length < 8) return Response.json({ error: "A name and valid phone are required" }, { status: 422 });

  const customer = {
    name,
    phone,
    email: body.email ? String(body.email).slice(0, 254) : null,
    rut: body.rut ? String(body.rut).slice(0, 40) : null,
    address: body.address ? String(body.address).slice(0, 500) : null,
    segment: body.segment ? String(body.segment).slice(0, 80) : "mayorista",
    notes: body.notes ? String(body.notes).slice(0, 2000) : null,
    tags: Array.isArray(body.tags) ? body.tags.map((tag: unknown) => String(tag).slice(0, 40)).slice(0, 30) : [],
    updatedAt: new Date().toISOString(),
  };
  try {
    const ref = db.collection("crm_customers").doc(key);
    const previous = await ref.get();
    const data = { ...(previous.data() ?? {}), ...customer, createdAt: previous.data()?.createdAt ?? customer.updatedAt };
    await ref.set(data, { merge: true });
    return Response.json({ customer: { key, ...data } }, { status: previous.exists ? 200 : 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Customer could not be saved" }, { status: 503 });
  }
}
