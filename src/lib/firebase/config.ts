import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * CONFIGURACIÓN_SÍNCRONA_SISTEMA
 * Estos valores vinculan la terminal con el núcleo de datos de Firebase.
 * IMPORTANTE: Verifica que estos valores coincidan con tu Consola de Firebase > Configuración del proyecto.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDSyukojYSkwnEJi3dka-yf_H7WRi_gjsc",
  authDomain: "synqaisports.firebaseapp.com",
  projectId: "synqaisports",
  storageBucket: "synqaisports.firebasestorage.app",
  messagingSenderId: "659509021859", // Sincronizado con tu ID de proyecto real
  appId: "1:659509021859:web:7c7c7c7c7c7c7c7c", 
};

// Inicialización de Protocolos
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
