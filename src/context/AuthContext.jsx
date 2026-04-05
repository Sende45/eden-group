import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion'; // L'import qui manquait

// 1. Création du contexte
const AuthContext = createContext(null);

// 2. LE PROVIDER
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged maintient la session au rafraîchissement
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); 
      
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Erreur profil Firestore:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  const value = {
    user,
    userData,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? (
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
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
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