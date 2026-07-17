// filepath: scripts/seed-orders.mjs
// Seed 48 pedidos simulados realistas (32 minoristas + 16 mayoristas)
// Ejecutar: node scripts/seed-orders.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJAdlJDA9ZE8CfC_ceEu5luv44qCxsfBE",
  authDomain: "elremate-6f8f2.firebaseapp.com",
  projectId: "elremate-6f8f2",
  storageBucket: "elremate-6f8f2.firebasestorage.app",
  messagingSenderId: "299477563303",
  appId: "1:299477563303:web:45da3792702a07c70f6882",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Catálogo de productos reales de distribuidora uruguaya ─────────────

const PRODUCTOS = [
  // Yerba Mate
  { codigo: "7730124002903", nombre: "Yerba Canarias Tradicional 1kg", precioUnitario: 289 },
  { codigo: "7730124002910", nombre: "Yerba Sara Roja 1kg", precioUnitario: 265 },
  { codigo: "7730124002927", nombre: "Yerba Del Cebador 1kg", precioUnitario: 245 },
  { codigo: "7730124002934", nombre: "Yerba Baldo Suave 1kg", precioUnitario: 275 },
  { codigo: "7730124002941", nombre: "Yerba Canarias Selección Especial 1kg", precioUnitario: 339 },

  // Aceites
  { codigo: "7790580001018", nombre: "Aceite Óptimo Girasol 900ml", precioUnitario: 149 },
  { codigo: "7790580001025", nombre: "Aceite Dos Anclas 900ml", precioUnitario: 175 },
  { codigo: "7790580001032", nombre: "Aceite Oliva Extra Virgen Cocinero 500ml", precioUnitario: 450 },

  // Arroz
  { codigo: "7730253000290", nombre: "Arroz Blue Bonnet 1kg", precioUnitario: 89 },
  { codigo: "7730253000344", nombre: "Arroz Saman Integral 1kg", precioUnitario: 115 },
  { codigo: "7730253000351", nombre: "Arroz Gallo Dorado 1kg", precioUnitario: 95 },

  // Fideos
  { codigo: "7790600000018", nombre: "Fideos Adria Tirabuzón 500g", precioUnitario: 69 },
  { codigo: "7790600000025", nombre: "Fideos Adria Mostachol 500g", precioUnitario: 69 },
  { codigo: "7790600000032", nombre: "Fideos Cololo Spaghetti 500g", precioUnitario: 59 },
  { codigo: "7790600000049", nombre: "Fideos Puritas Moñitas 500g", precioUnitario: 55 },

  // Galletitas
  { codigo: "7730300001234", nombre: "Galletitas La Banderita Sin Sal 380g", precioUnitario: 99 },
  { codigo: "7730300001241", nombre: "Galletas Portezuelo Agua 400g", precioUnitario: 85 },
  { codigo: "7730300001258", nombre: "Bizcochos 9 de Oro 200g", precioUnitario: 79 },
  { codigo: "7730300001265", nombre: "Obleas Fantoche Triple 75g x6", precioUnitario: 189 },

  // Bebidas
  { codigo: "7790895000102", nombre: "Coca-Cola 2.25L", precioUnitario: 129 },
  { codigo: "7790895000119", nombre: "Coca-Cola 500ml", precioUnitario: 79 },
  { codigo: "7790895000126", nombre: "Fanta Naranja 2.25L", precioUnitario: 119 },
  { codigo: "7790895000133", nombre: "Pepsi 2.25L", precioUnitario: 115 },
  { codigo: "7790895000140", nombre: "Step Cola 2.25L", precioUnitario: 85 },
  { codigo: "7790895000157", nombre: "Agua Salus sin gas 1.5L", precioUnitario: 65 },
  { codigo: "7790895000164", nombre: "Agua Nativa Bidón 5L", precioUnitario: 99 },
  { codigo: "7790895000171", nombre: "Jugo Rinde Dos Naranja 500ml", precioUnitario: 55 },

  // Cerveza
  { codigo: "7730400001234", nombre: "Pilsen 1L retornable", precioUnitario: 115 },
  { codigo: "7730400001241", nombre: "Patricia 1L retornable", precioUnitario: 125 },
  { codigo: "7730400001258", nombre: "Zillertal 1L retornable", precioUnitario: 110 },
  { codigo: "7730400001265", nombre: "Pilsen Lata 473ml x6", precioUnitario: 449 },

  // Limpieza
  { codigo: "7790500001018", nombre: "Jabón Nevex Líquido 1.2L", precioUnitario: 229 },
  { codigo: "7790500001025", nombre: "Lavandina Sello Rojo 1L", precioUnitario: 55 },
  { codigo: "7790500001032", nombre: "Detergente Hurra Limón 1.25L", precioUnitario: 149 },
  { codigo: "7790500001049", nombre: "Suavizante Comfort 900ml", precioUnitario: 189 },
  { codigo: "7790500001056", nombre: "Esponja Scotch-Brite Multiuso x3", precioUnitario: 89 },
  { codigo: "7790500001063", nombre: "Bolsas de Residuos 45x60 x20", precioUnitario: 79 },

  // Harinas y panadería
  { codigo: "7790600001018", nombre: "Harina Cañuelas 000 1kg", precioUnitario: 59 },
  { codigo: "7790600001025", nombre: "Harina Puritas 000 1kg", precioUnitario: 65 },
  { codigo: "7790600001032", nombre: "Azúcar Bella Unión 1kg", precioUnitario: 75 },
  { codigo: "7790600001039", nombre: "Polenta Presto Pronta 500g", precioUnitario: 65 },

  // Lácteos y café
  { codigo: "7790700001018", nombre: "Leche Entera Conaprole 1L", precioUnitario: 55 },
  { codigo: "7790700001025", nombre: "Café Águila Molido 250g", precioUnitario: 189 },
  { codigo: "7790700001032", nombre: "Café Saint 250g", precioUnitario: 165 },
  { codigo: "7790700001039", nombre: "Manteca Conaprole 200g", precioUnitario: 119 },
  { codigo: "7790700001046", nombre: "Queso Rallado Conaprole 40g", precioUnitario: 69 },

  // Conservas y salsas
  { codigo: "7790800001018", nombre: "Atún en Aceite Gourmet 170g", precioUnitario: 109 },
  { codigo: "7790800001025", nombre: "Salsa de Tomate Conaprole 340g", precioUnitario: 79 },
  { codigo: "7790800001032", nombre: "Dulce de Leche Conaprole 450g", precioUnitario: 159 },
  { codigo: "7790800001039", nombre: "Mermelada Los Nietitos Durazno 390g", precioUnitario: 139 },

  // Higiene personal
  { codigo: "7790900001018", nombre: "Papel Higiénico Elite DH x4", precioUnitario: 149 },
  { codigo: "7790900001025", nombre: "Jabón Protex Antibacterial x3", precioUnitario: 179 },
  { codigo: "7790900001032", nombre: "Shampoo Sedal Restauración 350ml", precioUnitario: 219 },
  { codigo: "7790900001039", nombre: "Desodorante Rexona 150ml", precioUnitario: 199 },
  { codigo: "7790900001046", nombre: "Pasta dental Colgate 90g", precioUnitario: 99 },

  // Snacks
  { codigo: "7791000001018", nombre: "Papas Lays Clásicas 150g", precioUnitario: 129 },
  { codigo: "7791000001025", nombre: "Alfajor Portezuelo Triple", precioUnitario: 69 },
  { codigo: "7791000001032", nombre: "Chocolate Águila 100g", precioUnitario: 149 },
  { codigo: "7791000001039", nombre: "Caramelos Media Hora x10", precioUnitario: 49 },

  // Pan y panificados
  { codigo: "7791100001018", nombre: "Pan Lactal Bimbo 550g", precioUnitario: 129 },
  { codigo: "7791100001025", nombre: "Tostadas Criollitas 200g", precioUnitario: 79 },

  // Condimentos
  { codigo: "7791200001018", nombre: "Sal Dos Anclas Fina 500g", precioUnitario: 45 },
  { codigo: "7791200001025", nombre: "Mayonesa Hellmanns 475g", precioUnitario: 179 },
  { codigo: "7791200001032", nombre: "Ketchup Hellmanns 400g", precioUnitario: 149 },
  { codigo: "7791200001039", nombre: "Mostaza Savora 220g", precioUnitario: 99 },

  // Fiambres y chacinados
  { codigo: "7791300001018", nombre: "Salchichas Schneck x6", precioUnitario: 169 },
  { codigo: "7791300001025", nombre: "Panchos Ottonello x6", precioUnitario: 149 },
  { codigo: "7791300001032", nombre: "Jamón Cocido Sarubbi 200g", precioUnitario: 219 },
];

// ── Clientes Minoristas ─────────────────────────────────────────────────

const CLIENTES_MINORISTAS = [
  { nombre: "María González", telefono: "099 123 456", barrio: "La Paz" },
  { nombre: "Juan Rodríguez", telefono: "098 765 432", barrio: "Las Piedras" },
  { nombre: "Ana Martínez", telefono: "099 234 567", barrio: "Canelones" },
  { nombre: "Carlos Fernández", telefono: "098 345 678", barrio: "18 de Mayo" },
  { nombre: "Laura Pérez", telefono: "099 456 789", barrio: "El Dorado" },
  { nombre: "Diego Silva", telefono: "098 567 890", barrio: "La Paz" },
  { nombre: "Valentina López", telefono: "099 678 901", barrio: "Las Piedras" },
  { nombre: "Martín García", telefono: "098 789 012", barrio: "Canelones" },
  { nombre: "Lucía Acosta", telefono: "099 890 123", barrio: "18 de Mayo" },
  { nombre: "Gabriel Hernández", telefono: "098 901 234", barrio: "El Dorado" },
  { nombre: "Camila Díaz", telefono: "099 012 345", barrio: "La Paz" },
  { nombre: "Sebastián Torres", telefono: "098 123 789", barrio: "Las Piedras" },
  { nombre: "Florencia Romero", telefono: "099 234 890", barrio: "Canelones" },
  { nombre: "Matías Vázquez", telefono: "098 345 901", barrio: "Las Piedras" },
  { nombre: "Sofía Alvarez", telefono: "099 456 012", barrio: "La Paz" },
  { nombre: "Federico Suárez", telefono: "098 567 123", barrio: "18 de Mayo" },
  { nombre: "Rocío Castro", telefono: "099 678 234", barrio: "Canelones" },
  { nombre: "Nicolás Ramírez", telefono: "098 789 345", barrio: "El Dorado" },
  { nombre: "Agustina Morales", telefono: "099 890 456", barrio: "Las Piedras" },
  { nombre: "Emiliano Ruiz", telefono: "098 901 567", barrio: "La Paz" },
  { nombre: "Milagros Benítez", telefono: "099 012 678", barrio: "18 de Mayo" },
  { nombre: "Tomás Giménez", telefono: "098 123 012", barrio: "Canelones" },
  { nombre: "Antonella Cardozo", telefono: "099 234 123", barrio: "Las Piedras" },
  { nombre: "Ignacio Pereira", telefono: "098 345 234", barrio: "El Dorado" },
  { nombre: "Renata Olivera", telefono: "099 456 345", barrio: "La Paz" },
  { nombre: "Facundo Méndez", telefono: "098 567 456", barrio: "Canelones" },
  { nombre: "Micaela Santos", telefono: "099 678 567", barrio: "Las Piedras" },
  { nombre: "Santiago Núñez", telefono: "098 789 678", barrio: "18 de Mayo" },
  { nombre: "Josefina Duarte", telefono: "099 890 789", barrio: "El Dorado" },
  { nombre: "Bruno Correa", telefono: "098 901 890", barrio: "La Paz" },
  { nombre: "Catalina Sosa", telefono: "099 012 901", barrio: "Canelones" },
  { nombre: "Lautaro Medina", telefono: "098 123 901", barrio: "Las Piedras" },
];

// ── Clientes Mayoristas ─────────────────────────────────────────────────

const CLIENTES_MAYORISTAS = [
  { nombre: "Almacén Don Pedro", telefono: "099 555 101", barrio: "Las Piedras", rut: "211234560019" },
  { nombre: "Autoservice La Esquina", telefono: "098 555 202", barrio: "La Paz", rut: "211234560026" },
  { nombre: "Despensa El Vecino", telefono: "099 555 303", barrio: "Canelones", rut: "211234560033" },
  { nombre: "Mini Market San José", telefono: "098 555 404", barrio: "18 de Mayo", rut: "211234560040" },
  { nombre: "Almacén y Fiambrería Los Hermanos", telefono: "099 555 505", barrio: "El Dorado", rut: "211234560057" },
  { nombre: "Distribuidora Sur SRL", telefono: "098 555 606", barrio: "Las Piedras", rut: "211234560064" },
  { nombre: "Kiosco y Almacén Rincón", telefono: "099 555 707", barrio: "La Paz", rut: "211234560071" },
  { nombre: "Autoservice Don Carlos", telefono: "098 555 808", barrio: "Canelones", rut: "211234560088" },
  { nombre: "Supermercado Barrial", telefono: "099 555 909", barrio: "Las Piedras", rut: "211234560095" },
  { nombre: "Almacén La Criolla", telefono: "098 555 010", barrio: "18 de Mayo", rut: "211234560101" },
  { nombre: "Despensa y Rotisería El Barrio", telefono: "099 555 011", barrio: "El Dorado", rut: "211234560118" },
  { nombre: "Mini Market Express", telefono: "098 555 012", barrio: "La Paz", rut: "211234560125" },
  { nombre: "Almacén Doña Rosa", telefono: "099 555 013", barrio: "Canelones", rut: "211234560132" },
  { nombre: "Comercial Las Piedras", telefono: "098 555 014", barrio: "Las Piedras", rut: "211234560149" },
  { nombre: "Autoservice El Puente", telefono: "099 555 015", barrio: "18 de Mayo", rut: "211234560156" },
  { nombre: "Almacén y Bebidas La Central", telefono: "098 555 016", barrio: "Canelones", rut: "211234560163" },
];

// ── Mapeo barrio → sucursal ─────────────────────────────────────────────

const BARRIO_SUCURSAL = {
  "La Paz": "la-paz",
  "Las Piedras": "las-piedras-herrera",
  "Canelones": "canelones",
  "18 de Mayo": "18-de-mayo",
  "El Dorado": "el-dorado",
};

const SUCURSAL_DIRECCION = {
  "la-paz": "Sucursal La Paz (Ramón Álvarez 225)",
  "las-piedras-herrera": "Sucursal Las Piedras (Luis Alberto de Herrera 487)",
  "canelones": "Sucursal Canelones (General Artigas 118)",
  "18-de-mayo": "Sucursal 18 de Mayo (Maestro Julio Castro 15)",
  "el-dorado": "Sucursal El Dorado (Elías Regules esq. Honduras)",
  "las-piedras-artigas": "Sucursal Las Piedras (Avenida Artigas 750)",
};

// ── Helpers ─────────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function randomDate(daysAgoMin, daysAgoMax) {
  const daysAgo = randomInt(daysAgoMin, daysAgoMax);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(randomInt(7, 20), randomInt(0, 59), randomInt(0, 59));
  return d;
}

// ── Notas realistas (variadas) ──────────────────────────────────────────

const NOTAS_MINORISTA = [
  "",
  "",
  "",
  "Dejar en portería por favor",
  "Llamar antes de entregar",
  "Después de las 14hs",
  "Si no hay Canarias, reemplazar por Sara",
  "Entregar por la puerta del costado",
  "Pedido para cumpleaños, necesito que llegue antes de las 17",
  "Es para la oficina, entregar en recepción",
  "",
  "Timbre roto, golpear fuerte",
  "",
  "Pago con Mercado Pago",
  "",
  "Si no hay stock de algún producto, no sustituir",
];

const NOTAS_MAYORISTA = [
  "",
  "Pedido semanal habitual",
  "Reposición de góndola urgente",
  "Factura a nombre de la empresa",
  "Entrega en horario comercial (8-18hs)",
  "",
  "Incluir factura y remito",
  "Agregar a cuenta corriente",
  "Para stock del fin de semana",
  "",
  "Confirmar disponibilidad antes de despachar",
  "Pedido quincenal - mismo de siempre",
  "",
  "Necesitamos remito para contabilidad",
  "Enviar con boleta",
  "",
];

// ── Direcciones de envío realistas ──────────────────────────────────────

const DIRECCIONES_ENVIO = [
  "Av. Artigas 1240, Las Piedras",
  "Calle Uruguay 567, La Paz",
  "18 de Julio 890, Canelones",
  "Ruta 5 km 24, 18 de Mayo",
  "Bulevar Artigas 345, Las Piedras",
  "Camino Maldonado 1120, Canelones",
  "José E. Rodó 234, La Paz",
  "Av. Giannattasio km 28, El Dorado",
  "Rivera 456, Las Piedras",
  "Sarandí 789, Canelones",
  "Av. Italia 1500, Las Piedras",
  "Treinta y Tres 678, La Paz",
];

// ── Generador de pedido ─────────────────────────────────────────────────

function generarPedidoMinorista(cliente, daysAgoMin, daysAgoMax) {
  const numItems = randomInt(3, 8);
  const items = pickRandomItems(PRODUCTOS, numItems).map(p => {
    const cantidad = randomInt(1, 4);
    return {
      codigo: p.codigo,
      nombre: p.nombre,
      cantidad,
      precioUnitario: p.precioUnitario,
    };
  });
  
  const total = items.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0);
  const sucursalId = BARRIO_SUCURSAL[cliente.barrio] || "las-piedras-herrera";
  
  // 60% retiro, 40% envío
  const esRetiro = Math.random() < 0.6;
  let direccion;
  if (esRetiro) {
    direccion = `RETIRO EN LOCAL: ${SUCURSAL_DIRECCION[sucursalId]}`;
  } else {
    direccion = `🏠 ENVÍO A DOMICILIO: ${randomItem(DIRECCIONES_ENVIO)}`;
  }

  return {
    uid: null,
    clienteNombre: cliente.nombre,
    clienteTelefono: cliente.telefono,
    clienteDireccion: direccion,
    items,
    total,
    notas: randomItem(NOTAS_MINORISTA),
    status: "cargado",
    sucursalId,
    fecha: Timestamp.fromDate(randomDate(daysAgoMin, daysAgoMax)),
  };
}

function generarPedidoMayorista(cliente, daysAgoMin, daysAgoMax) {
  const numItems = randomInt(6, 15);
  const items = pickRandomItems(PRODUCTOS, numItems).map(p => {
    // Mayoristas compran en cantidad (6-48 unidades por producto)
    const cantidad = randomInt(6, 48);
    // Precio mayorista: ~15% descuento
    const precioMayorista = Math.round(p.precioUnitario * 0.85);
    return {
      codigo: p.codigo,
      nombre: p.nombre,
      cantidad,
      precioUnitario: precioMayorista,
    };
  });

  const total = items.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0);
  const sucursalId = BARRIO_SUCURSAL[cliente.barrio] || "las-piedras-herrera";

  // Mayoristas: 80% retiro en local
  const esRetiro = Math.random() < 0.8;
  let direccion;
  if (esRetiro) {
    direccion = `RETIRO EN LOCAL: ${SUCURSAL_DIRECCION[sucursalId]}`;
  } else {
    direccion = `🏠 ENVÍO A DOMICILIO: ${randomItem(DIRECCIONES_ENVIO)} (${cliente.nombre})`;
  }

  return {
    uid: null,
    clienteNombre: cliente.nombre,
    clienteTelefono: cliente.telefono,
    clienteDireccion: direccion,
    items,
    total,
    notas: randomItem(NOTAS_MAYORISTA),
    status: "cargado",
    sucursalId,
    fecha: Timestamp.fromDate(randomDate(daysAgoMin, daysAgoMax)),
  };
}

// ── Generación de 48 pedidos ────────────────────────────────────────────

async function seed() {
  console.log("🌱 Sembrando 48 pedidos simulados en pedidos_globales...\n");
  
  const pedidos = [];

  // ── 32 Minoristas ──
  // Semana actual (0-6 días): 10 pedidos (tendencia creciente)
  for (let i = 0; i < 10; i++) {
    const cliente = CLIENTES_MINORISTAS[i % CLIENTES_MINORISTAS.length];
    pedidos.push(generarPedidoMinorista(cliente, 0, 6));
  }
  // Semana pasada (7-13 días): 8 pedidos
  for (let i = 0; i < 8; i++) {
    const cliente = CLIENTES_MINORISTAS[(i + 10) % CLIENTES_MINORISTAS.length];
    pedidos.push(generarPedidoMinorista(cliente, 7, 13));
  }
  // Hace 2 semanas (14-20 días): 7 pedidos
  for (let i = 0; i < 7; i++) {
    const cliente = CLIENTES_MINORISTAS[(i + 18) % CLIENTES_MINORISTAS.length];
    pedidos.push(generarPedidoMinorista(cliente, 14, 20));
  }
  // Hace 3-4 semanas (21-30 días): 7 pedidos
  for (let i = 0; i < 7; i++) {
    const cliente = CLIENTES_MINORISTAS[(i + 25) % CLIENTES_MINORISTAS.length];
    pedidos.push(generarPedidoMinorista(cliente, 21, 30));
  }

  // ── 16 Mayoristas ──
  // Semana actual: 5 pedidos
  for (let i = 0; i < 5; i++) {
    const cliente = CLIENTES_MAYORISTAS[i % CLIENTES_MAYORISTAS.length];
    pedidos.push(generarPedidoMayorista(cliente, 0, 6));
  }
  // Semana pasada: 4 pedidos
  for (let i = 0; i < 4; i++) {
    const cliente = CLIENTES_MAYORISTAS[(i + 5) % CLIENTES_MAYORISTAS.length];
    pedidos.push(generarPedidoMayorista(cliente, 7, 13));
  }
  // Hace 2 semanas: 4 pedidos
  for (let i = 0; i < 4; i++) {
    const cliente = CLIENTES_MAYORISTAS[(i + 9) % CLIENTES_MAYORISTAS.length];
    pedidos.push(generarPedidoMayorista(cliente, 14, 20));
  }
  // Hace 3-4 semanas: 3 pedidos
  for (let i = 0; i < 3; i++) {
    const cliente = CLIENTES_MAYORISTAS[(i + 13) % CLIENTES_MAYORISTAS.length];
    pedidos.push(generarPedidoMayorista(cliente, 21, 30));
  }

  // Estadísticas
  const totalRevenue = pedidos.reduce((s, p) => s + p.total, 0);
  const minoristas = pedidos.filter(p => p.items.length <= 8 && p.total < 10000);
  const mayoristas = pedidos.filter(p => p.items.length > 8 || p.total >= 10000);

  console.log(`📊 Resumen:`);
  console.log(`   Total pedidos: ${pedidos.length}`);
  console.log(`   Minoristas: ~${minoristas.length}`);
  console.log(`   Mayoristas: ~${mayoristas.length}`);
  console.log(`   Revenue total: $${totalRevenue.toLocaleString("es-UY")} UYU`);
  console.log(`   Ticket promedio: $${Math.round(totalRevenue / pedidos.length).toLocaleString("es-UY")} UYU\n`);

  // Escribir a Firestore
  const ref = collection(db, "pedidos_globales");
  let count = 0;
  
  for (const pedido of pedidos) {
    try {
      const docRef = await addDoc(ref, pedido);
      count++;
      const tipo = pedido.items.length > 8 || pedido.total >= 10000 ? "MAYOR" : "MINOR";
      const fechaStr = pedido.fecha.toDate().toLocaleDateString("es-UY");
      console.log(`  ✅ [${count}/${pedidos.length}] ${tipo} | ${pedido.clienteNombre.padEnd(35)} | ${fechaStr} | $${pedido.total.toLocaleString("es-UY").padStart(8)} | ${pedido.items.length} items | ${docRef.id}`);
    } catch (err) {
      console.error(`  ❌ Error con pedido de ${pedido.clienteNombre}:`, err.message);
    }
  }

  console.log(`\n🎉 Seed completo: ${count}/${pedidos.length} pedidos creados.`);
  console.log(`   Todos con status "cargado" - no aparecerán como pendientes.`);
  console.log(`   Visibles en el tab "Flujo de Clientes" de /admin/publicidad\n`);
  
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
