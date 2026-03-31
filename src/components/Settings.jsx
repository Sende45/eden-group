import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../firebase';
import { updatePassword, updateEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Building2, Lock, Save, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

const Settings = ({ userData }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  
  // États locaux pour le formulaire
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    structure: userData?.structure || '',
    newPassword: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const user = auth.currentUser;
      
      // 1. Mise à jour Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        fullName: formData.fullName,
        structure: formData.structure
      });

      // 2. Mise à jour Mot de Passe (si rempli)
      if (formData.newPassword.length >= 6) {
        await updatePassword(user, formData.newPassword);
      }

      setStatus({ type: 'success', msg: 'Profil mis à jour avec excellence.' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', msg: 'Erreur lors de la mise à jour. Re-connectez-vous pour modifier vos accès.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-eden-gold/10 flex items-center justify-center text-eden-gold">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-black-mango text-2xl text-eden-dark">Paramètres du Compte</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Gérez vos accès et informations privées</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-8">
          
          {/* Feedback Status */}
          {status.msg && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {status.msg}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-eden-gold font-bold ml-4">Nom complet</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eden-gold transition-colors" size={16} />
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-eden-gold/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-eden-gold font-bold ml-4">Structure / Entité</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eden-gold transition-colors" size={16} />
                <input 
                  type="text" 
                  value={formData.structure}
                  onChange={(e) => setFormData({...formData, structure: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-eden-gold/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-4" />

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-eden-gold font-bold ml-4">Nouveau mot de passe (Laisser vide pour garder l'actuel)</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eden-gold transition-colors" size={16} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-eden-gold/20 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-eden-dark text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-eden-gold transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={18} className="text-eden-gold" />}
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Settings;