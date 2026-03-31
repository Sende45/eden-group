import React, { useState, useEffect } from 'react'; // Ajout de useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  LayoutDashboard, 
  History, 
  Settings as SettingsIcon, 
  Bell, 
  MapPin, 
  User as UserIcon,
  Sparkles,
  Home as HomeIcon,
  CheckCircle,
  Menu,
  X 
} from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom'; // Ajout de useSearchParams

import { db } from '../firebase'; // Import de db
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore logic
import { useAuth } from '../context/AuthContext'; 

import MessageStream from "../components/MessageStream"; 
import Historique from "../components/Historique";
import Settings from "../components/Settings";
import ProfileDetail from "../components/ProfileDetail";

const EspaceClient = () => {
  const { userData, logout, loading } = useAuth(); 
  const [activeTab, setActiveTab] = useState('live');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // --- LOGIQUE DE DÉTECTION DU MAIL ---
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    const devisId = searchParams.get('id');

    if (action === 'confirm' && devisId) {
        const confirmerDevis = async () => {
            try {
                const devisRef = doc(db, "devis", devisId);
                await updateDoc(devisRef, { 
                    status: "client_valide", 
                    confirmedAt: serverTimestamp() 
                });
                alert("✨ Excellence validée ! Votre devis est confirmé. Nos équipes préparent l'intervention.");
                navigate('/dashboard', { replace: true });
            } catch (error) {
                console.error("Erreur de confirmation devis:", error);
            }
        };
        confirmerDevis();
    }
  }, [searchParams, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-eden-dark flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-eden-gold border-t-transparent rounded-full"
      />
    </div>
  );

  const navItems = [
    { id: 'profile', label: 'Mon Profil', icon: UserIcon },
    { id: 'live', label: 'Flux Direct', icon: LayoutDashboard },
    { id: 'history', label: 'Historique', icon: History },
    { id: 'settings', label: 'Paramètres', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-eden-dark p-4 flex justify-between items-center z-50">
        <h2 className="font-black-mango text-2xl text-eden-gold">EDÈN</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 w-72 bg-eden-dark text-white p-8 flex flex-col z-40 h-full`}>
        <Link to="/" className="mb-12 group hidden md:block">
          <h2 className="font-black-mango text-3xl text-eden-gold group-hover:scale-105 transition-transform">EDÈN</h2>
          <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mt-2 font-bold italic">Private Access</p>
        </Link>

        <nav className="flex-grow space-y-4">
          <Link to="/" className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 font-bold text-xs uppercase tracking-widest transition-all group">
            <HomeIcon size={18} className="group-hover:text-eden-gold" /> Retour au Site
          </Link>

          <div className="h-px bg-white/5 my-4" />

          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-eden-gold text-white shadow-lg shadow-eden-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 font-bold text-xs uppercase tracking-widest transition-all"
        >
          <LogOut size={18} /> Déconnexion
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow p-4 md:p-12 overflow-y-auto h-screen bg-gray-50/30">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-16 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="font-black-mango text-3xl md:text-4xl text-eden-dark leading-tight">
              Ravi de vous revoir, <span className="text-eden-gold italic">{userData?.fullName?.split(' ')[0] || 'Partenaire'}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                   <MapPin size={12} className="text-eden-gold" />
                   <span className="text-[10px] font-bold text-eden-dark uppercase tracking-tighter">
                     {userData?.structure || "Particulier"}
                   </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-eden-gold/10 rounded-full">
                   <Sparkles size={12} className="text-eden-gold" />
                   <span className="text-[10px] font-bold text-eden-gold uppercase tracking-tighter">
                     {userData?.pole || "Services"}
                   </span>
                </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-3 md:gap-4 self-end md:self-center">
            <Link to="/" className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl border border-gray-100 flex items-center justify-center text-eden-dark hover:text-eden-gold shadow-sm group">
              <HomeIcon size={18} className="group-hover:scale-110 transition-transform" />
            </Link>

            <button className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl border border-gray-100 flex items-center justify-center text-eden-dark relative shadow-sm">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-eden-gold rounded-full animate-pulse" />
            </button>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-eden-dark rounded-xl md:rounded-2xl flex items-center justify-center text-eden-gold shadow-lg border border-white/10">
              <UserIcon size={18} />
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-1 gap-8 md:gap-12 max-w-6xl pb-20">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.section key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <ProfileDetail userData={userData} />
              </motion.section>
            )}

            {activeTab === 'live' && (
              <motion.section key="live" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-eden-gold/5 blur-[80px] rounded-full -mr-20 -mt-20 md:-mr-32 md:-mt-32" />
                   <MessageStream /> 
                </div>
              </motion.section>
            )}

            {activeTab === 'history' && (
              <motion.section key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Historique />
              </motion.section>
            )}

            {activeTab === 'settings' && (
              <motion.section key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Settings userData={userData} />
              </motion.section>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
};

export default EspaceClient;