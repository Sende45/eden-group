import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// 1. Création du contexte
const AuthContext = createContext(undefined);

// 2. LE PROVIDER
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged est la clé de la persistance (maintient la session au rafraîchissement)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // On s'assure d'être en chargement pendant la récupération Firestore
      
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Erreur récupération profil Firestore:", error);
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
      {/* IMPORTANT : On affiche un loader élégant aux couleurs d'EDÈN 
          pour éviter que l'utilisateur ne voie le formulaire de login 
          une fraction de seconde s'il est déjà connecté.
      */}
      {!loading ? children : (
        <div className="min-h-screen bg-[#0A1A1E] flex flex-col items-center justify-center gap-6">
          {/* Logo animé en fondu */}
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[#B8976A]/20 border-t-[#B8976A] rounded-full animate-spin" />
            <img 
                src="https://i.ibb.co/gMMcsrHk/logo.png" 
                alt="Logo loading" 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 object-contain opacity-50"
            />
          </div>
          <p className="text-[#B8976A] text-[10px] uppercase tracking-[0.5em] font-bold animate-pulse">
            Authentification Sécurisée
          </p>
        </div>
      )}
    </AuthContext.Provider>
  );
}

// 3. LE HOOK
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}