# ESPECIFICACIÓN TÉCNICA: ARQUITECTURA DE RUTAS, CATÁLOGO Y FLUJO DE PEDIDOS A WHATSAPP
**Proyecto:** El Remate Canelones (Distribuidora Mayorista)  
**Ubicación Base en Disco:** `D:\PROYECTOS\ELREMATE\distribuidora`  
**Framework:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Firebase Firestore / Auth  
**Fecha de Emisión:** Noviembre 2026  

---

## 1. MAPA COMPLETO DE RUTAS Y ARCHIVOS FÍSICOS EN DISCO

A continuación se detalla la correspondencia exacta entre la URL accesible y el archivo físico en el disco duro:

### 1.1. Rutas Públicas y de Clientes (Front-End)

| URL Relativa | Propósito Funcional | Archivo Físico en Disco Duro |
|---|---|---|
| `/` | **Landing Page Principal**: Hero, selector de sucursal, categorías destacadas, carrusel publicitario de marcas (Retail Media). | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\page.tsx` |
| `/catalogo` | **Catálogo Mayorista**: Buscador debounced, filtro por categorías, listado/grilla, panel de carrito lateral y checkout. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\catalogo\page.tsx`<br>`D:\PROYECTOS\ELREMATE\distribuidora\src\app\catalogo\CatalogoPageClient.tsx` |
| `/ofertas` | **Ofertas y Promociones**: Liquidaciones, combos y descuentos destacados por volumen. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\ofertas\page.tsx` |
| `/fiesta` | **Módulo Fiesta / Eventos**: Selección rápida de bebidas, descartables y snacks por bulto cerrado. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\fiesta\page.tsx` |
| `/listas` | **Listas del Cliente**: Gestión de listas de compra recurrentes para comercios. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\listas\page.tsx` |
| `/listas/[id]` | **Detalle de Lista Compartida**: Carga masiva de ítems preconfigurados al carrito. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\listas\[id]\page.tsx` |
| `/historial` | **Historial de Pedidos**: Registro de pedidos locales y sincronizados para repetir pedidos con un toque. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\historial\page.tsx` |
| `/cuenta` | **Perfil de Usuario / Auth**: Inicio de sesión (Firebase Auth), datos de facturación y comercio. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\cuenta\page.tsx` |
| `/seleccionar-sucursal` | **Selector de Sucursal**: Asignación de sucursal activa en `localStorage` y cookies. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\seleccionar-sucursal\page.tsx` |
| `/publicitate` | **Retail Media B2B**: Presentación institucional y planes comerciales para anunciantes. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\publicitate\page.tsx` |
| `/tutorial` | **Guía de Uso para Clientes**: Onboarding sobre cómo armar y enviar pedidos. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\tutorial\page.tsx` |
| `/tutorial-empleado` | **Guía Operativa**: Manual de preparación de pedidos y uso del panel administrativo. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\tutorial-empleado\page.tsx` |
| `/politica-de-privacidad` | **Legales**: Políticas de privacidad y tratamiento de datos personales. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\politica-de-privacidad\page.tsx` |

---

### 1.2. Rutas del Panel de Administración (`/admin`)

| URL Relativa | Propósito Funcional | Archivo Físico en Disco Duro |
|---|---|---|
| `/admin` | **Dashboard Central**: Métricas clave de actividad, pedidos pendientes y accesos rápidos. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\page.tsx` |
| `/admin/login` | **Autenticación Administrativa**: Acceso restringido por credenciales para administradores. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\login\page.tsx` |
| `/admin/pedidos` | **Tablero Operativo de Pedidos**: Recepción en tiempo real de pedidos de WhatsApp y web con estados (`no_leido`, `preparando`, `completado`). | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\pedidos\page.tsx` |
| `/admin/productos` | **Gestión de Inventario**: Altas, bajas, modificación y habilitación de ítems. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\productos\page.tsx` |
| `/admin/precios` | **Actualización Masiva de Precios**: Importación y sincronización de listas Excel. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\precios\page.tsx` |
| `/admin/sucursales` | **Gestión de Sucursales y WhatsApps**: Horarios, estado abierto/cerrado y teléfonos de WhatsApp receptores. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\sucursales\page.tsx` |
| `/admin/categorias` | **Taxonomía**: Jerarquías y visibilidad de categorías en la web. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\categorias\page.tsx` |
| `/admin/cupones` | **Cupones de Descuento**: Campañas promocionales y códigos de beneficio. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\cupones\page.tsx` |
| `/admin/publicidad` | **Gestión de Retail Media**: Banners, contratos de marcas y patrocinios. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\publicidad\page.tsx` |
| `/admin/publicidad/reporte/[brandId]` | **Reporte de Marca**: Métricas de impresiones y CTR de campañas de marcas específicas. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\publicidad\reporte\[brandId]\page.tsx` |
| `/admin/marketing` | **Campañas y Difusión**: Gestión de avisos, popups de bienvenida y anuncios. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\marketing\page.tsx` |
| `/admin/stats` | **Estadísticas de Demanda**: Productos más pedidos, horarios pico y volumen de ventas. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\stats\page.tsx` |
| `/admin/usuarios` | **Control de Accesos**: Asignación de roles y permisos para el personal. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\admin\usuarios\page.tsx` |

---

### 1.3. Endpoints de Backend / API REST (`/api/...`)

| Endpoint HTTP | Método | Propósito Funcional | Archivo Físico en Disco Duro |
|---|---|---|---|
| `/api/orders` | `GET`, `POST` | Creación y listado de pedidos en Firestore. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\orders\route.ts` |
| `/api/orders/[id]` | `GET` | Consulta individual de estado de un pedido por ID. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\orders\[id]\route.ts` |
| `/api/orders/[id]/status` | `PATCH` | Actualización operativa de estado (`preparando`, `enviado`, `entregado`). | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\orders\[id]\status\route.ts` |
| `/api/crm/events` | `POST` | Ingesta de eventos hacia el CRM Hub central (`order.created`, etc.). | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\crm\events\route.ts` |
| `/api/crm/overview` | `GET` | Resumen consolidado para integración con dashboards externos. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\crm\overview\route.ts` |
| `/api/crm/customers` | `GET` | Extracción de base de clientes y números telefónicos para fidelización. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\crm\customers\route.ts` |
| `/api/crm/catalog` | `GET` | Exportación sincronizada del catálogo para herramientas externas. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\crm\catalog\route.ts` |
| `/api/crm/chat-logs` | `GET` | Logs de conversaciones e intenciones de clientes. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\crm\chat-logs\route.ts` |
| `/api/crm/config` | `GET`, `POST` | Ajustes de conexión y tokens del CRM Hub. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\crm\config\route.ts` |
| `/api/crm/webhooks/test` | `POST` | Endpoint de validación de entrega de webhooks. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\crm\webhooks\test\route.ts` |
| `/api/chat` | `POST` | Asistente conversacional de consulta rápida de stock y precios. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\chat\route.ts` |
| `/api/chat/handoff` | `POST` | Transferencia de conversación a atención por WhatsApp con humano. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\chat\handoff\route.ts` |
| `/api/products` | `GET`, `POST` | Consulta y mutación directa de productos. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\products\route.ts` |
| `/api/ad-event` | `POST` | Registro de impresiones y clics en banners patrocinados. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\ad-event\route.ts` |
| `/api/seed-master` | `POST` | Inicializador y sembrador inicial de datos maestros. | `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\seed-master\route.ts` |

---

## 2. ARQUITECTURA Y FUNCIONAMIENTO DEL CATÁLOGO

El catálogo está orquestado principalmente en:
* `D:\PROYECTOS\ELREMATE\distribuidora\src\app\catalogo\CatalogoPageClient.tsx`
* `D:\PROYECTOS\ELREMATE\distribuidora\src\hooks\useProductos.ts`

### 2.1. Estrategia de Carga de Datos Resiliente (Fallback Waterfall)
Cuando un cliente ingresa a `/catalogo`, el sistema ejecuta una resolución jerárquica en cascada:
1. **Catálogo por Sucursal (Firestore):**  
   Intenta leer el documento `sucursales_catalogos/{sucursalId}`. Si la sucursal tiene un listado propio personalizado y activo, se carga en memoria.
2. **Catálogo Global (Firestore):**  
   Si no existe personalización de sucursal, consulta `catalogo_activo/productos` en Firebase Firestore.
3. **Catálogo Local Estático (Zero-Fail Fallback):**  
   Si Firestore no responde o el usuario navega sin conexión, realiza un `fetch('/productos.json')` desde `D:\PROYECTOS\ELREMATE\distribuidora\public\productos.json` (que contiene más de 1.900 referencias de productos).

### 2.2. Normalización de Categorías y Códigos
* Cada producto se valida contra el diccionario `D:\PROYECTOS\ELREMATE\distribuidora\src\lib\categoria_mapping.json`.
* La función `normalizeProductCategory()` en `D:\PROYECTOS\ELREMATE\distribuidora\src\lib\category-normalizer.ts` asocia códigos de barras con la categoría comercial exacta.

### 2.3. Búsqueda y Filtrado Instantáneo en Cliente
* **Búsqueda Debounced:** Temporizador de 200 ms que busca en tiempo real por coincidencia parcial de texto en `nombre` y `codigo`.
* **Filtros cruzados:** Filtrado inmediato por categoría seleccionada, marca y rangos de precio sin recargar la página.

### 2.4. Gestión de Estado del Carrito y Enlaces Compartibles
* El estado del carrito es gestionado por `CartProvider` en `D:\PROYECTOS\ELREMATE\distribuidora\src\lib\cart-context.tsx` y sincronizado en `localStorage`.
* **Carritos Compartibles por URL:** En `D:\PROYECTOS\ELREMATE\distribuidora\src\lib\cart-share.ts`, las funciones `encodeCartToURL()` y `decodeCartFromURL()` permiten compartir un carrito completo empaquetado en base64/lz-string vía el parámetro `?cart=...`.

---

## 3. FLUJO COMPLETO: DEL ARMADO DEL PEDIDO AL MENSAJE EN WHATSAPP

El objetivo del flujo es permitir que **cualquier cliente (con o sin cuenta)** concrete un pedido con **cero fricción**.

### 3.1. Fase 1: Armado del Pedido en la Web
1. El cliente agrega productos al carrito desde la grilla o las tarjetas de producto.
2. Se ejecuta la animación de vuelo visual mediante `D:\PROYECTOS\ELREMATE\distribuidora\src\lib\flyToCart.ts`.
3. Al abrir el panel lateral (`CartPanel.tsx` ubicado en `D:\PROYECTOS\ELREMATE\distribuidora\src\components\carrito\CartPanel.tsx`), el cliente revisa los ítems y presiona **"Continuar a Entrega"**.

### 3.2. Fase 2: Formulario de Checkout y Datos de Entrega
Dentro de `CartPanel.tsx` y su subcomponente `CartFooter`:
* **Datos del Cliente:**
  * Nombre / Nombre del Comercio (`alias`): Si no lo introduce, se asigna `"Cliente"` por defecto.
  * Teléfono de contacto (`telefono`).
  * Notas o aclaraciones para el armado (`clientNotes`).
* **Modalidad de Entrega:**
  * **Retiro en sucursal:** Costo $0.
  * **Envío a domicilio:**
    * Si la zona es **Canelones**: Se evalúa `calcularCostoEnvio()` en `D:\PROYECTOS\ELREMATE\distribuidora\src\lib\envio-config.ts`. Si el subtotal supera el umbral (`UMBRAL_ENVIO_GRATIS = $1.500`), el envío es gratuito; de lo contrario se añade el costo fijo estipulado.
    * Si la zona es **Otras Zonas / Montevideo**: El subtotal se mantiene sin recargo web y se detalla "Costo de envío a coordinar por WhatsApp".
* El cliente presiona el botón verde principal: **"Enviar Pedido por WhatsApp"**.

### 3.3. Fase 3: Procesamiento Asíncrono en Segundo Plano (Non-Blocking)
Al hacer clic, `handleEnviarWhatsApp()` en `D:\PROYECTOS\ELREMATE\distribuidora\src\app\catalogo\CatalogoPageClient.tsx` ejecuta en paralelo y **sin bloquear la navegación**:
1. **Generación de ID de Pedido:**
   * Se crea un ID único (ej: `L20261106-4921` -> código visible `CN-4921`).
2. **Persistencia en Firestore (`pedidos_globales`):**
   * Se ejecuta `guardarPedidoGlobalInstantaneo()` de `D:\PROYECTOS\ELREMATE\distribuidora\src\lib\pedidos.ts`.
   * El pedido queda visible de forma inmediata en el panel del encargado en `/admin/pedidos` con estado inicial `no_leido`.
3. **Notificación al CRM Hub:**
   * Realiza un `POST` en segundo plano hacia `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\crm\events\route.ts` con el evento `order.created`, enviando los datos del cliente, dirección, entrega y lista de productos.
4. **Respaldo Local y de Usuario:**
   * Si el usuario está autenticado, guarda el registro en su cuenta con `guardarPedidoUsuario()`.
   * Para invitados, almacena el historial en `localStorage` mediante `saveLocalPedido()` de `D:\PROYECTOS\ELREMATE\distribuidora\src\hooks\usePedidosLocales.ts`.
   * Almacena el pedido en `localStorage` bajo la clave `elremate_pedido_pendiente_wa` (`persistPedidoPendiente`) para permitir seguimiento o reapertura.

### 3.4. Fase 4: Formateo del Mensaje de WhatsApp
La función `armarMensajeWA()` en `D:\PROYECTOS\ELREMATE\distribuidora\src\lib\whatsapp.ts` estructura el texto con formato enriquecido para WhatsApp:

```text
🧾 *PEDIDO EL REMATE #CN-4921*
📅 06/11/2026, 13:50
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* Autoservicio San Cono
📱 *Tel:* 099123456
📍 *Entrega:* Calle Treinta y Tres 450, Canelones
━━━━━━━━━━━━━━━━━━━━
🛒 *DETALLE (3 items):*
• *4x* Harina de Trigo 0000 1kg → *$192*
• *2x* Aceite de Girasol 900ml → *$150*
• *10x* Fideos Guiseros 500g → *$450*
━━━━━━━━━━━━━━━━━━━━
💵 *Subtotal:* $792
🚚 *Envío Canelones:* $150
💰 *TOTAL: $942*
━━━━━━━━━━━━━━━━━━━━
📝 *Notas:* Por favor entregar después de las 14:00 hs.
━━━━━━━━━━━━━━━━━━━━
⚡ _Pedido enviado desde elremate.uy_
```

### 3.5. Fase 5: Resolución de Destinatario y Apertura de WhatsApp
1. **Resolución del Teléfono Receptor:**  
   Mediante `getSucursalWhatsApp(sucursalId)` en `D:\PROYECTOS\ELREMATE\distribuidora\src\lib\sucursales-config.ts`, el sistema resuelve dinámicamente el número telefónico asignado a la sucursal elegida por el cliente (con fallback a la variable de entorno `NEXT_PUBLIC_WA_NUMBER` o `D:\PROYECTOS\ELREMATE\distribuidora\src\lib\sucursales.ts`).
2. **Construcción del Enlace (`construirLinkWhatsApp`):**  
   Normaliza el teléfono a formato internacional uruguayo (`598...`) y codifica el texto con `encodeURIComponent()`.
3. **Apertura Directa (`abrirWhatsApp` en `whatsapp.ts`):**  
   * **En Dispositivos Móviles:** Lanza el protocolo directo `whatsapp://send?phone=598XXXXXXXX&text=...` para que el sistema operativo abra la aplicación nativa de WhatsApp al instante.
   * **En Computadoras (Desktop):** Abre `https://wa.me/598XXXXXXXX?text=...` o `https://web.whatsapp.com/send?...`.
4. **Envío Final por el Cliente:**  
   El mensaje con todos los ítems, totales, dirección y notas queda **pre-escrito** en la caja de texto del chat con la distribuidora. El cliente solo debe tocar el botón de enviar en WhatsApp.

---

## 4. INTEGRACIÓN CON OTROS SISTEMAS (PAUTAS DE UNIFICACIÓN)

Para conectar o unificar esta solución con otro proyecto:

1. **Recepción Webhook de Pedidos:**  
   Escuchar o consumir los eventos emitidos por `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\crm\events\route.ts`. El payload de `order.created` incluye:
   * `order.id` (ID interno Firestore)
   * `order.publicCode` (código corto ej. `CN-4921`)
   * `order.customerName`, `customerPhone`, `deliveryAddress`
   * `order.deliveryType` (`PICKUP` o `DELIVERY`)
   * `order.total` y array `order.items` (`productId`, `name`, `quantity`, `unitPrice`).
2. **Sincronización de Catálogo:**  
   Consumir el endpoint `GET` en `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\crm\catalog\route.ts` o consultar directamente la colección `catalogo_activo` en Firestore.
3. **Gestión de Estados de Pedido:**  
   Para sincronizar el picking o despacho, enviar peticiones `PATCH` a `D:\PROYECTOS\ELREMATE\distribuidora\src\app\api\orders\[id]\status\route.ts` con el nuevo estado del pedido.
