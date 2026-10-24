# Integración con DeskcommCRM

Este proyecto es el Spoke de tienda de El Remate. DeskcommCRM es el Hub y conserva la ejecución de los agentes y seguimientos de WhatsApp. Este documento registra la referencia de configuración observada en el CRM y el contrato de integración; no replica el runtime del chatbot.

## Contrato esperado por el Hub

- M2M Hub → tienda: `X-CRM-Api-Key`.
- Webhooks tienda → Hub: `X-Webhook-Signature: sha256=<HMAC-SHA256(secret, rawBody)>`.
- Recursos del Spoke: `GET /api/crm/overview`, `GET|POST /api/crm/customers`, `PUT /api/crm/config`, `POST /api/crm/webhooks/test`, `GET /api/products?limit=5000`, `POST /api/orders`, `PATCH /api/orders/:id/status`.
- Eventos de negocio enviados al Hub: `order.created`, `order.status_changed`, `customer.upserted`; cada evento tiene `id`, `event`, `tenant`, `timestamp` y `data`.
- El pedido confirmado desde checkout debe ser idempotente por ID de evento e ID externo; los cambios posteriores de estado se sincronizan con el Hub.

## Variables del servidor

Configurar únicamente en el entorno servidor, nunca con prefijo `NEXT_PUBLIC_`:

```dotenv
EL_REMATE_TENANT_ID=ER-01
EL_REMATE_CRM_API_KEY=
EL_REMATE_WEBHOOK_SECRET=
CRM_BASE_URL=
FIREBASE_SERVICE_ACCOUNT_KEY=
```

No copiar credenciales de archivos de ejemplo o documentación antigua. El API key y el secreto HMAC deben ser nuevos y coincidir con los configurados en el conector del Hub.

## Configuración IA de referencia

Origen: CRM, organización “El Remate — Mercado Atlántida”, consulta de solo lectura del 22/10/2026.

Agente publicado/default: “Asistente de Pedidos — El Remate / Mayorista”. Los otros agentes visibles son “Agente de Reparto y Logística”, “Agente de Cuentas y Cobranzas” y “Agente de Ventas Mayoristas”. El prompt publicado exige voseo uruguayo, identificar al cliente, consultar datos reales, no inventar stock/precios/horarios y confirmar pedidos solo con autorización explícita; reclamos y excepciones pasan a una persona.

Seguimientos activos observados (6):

1. Conformidad y Cobranza Post-Reparto.
2. Alerta Cierre de Tanda de Pedidos (Cutoff).
3. Calificación y Bienvenida de Nuevo Cliente Mayorista.
4. El Remate · Recompra semanal y reposición de surtido.
5. El Remate · Pedido listo para retiro en local.
6. El Remate · Carrito o cotización sin confirmar.

Los detalles operativos completos y editables permanecen en CRM, que es la fuente de verdad. Para trasladarlos sin perder nodos, condiciones, temporizadores, prompts o versiones, usar la exportación/importación nativa del CRM; no reconstruirlos como una segunda automatización en la tienda.

## Activación

La documentación del CRM describe hoy otro backend como destino del conector. Cambiar el `base_url` de producción al proyecto Next/Firebase es un cambio operativo separado: hacerlo solo después de desplegar aquí el contrato completo y configurar credenciales por entorno. No apuntar el Hub al sitio hasta completar esa transición.
