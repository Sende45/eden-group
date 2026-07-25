import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore, setLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import indispensable pour les fichiers
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

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

// --- APP CHECK (protection anti-abus du backend Firebase) ---
// En développement, on autorise un jeton de debug (localhost).
// Le token à enregistrer dans la console s'affichera dans la console navigateur.
if (import.meta.env.DEV) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// À initialiser AVANT auth/db/storage pour que le jeton soit attaché aux requêtes.
initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider("TA_CLE_SITE_RECAPTCHA_ENTERPRISE"),
  // Alternative gratuite : remplacer par ReCaptchaV3Provider("TA_CLE_SITE_V3")
  // et importer ReCaptchaV3Provider depuis "firebase/app-check".
  isTokenAutoRefreshEnabled: true,
});

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