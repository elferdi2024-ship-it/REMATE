import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function readOfertas() {
  const docRef = doc(db, "configuracion", "ofertas");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log("Document data:", JSON.stringify(snap.data(), null, 2));
  } else {
    console.log("No such document!");
  }
  process.exit(0);
}

readOfertas();
