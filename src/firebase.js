import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore, setLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import indispensable pour les fichiers
import { initializeAppCheck, ReCaptchaEnterpriseProvider, CustomProvider } from "firebase/app-check";
import { Capacitor } from "@capacitor/core";
import { FirebaseAppCheck } from "@capacitor-firebase/app-check";

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

// --- APP CHECK (protection anti-abus du backend Firebase) ---
// À initialiser juste après initializeApp, avant toute requête backend.
if (Capacitor.isNativePlatform()) {
  // NATIF (iOS / Android) : l'attestation est faite par l'OS
  // (App Attest sur iOS, Play Integrity sur Android) puis relayée
  // au SDK JS via un CustomProvider. Aucune clé reCAPTCHA ici.
  const nativeReady = FirebaseAppCheck.initialize(); // active la couche native (une seule fois)

  const provider = new CustomProvider({
    getToken: async () => {
      await nativeReady;                    // s'assure que la couche native est prête
      return FirebaseAppCheck.getToken();   // { token, expireTimeMillis }
    },
  });

  initializeAppCheck(app, { provider, isTokenAutoRefreshEnabled: true });
} else {
  // WEB / PWA : provider reCAPTCHA Enterprise.
  // En dev, on autorise un jeton de debug (le token s'affiche dans la console navigateur).
  if (import.meta.env.DEV) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider("TA_CLE_SITE_RECAPTCHA_ENTERPRISE"),
    // Alternative gratuite : new ReCaptchaV3Provider("TA_CLE_SITE_V3")
    // (importer ReCaptchaV3Provider depuis "firebase/app-check").
    isTokenAutoRefreshEnabled: true,
  });
}

// Analytics : uniquement là où c'est supporté (évite un crash dans le webview natif).
export let analytics = null;
analyticsIsSupported().then((ok) => {
  if (ok) analytics = getAnalytics(app);
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