// filepath: src/app/api/seed-master/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";

// Catálogo de productos uruguayos reales
const PRODUCTOS = [
  // #1 Yerba Canarias (Top 1 intencional)
  { codigo: "7730124002903", nombre: "Yerba Canarias Tradicional 1kg", precioUnitario: 289 },
  
  // Lácteos Conaprole (muy comunes)
  { codigo: "7790700001018", nombre: "Leche Entera Conaprole bolsa 1L", precioUnitario: 55 },
  { codigo: "7790800001032", nombre: "Dulce de Leche Conaprole 450g", precioUnitario: 159 },
  { codigo: "7790700001039", nombre: "Manteca Conaprole 200g", precioUnitario: 119 },
  { codigo: "7791300001076", nombre: "Queso Danbo Conaprole Feteado 250g", precioUnitario: 225 },

  // Almacén Uruguayo
  { codigo: "7730253000290", nombre: "Arroz Blue Bonnet Semilla 1kg", precioUnitario: 89 },
  { codigo: "7730253000344", nombre: "Arroz Saman Integral 1kg", precioUnitario: 115 },
  { codigo: "7790600000032", nombre: "Fideos Cololo Spaghetti 500g", precioUnitario: 59 },
  { codigo: "7790600001032", nombre: "Azúcar Bella Unión Comun 1kg", precioUnitario: 75 },

  // Fiambrería y reventa (importantes pero dosificados por debajo de Yerba Canarias)
  { codigo: "7791300001032", nombre: "Jamón Cocido Sarubbi 200g", precioUnitario: 219 },
  { codigo: "7791300001045", nombre: "Jamón Cocido Schneck Feteado 250g", precioUnitario: 249 },
  { codigo: "7791300001018", nombre: "Salchichas Schneck Cortas x6", precioUnitario: 169 },
  { codigo: "7791300001025", nombre: "Panchos Ottonello Super x6", precioUnitario: 149 },
  { codigo: "7791300001090", nombre: "Queso Muzarella Calcar Feteada 250g", precioUnitario: 199 },

  // Bebidas y otros
  { codigo: "7790895000102", nombre: "Coca-Cola Original 2.25L", precioUnitario: 129 },
  { codigo: "7790895000157", nombre: "Agua Salus Sin Gas 1.5L", precioUnitario: 65 },
  { codigo: "7730400001234", nombre: "Cerveza Pilsen 1L Retornable", precioUnitario: 115 },
];

const CLIENTES_MINORISTAS = [
  { nombre: "María González", telefono: "099 123 456", sucursalId: "canelones" },
  { nombre: "Juan Rodríguez", telefono: "098 765 432", sucursalId: "las-piedras-herrera" },
  { nombre: "Ana Martínez", telefono: "099 234 567", sucursalId: "canelones" },
  { nombre: "Carlos Fernández", telefono: "098 345 678", sucursalId: "18 de Mayo" },
  { nombre: "Laura Pérez", telefono: "099 456 789", sucursalId: "el-dorado" },
  { nombre: "Diego Silva", telefono: "098 567 890", sucursalId: "la-paz" },
  { nombre: "Valentina López", telefono: "099 678 901", sucursalId: "canelones" },
  { nombre: "Martín García", telefono: "098 789 012", sucursalId: "canelones" },
  { nombre: "Patricia Silva", telefono: "099 231 442", sucursalId: "canelones" },
  { nombre: "Gonzalo Castro", telefono: "098 122 984", sucursalId: "las-piedras-herrera" },
  { nombre: "Beatriz Méndez", telefono: "094 771 228", sucursalId: "canelones" },
  { nombre: "Daniela Sosa", telefono: "099 873 112", sucursalId: "18 de Mayo" },
  { nombre: "Andrés Ledesma", telefono: "098 442 551", sucursalId: "las-piedras-herrera" },
];

const CLIENTES_MAYORISTAS = [
  { nombre: "Almacén Don Pedro", telefono: "099 555 101", sucursalId: "canelones", rut: "211234560019" },
  { nombre: "Autoservice La Esquina", telefono: "098 555 202", sucursalId: "la-paz", rut: "211234560026" },
  { nombre: "Despensa El Vecino", telefono: "099 555 303", sucursalId: "canelones", rut: "211234560033" },
  { nombre: "Mini Market San José", telefono: "098 555 404", sucursalId: "18 de Mayo", rut: "211234560040" },
  { nombre: "Almacén Los Hermanos", telefono: "099 555 505", sucursalId: "el-dorado", rut: "211234560057" },
  { nombre: "Distribuidora Sur SRL", telefono: "098 555 606", sucursalId: "las-piedras-herrera", rut: "211234560064" },
  { nombre: "Supermercado El Sol", telefono: "099 900 811", sucursalId: "canelones", rut: "211234560901" },
  { nombre: "Autoservice Central", telefono: "099 800 700", sucursalId: "canelones", rut: "211234560903" },
];

const SUCURSAL_DIRECCION: Record<string, string> = {
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

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    // Proteger el reset con un secret básico
    if (secret !== "remate2026") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Admin SDK no inicializado" }, { status: 500 });
    }

    // 1. Limpiar pedidos_globales
    const colRef = db.collection("pedidos_globales");
    const snap = await colRef.get();
    const batch = db.batch();
    snap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Eliminados ${snap.size} pedidos en batch.`);

    // 2. Generar 135 pedidos simulados
    const pedidos = [];

    for (let i = 0; i < 135; i++) {
      let daysAgo = 0;
      if (i >= 15 && i < 25) {
        daysAgo = 1; // Ayer
      } else if (i >= 25) {
        daysAgo = randomInt(2, 60); // 2 a 60 días atrás
      }

      // 30% Mayoristas, 70% Minoristas
      const esMayorista = i % 3 === 0;
      const cliente = esMayorista ? randomItem(CLIENTES_MAYORISTAS) : randomItem(CLIENTES_MINORISTAS);

      // Priorizar Canelones asignándola al 45% de los pedidos
      let sucursalId = cliente.sucursalId;
      if (Math.random() < 0.45) {
        sucursalId = "canelones";
      }

      // Armar ítems del pedido
      const items = [];
      
      // Forzar Yerba Canarias (Top 1) en el 80% de los pedidos
      if (Math.random() < 0.80) {
        const cantCanarias = esMayorista ? randomInt(12, 60) : randomInt(1, 4);
        items.push({
          codigo: "7730124002903",
          nombre: "Yerba Canarias Tradicional 1kg",
          cantidad: cantCanarias,
          precioUnitario: esMayorista ? 245 : 289,
        });
      }

      // Resto de los productos
      const pool = PRODUCTOS.filter(p => p.codigo !== "7730124002903");
      const cantItemsAdicionales = esMayorista ? randomInt(5, 10) : randomInt(2, 5);
      const itemsElegidos = pickRandomItems(pool, cantItemsAdicionales);

      itemsElegidos.forEach(p => {
        const cantidad = esMayorista ? randomInt(6, 30) : randomInt(1, 3);
        const precioUnitario = esMayorista ? Math.round(p.precioUnitario * 0.85) : p.precioUnitario;
        items.push({
          codigo: p.codigo,
          nombre: p.nombre,
          cantidad,
          precioUnitario,
        });
      });

      const total = items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);

      // Fecha
      const fechaObj = new Date();
      if (daysAgo > 0) {
        fechaObj.setDate(fechaObj.getDate() - daysAgo);
      }
      fechaObj.setHours(randomInt(8, 20), randomInt(0, 59));

      const esRetiro = Math.random() < 0.6;
      const direccion = esRetiro
        ? `RETIRO EN LOCAL: ${SUCURSAL_DIRECCION[sucursalId] || SUCURSAL_DIRECCION["canelones"]}`
        : `🏠 ENVÍO A DOMICILIO: ${randomItem(DIRECCIONES_ENVIO)}`;

      pedidos.push({
        uid: null,
        clienteNombre: cliente.nombre,
        clienteTelefono: cliente.telefono,
        clienteDireccion: direccion,
        items,
        total,
        notas: esMayorista ? "Pedido mayorista de reposición comercial" : "",
        status: "cargado",
        sucursalId,
        fecha: Timestamp.fromDate(fechaObj),
      });
    }

    // Insertar a Firestore en lotes de 50 (Firestore limit de batch es 500, así que podemos hacer todo en uno)
    const writeBatch = db.batch();
    pedidos.forEach((p) => {
      const docRef = colRef.doc();
      writeBatch.set(docRef, p);
    });
    await writeBatch.commit();

    return NextResponse.json({
      ok: true,
      mensaje: "Base de datos reseteada y sembrada con 135 pedidos con éxito.",
      sucursalTop: "Canelones",
      productoTop: "Yerba Canarias Tradicional 1kg",
      totalPedidos: 135,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
