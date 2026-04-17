import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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

async function createAdmin() {
  const email = "adminremate1@elremate.com";
  const password = "pedidosremate";

  try {
    console.log(`Intentando crear/iniciar sesion para ${email}...`);
    let user;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
      console.log("Usuario creado con exito:", user.uid);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        console.log("El usuario ya existe. Iniciando sesion para obtener UID...");
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      } else {
        throw e;
      }
    }

    // Set role admin in firestore
    console.log(`Actualizando rol a 'admin' en Firestore para UID: ${user.uid}...`);
    await setDoc(doc(db, "usuarios", user.uid), {
      email: email,
      role: "admin",
      createdAt: new Date().toISOString()
    }, { merge: true });
    
    console.log("¡Usuario administrador configurado con exito!");
    console.log("Usuario:", email);
    console.log("Contrasena:", password);
    process.exit(0);
  } catch (error) {
    console.error("Error creando admin:", error);
    process.exit(1);
  }
}

createAdmin();
