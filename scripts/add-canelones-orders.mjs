// filepath: scripts/add-canelones-orders.mjs
// Agrega 120 pedidos simulados de alto volumen asignados exclusivamente a Canelones.
// Esto asegura que Canelones sea la sucursal número 1 en ventas y Yerba Canarias sea el producto Top 1.
// Ejecutar: node scripts/add-canelones-orders.mjs

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

// Productos de alta rotación (Yerba Canarias como #1)
const PRODUCTOS = [
  { codigo: "7730124002903", nombre: "Yerba Canarias Tradicional 1kg", precioUnitario: 289 },
  { codigo: "7790700001018", nombre: "Leche Entera Conaprole bolsa 1L", precioUnitario: 55 },
  { codigo: "7790800001032", nombre: "Dulce de Leche Conaprole 450g", precioUnitario: 159 },
  { codigo: "7730253000290", nombre: "Arroz Blue Bonnet Semilla 1kg", precioUnitario: 89 },
  { codigo: "7790600000032", nombre: "Fideos Cololo Spaghetti 500g", precioUnitario: 59 },
  { codigo: "7791300001032", nombre: "Jamón Cocido Sarubbi 200g", precioUnitario: 219 },
  { codigo: "7791300001045", nombre: "Jamón Cocido Schneck Feteado 250g", precioUnitario: 249 },
  { codigo: "7791300001018", nombre: "Salchichas Schneck Cortas x6", precioUnitario: 169 },
  { codigo: "7790895000102", nombre: "Coca-Cola Original 2.25L", precioUnitario: 129 },
  { codigo: "7730400001234", nombre: "Cerveza Pilsen 1L Retornable", precioUnitario: 115 },
];

const CLIENTES_MINORISTAS = [
  { nombre: "Laura Pérez", telefono: "099 456 789" },
  { nombre: "María González", telefono: "099 123 456" },
  { nombre: "Ana Martínez", telefono: "099 234 567" },
  { nombre: "Valentina López", telefono: "099 678 901" },
  { nombre: "Martín García", telefono: "098 789 012" },
  { nombre: "Patricia Silva", telefono: "099 231 442" },
];

const CLIENTES_MAYORISTAS = [
  { nombre: "Almacén Don Pedro", telefono: "099 555 101", rut: "211234560019" },
  { nombre: "Despensa El Vecino", telefono: "099 555 303", rut: "211234560033" },
  { nombre: "Supermercado El Sol", telefono: "099 900 811", rut: "211234560901" },
  { nombre: "Autoservice Central", telefono: "099 800 700", rut: "211234560903" },
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

function crearPedidoCanelones(esMayorista, daysAgo) {
  const cliente = esMayorista ? randomItem(CLIENTES_MAYORISTAS) : randomItem(CLIENTES_MINORISTAS);
  const items = [];

  // Forzar Yerba Canarias (Top 1) en todos los pedidos de Canelones
  const cantCanarias = esMayorista ? randomInt(30, 80) : randomInt(2, 6);
  items.push({
    codigo: "7730124002903",
    nombre: "Yerba Canarias Tradicional 1kg",
    cantidad: cantCanarias,
    precioUnitario: esMayorista ? 245 : 289,
  });

  // Agregar otros productos locales
  const pool = PRODUCTOS.filter(p => p.codigo !== "7730124002903");
  const cantItemsAdicionales = esMayorista ? randomInt(4, 8) : randomInt(1, 3);
  const itemsElegidos = pickRandomItems(pool, cantItemsAdicionales);

  itemsElegidos.forEach(p => {
    const cantidad = esMayorista ? randomInt(10, 40) : randomInt(1, 3);
    const precioUnitario = esMayorista ? Math.round(p.precioUnitario * 0.85) : p.precioUnitario;
    items.push({
      codigo: p.codigo,
      nombre: p.nombre,
      cantidad,
      precioUnitario,
    });
  });

  const total = items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);

  const d = new Date();
  if (daysAgo > 0) {
    d.setDate(d.getDate() - daysAgo);
  }
  d.setHours(randomInt(8, 20), randomInt(0, 59));

  const esRetiro = Math.random() < 0.7;
  const direccion = esRetiro 
    ? "RETIRO EN LOCAL: Sucursal Canelones (General Artigas 118)"
    : "🏠 ENVÍO A DOMICILIO: Canelones Centro";

  return {
    uid: null,
    clienteNombre: cliente.nombre,
    clienteTelefono: cliente.telefono,
    clienteDireccion: direccion,
    items,
    total,
    notas: esMayorista ? "Pedido mayorista Canelones Distribución" : "",
    status: "cargado",
    sucursalId: "canelones",
    fecha: Timestamp.fromDate(d),
  };
}

async function run() {
  console.log("🚀 Agregando 120 pedidos exclusivos para Canelones (fuerza bruta)...");
  
  const pedidos = [];

  // 40 Mayoristas de alto valor ($20,000 - $45,000 UYU)
  for (let i = 0; i < 40; i++) {
    const daysAgo = randomInt(0, 60);
    pedidos.push(crearPedidoCanelones(true, daysAgo));
  }

  // 80 Minoristas ($1,500 - $4,500 UYU)
  for (let i = 0; i < 80; i++) {
    const daysAgo = randomInt(0, 60);
    pedidos.push(crearPedidoCanelones(false, daysAgo));
  }

  const ref = collection(db, "pedidos_globales");
  let count = 0;
  let totalMontoAdded = 0;

  for (const pedido of pedidos) {
    try {
      const docRef = await addDoc(ref, pedido);
      count++;
      totalMontoAdded += pedido.total;
      console.log(`  ✅ [${count}/120] | Canelones | $${pedido.total.toLocaleString("es-UY").padStart(7)} UYU | ${docRef.id}`);
    } catch (e) {
      console.error("  ❌ Error:", e.message);
    }
  }

  console.log(`\n🎉 Completado: ${count}/120 pedidos de Canelones creados.`);
  console.log(`💰 Monto total añadido a Canelones: $${totalMontoAdded.toLocaleString("es-UY")} UYU.`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
