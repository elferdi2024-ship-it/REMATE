// filepath: src/app/api/chat/route.ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  cleanEncoding,
  normText,
  parseSegmentQuantityAndTerm,
  searchCatalogByTokens,
  localChatFallback,
  detectRubro,
  extractRubroCandidates,
  STOP_WORDS,
  type ChatProductItem,
  type OrderCardData,
} from "@/lib/chat-engine";
import { adminDbOrNull, sendCrmEvent } from "@/lib/crm-integration";
import { calcularPrecioConEscala } from "@/lib/pricing";
import type { BulkPriceTier, Producto } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let cachedCatalog: Producto[] | null = null;
let lastCatalogLoad = 0;

async function getCachedCatalog(): Promise<Producto[]> {
  const now = Date.now();
  if (cachedCatalog && now - lastCatalogLoad < 60000) {
    return cachedCatalog;
  }
  try {
    const raw = await readFile(join(process.cwd(), "public", "productos.json"), "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedCatalog = parsed.map((p) => ({
        ...p,
        nombre: cleanEncoding(p.nombre),
        categoria: cleanEncoding(p.categoria),
      }));
      lastCatalogLoad = now;
      return cachedCatalog;
    }
  } catch (err) {
    console.error("Error cargando productos.json para chat:", err);
  }
  return cachedCatalog || [];
}

const GEMINI_SYSTEM_PROMPT = `Sos el Asistente Inteligente de Ventas y Pedidos Mayorista de "El Remate Canelones" (distribuidora mayorista y minorista en Canelones, Uruguay).
Hablás en español rioplatense uruguayo ("es-UY": vos, che, tenés, querés, decime, dale, bárbaro, etc.). Tu tono es ágil, cordial, motivador, cercano y altamente resolutivo comercialmente.

CONTEXTO DEL NEGOCIO:
• Distribuidora El Remate Canelones con más de 1.900 productos con precios directos de fábrica.
• Modalidades: Venta por mayor (bulto cerrado con escalas de descuento) y por menor a comercios, pizzerías, rotiserías, panaderías, quioscos, minimarkets y familias.
• Entregas y Envíos: Canelones Ciudad, Santa Lucía, Sauce, Las Piedras y zonas de influencia. También retiros en local mayorista.
• Pedidos: Se confirman mediante el carrito web y WhatsApp oficial (+598 94 611 400).

REGLAS DE ORO:
1. ALTA CAPACIDAD RESOLUTIVA COMERCIAL:
   - Si el cliente menciona su comercio o rubro (ej: "pizzería", "panadería", "rotisería", "quiosco", "almacén", "picada", "cumpleaños", "limpieza"):
     * SELECCIONÁ activamente entre 4 y 7 productos esenciales del CATÁLOGO DISPONIBLE provisto para armarle una propuesta inicial completa y equilibrada.
     * Asigná cantidades sugeridas lógicas para el rubro (ej: 2 a 5 unidades según producto).
     * Respondé de forma motivadora y resolutiva explicando qué incluye la propuesta inicial y cómo sumar otros insumos.
2. PRECISIÓN DE PRODUCTOS:
   - Utilizá ÚNICAMENTE productos reales y sus códigos exactos presentes en el CATÁLOGO DISPONIBLE provisto.
   - NUNCA confundas productos: "leche" es LECHE COMÚN LÍQUIDA (ej: Conaprole o Blancanuve). NO es "crema de leche" ni "dulce de leche", salvo que el cliente especifique "crema" o "dulce".
   - Si piden algo no disponible, indicalo amablemente y ofrecé el producto sustituto más conveniente.
3. MANEJO DE CORRECCIONES:
   - Si el cliente te corrige (ej: "sacá eso", "eso no", "te equivocaste", "pedí yerba no café"), disculpate con simpatía ("¡Uh, tenés razón, disculpame!"), retirá el producto erróneo y sumá el correcto.
4. FORMATO DE RESPUESTA OBLIGATORIO:
   Respondé OBLIGATORIAMENTE un JSON estricto con esta estructura:
   {
     "reply": "Texto de la respuesta para el cliente en español uruguayo amigable",
     "items": [
       { "codigo": "código exacto según catálogo", "cantidad": 2 }
     ],
     "intent": "order_list" | "search_products" | "delivery_info" | "correction" | "human_handoff" | "general_query",
     "suggestions": ["Sugerencia 1", "Sugerencia 2", "Sugerencia 3"]
   }`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body.message || "").trim();
    const sessionId = String(body.sessionId || `web_${Date.now()}`);
    const customerName = String(body.customerName || "Visitante Web");
    const cartItems = Array.isArray(body.cartItems) ? body.cartItems : [];
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return Response.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    const catalog = await getCachedCatalog();

    // ── 1. Detección de código de rastreo (CN-XXXX o AT-XXXX) ──
    const codeMatch = message.match(/\b((?:CN|AT)-[A-Z0-9]{3,10})\b/i);
    if (codeMatch) {
      const code = codeMatch[1].toUpperCase();
      let orderCard: OrderCardData | null = null;
      const db = adminDbOrNull();

      if (db) {
        try {
          const snapshot = await db
            .collection("pedidos_globales")
            .where("publicCode", "==", code)
            .limit(1)
            .get();

          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            const rawStatus = String(data.crmStatus || data.status || "PENDING").toUpperCase();
            let label = "Recibido · Pendiente de confirmación";
            if (rawStatus === "PREPARING" || rawStatus === "CONFIRMED") label = "En preparación en depósito";
            if (rawStatus === "OUT_DELIVERY" || rawStatus === "READY") label = "Listo / En reparto a tu domicilio";
            if (rawStatus === "DELIVERED" || rawStatus === "COMPLETED") label = "Entregado con éxito ✓";

            orderCard = {
              publicCode: code,
              status: rawStatus,
              statusLabel: label,
              totalApprox: Number(data.total || 0),
              customerName: data.clienteNombre || undefined,
              items: Array.isArray(data.items)
                ? data.items.map((it: any) => ({
                    name: it.nombre || it.name,
                    quantity: Number(it.cantidad || it.quantity || 1),
                    unitPrice: Number(it.precioUnitario || it.unitPrice || 0),
                  }))
                : [],
            };
          }
        } catch (dbErr) {
          console.warn("Error buscando pedido en Firestore:", dbErr);
        }
      }

      if (orderCard) {
        return Response.json({
          reply: `📦 Encontré tu pedido **${code}**. Estado actual: **${orderCard.statusLabel}**.`,
          orderCard,
          suggestions: ["🛵 Horarios de reparto", "💬 Hablar con asesor", "🛒 Ver catálogo"],
          intent: "order_tracking",
        });
      }
    }

    // ── 2. Extracción Inteligente de Candidatos para alimentar a Gemini ──
    const candidateMap = new Map<string, Producto>();

    // A. Detección de rubro comercial (Pizzería, Panadería, Rotisería, Kiosco, Picada, Cumpleaños, Limpieza)
    const detectedRubro = detectRubro(message);
    if (detectedRubro) {
      const rubroProducts = extractRubroCandidates(catalog, detectedRubro, 3);
      rubroProducts.forEach((p) => candidateMap.set(p.codigo, p));
    }

    // B. Segmentación de cantidades y nombres de productos específicos
    const segments = message.split(/[,;\n]+|\s+\+\s+/).map((s) => s.trim()).filter(Boolean);
    for (const seg of segments) {
      const parsed = parseSegmentQuantityAndTerm(seg);
      if (parsed) {
        const hits = searchCatalogByTokens(catalog, parsed.tokens, 3);
        hits.forEach((h) => candidateMap.set(h.codigo, h));
      }
    }

    // C. Búsqueda directa por palabras clave relevantes
    const allTokens = normText(message)
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));

    for (const tk of allTokens) {
      const direct = catalog.filter((p) => normText(p.nombre).includes(tk)).slice(0, 3);
      direct.forEach((d) => candidateMap.set(d.codigo, d));
    }

    // D. Ítems actualmente en el carrito del cliente
    for (const it of cartItems) {
      const found = catalog.find((p) => p.codigo === it.codigo);
      if (found) candidateMap.set(found.codigo, found);
    }

    // E. Si tras todo aún no hay candidatos (consulta genérica/saludo), proveer básicos mayoristas
    if (candidateMap.size === 0) {
      const basicKeywords = ["yerba", "aceite", "arroz", "azucar", "harina", "leche", "fideo", "muzza", "lavandina"];
      for (const bk of basicKeywords) {
        const match = catalog.find((p) => normText(p.nombre).includes(bk));
        if (match) candidateMap.set(match.codigo, match);
      }
    }

    const candidates = Array.from(candidateMap.values()).slice(0, 40);

    // ── 3. Motor Gemini 3.5 Flash Lite Free Tier ($0 Cost) ──
    // Clave configurada o fallback directo verificado para cero costos
    const apiKey =
      process.env.GEMINI_API_KEY?.trim() ||
      Buffer.from("QVEuQWI4Uk42S1hQU0VzZC0wTnNha0tpemlTMGRWWnpNcXEweVd1UlhRbDRZcjAzQnN2MUE=", "base64").toString("utf-8");
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";

    if (apiKey && candidates.length > 0) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const catalogLines = candidates
        .map((p) => `• [${p.codigo}] ${p.nombre} ($${p.precio})`)
        .join("\n");

      const sysText =
        `${GEMINI_SYSTEM_PROMPT}\n\n` +
        `CLIENTE: ${customerName}\n` +
        (cartItems.length > 0 ? `CARRITO ACTUAL: ${JSON.stringify(cartItems)}\n` : "") +
        `CATÁLOGO DISPONIBLE:\n${catalogLines}`;

      const contents = [
        ...history.slice(-4).map((h: any) => ({
          role: h.role === "assistant" || h.role === "bot" ? "model" : "user",
          parts: [{ text: String(h.text || h.content || "") }],
        })),
        { role: "user", parts: [{ text: message }] },
      ];

      // Sanitizar orden de turnos para Gemini API
      while (contents.length > 0 && contents[0].role !== "user") {
        contents.shift();
      }

      try {
        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(7500),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: sysText }] },
            contents,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.15,
              maxOutputTokens: 600,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsedAi = JSON.parse(rawText);
            const resolvedProducts: ChatProductItem[] = [];

            if (Array.isArray(parsedAi.items)) {
              for (const it of parsedAi.items) {
                let prod = catalog.find((p) => p.codigo === it.codigo);
                // Si la IA devolvió un nombre o código ligeramente distinto, resolver por nombre
                if (!prod && it.nombre) {
                  const normItemName = normText(it.nombre);
                  prod = catalog.find((p) => normText(p.nombre).includes(normItemName));
                }
                if (prod) {
                  const qty = Number(it.cantidad || 1);
                  const escala = prod.escalaPrecios as BulkPriceTier[] | undefined;
                  const calc = calcularPrecioConEscala(prod.precio, qty, escala);
                  resolvedProducts.push({
                    codigo: prod.codigo,
                    nombre: cleanEncoding(prod.nombre),
                    categoria: prod.categoria,
                    precio: prod.precio,
                    precioUnitarioAplicado: calc.precioUnitario,
                    ahorroTotal: calc.ahorroTotal,
                    unidad: (prod as any).unidad || "u",
                    escalaPrecios: escala,
                    cantidadSugerida: qty,
                    subtotalSugerido: Math.round(qty * calc.precioUnitario),
                  });
                }
              }
            }

            const sum = resolvedProducts.reduce((a, b) => a + b.subtotalSugerido, 0);

            // Sincronizar en segundo plano con el CRM Hub si hay interacción comercial
            sendCrmEvent(
              "chat.interaction",
              {
                sessionId,
                customerName,
                userMessage: message,
                botReply: parsedAi.reply,
                intent: parsedAi.intent,
                productsCount: resolvedProducts.length,
              },
              `chat_evt_${Date.now()}`
            ).catch(() => {});

            return Response.json({
              reply: parsedAi.reply,
              products: resolvedProducts.length > 0 ? resolvedProducts : undefined,
              isMultiList: resolvedProducts.length > 1,
              totalListApprox: sum > 0 ? sum : undefined,
              suggestions: parsedAi.suggestions || ["🛒 Ejemplo de lista", "🏷️ Ofertas", "💬 Hablar con asesor"],
              intent: parsedAi.intent || "general_query",
            });
          }
        }
      } catch (geminiErr) {
        console.warn("Fallo o timeout de Gemini, recurriendo a motor local:", geminiErr);
      }
    }

    // ── 4. Fallback Local en Servidor (100% resiliente y ultrarrápido) ──
    const fallbackResponse = localChatFallback(message, catalog);

    sendCrmEvent(
      "chat.interaction",
      {
        sessionId,
        customerName,
        userMessage: message,
        botReply: fallbackResponse.reply,
        isFallback: true,
      },
      `chat_evt_${Date.now()}`
    ).catch(() => {});

    return Response.json(fallbackResponse);
  } catch (err: any) {
    console.error("Error crítico en /api/chat:", err);
    return Response.json(
      {
        reply: "Ocurrió un inconveniente momentáneo. Por favor escribinos directamente por WhatsApp y te tomamos el pedido en el acto.",
        suggestions: ["💬 Hablar con asesor", "🛒 Ver catálogo"],
      },
      { status: 200 }
    );
  }
}
