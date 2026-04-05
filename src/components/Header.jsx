import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Utilisation de MessageSquare pour la messagerie interne (Point 1)
import { User, Menu, MessageCircle, MessageSquare, X } from 'lucide-react'; 
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Simulation d'un état de nouveau message (badge rouge)
  const [hasNewMessage, setHasNewMessage] = useState(true); 
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isMessagesPage = location.pathname === '/messages';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquer le scroll derrière le menu mobile
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
    // Si on arrive sur la page messages, on retire le badge
    if (location.pathname === '/messages') setHasNewMessage(false);
  }, [location]);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 px-4 md:px-6 py-4 ${
        isScrolled 
          ? 'bg-eden-dark/95 backdrop-blur-md border-b border-eden-gold/10 py-3' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center relative z-[101]">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="https://i.ibb.co/gMMcsrHk/logo.png" 
            alt="EDÈN Logo" 
            className="h-9 md:h-12 w-auto object-contain transition-transform group-hover:scale-110"
          />
          <div className="flex flex-col">
            <span className="font-black-mango text-lg md:text-2xl text-eden-gold leading-none tracking-tight">
              EDÈN Group
            </span>
            <span className="text-[5px] md:text-[7px] uppercase tracking-[0.4em] text-white/50 mt-1">
              L'Excellence de la Propreté
            </span>
          </div>
        </Link>

        {/* NAVIGATION DESKTOP */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
            <Link to="/accueil" className={`hover:text-eden-gold transition-colors ${location.pathname === '/accueil' ? 'text-eden-gold' : ''}`}>Accueil</Link>
            <Link to="/services" className={`hover:text-eden-gold transition-colors ${location.pathname === '/services' ? 'text-eden-gold' : ''}`}>Services</Link>
            <Link to="/devis" className={`hover:text-eden-gold transition-colors ${location.pathname === '/devis' ? 'text-eden-gold' : ''}`}>Devis</Link>
          </nav>
        )}

        {/* ACTIONS */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* LIEN MESSAGERIE INTERNE (POINT 1) */}
          {!isAuthPage && (
            <Link 
              to="/messages" 
              className={`relative flex items-center justify-center p-2.5 md:p-3 rounded-full border transition-all shadow-lg active:scale-90 ${
                isMessagesPage 
                ? 'bg-eden-gold text-eden-dark border-eden-gold' 
                : 'bg-white/5 text-eden-gold border-eden-gold/20 hover:bg-eden-gold/10'
              }`}
            >
              <MessageSquare size={18} />
              
              {/* Badge de notification dynamique */}
              {hasNewMessage && !isMessagesPage && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-eden-dark"></span>
                </span>
              )}
            </Link>
          )}

          {/* CONTACT WHATSAPP DIRECT */}
          <a 
            href="https://wa.me/33780801642" 
            className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 bg-[#25D366]/10 text-[#25D366] rounded-full border border-[#25D366]/20 text-[8px] font-black uppercase tracking-widest shadow-lg hover:bg-[#25D366]/20 transition-all"
          >
            <MessageCircle size={14} />
            <span>WhatsApp</span>
          </a>
          
          <Link 
            to="/login" 
            className={`flex items-center gap-2 px-4 md:px-6 py-2 bg-eden-gold text-white rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all shadow-xl hover:brightness-110 active:scale-95 ${isAuthPage ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <User size={14} /> 
            <span className="hidden sm:inline">Espace client</span>
          </Link>
          
          {!isAuthPage && (
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* MENU MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && !isAuthPage && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-eden-dark z-[90] flex flex-col p-8 pt-32 h-screen overflow-hidden touch-none"
          >
            <nav className="flex flex-col gap-6 relative z-10">
              <Link to="/accueil" className="font-black-mango text-3xl text-white">Accueil</Link>
              <Link to="/services" className="font-black-mango text-3xl text-white">Services</Link>
              <Link to="/devis" className="font-black-mango text-3xl text-white">Devis</Link>
              
              {/* Lien Messagerie dans le menu mobile */}
              <Link 
                to="/messages" 
                className="font-black-mango text-3xl text-eden-gold flex items-center justify-between"
              >
                <span>Messages</span>
                <div className="relative">
                  <MessageSquare size={28} />
                  {hasNewMessage && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-eden-dark"></span>
                  )}
                </div>
              </Link>
              
              <div className="h-px bg-white/10 my-2" />
              
              <Link to="/login" className="font-black-mango text-3xl text-white flex items-center gap-3">
                Mon Compte <User size={28} />
              </Link>
            </nav>

            <div className="mt-auto pb-10 text-center">
              <p className="text-white/20 text-[8px] uppercase tracking-[0.5em] font-bold">
                L'Excellence de la Propreté • France
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}