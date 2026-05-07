import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
// Firebase & Context
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext'; 

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();
  const { user, userData, loading: authLoading } = useAuth(); 

  // --- REDIRECTION AUTOMATIQUE SI UNE SESSION EXISTE ---
  useEffect(() => {
    if (!authLoading && user && userData) {
      if (userData.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        // Redirection vers l'espace client privé
        navigate('/espace-client', { replace: true });
      }
    }
  }, [user, userData, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const loggedUser = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", loggedUser.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          // Redirection vers l'espace client après connexion
          navigate('/espace-client', { replace: true }); 
        }
      } else {
        // Redirection de secours
        navigate('/espace-client', { replace: true });
      }
    } catch (error) {
      console.error("Login Error:", error.code);
      switch (error.code) {
        case 'auth/invalid-email':
          setError("L'adresse email n'est pas conforme.");
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError("Identifiants incorrects. Veuillez réessayer.");
          break;
        case 'auth/too-many-requests':
          setError("Accès bloqué temporairement (trop de tentatives).");
          break;
        default:
          setError("Erreur d'authentification. Vérifiez votre connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Empêcher le flash du formulaire pendant la vérification de session
  if (authLoading) return (
    <div className="min-h-screen bg-eden-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-eden-gold" size={40} />
        <p className="text-eden-gold text-xs uppercase tracking-[0.3em] font-bold">Vérification de l'accès...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-eden-dark text-white font-sans py-10">
      
      {/* BACKGROUND OPTIMISÉ */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-eden-dark via-eden-dark/95 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-20 scale-105 transition-transform duration-1000" 
          alt="" 
        />
      </div>

      {/* EFFETS DE LUMIÈRE D'AMBIANCE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-eden-gold/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-eden-gold/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl"
        >
          <div className="text-center mb-10">
            <h1 className="font-black-mango text-4xl md:text-5xl text-eden-gold mb-3">Connexion</h1>
            <p className="text-gray-400 text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold">Espace Partenaire Privé</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 md:space-y-7">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[11px] flex items-center gap-3 font-bold uppercase tracking-wider"
                >
                  <AlertCircle size={16} className="shrink-0" /> <span className="leading-tight">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-eden-gold font-bold ml-5">Email Professionnel</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-eden-gold transition-colors" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 outline-none focus:border-eden-gold/50 focus:bg-white/10 transition-all text-sm placeholder:text-gray-600 appearance-none"
                  placeholder="nom@entreprise.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-eden-gold font-bold ml-5">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-eden-gold transition-colors" size={18} />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-14 outline-none focus:border-eden-gold/50 focus:bg-white/10 transition-all text-sm placeholder:text-gray-600 appearance-none"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-eden-gold transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="text-right px-2">
                <Link to="/forgot-password" size={18} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-eden-gold transition-colors font-medium italic">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 md:py-6 bg-eden-gold text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] md:text-[11px] hover:shadow-[0_15px_40px_rgba(184,151,106,0.3)] transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-8 shadow-2xl disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Accéder au Dashboard <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold leading-relaxed">
              Pas encore partenaire ? <br className="sm:hidden"/> 
              <Link to="/register" className="text-eden-gold hover:text-white transition-colors underline underline-offset-8 ml-2">Créer un compte</Link>
            </p>
          </div>
        </motion.div>
        
        <div className="mt-10 flex items-center justify-center gap-3 text-gray-500 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold">
          <ShieldCheck size={16} className="text-eden-gold" /> Serveur Sécurisé EDÈN Group
        </div>
      </motion.div>
    </div>
  );
};

export default Login;