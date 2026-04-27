import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyBJAdlJDA9ZE8CfC_ceEu5luv44qCxsfBE",
  authDomain: "elremate-6f8f2.firebaseapp.com",
  projectId: "elremate-6f8f2",
  storageBucket: "elremate-6f8f2.firebasestorage.app",
  messagingSenderId: "299477563303",
  appId: "1:299477563303:web:45da3792702a07c70f6882"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const IMAGES = [
  { file: "FIAMBRES Y CARNES.jpg", cat: "CARNES Y EMBUTIDOS" },
  { file: "ESPECIAS.jpg", cat: "CONDIMENTOS Y ESPECIAS" },
  { file: "BEBIDAS SIN ALC.webp", cat: "BEBIDAS SIN ALCOHOL" },
  { file: "BEBIDAS ALC.jpg", cat: "BEBIDAS ALCOHÓLICAS" },
  { file: "ACEITES Y GRASAS.jpg", cat: "ACEITES Y GRASAS" }
];

const basePath = "d:\\PROYECTOS\\ELREMATE\\modificaciones\\CATEGORIAS";

async function upload() {
  try {
    console.log("Iniciando sesión como admin...");
    const email = "adminremate1@elremate.com";
    const password = "pedidosremate";
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Sesión iniciada.");

    const config = {};
    const snap = await getDoc(doc(db, "configuracion", "categorias"));
    const currentConfig = snap.exists() ? snap.data() || {} : {};

    for (const img of IMAGES) {
      const filePath = path.join(basePath, img.file);
      if (!fs.existsSync(filePath)) {
        console.error(`ERROR: Archivo no encontrado: ${filePath}`);
        continue;
      }

      console.log(`Subiendo ${img.file}...`);
      const fileBuffer = fs.readFileSync(filePath);
      const storageRef = ref(storage, `categorias/${img.file}`);
      
      await uploadBytes(storageRef, fileBuffer, {
        contentType: img.file.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
      });

      const url = await getDownloadURL(storageRef);
      config[img.cat] = url;
      console.log(`OK: ${img.file} -> ${url}`);
    }

    const finalConfig = Object.assign({}, currentConfig, config);
    await setDoc(doc(db, "configuracion", "categorias"), finalConfig);
    console.log("¡Configuración de categorías actualizada exitosamente!");
    process.exit(0);
  } catch (error) {
    console.error("ERROR FATAL:", error);
    process.exit(1);
  }
}

upload();
