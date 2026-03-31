import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
// Firebase
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus({ 
        type: 'success', 
        msg: 'Lien de réinitialisation envoyé ! Vérifiez votre boîte mail.' 
      });
    } catch (error) {
      console.error(error.code);
      if (error.code === 'auth/user-not-found') {
        setStatus({ type: 'error', msg: "Aucun compte n'est associé à cet email." });
      } else {
        setStatus({ type: 'error', msg: "Une erreur est survenue. Veuillez réessayer." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-eden-dark text-white font-sans">
      {/* Background Palmier */}
      <div className="absolute inset-0 z-0">
        <img src="/assets/palm-texture.jpg" className="w-full h-full object-cover opacity-20 scale-110" alt="" />
        <div className="absolute inset-0 bg-gradient-to-br from-eden-dark via-eden-dark/90 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="mb-8">
            <Link to="/login" className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-eden-gold transition-colors w-fit group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Retour
            </Link>
          </div>

          <div className="text-center mb-10">
            <h1 className="font-black-mango text-4xl text-eden-gold mb-2">Réinitialisation</h1>
            <p className="text-gray-400 text-[10px] uppercase tracking-[0.4em] font-bold">Restaurez votre accès privé</p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <AnimatePresence>
              {status.msg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-4 rounded-xl text-[11px] flex items-center gap-3 font-bold uppercase tracking-widest ${
                    status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {status.msg}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-eden-gold font-bold ml-4">Votre Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-eden-gold transition-colors" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-eden-gold/50 transition-all text-sm placeholder:text-gray-600"
                  placeholder="nom@entreprise.com"
                />
              </div>
            </div>

            <button 
              disabled={loading || status.type === 'success'}
              className="w-full py-5 bg-eden-gold text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:shadow-[0_15px_30px_rgba(184,151,106,0.3)] transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {loading ? "Envoi du lien..." : "Envoyer les instructions"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;