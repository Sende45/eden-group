import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Ajout useLocation
import { 
  User as UserIcon, Mail, Lock, Building2, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck 
} from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Pour récupérer les données du devis
  const { user, userData, loading: authLoading } = useAuth();
  
  const [selectedPole, setSelectedPole] = useState('chantier');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptCGU, setAcceptCGU] = useState(false); // État CGU

  const [formData, setFormData] = useState({
    fullName: '',
    structure: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!authLoading && user && userData) {
      // Si on vient du devis, on y retourne, sinon dashboard
      if (location.state?.fromDevis) {
        navigate('/devis', { state: { ...location.state, step: 3 }, replace: true });
      } else {
        navigate(userData.role === 'admin' ? '/admin-dashboard' : '/espace-client', { replace: true });
      }
    }
  }, [user, userData, authLoading, navigate, location]);

  const poleOptions = [
    { id: 'chantier', label: 'Fin de Chantier' },
    { id: 'tertiaire', label: 'Tertiaire & Bureaux' },
    { id: 'particulier', label: 'Particuliers' }
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!acceptCGU) {
      setError("Vous devez accepter les CGU pour continuer.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      const newUser = userCredential.user;

      const finalStructure = selectedPole === 'particulier' ? "Particulier" : (formData.structure || "Non précisé");

      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        fullName: formData.fullName,
        structure: finalStructure,
        email: formData.email.toLowerCase().trim(),
        pole: selectedPole,
        role: 'client',
        cguAccepted: true, // Validation des CGU
        cguAcceptedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Redirection intelligente
      if (location.state?.fromDevis) {
        navigate('/devis', { state: { ...location.state, step: 3 }, replace: true });
      } else {
        navigate('/espace-client', { replace: true }); 
      }
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? "Cet email est déjà utilisé." : "Erreur d'inscription.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-eden-dark flex items-center justify-center">
      <Loader2 className="animate-spin text-eden-gold" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-eden-dark text-white font-sans py-10 md:py-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-eden-dark via-eden-dark/90 to-transparent" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-2xl px-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-black-mango text-3xl md:text-4xl text-eden-gold mb-2">Inscription</h1>
            <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em]">
              {location.state?.fromDevis ? "Créez votre compte pour valider votre devis" : "Rejoindre le réseau d'excellence"}
            </p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:col-span-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-3">
                  <AlertCircle size={16} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="md:col-span-2 space-y-2">
               <label className="text-[10px] uppercase tracking-widest text-eden-gold font-bold ml-4">Votre Domaine</label>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                 {poleOptions.map(p => (
                   <button key={p.id} type="button" onClick={() => setSelectedPole(p.id)} className={`py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${selectedPole === p.id ? 'bg-eden-gold border-eden-gold text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                     {p.label}
                   </button>
                 ))}
               </div>
            </div>

            <div className={`space-y-1 ${selectedPole === 'particulier' ? 'md:col-span-2' : ''}`}>
              <label className="text-[10px] uppercase text-eden-gold font-bold ml-4">Nom complet</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-eden-gold/50 text-sm" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Jean Dupont"/>
              </div>
            </div>

            {selectedPole !== 'particulier' && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-eden-gold font-bold ml-4">Structure</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input required={selectedPole !== 'particulier'} type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-eden-gold/50 text-sm" value={formData.structure} onChange={e => setFormData({...formData, structure: e.target.value})} placeholder="Nom société"/>
                </div>
              </div>
            )}

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase text-eden-gold font-bold ml-4">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-eden-gold/50 text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="nom@entreprise.com"/>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-eden-gold font-bold ml-4">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input required type={showPassword ? "text" : "password"} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-eden-gold/50 text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-eden-gold font-bold ml-4">Confirmer</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input required type={showConfirmPassword ? "text" : "password"} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-eden-gold/50 text-sm" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
            </div>

            {/* CASE CGU AJOUTÉE */}
            <div className="md:col-span-2 py-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div 
                  onClick={() => setAcceptCGU(!acceptCGU)}
                  className={`mt-1 min-w-[18px] h-[18px] rounded border flex items-center justify-center transition-all ${acceptCGU ? 'bg-eden-gold border-eden-gold' : 'border-white/20 bg-white/5'}`}
                >
                  {acceptCGU && <ShieldCheck size={12} className="text-white" />}
                </div>
                <span className="text-[10px] text-gray-400 leading-relaxed uppercase font-bold tracking-wider">
                  J'accepte les conditions générales d'utilisation et la politique de confidentialité de <span className="text-eden-gold">Edèn Group</span>.
                </span>
              </label>
            </div>

            <button disabled={loading || !acceptCGU} type="submit" className="md:col-span-2 py-5 bg-eden-gold text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center justify-center gap-3 disabled:opacity-30">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Créer mon compte <ArrowRight size={16}/></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-[10px] uppercase font-bold">Déjà membre ? <Link to="/login" className="text-eden-gold underline ml-1">Se connecter</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;