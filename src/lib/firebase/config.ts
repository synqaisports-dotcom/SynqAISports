import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Misión Crítica (Hardcoded para estabilidad en prototipo)
const firebaseConfig = {
  apiKey: "AIzaSyDSyukojYSkwnEJi3dka-yf_H7WRi_gjsc",
  authDomain: "synqaisports.firebaseapp.com",
  projectId: "synqaisports",
  storageBucket: "synqaisports.firebasestorage.app",
  messagingSenderId: "593859385938", // Placeholder si no se tiene el real
  appId: "1:593859385938:web:abcdef123456", // Placeholder si no se tiene el real
};

// Inicialización Segura
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
