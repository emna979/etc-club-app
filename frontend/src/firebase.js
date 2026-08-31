import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Ces valeurs ne sont pas secrètes : elles identifient le projet Firebase
// côté client, la vraie sécurité vient des règles Firestore (firestore.rules).
const firebaseConfig = {
  apiKey: "AIzaSyCuFeI_MbY_u_QLryRH6t8_Gu_R3Nqn2Qg",
  authDomain: "etc-club-app.firebaseapp.com",
  projectId: "etc-club-app",
  storageBucket: "etc-club-app.firebasestorage.app",
  messagingSenderId: "534361375120",
  appId: "1:534361375120:web:56fc6f8fae0b3f313ef315",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// URL de ton backend Express (upload de fichiers). En local par défaut ;
// remplace VITE_BACKEND_URL dans un fichier .env une fois le backend déployé.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
