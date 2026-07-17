// filepath: scripts/seed-more-orders.mjs
// Seeda 35 pedidos simulados adicionales, la mayoría fechados hoy para que aparezcan en /admin/pedidos
// Ejecutar: node scripts/seed-more-orders.mjs

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

// Catálogo de productos reales
const PRODUCTOS = [
  { codigo: "7730124002903", nombre: "Yerba Canarias Tradicional 1kg", precioUnitario: 289 },
  { codigo: "7730124002910", nombre: "Yerba Sara Roja 1kg", precioUnitario: 265 },
  { codigo: "7790580001018", nombre: "Aceite Óptimo Girasol 900ml", precioUnitario: 149 },
  { codigo: "7730253000290", nombre: "Arroz Blue Bonnet 1kg", precioUnitario: 89 },
  { codigo: "7790600000018", nombre: "Fideos Adria Tirabuzón 500g", precioUnitario: 69 },
  { codigo: "7730300001234", nombre: "Galletitas La Banderita Sin Sal 380g", precioUnitario: 99 },
  { codigo: "7790895000102", nombre: "Coca-Cola 2.25L", precioUnitario: 129 },
  { codigo: "7790500001018", nombre: "Jabón Nevex Líquido 1.2L", precioUnitario: 229 },
  { codigo: "7790700001018", nombre: "Leche Entera Conaprole 1L", precioUnitario: 55 },
  { codigo: "7790800001032", nombre: "Dulce de Leche Conaprole 450g", precioUnitario: 159 },
  { codigo: "7791300001032", nombre: "Jamón Cocido Sarubbi 200g", precioUnitario: 219 },
];

const CLIENTES = [
  { nombre: "Patricia Silva", telefono: "099 231 442", barrio: "La Paz" },
  { nombre: "Gonzalo Castro", telefono: "098 122 984", barrio: "Las Piedras" },
  { nombre: "Beatriz Méndez", telefono: "094 771 228", barrio: "Canelones" },
  { nombre: "Estela Pereyra", telefono: "093 115 009", barrio: "El Dorado" },
  { nombre: "Daniela Sosa", telefono: "099 873 112", barrio: "18 de Mayo" },
  { nombre: "Andrés Ledesma", telefono: "098 442 551", barrio: "Las Piedras" },
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

// Genera una fecha de HOY con hora aleatoria
function getTodayDate() {
  const d = new Date();
  d.setHours(randomInt(8, 20), randomInt(0, 59), randomInt(0, 59));
  return d;
}

async function seedMore() {
  console.log("🌱 Generando 35 pedidos simulados adicionales (la mayoría fechados HOY)...");
  
  const pedidos = [];

  for (let i = 0; i < 35; i++) {
    const cliente = randomItem(CLIENTES);
    const esMayor = !!cliente.rut;
    
    const numItems = esMayor ? randomInt(6, 12) : randomInt(3, 7);
    const items = pickRandomItems(PRODUCTOS, numItems).map(p => {
      const cantidad = esMayor ? randomInt(6, 36) : randomInt(1, 4);
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

    // 85% de probabilidad de ser fechado HOY para que se muestre en el panel diario de pedidos
    const esHoy = Math.random() < 0.85;
    let fecha;
    if (esHoy) {
      fecha = getTodayDate();
    } else {
      // 1 a 3 días atrás
      const d = new Date();
      d.setDate(d.getDate() - randomInt(1, 3));
      d.setHours(randomInt(9, 18), randomInt(0, 59));
      fecha = d;
    }

    const esRetiro = Math.random() < 0.6;
    const direccion = esRetiro 
      ? `RETIRO EN LOCAL: ${SUCURSAL_DIRECCION[sucursalId]}`
      : `🏠 ENVÍO A DOMICILIO: Calle Uruguay ${randomInt(100, 2500)}, Canelones`;

    pedidos.push({
      uid: null,
      clienteNombre: cliente.nombre,
      clienteTelefono: cliente.telefono,
      clienteDireccion: direccion,
      items,
      total,
      notas: esMayor ? "Pedido de reposición rápida" : "",
      status: "cargado",
      sucursalId,
      fecha: Timestamp.fromDate(fecha),
    });
  }

  const ref = collection(db, "pedidos_globales");
  let count = 0;

  for (const pedido of pedidos) {
    try {
      const docRef = await addDoc(ref, pedido);
      count++;
      const fechaStr = pedido.fecha.toDate().toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });
      const esHoyStr = pedido.fecha.toDate().toDateString() === new Date().toDateString() ? "HOY" : "HIST";
      console.log(`  ✅ [${count}/35] [${esHoyStr}] | ${pedido.clienteNombre.padEnd(25)} | $${pedido.total.toLocaleString("es-UY").padStart(7)} | ${pedido.items.length} items | ${docRef.id}`);
    } catch (err) {
      console.error(`  ❌ Error con pedido de ${pedido.clienteNombre}:`, err.message);
    }
  }

  console.log(`\n🎉 Completado: ${count}/35 pedidos adicionales creados.`);
  process.exit(0);
}

seedMore().catch(err => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
