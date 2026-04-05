import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore, setLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import indispensable pour les fichiers

const firebaseConfig = {
  apiKey: "AIzaSyAUJxlKLtryrMTQEzQVBEvRuWp-l5GcvWY",
  authDomain: "eden-group-78b42.firebaseapp.com",
  projectId: "eden-group-78b42",
  storageBucket: "eden-group-78b42.firebasestorage.app",
  messagingSenderId: "801917803644",
  appId: "1:801917803644:web:d0e51b49b352c8a6fabdf9",
  measurementId: "G-QH5M3NXN0G"
};

// Initialisation de l'application
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// On limite les logs pour garder une console propre
setLogLevel('error'); 

// Authentification
export const auth = getAuth(app);

// Firestore avec configuration de stabilité (Polling + Ignore Undefined)
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true, 
  useFetchStreams: false 
});

// NOUVEAU : Exportation du Storage pour les images et vidéos du chat
export const storage = getStorage(app);

export default app;