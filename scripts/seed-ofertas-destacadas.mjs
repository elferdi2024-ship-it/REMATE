// filepath: scripts/seed-ofertas-destacadas.mjs
// Run with: node scripts/seed-ofertas-destacadas.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

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

const PROMOS_DESTACADAS = [
  {
    id: "papas-mccain-2500g",
    titulo: "Papas Mc Cain Corte Fino 2.5kg",
    precio: 250,
    cantidad: 1,
    imagen: "/ofertas/papas-mccain.jpg",
    activa: true,
    sucursalId: null,
  },
  {
    id: "fideos-granny-3x99",
    titulo: "Fideos Granny 400g (Promo 3 x $99)",
    precio: 99,
    cantidad: 3,
    imagen: "/ofertas/fideos-granny.jpg",
    activa: true,
    sucursalId: null,
  },
  {
    id: "vino-el-taipero-2x180",
    titulo: "Vino El Taipero Bodega Rosés 1L (2 x $180)",
    precio: 180,
    cantidad: 2,
    imagen: "/ofertas/vino-el-taipero.jpg",
    activa: true,
    sucursalId: null,
  },
  {
    id: "dulce-de-leche-colonial-500g",
    titulo: "Dulce de Leche Colonial 500g",
    precio: 50,
    cantidad: 1,
    imagen: "/ofertas/dulce-de-leche-colonial.jpg",
    activa: true,
    sucursalId: null,
  },
  {
    id: "mortadela-arizona-100g",
    titulo: "Mortadela Arizona en Fetas ($17 x 100g)",
    precio: 17,
    cantidad: 1,
    imagen: "/ofertas/mortadela-arizona.jpg",
    activa: true,
    sucursalId: null,
  },
  {
    id: "combo-mayonesa-cololo-atun",
    titulo: "Combo Mayonesa Cololo 200g + Atún Fresco Mar",
    precio: 90,
    cantidad: 1,
    imagen: "/ofertas/combo-mayonesa-atun.jpg",
    activa: true,
    sucursalId: null,
  },
];

const PRODUCTOS_OFERTAS = [
  {
    codigo: "5797",
    nombre: "PAPAS CONG. MC CAIN CORTE FINO 2.5KG",
    precioOriginal: 325,
    precioOferta: 250,
    descuento: 23,
    imagen: "/ofertas/papas-mccain.jpg",
    categoria: "Congelados",
    destacado: true,
  },
  {
    codigo: "7730430004349",
    nombre: "FIDEOS GRANNY 400G (PROMO 3X$99)",
    precioOriginal: 120,
    precioOferta: 99,
    descuento: 18,
    imagen: "/ofertas/fideos-granny.jpg",
    categoria: "Harinas, Pastas y Legumbres",
    destacado: true,
  },
  {
    codigo: "MM7730493084159",
    nombre: "VINO EL TAIPERO 1L (PROMO 2X$180)",
    precioOriginal: 198,
    precioOferta: 180,
    descuento: 10,
    imagen: "/ofertas/vino-el-taipero.jpg",
    categoria: "Bebidas",
    destacado: true,
  },
  {
    codigo: "DULCE-COLONIAL-500",
    nombre: "DULCE DE LECHE COLONIAL 500G",
    precioOriginal: 75,
    precioOferta: 50,
    descuento: 33,
    imagen: "/ofertas/dulce-de-leche-colonial.jpg",
    categoria: "Dulces y Mermeladas",
    destacado: true,
  },
  {
    codigo: "9768",
    nombre: "MORTADELA ARIZONA EN FETAS (100G)",
    precioOriginal: 22,
    precioOferta: 17,
    descuento: 23,
    imagen: "/ofertas/mortadela-arizona.jpg",
    categoria: "Fiambres y Carnes",
    destacado: true,
  },
  {
    codigo: "COMBO-COLOLO-ATUN",
    nombre: "COMBO MAYONESA COLOLO 200G + ATÚN FRESCO MAR",
    precioOriginal: 125,
    precioOferta: 90,
    descuento: 28,
    imagen: "/ofertas/combo-mayonesa-atun.jpg",
    categoria: "Salsas y Aderezos",
    destacado: true,
  },
];

async function seedOfertas() {
  console.log("🔥 Sembrando configuración de Ofertas Destacadas en Firestore...");
  try {
    const docRef = doc(db, "configuracion", "ofertas");
    const existingSnap = await getDoc(docRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : {};

    const payload = {
      ...existingData,
      activa: true,
      titulo: existingData.titulo || "Ofertas Destacadas de la Semana",
      subtitulo: existingData.subtitulo || "Aprovechá precios únicos y combos especiales por tiempo limitado",
      premiumPromos: PROMOS_DESTACADAS,
      productos: (existingData.productos && existingData.productos.length > 0) ? existingData.productos : PRODUCTOS_OFERTAS,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, payload, { merge: true });
    console.log("✅ ¡Ofertas Destacadas guardadas exitosamente en Firestore!");
    console.log(`📦 ${PROMOS_DESTACADAS.length} Banners de Promociones Destacadas listas.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error al guardar ofertas en Firestore:", err);
    process.exit(1);
  }
}

seedOfertas();
