import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Construction, Building2, UserCheck, MapPin, Ruler, ArrowLeft, Send, 
  Loader2, Calendar, Phone, MessageCircle, ShieldCheck, CheckCircle 
} from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import fr from 'date-fns/locale/fr';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

registerLocale('fr', fr);

const Devis = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCGUModal, setShowCGUModal] = useState(false);

  const [formData, setFormData] = useState({
    pole: '',
    surface: 50,
    localisation: '',
    frequence: 'ponctuel',
    email: '',
    message: '',
    appointmentDate: null
  });

  const minTime = new Date();
  minTime.setHours(8, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(18, 0, 0);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }

    const typeParam = searchParams.get('type');
    if (typeParam) {
      const selectedPole = poles.find(p => p.id === typeParam);
      if (selectedPole) {
        setFormData(prev => ({ ...prev, pole: selectedPole.title }));
        setStep(2);
      }
    }
  }, [searchParams, user]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // --- NOUVELLE LOGIQUE DE REDIRECTION REGISTER ---
  const handleAuthRedirection = () => {
    if (!user) {
      // Redirection vers Register en passant les données actuelles
      navigate('/register', { 
        state: { 
          fromDevis: true, 
          pendingFormData: formData,
          selectedDate: selectedDate 
        } 
      });
    } else {
      nextStep();
    }
  };

  const poles = [
    { id: 'chantier', title: 'Fin de Chantier', icon: Construction, desc: 'Nettoyage approfondi après travaux' },
    { id: 'tertiaire', title: 'Tertiaire & Bureaux', icon: Building2, desc: 'Entretien des postes de travail et espaces communs' },
    { id: 'particulier', title: 'Services Particuliers', icon: UserCheck, desc: 'Agences immobilières et conciergeries' }
  ];

  const frequencies = [
    { id: 'ponctuel', label: 'Une seule fois' },
    { id: 'hebdomadaire', label: 'Hebdomadaire' },
    { id: 'mensuel', label: 'Mensuel' }
  ];

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes('@')) return alert("Veuillez entrer un email valide.");
    if (!selectedDate) return alert("Veuillez choisir une date de rendez-vous pour l'estimation.");

    if (user && !userData?.cguAccepted) {
        setShowCGUModal(true);
    } else {
        handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const clientName = userData?.fullName || userData?.nom || 'Client Externe';
      
      if (user && !userData?.cguAccepted) {
          await updateDoc(doc(db, "users", user.uid), {
              cguAccepted: true,
              cguAcceptedAt: serverTimestamp()
          });
      }

      const devisRef = await addDoc(collection(db, "devis"), {
        ...formData,
        appointmentDate: selectedDate,
        userId: user ? user.uid : 'anonyme',
        clientName: clientName,
        status: "nouveau",
        typeService: "nettoyage",
        createdAt: serverTimestamp()
      });

      if (user) {
        await addDoc(collection(db, "messages"), {
          userId: user.uid,
          sender: "Système EDÈN",
          text: `✨ Nouvelle demande de devis enregistrée (${formData.pole}). Votre rendez-vous pour l'estimation est fixé au ${selectedDate.toLocaleString('fr-FR')}.`,
          timestamp: serverTimestamp(),
          type: "notification",
          devisId: devisRef.id
        });
      }

      alert(`Votre demande a été transmise avec succès. Un agent d'Edèn Group reviendra vers vous avec votre prix.`);
      setIsSubmitting(false);
      navigate(user ? '/espace-client' : '/accueil');
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert("Une erreur est survenue lors de l'envoi du formulaire.");
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    initial: { x: 30, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -30, opacity: 0 }
  };

  return (
    <div className="min-h-screen bg-eden-dark pt-24 md:pt-32 pb-10 md:pb-20 px-4 md:px-6 font-sans text-eden-dark">
      <style>{`
        .react-datepicker {
          font-family: inherit !important;
          border-radius: 1.5rem !important;
          border: none !important;
          background: #f9fafb !important;
        }
        .react-datepicker__header {
          background: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-radius: 1.5rem 1.5rem 0 0 !important;
        }
        .react-datepicker__day--selected {
          background-color: #C5A059 !important;
          border-radius: 0.5rem !important;
        }
      `}</style>

      <AnimatePresence>
        {showCGUModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-eden-dark/80 backdrop-blur-sm"
              onClick={() => setShowCGUModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-eden-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} className="text-eden-gold" />
              </div>
              <h2 className="font-black-mango text-2xl md:text-3xl mb-4 text-eden-dark uppercase tracking-tight">Engagement de Confiance</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Pour finaliser votre demande, veuillez accepter nos conditions générales d'utilisation. Elles garantissent la sécurité de vos données et la qualité de nos interventions.
              </p>
              <button 
                onClick={() => { setShowCGUModal(false); handleSubmit(); }}
                className="w-full py-4 bg-eden-gold text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:shadow-lg shadow-eden-gold/30 transition-all"
              >
                <CheckCircle size={18} /> J'accepte et je valide
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
           <motion.h1 
             initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
             className="font-black-mango text-3xl md:text-6xl text-white mb-4 leading-tight"
           >
             Demande de <span className="text-eden-gold italic">Devis</span>
           </motion.h1>
        </div>

        <div className="flex justify-center mb-8 md:mb-12 gap-2 px-6">
           {[1, 2, 3].map((i) => (
             <div key={i} className={`h-1.5 flex-1 max-w-[100px] rounded-full transition-all duration-500 ${step >= i ? 'bg-eden-gold' : 'bg-gray-700'}`} />
           ))}
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" {...stepVariants} className="space-y-6 md:space-y-8">
                <h2 className="font-black-mango text-xl md:text-2xl">Quel pôle d'activité vous concerne ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {poles.map((p) => (
                    <button
                      key={p.id} type="button"
                      onClick={() => { setFormData({ ...formData, pole: p.title }); nextStep(); }}
                      className={`p-5 md:p-6 rounded-2xl border-2 transition-all text-left group flex flex-col h-full ${formData.pole === p.title ? 'border-eden-gold bg-eden-gold/5 shadow-inner' : 'border-gray-100 hover:border-eden-gold/50'}`}
                    >
                      <p.icon className={`w-8 h-8 md:w-10 md:h-10 mb-4 md:mb-6 ${formData.pole === p.title ? 'text-eden-gold' : 'text-gray-400 group-hover:text-eden-gold'}`} />
                      <h3 className="font-bold mb-2 text-sm md:text-base">{p.title}</h3>
                      <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
               <motion.div key="step2" {...stepVariants} className="space-y-6 md:space-y-8">
                <h2 className="font-black-mango text-xl md:text-2xl">Détails de l'intervention pour <span className="text-eden-gold">{formData.pole}</span></h2>
                <div className="space-y-6 md:space-y-8">
                  <div className="bg-gray-50 p-4 md:p-6 rounded-2xl">
                    <label className="flex items-center gap-2 text-[10px] md:text-sm font-bold mb-4 uppercase tracking-widest text-gray-400">
                      <Calendar className="w-4 h-4 text-eden-gold" /> Fréquence souhaitée
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                      {frequencies.map((f) => (
                        <button
                          key={f.id} type="button"
                          onClick={() => setFormData({...formData, frequence: f.id})}
                          className={`py-3 px-2 rounded-xl border-2 font-bold text-[10px] md:text-xs transition-all ${formData.frequence === f.id ? 'border-eden-gold bg-eden-gold text-white shadow-lg' : 'border-white bg-white hover:border-eden-gold/30'}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-gray-50 p-4 md:p-6 rounded-2xl">
                      <label className="flex items-center gap-2 text-[10px] md:text-sm font-bold mb-6 uppercase tracking-widest text-gray-400">
                        <Ruler className="w-4 h-4 text-eden-gold" /> Surface : <span className="text-eden-dark">{formData.surface} m²</span>
                      </label>
                      <input 
                        type="range" min="10" max="2000" step="10"
                        value={formData.surface}
                        onChange={(e) => setFormData({...formData, surface: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-eden-gold"
                      />
                    </div>
                    <div className="bg-gray-50 p-4 md:p-6 rounded-2xl">
                      <label className="flex items-center gap-2 text-[10px] md:text-sm font-bold mb-4 uppercase tracking-widest text-gray-400">
                        <MapPin className="w-4 h-4 text-eden-gold" /> Localisation
                      </label>
                      <select 
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-eden-gold outline-none bg-white font-bold text-xs md:text-sm"
                        value={formData.localisation}
                        onChange={(e) => setFormData({...formData, localisation: e.target.value})}
                      >
                        <option value="" disabled>Sélectionnez la zone...</option>
                        <option value="Paris / Île-de-France">Paris / Île-de-France</option>
                        <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
                        <option value="Haute-Loire">Haute-Loire</option>
                        <option value="Haute-Savoie">Haute-Savoie</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="text-gray-400 font-bold hover:text-eden-dark flex items-center justify-center gap-2 py-2">
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </button>
                  {/* MODIFIÉ : On utilise handleAuthRedirection ici */}
                  <button type="button" onClick={handleAuthRedirection} disabled={!formData.localisation} className="px-10 py-4 bg-eden-dark text-white rounded-xl font-bold hover:bg-eden-gold disabled:opacity-30 transition-all w-full sm:w-auto">
                    Continuer
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" {...stepVariants} className="space-y-6 md:space-y-8">
                <h2 className="font-black-mango text-xl md:text-2xl text-center">Disponibilités & Contact</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 text-center block">Choisir un créneau d'estimation</label>
                    <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center shadow-inner">
                      <DatePicker
                        selected={selectedDate} onChange={(date) => setSelectedDate(date)}
                        filterDate={isWeekday} showTimeSelect timeFormat="HH:mm" timeIntervals={30}
                        dateFormat="dd MMMM yyyy à HH:mm" minDate={new Date()}
                        minTime={minTime} maxTime={maxTime} locale="fr" inline
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-eden-dark p-6 rounded-2xl text-white space-y-4 shadow-xl">
                      <p className="text-[10px] uppercase font-bold text-eden-gold">Besoin d'aide immédiate ?</p>
                      <div className="grid grid-cols-1 gap-3">
                        <a href="tel:0780801642" className="flex items-center justify-center gap-3 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-bold text-sm">
                          <Phone size={18} className="text-eden-gold" /> 07 80 80 16 42
                        </a>
                        <a href="https://wa.me/33780801642" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl border border-[#25D366]/30 font-bold text-sm text-[#25D366]">
                          <MessageCircle size={18} /> WhatsApp Direct
                        </a>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <input 
                        type="email" placeholder="Email de contact" 
                        disabled={!!user} 
                        className={`w-full p-4 rounded-xl border border-gray-200 focus:border-eden-gold outline-none transition-all text-sm ${user ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`} 
                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      />
                      <textarea 
                        placeholder="Détails supplémentaires..." 
                        className="w-full p-4 rounded-xl border border-gray-200 focus:border-eden-gold outline-none bg-gray-50 h-24 text-sm" 
                        value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
                  <button type="button" onClick={prevStep} className="text-gray-400 font-bold hover:text-eden-dark flex items-center justify-center gap-2 py-2">
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </button>
                  <button 
                    type="submit" 
                    onClick={handlePreSubmit} 
                    disabled={isSubmitting || !selectedDate || !formData.email} 
                    className="flex items-center justify-center gap-3 px-10 py-4 bg-eden-gold text-white rounded-xl font-bold shadow-lg hover:shadow-eden-gold/40 transition-all transform hover:scale-105 disabled:opacity-50 w-full sm:w-auto"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span className="text-sm">{isSubmitting ? "Transmission..." : "Valider le Rendez-vous"}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Devis;