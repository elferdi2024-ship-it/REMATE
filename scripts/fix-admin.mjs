import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function fixAdmin(email, password) {
  try {
    console.log(`Iniciando sesión para ${email}...`);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log(`Asignando rol 'admin' en Firestore para UID: ${user.uid}...`);
    await setDoc(doc(db, "usuarios", user.uid), {
      email: email,
      role: "admin",
      fixedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log("¡ÉXITO! Ahora deberías tener permisos totales.");
    process.exit(0);
  } catch (error) {
    console.error("Error al corregir permisos:", error.message);
    process.exit(1);
  }
}

const email = process.argv[2] || "rnt.atlantida@gmail.com";
const password = process.argv[3];

if (!password) {
  console.log("Uso: node scripts/fix-admin.mjs <email> <password>");
  process.exit(1);
}

fixAdmin(email, password);
