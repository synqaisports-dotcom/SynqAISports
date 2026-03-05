import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * CONFIGURACIÓN_SÍNCRONA_SISTEMA
 * Estos valores vinculan la terminal con el núcleo de datos de Firebase.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDSyukojYSkwnEJi3dka-yf_H7WRi_gjsc",
  authDomain: "synqaisports.firebaseapp.com",
  projectId: "synqaisports",
  storageBucket: "synqaisports.firebasestorage.app",
  messagingSenderId: "593859385938",
  appId: "1:593859385938:web:7c7c7c7c7c7c7c7c", 
};

// Inicialización de Protocolos
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
