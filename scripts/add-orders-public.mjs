// filepath: scripts/add-orders-public.mjs
// Agrega 100 pedidos simulados adicionales y realistas (enfoque fiambrería y reventa)
// Distribuidos en los últimos 2 meses. No requiere autenticación.
// Ejecutar: node scripts/add-orders-public.mjs

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

// Productos fiambrería y reventa
const PRODUCTOS = [
  { codigo: "7791300001032", nombre: "Jamón Cocido Sarubbi 200g", precioUnitario: 219 },
  { codigo: "7791300001045", nombre: "Jamón Cocido Schneck Feteado 250g", precioUnitario: 249 },
  { codigo: "7791300001052", nombre: "Salame Tipo Italiano Sarubbi 150g", precioUnitario: 189 },
  { codigo: "7791300001018", nombre: "Salchichas Schneck Cortas x6", precioUnitario: 169 },
  { codigo: "7791300001025", nombre: "Panchos Ottonello Super x6", precioUnitario: 149 },
  { codigo: "7791300001069", nombre: "Panceta Ahumada Sarubbi Feteada 150g", precioUnitario: 179 },
  { codigo: "7791300001076", nombre: "Queso Danbo Conaprole Feteado 250g", precioUnitario: 225 },
  { codigo: "7791300001083", nombre: "Queso Colonia Conaprole Trozo 300g", precioUnitario: 269 },
  { codigo: "7791300001090", nombre: "Queso Muzarella Calcar Feteada 250g", precioUnitario: 199 },
  { codigo: "7730124002903", nombre: "Yerba Canarias Tradicional 1kg", precioUnitario: 289 },
  { codigo: "7730124002910", nombre: "Yerba Sara Roja 1kg", precioUnitario: 265 },
  { codigo: "7790580001018", nombre: "Aceite Óptimo Girasol 900ml", precioUnitario: 149 },
  { codigo: "7730253000290", nombre: "Arroz Blue Bonnet Semilla 1kg", precioUnitario: 89 },
  { codigo: "7790600000032", nombre: "Fideos Cololo Spaghetti 500g", precioUnitario: 59 },
  { codigo: "7790700001018", nombre: "Leche Entera Conaprole bolsa 1L", precioUnitario: 55 },
  { codigo: "7790895000102", nombre: "Coca-Cola Original 2.25L", precioUnitario: 129 },
  { codigo: "7790895000157", nombre: "Agua Salus Sin Gas 1.5L", precioUnitario: 65 },
];

const CLIENTES_MINORISTAS = [
  { nombre: "María González", telefono: "099 123 456", barrio: "La Paz" },
  { nombre: "Juan Rodríguez", telefono: "098 765 432", barrio: "Las Piedras" },
  { nombre: "Ana Martínez", telefono: "099 234 567", barrio: "Canelones" },
  { nombre: "Carlos Fernández", telefono: "098 345 678", barrio: "18 de Mayo" },
  { nombre: "Laura Pérez", telefono: "099 456 789", barrio: "El Dorado" },
  { nombre: "Diego Silva", telefono: "098 567 890", barrio: "La Paz" },
  { nombre: "Valentina López", telefono: "099 678 901", barrio: "Las Piedras" },
  { nombre: "Martín García", telefono: "098 789 012", barrio: "Canelones" },
  { nombre: "Beatriz Méndez", telefono: "094 771 228", barrio: "Canelones" },
  { nombre: "Daniela Sosa", telefono: "099 873 112", barrio: "18 de Mayo" },
  { nombre: "Andrés Ledesma", telefono: "098 442 551", barrio: "Las Piedras" },
];

const CLIENTES_MAYORISTAS = [
  { nombre: "Almacén Don Pedro", telefono: "099 555 101", barrio: "Las Piedras", rut: "211234560019" },
  { nombre: "Autoservice La Esquina", telefono: "098 555 202", barrio: "La Paz", rut: "211234560026" },
  { nombre: "Despensa El Vecino", telefono: "099 555 303", barrio: "Canelones", rut: "211234560033" },
  { nombre: "Mini Market San José", telefono: "098 555 404", barrio: "18 de Mayo", rut: "211234560040" },
  { nombre: "Almacén Los Hermanos", telefono: "099 555 505", barrio: "El Dorado", rut: "211234560057" },
  { nombre: "Distribuidora Sur SRL", telefono: "098 555 606", barrio: "Las Piedras", rut: "211234560064" },
  { nombre: "Supermercado El Sol", telefono: "099 900 811", barrio: "La Paz", rut: "211234560901" },
];

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
};

const DIRECCIONES_ENVIO = [
  "Av. Artigas 1240, Las Piedras",
  "Calle Uruguay 567, La Paz",
  "18 de Julio 890, Canelones",
  "Ruta 5 km 24, 18 de Mayo",
  "Bulevar Artigas 345, Las Piedras",
];

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

function crearPedidoSimulado(cliente, daysAgo) {
  const esMayor = !!cliente.rut;
  const numItems = esMayor ? randomInt(6, 12) : randomInt(3, 7);
  
  const items = pickRandomItems(PRODUCTOS, numItems).map(p => {
    const cantidad = esMayor ? randomInt(8, 35) : randomInt(1, 4);
    const precioUnitario = esMayor ? Math.round(p.precioUnitario * 0.85) : p.precioUnitario;
    return {
      codigo: p.codigo,
      nombre: p.nombre,
      cantidad,
      precioUnitario,
    };
  });

  const total = items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);
  const sucursalId = BARRIO_SUCURSAL[cliente.barrio] || "las-piedras-herrera";

  const d = new Date();
  if (daysAgo === 0) {
    d.setHours(randomInt(8, 20), randomInt(0, 59));
  } else {
    d.setDate(d.getDate() - daysAgo);
    d.setHours(randomInt(9, 19), randomInt(0, 59));
  }

  const esRetiro = Math.random() < 0.6;
  const direccion = esRetiro 
    ? `RETIRO EN LOCAL: ${SUCURSAL_DIRECCION[sucursalId]}`
    : `🏠 ENVÍO A DOMICILIO: ${randomItem(DIRECCIONES_ENVIO)}`;

  return {
    uid: null,
    clienteNombre: cliente.nombre,
    clienteTelefono: cliente.telefono,
    clienteDireccion: direccion,
    items,
    total,
    notas: esMayor ? "Pedido de fiambrería para reventa comercial" : "",
    status: "cargado",
    sucursalId,
    fecha: Timestamp.fromDate(d),
  };
}

async function addOrders() {
  console.log("🌱 Agregando 100 pedidos simulados públicos (distribuidos en 2 meses)...");
  
  const pedidos = [];

  // 1. 10 pedidos para HOY (para bandeja diaria)
  for (let i = 0; i < 10; i++) {
    const cliente = i % 3 === 0 ? randomItem(CLIENTES_MAYORISTAS) : randomItem(CLIENTES_MINORISTAS);
    pedidos.push(crearPedidoSimulado(cliente, 0));
  }

  // 2. 10 pedidos para AYER
  for (let i = 0; i < 10; i++) {
    const cliente = i % 3 === 0 ? randomItem(CLIENTES_MAYORISTAS) : randomItem(CLIENTES_MINORISTAS);
    pedidos.push(crearPedidoSimulado(cliente, 1));
  }

  // 3. 80 pedidos distribuidos en los últimos 2 meses (días 2 a 60)
  for (let i = 0; i < 80; i++) {
    const daysAgo = randomInt(2, 60);
    const cliente = i % 3 === 0 ? randomItem(CLIENTES_MAYORISTAS) : randomItem(CLIENTES_MINORISTAS);
    pedidos.push(crearPedidoSimulado(cliente, daysAgo));
  }

  const ref = collection(db, "pedidos_globales");
  let count = 0;

  for (const pedido of pedidos) {
    try {
      const docRef = await addDoc(ref, pedido);
      count++;
      const fechaStr = pedido.fecha.toDate().toLocaleDateString("es-UY");
      const tipo = pedido.total >= 8000 ? "MAYOR" : "MINOR";
      console.log(`  ✅ [${count}/100] | ${tipo} | ${pedido.clienteNombre.padEnd(25)} | $${pedido.total.toLocaleString("es-UY").padStart(7)} UYU | ${fechaStr} | ${docRef.id}`);
    } catch (e) {
      console.error("  ❌ Error:", e.message);
    }
  }

  console.log(`\n🎉 Completado: ${count}/100 pedidos adicionales creados y distribuidos.`);
  process.exit(0);
}

addOrders().catch(err => {
  console.error(err);
  process.exit(1);
});
