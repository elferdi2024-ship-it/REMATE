// filepath: src/app/api/chat/handoff/route.ts
import { sendCrmEvent, adminDbOrNull } from "@/lib/crm-integration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();
    const sessionId = String(body.sessionId || `web_${Date.now()}`);
    const cartItems = Array.isArray(body.cartItems) ? body.cartItems : [];
    const totalApprox = Number(body.totalApprox || 0);

    if (!name || !phone) {
      return Response.json({ error: "Nombre y teléfono requeridos" }, { status: 400 });
    }

    // 1. Guardar en Firestore si está disponible
    const db = adminDbOrNull();
    if (db) {
      try {
        await db.collection("chat_leads").add({
          name,
          phone,
          message,
          sessionId,
          cartItems,
          totalApprox,
          createdAt: new Date(),
          status: "PENDING_CONTACT",
          tenant: "ER-CANELONES",
        });
      } catch (err) {
        console.warn("Error guardando lead en Firestore:", err);
      }
    }

    // 2. Disparar evento M2M firmado hacia el CRM Hub
    const crmResult = await sendCrmEvent(
      "lead.created",
      {
        name,
        phone,
        message,
        sessionId,
        cartItemsCount: cartItems.length,
        totalApprox,
        source: "WEBCHAT_HANDOFF",
      },
      `lead_${Date.now()}_${sessionId.slice(-6)}`
    ).catch(() => ({ sent: false }));

    const reply = `¡Muchas gracias **${name}**! Ya registramos tu consulta y tus datos de contacto (${phone}). Un asesor comercial de El Remate Canelones se comunicará a la brevedad.`;

    return Response.json({
      success: true,
      reply,
      crmNotified: crmResult.sent,
    });
  } catch (err: any) {
    console.error("Error en handoff:", err);
    return Response.json(
      {
        reply: "Recibimos tu solicitud. Podés continuar la conversación directamente por WhatsApp para atención inmediata.",
      },
      { status: 200 }
    );
  }
}
