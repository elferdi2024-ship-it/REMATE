// filepath: scripts/update-ofertas-auth.mjs
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJAdlJDA9ZE8CfC_ceEu5luv44qCxsfBE",
  authDomain: "elremate-6f8f2.firebaseapp.com",
  projectId: "elremate-6f8f2",
  storageBucket: "elremate-6f8f2.firebasestorage.app",
  messagingSenderId: "299477563303",
  appId: "1:299477563303:web:45da3792702a07c70f6882",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
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

async function updateOfertas() {
  try {
    console.log("🔐 Autenticando como Administrador en Firebase...");
    await signInWithEmailAndPassword(auth, "adminremate1@elremate.com", "pedidosremate");
    console.log("✅ Autenticado correctamente.");

    console.log("📝 Guardando las 6 nuevas ofertas en Firestore (configuracion/ofertas)...");
    await setDoc(
      doc(db, "configuracion", "ofertas"),
      {
        activa: true,
        titulo: "Ofertas Destacadas de la Semana",
        subtitulo: "Aprovechá precios únicos y combos especiales por tiempo limitado",
        premiumPromos: PROMOS_DESTACADAS,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("🎉 ¡Firestore actualizado con éxito con las 6 ofertas!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

updateOfertas();
