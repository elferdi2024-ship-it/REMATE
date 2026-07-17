// filepath: scripts/seed-master-orders.mjs
// Master seed para recrear la base de datos de pedidos con 135 pedidos realistas
// Distribuidos en los últimos 2 meses (60 días), con un grupo de hoy para el panel de control.
// Autentica como admin para poder leer y borrar.
// Ejecutar: node scripts/seed-master-orders.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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

// ── Lista de productos ampliada con énfasis en fiambrería y reventa ─────
const PRODUCTOS = [
  // Fiambrería y Salchichería (alta reventa)
  { codigo: "7791300001032", nombre: "Jamón Cocido Sarubbi 200g", precioUnitario: 219 },
  { codigo: "7791300001045", nombre: "Jamón Cocido Schneck Feteado 250g", precioUnitario: 249 },
  { codigo: "7791300001052", nombre: "Salame Tipo Italiano Sarubbi 150g", precioUnitario: 189 },
  { codigo: "7791300001018", nombre: "Salchichas Schneck Cortas x6", precioUnitario: 169 },
  { codigo: "7791300001025", nombre: "Panchos Ottonello Super x6", precioUnitario: 149 },
  { codigo: "7791300001069", nombre: "Panceta Ahumada Sarubbi Feteada 150g", precioUnitario: 179 },
  { codigo: "7791300001076", nombre: "Queso Danbo Conaprole Feteado 250g", precioUnitario: 225 },
  { codigo: "7791300001083", nombre: "Queso Colonia Conaprole Trozo 300g", precioUnitario: 269 },
  { codigo: "7791300001090", nombre: "Queso Muzarella Calcar Feteada 250g", precioUnitario: 199 },

  // Yerba Mate
  { codigo: "7730124002903", nombre: "Yerba Canarias Tradicional 1kg", precioUnitario: 289 },
  { codigo: "7730124002910", nombre: "Yerba Sara Roja 1kg", precioUnitario: 265 },
  { codigo: "7730124002927", nombre: "Yerba Del Cebador 1kg", precioUnitario: 245 },
  { codigo: "7730124002934", nombre: "Yerba Baldo Suave 1kg", precioUnitario: 275 },

  // Aceites y Condimentos
  { codigo: "7790580001018", nombre: "Aceite Óptimo Girasol 900ml", precioUnitario: 149 },
  { codigo: "7790580001032", nombre: "Aceite Oliva Extra Virgen Cocinero 500ml", precioUnitario: 450 },
  { codigo: "7791200001025", nombre: "Mayonesa Hellmanns Receta Casera 475g", precioUnitario: 179 },
  { codigo: "7791200001032", nombre: "Ketchup Hellmanns Regular 400g", precioUnitario: 149 },

  // Almacén Secos (Arroz, Fideos, Harinas)
  { codigo: "7730253000290", nombre: "Arroz Blue Bonnet Semilla 1kg", precioUnitario: 89 },
  { codigo: "7730253000344", nombre: "Arroz Saman Integral 1kg", precioUnitario: 115 },
  { codigo: "7790600000018", nombre: "Fideos Adria Tirabuzón 500g", precioUnitario: 69 },
  { codigo: "7790600000032", nombre: "Fideos Cololo Spaghetti 500g", precioUnitario: 59 },
  { codigo: "7790600001018", nombre: "Harina Cañuelas 000 1kg", precioUnitario: 59 },
  { codigo: "7790600001032", nombre: "Azúcar Bella Unión Comun 1kg", precioUnitario: 75 },

  // Lácteos, Panificados y Café
  { codigo: "7790700001018", nombre: "Leche Entera Conaprole bolsa 1L", precioUnitario: 55 },
  { codigo: "7790700001025", nombre: "Café Águila Molido Clásico 250g", precioUnitario: 189 },
  { codigo: "7790700001039", nombre: "Manteca Conaprole 200g", precioUnitario: 119 },
  { codigo: "7791100001018", nombre: "Pan Lactal Blanco Bimbo 550g", precioUnitario: 129 },

  // Bebidas (Alta rotación)
  { codigo: "7790895000102", nombre: "Coca-Cola Original 2.25L", precioUnitario: 129 },
  { codigo: "7790895000126", nombre: "Fanta Naranja 2.25L", precioUnitario: 119 },
  { codigo: "7790895000157", nombre: "Agua Salus Sin Gas 1.5L", precioUnitario: 65 },
  { codigo: "7730400001234", nombre: "Cerveza Pilsen 1L Retornable", precioUnitario: 115 },
  { codigo: "7730400001241", nombre: "Cerveza Patricia 1L Retornable", precioUnitario: 125 },

  // Higiene y Limpieza
  { codigo: "7790500001018", nombre: "Jabón Nevex Líquido Multiacción 1.2L", precioUnitario: 229 },
  { codigo: "7790500001025", nombre: "Lavandina Sello Rojo Tradicional 1L", precioUnitario: 55 },
  { codigo: "7790500001032", nombre: "Detergente Hurra Limón Concentrado 1.25L", precioUnitario: 149 },
  { codigo: "7790900001018", nombre: "Papel Higiénico Elite Doble Hoja x4", precioUnitario: 149 },
  { codigo: "7790900001039", nombre: "Desodorante Rexona Aerosol 150ml", precioUnitario: 199 },
];

// ── Clientes Minoristas (35 Nombres variados) ───────────────────────────
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
  { nombre: "Patricia Silva", telefono: "099 231 442", barrio: "La Paz" },
  { nombre: "Gonzalo Castro", telefono: "098 122 984", barrio: "Las Piedras" },
  { nombre: "Beatriz Méndez", telefono: "094 771 228", barrio: "Canelones" },
  { nombre: "Estela Pereyra", telefono: "093 115 009", barrio: "El Dorado" },
  { nombre: "Daniela Sosa", telefono: "099 873 112", barrio: "18 de Mayo" },
  { nombre: "Andrés Ledesma", telefono: "098 442 551", barrio: "Las Piedras" },
];

// ── Clientes Mayoristas (Almacenes y Reventa) ───────────────────────────
const CLIENTES_MAYORISTAS = [
  { nombre: "Almacén Don Pedro", telefono: "099 555 101", barrio: "Las Piedras", rut: "211234560019" },
  { nombre: "Autoservice La Esquina", telefono: "098 555 202", barrio: "La Paz", rut: "211234560026" },
  { nombre: "Despensa El Vecino", telefono: "099 555 303", barrio: "Canelones", rut: "211234560033" },
  { nombre: "Mini Market San José", telefono: "098 555 404", barrio: "18 de Mayo", rut: "211234560040" },
  { nombre: "Almacén Los Hermanos", telefono: "099 555 505", barrio: "El Dorado", rut: "211234560057" },
  { nombre: "Distribuidora Sur SRL", telefono: "098 555 606", barrio: "Las Piedras", rut: "211234560064" },
  { nombre: "Kiosco y Almacén Rincón", telefono: "099 555 707", barrio: "La Paz", rut: "211234560071" },
  { nombre: "Autoservice Don Carlos", telefono: "098 555 808", barrio: "Canelones", rut: "211234560088" },
  { nombre: "Supermercado Barrial", telefono: "099 555 909", barrio: "Las Piedras", rut: "211234560095" },
  { nombre: "Almacén La Criolla", telefono: "098 555 010", barrio: "18 de Mayo", rut: "211234560101" },
  { nombre: "Supermercado El Sol", telefono: "099 900 811", barrio: "La Paz", rut: "211234560901" },
  { nombre: "Almacén Los Amigos", telefono: "098 700 600", barrio: "Canelones", rut: "211234560902" },
  { nombre: "Autoservice Central", telefono: "099 800 700", barrio: "Las Piedras", rut: "211234560903" },
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
  "José E. Rodó 234, La Paz",
  "Av. Giannattasio km 28, El Dorado",
];

// Helper functions
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

// ── Generar Pedido ──────────────────────────────────────────────────────
function crearPedidoSimulado(cliente, daysAgo) {
  const esMayor = !!cliente.rut;
  const numItems = esMayor ? randomInt(6, 14) : randomInt(3, 7);
  
  const items = pickRandomItems(PRODUCTOS, numItems).map(p => {
    // Los mayoristas compran en cantidad (cajones, hormas, packs)
    const cantidad = esMayor ? randomInt(6, 40) : randomInt(1, 4);
    // 15% descuento mayorista
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

  // Fecha
  const d = new Date();
  if (daysAgo === 0) {
    // HOY
    d.setHours(randomInt(8, 20), randomInt(0, 59));
  } else {
    d.setDate(d.getDate() - daysAgo);
    d.setHours(randomInt(9, 19), randomInt(0, 59));
  }

  const esRetiro = Math.random() < 0.65;
  const direccion = esRetiro 
    ? `RETIRO EN LOCAL: ${SUCURSAL_DIRECCION[sucursalId]}`
    : `🏠 ENVÍO A DOMICILIO: ${randomItem(DIRECCIONES_ENVIO)} (Cliente: ${cliente.nombre})`;

  return {
    uid: null,
    clienteNombre: cliente.nombre,
    clienteTelefono: cliente.telefono,
    clienteDireccion: direccion,
    items,
    total,
    notas: esMayor ? "Pedido de reventa fiambrería / almacén" : "",
    status: "cargado",
    sucursalId,
    fecha: Timestamp.fromDate(d),
  };
}

async function runSeed() {
  console.log("🔒 Autenticando como admin...");
  const auth = getAuth(app);
  await signInWithEmailAndPassword(auth, "adminremate1@elremate.com", "pedidosremate");
  console.log("🔓 Autenticación exitosa.");

  console.log("🧹 Limpiando base de datos de pedidos_globales...");
  const colRef = collection(db, "pedidos_globales");
  const querySnap = await getDocs(colRef);
  
  console.log(`🗑️ Eliminando ${querySnap.size} documentos antiguos...`);
  const deletePromises = querySnap.docs.map(d => deleteDoc(doc(db, "pedidos_globales", d.id)));
  await Promise.all(deletePromises);
  console.log("✨ Limpieza completada.");

  console.log("🌱 Generando 135 pedidos simulados bien distribuidos...");
  const pedidos = [];

  // 1. Crear 15 pedidos para HOY (para que se vean en /admin/pedidos)
  for (let i = 0; i < 15; i++) {
    const cliente = i % 3 === 0 ? randomItem(CLIENTES_MAYORISTAS) : randomItem(CLIENTES_MINORISTAS);
    pedidos.push(crearPedidoSimulado(cliente, 0));
  }

  // 2. Crear 10 pedidos para AYER
  for (let i = 0; i < 10; i++) {
    const cliente = i % 3 === 0 ? randomItem(CLIENTES_MAYORISTAS) : randomItem(CLIENTES_MINORISTAS);
    pedidos.push(crearPedidoSimulado(cliente, 1));
  }

  // 3. Crear 110 pedidos distribuidos en los últimos 60 días (días 2 a 60)
  for (let i = 0; i < 110; i++) {
    const daysAgo = randomInt(2, 60);
    const cliente = i % 3 === 0 ? randomItem(CLIENTES_MAYORISTAS) : randomItem(CLIENTES_MINORISTAS);
    pedidos.push(crearPedidoSimulado(cliente, daysAgo));
  }

  // Ordenar pedidos por fecha de forma ascendente para insertar ordenadamente
  pedidos.sort((a, b) => a.fecha.seconds - b.fecha.seconds);

  // Estadísticas estimadas
  const totalRev = pedidos.reduce((s, p) => s + p.total, 0);
  const mayoristas = pedidos.filter(p => p.total >= 8000).length;
  const minoristas = pedidos.length - mayoristas;

  console.log(`📊 Planificación de Carga:`);
  console.log(`   - Total pedidos: ${pedidos.length}`);
  console.log(`   - Pedidos de HOY: 15`);
  console.log(`   - Pedidos de AYER: 10`);
  console.log(`   - Pedidos Históricos: 110`);
  console.log(`   - Mayoristas (Reventa): ${mayoristas}`);
  console.log(`   - Minoristas: ${minoristas}`);
  console.log(`   - Revenue Estimado: ${totalRev.toLocaleString("es-UY")} UYU\n`);

  // Insertar en Firestore
  let count = 0;
  for (const pedido of pedidos) {
    try {
      const docRef = await addDoc(colRef, pedido);
      count++;
      const esHoyStr = pedido.fecha.toDate().toDateString() === new Date().toDateString() ? "HOY " : "HIST";
      const fechaStr = pedido.fecha.toDate().toLocaleDateString("es-UY");
      const tipoStr = pedido.total >= 8000 ? "MAYOR" : "MINOR";
      console.log(`  ✅ [${count}/135] [${esHoyStr}] [${fechaStr}] | ${tipoStr} | ${pedido.clienteNombre.padEnd(28)} | $${pedido.total.toLocaleString("es-UY").padStart(7)} UYU | ${docRef.id}`);
    } catch (e) {
      console.error(`  ❌ Error con pedido de ${pedido.clienteNombre}:`, e.message);
    }
  }

  console.log(`\n🎉 ¡Seed completado! ${count}/135 pedidos sembrados con éxito.`);
  console.log("   - Distribuidos uniformemente en 2 meses (60 días).");
  console.log("   - Todos con estado 'cargado' para mantener limpia la bandeja de entrada.");
  process.exit(0);
}

runSeed().catch(err => {
  console.error("❌ Error en el seed master:", err);
  process.exit(1);
});
