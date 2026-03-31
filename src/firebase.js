import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore, setLogLevel } from "firebase/firestore"; // Garde bien ça
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAUJxlKLtryrMTQEzQVBEvRuWp-l5GcvWY",
  authDomain: "eden-group-78b42.firebaseapp.com",
  projectId: "eden-group-78b42",
  storageBucket: "eden-group-78b42.firebasestorage.app",
  messagingSenderId: "801917803644",
  appId: "1:801917803644:web:d0e51b49b352c8a6fabdf9",
  measurementId: "G-QH5M3NXN0G"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

setLogLevel('error'); 

export const auth = getAuth(app);

// LA MODIF DE SECOURS ICI :
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true, // FORCE Firestore à utiliser un mode de connexion plus simple/stable
  useFetchStreams: false // Empêche les erreurs de stream que tu vois dans la console
});

export const storage = getStorage(app);

export default app;