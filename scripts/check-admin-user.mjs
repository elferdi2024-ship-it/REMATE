// filepath: scripts/check-admin-user.mjs
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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

async function check() {
  const cred = await signInWithEmailAndPassword(auth, "adminremate1@elremate.com", "pedidosremate");
  console.log("Logged in UID:", cred.user.uid);
  const snap = await getDoc(doc(db, "usuarios", cred.user.uid));
  console.log("User doc:", snap.exists() ? snap.data() : "NOT FOUND");
  process.exit(0);
}
check();
