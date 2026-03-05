import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * CONFIGURACIÓN_REAL_SISTEMA
 * Sincronizado con el Proyecto: SynqAiSports
 * ID: studio-5944752012-52b7a
 */
const firebaseConfig = {
  apiKey: "AIzaSyDSyukojYSkwnEJi3dka-yf_H7WRi_gjsc", // Asegúrate de que esta sea la API Key de studio-5944752012-52b7a
  authDomain: "studio-5944752012-52b7a.firebaseapp.com",
  projectId: "studio-5944752012-52b7a",
  storageBucket: "studio-5944752012-52b7a.firebasestorage.app",
  messagingSenderId: "1077364844635",
  appId: "1:1077364844635:web:7c7c7c7c7c7c7c7c", 
};

// Inicialización de Protocolos
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
