// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

// 1. Création du contexte
const AuthContext = createContext(null);

// 2. LE PROVIDER
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);       // vérification de la session en cours
  const [premierChargement, setPremierChargement] = useState(true); // seulement à l'ouverture du site
  const dernierUid = useRef(null);

  useEffect(() => {
    // onAuthStateChanged maintient la session au rafraîchissement
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      dernierUid.current = currentUser?.uid ?? null;

      if (!currentUser) {
        setUser(null);
        setUserData(null);
        setLoading(false);
        setPremierChargement(false);
        return;
      }

      // On efface IMMÉDIATEMENT le profil précédent : jamais le rôle d'un autre compte
      setUser(currentUser);
      setUserData(null);

      try {
        const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
        // Si l'utilisateur a changé pendant la lecture (connexion/déconnexion rapide), on ignore ce résultat
        if (dernierUid.current !== currentUser.uid) return;
        setUserData(
          docSnap.exists()
            ? { uid: currentUser.uid, ...docSnap.data() }
            : { uid: currentUser.uid, email: currentUser.email, role: 'client' } // profil absent : client par défaut
        );
      } catch (error) {
        console.error('Erreur profil Firestore:', error);
        if (dernierUid.current !== currentUser.uid) return;
        // Profil illisible (réseau, App Check, règles) : on ne donne AUCUN droit admin par erreur
        setUserData({ uid: currentUser.uid, email: currentUser.email, role: 'client', profilIncomplet: true });
      } finally {
        if (dernierUid.current === currentUser.uid) {
          setLoading(false);
          setPremierChargement(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  const value = {
    user,
    userData,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Le grand écran de chargement ne s'affiche qu'à l'ouverture du site.
          Ensuite, l'application reste affichée : les pages gèrent elles-mêmes `loading`. */}
      {!premierChargement ? (
        children
      ) : (
        /* --- LOADER ÉLÉGANT EDÈN GROUP --- */
        <div className="fixed inset-0 bg-[#0A1A1E] z-[999] flex flex-col items-center justify-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* Spinner Doré */}
            <div className="w-16 h-16 border-2 border-[#B8976A]/20 border-t-[#B8976A] rounded-full animate-spin" />

            {/* Logo Central */}
            <img
              src="https://i.ibb.co/gMMcsrHk/logo.png"
              alt="EDÈN"
              className="absolute w-8 h-8 object-contain opacity-60"
            />
          </div>

          {/* Animation du texte de chargement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <p className="text-[#B8976A] text-[9px] uppercase tracking-[0.5em] font-black">
              Authentification Sécurisée
            </p>
            <span className="text-white/10 text-[7px] uppercase tracking-[0.3em]">
              EDÈN Group France
            </span>
          </motion.div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

// 3. LE HOOK
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}