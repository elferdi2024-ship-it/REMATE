# 📖 MANUAL DE USUARIO PARA EMPLEADOS
## Panel de Gestión de Pedidos — Distribuidora El Remate

Este manual está diseñado para capacitar al personal de depósito, sucursales y atención al cliente en el uso del panel de administración de pedidos. La correcta ejecución de este flujo garantiza que cada compra sea procesada, empacada y despachada sin demoras ni errores.

---

## 🛡️ 1. ACCESO Y SEGURIDAD

Cada empleado posee una cuenta individual configurada con permisos específicos según su función dentro de la distribuidora.

### 🔑 Inicio de Sesión
1. Ingrese a la plataforma de administración con sus credenciales institucionales (correo electrónico y contraseña).
2. **Restricción de Seguridad por Sucursal (RSC Scoping)**: 
   - Si su cuenta tiene asignado el rol de **Empleado**, el sistema restringirá automáticamente su vista.
   - **Solo podrá ver y gestionar los pedidos correspondientes a su sucursal asignada**.
   - No tendrá acceso a la facturación total de la distribuidora ni a los pedidos de otras sucursales, garantizando la privacidad y concentración operativa de su punto de venta.

---

## 🎛️ 2. LA INTERFAZ DE TRABAJO (PANEL DE CONTROL)

Al ingresar a la sección de **Pedidos**, se encontrará con una interfaz de alto rendimiento que se actualiza en tiempo real:

1. **Indicador de Pedidos de Hoy**: Muestra la fecha actual y el listado de pedidos realizados en la jornada.
2. **Alertas Sonoras**: Cuando un cliente realiza un nuevo pedido en el sitio web, el panel emite una **alerta de sonido en tiempo real** para notificar al equipo, incluso si están trabajando en otra pestaña.
3. **Barra de Búsqueda Rápida**: Ubicada en la esquina superior derecha, permite encontrar un pedido instantáneamente escribiendo el nombre del cliente o su número de teléfono.
4. **Tarjetas de Estadísticas**:
   - **Ventas Hoy / Artículos**: Permite monitorear el volumen físico a preparar.
   - **No Leídos (Rojo)** / **Pendientes (Amarillo)**: Muestra cuántas tareas requieren atención inmediata.

---

## 🔄 3. EL FLUJO DE TRABAJO (LOS 3 ESTADOS DEL PEDIDO)

El éxito operativo se basa en la transición ordenada de cada orden a través de sus tres estados principales. Cada tarjeta de pedido cuenta con una barra de progreso interactiva de 3 pasos:

```
[ 📥 Recibido ] --------► [ 📦 Preparando ] --------► [ 🚚 Cargado ]
   (No Leído)                (Pendiente)                (Completado)
```

### Paso 1: 📥 Estado "No Leído" (Color Rojo)
* **Significado**: Es un pedido recién ingresado por el cliente en el sitio web. Requiere validación inmediata.
* **Acción del Empleado**: 
  1. Revise los productos solicitados y las notas especiales del cliente.
  2. Verifique la disponibilidad de stock físico de los artículos.
  3. Si la orden es válida, haga clic en el botón **"Preparar"** en la tarjeta del pedido. La tarjeta cambiará de color y pasará al estado **Pendiente**.

### Paso 2: 📦 Estado "Pendiente" (Color Amarillo)
* **Significado**: El pedido está en proceso de picking y embalaje en el depósito o la sucursal.
* **Acción del Empleado**:
  1. Utilice el botón de **Impresión de Ticket** (explicado más adelante) para recolectar los artículos.
  2. Reúna los productos físicamente y colóquelos en la zona de embalaje.
  3. Embale el pedido de forma segura y adjunte el ticket físico.
  4. Una vez que el pedido esté empaquetado y listo para su distribución o retiro, haga clic en el botón **"Cargar"**.

### Paso 3: 🚚 Estado "Cargado" (Color Verde)
* **Significado**: La orden ha sido completada.
  - Para envíos a domicilio: Significa que el pedido ya fue subido al camión de reparto.
  - Para retiro en local: Significa que el pedido está listo en el mostrador esperando al cliente, o ya fue entregado.
* **Acción del Empleado**:
  - Al presionar **"Cargar"**, el pedido se archiva visualmente del flujo crítico diario, manteniendo el panel limpio y enfocado en las tareas pendientes.

---

## ⚡ 4. HERRAMIENTAS ADICIONALES DE ALTA PRODUCTIVIDAD

Cada tarjeta de pedido cuenta con herramientas diseñadas para agilizar las tareas cotidianas:

### 🖨️ Impresión de Ticket de Preparación (80mm)
* **¿Cuándo usarlo?**: Al iniciar la preparación física (Picking) de un pedido.
* **Cómo funciona**: Haga clic en el botón con el ícono de la impresora (**Imprimir Ticket**). Se abrirá una ventana de impresión optimizada para ticketeadoras térmicas estándar de **80mm**. Muestra una lista limpia y compacta de productos y cantidades para que el preparador la lleve en mano.

### 📋 Copiar Datos de Facturación
* **¿Cuándo usarlo?**: Para ingresar el pedido manualmente en el sistema contable o de facturación de la distribuidora.
* **Cómo funciona**: Presione el botón **"Copiar Resumen"**. Esto copiará al portapapeles un resumen estructurado del pedido que incluye:
  - Nombre y teléfono del cliente.
  - Dirección de entrega o Sucursal de retiro.
  - Lista detallada de productos con cantidades y precios.
  - Total de la orden.
  - Solo necesita pegarlo (Ctrl+V) en su sistema interno o chat.

### 💬 Contacto Directo por WhatsApp
* **¿Cuándo usarlo?**: Si falta stock de algún producto, si la dirección de entrega no está clara o si el pedido ya está listo para ser retirado.
* **Cómo funciona**: Haga clic en el botón con el ícono de **WhatsApp**. El sistema abrirá automáticamente una conversación en WhatsApp Web o la App móvil directamente con el número del cliente, evitando tener que agendar el contacto telefónico.

---

## 🎮 5. TUTORIAL INTERACTIVO EN VIVO (APRENDIZAJE EN 2 MINUTOS)

Para que puedas familiarizarte y dominar el sistema antes de trabajar con clientes reales, hemos desarrollado un **simulador interactivo en tiempo real**. Esto te permite experimentar el flujo de trabajo de extremo a extremo en tu propio navegador.

### 🕹️ Cómo iniciar el entrenamiento:
1. Asegúrate de tener la consola/terminal abierta en la carpeta del proyecto.
2. Ejecuta el siguiente comando en tu terminal:
   ```bash
   npm run simular
   ```
3. El sistema creará un **pedido de prueba real** en la base de datos Firestore a nombre de `"Renato (Simulador Interactivo)"`.
4. De inmediato, tu panel web (`http://localhost:3000/admin/pedidos`) emitirá la **alerta sonora real** de nuevo pedido, y verás aparecer la tarjeta en **Rojo (No Leído)**.
5. El simulador en tu consola se detendrá y te guiará paso a paso para que:
   - Presiones **"EMPEZAR PREPARACIÓN"** en la web real y observes cómo el simulador detecta que pasó a **Pendiente (Amarillo)**.
   - Pruebes la **impresión del ticket térmico** de 80mm y la función de copiar al portapapeles.
   - Presiones **"COMPLETAR CARGA"** en la web real y verifiques cómo se procesa la carga final del camión.
6. Al finalizar, el simulador te ofrecerá limpiar automáticamente los datos de prueba de la base de datos. ¡Ideal para entrenar a nuevos empleados en 2 minutos!

---

## 🛠️ 6. SOPORTE TÉCNICO E INCIDENCIAS

Si experimenta una caída de conexión, lentitud, fallas en la impresión o tiene alguna sugerencia de mejora, el panel cuenta con una **tarjeta de soporte técnico integrada** al final de la página.

* **Contacto directo**: Puede hacer clic en el botón de soporte para abrir un chat de WhatsApp con **Facundo Fernandez (092 265 952)**, encargado de infraestructura y desarrollo técnico, quien resolverá su incidencia a la brevedad.

---
*Distribuidora El Remate — Tecnología al Servicio de la Eficiencia Operativa.*
