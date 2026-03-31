import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, MessageCircle, X } from 'lucide-react'; 
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquer le scroll derrière le menu
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
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
            <Link to="/accueil" className="hover:text-eden-gold transition-colors">Accueil</Link>
            <Link to="/services" className="hover:text-eden-gold transition-colors">Services</Link>
            <Link to="/devis" className="hover:text-eden-gold transition-colors">Devis</Link>
          </nav>
        )}

        {/* ACTIONS */}
        <div className="flex items-center gap-2 md:gap-6">
          <a 
            href="https://wa.me/33780801642" 
            className="flex items-center gap-2 px-3 md:px-5 py-2 bg-[#25D366]/10 text-[#25D366] rounded-full border border-[#25D366]/20 text-[8px] font-black uppercase tracking-widest shadow-lg"
          >
            <MessageCircle size={14} />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          
          <Link 
            to="/login" 
            className={`flex items-center gap-2 px-4 md:px-6 py-2 bg-eden-gold text-white rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all ${isAuthPage ? 'opacity-0 pointer-events-none' : ''}`}
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

      {/* MENU MOBILE OVERLAY - TAILLES AJUSTÉES */}
      <AnimatePresence>
        {isMobileMenuOpen && !isAuthPage && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-eden-dark z-[90] flex flex-col p-8 pt-32 h-screen overflow-hidden touch-none"
          >
            {/* Background filigrane plus discret */}
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                <span className="font-black-mango text-[8rem] leading-none">EDÈN</span>
            </div>

            <nav className="flex flex-col gap-6 relative z-10">
              <Link to="/accueil" className="font-black-mango text-3xl text-white hover:text-eden-gold transition-colors">Accueil</Link>
              <Link to="/services" className="font-black-mango text-3xl text-white hover:text-eden-gold transition-colors">Services</Link>
              <Link to="/devis" className="font-black-mango text-3xl text-white hover:text-eden-gold transition-colors">Devis</Link>
              
              <div className="h-px bg-white/10 my-2" />
              
              <Link to="/login" className="font-black-mango text-3xl text-eden-gold flex items-center gap-3 transition-colors">
                Mon Compte <User size={28} />
              </Link>
            </nav>

            <div className="mt-auto pb-10 text-center">
              <p className="text-gray-600 text-[8px] uppercase tracking-[0.5em] font-bold">
                Luxury Cleaning Services
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}