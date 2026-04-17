import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const firebaseConfig = {
  apiKey: "AIzaSyBJAdlJDA9ZE8CfC_ceEu5luv44qCxsfBE",
  authDomain: "elremate-6f8f2.firebaseapp.com",
  projectId: "elremate-6f8f2",
  storageBucket: "elremate-6f8f2.firebasestorage.app",
  messagingSenderId: "299477563303",
  appId: "1:299477563303:web:45da3792702a07c70f6882"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

import fs from 'fs';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

async function verifyProducts() {
  try {
    const auth = getAuth(app);
    await signInWithEmailAndPassword(auth, "adminremate1@elremate.com", "pedidosremate");
    console.log("Autenticado como admin.");

    console.log("Leyendo archivo Excel...");
    const buffer = fs.readFileSync("d:\\PROYECTOS\\ELREMATE\\lista de precio - nombre comercial -6-4-2026.xlsx");
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const excelProducts = new Map();
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 6) continue;
      const codigo = String(row[0] || "").trim();
      const nombre = String(row[2] || "").trim().toUpperCase();
      const precio = parseFloat(String(row[5] || ""));
      if (!nombre || isNaN(precio) || !codigo) continue;
      excelProducts.set(codigo, { nombre, precio });
    }
    console.log(`Productos en Excel válidos: ${excelProducts.size}`);

    console.log("Obteniendo catálogo desde Firestore...");
    const docRef = doc(db, "catalogo_activo", "productos");
    const docSnap = await getDoc(docRef);

    console.log(`Escribiendo ${excelProducts.size} productos a catalogo_activo/productos...`);
    
    const catalogoActivo = {};
    for (const [codigo, excelProd] of excelProducts.entries()) {
      catalogoActivo[codigo] = {
        codigo,
        nombre: excelProd.nombre,
        precio: excelProd.precio,
        categoria: "Otros" // Fallback, no categorization here as it is a quick script
      };
    }

    await setDoc(doc(db, "catalogo_activo", "productos"), {
      items: catalogoActivo,
      actualizadoEn: new Date().toISOString(),
      totalProductos: excelProducts.size,
    });

    console.log("¡Productos cargados con éxito en la base de datos!");
    process.exit(0);
  } catch (err) {
    console.error("Error verificando productos:", err);
    process.exit(1);
  }
}

verifyProducts();
