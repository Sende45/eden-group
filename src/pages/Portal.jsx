import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Portal = () => {
    return (
        // Fond blanc pur et éclatant - overflow-y-auto pour permettre le scroll sur mobile
        <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-6 relative overflow-x-hidden overflow-y-auto">
            
            {/* LOGO CENTRAL EN BACKGROUND : Changé en 'fixed' pour qu'il reste derrière au scroll mobile */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.img 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.12 }} 
                    transition={{ duration: 2, ease: "easeOut" }}
                    src="https://i.ibb.co/gMMcsrHk/logo.png" 
                    alt="EDÈN Group Background" 
                    className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-white/40" />
            </div>

            {/* EFFETS DE LUMIÈRE DORÉE : Redimensionnés pour mobile */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-eden-gold/15 blur-[80px] md:blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-eden-gold/15 blur-[80px] md:blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-7xl w-full text-center py-10 md:py-0">
                
                {/* TITRE PRINCIPAL : Tailles de texte adaptatives (Responsive Text) */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 md:mb-20"
                >
                    <h1 className="font-black-mango text-5xl sm:text-6xl md:text-9xl text-eden-dark mb-4 tracking-tighter">
                        EDÈN<span className="text-eden-gold italic">Group</span>
                    </h1>
                    <div className="w-16 md:w-24 h-1 bg-eden-gold mx-auto rounded-full mt-2" />
                </motion.div>

                {/* GRILLE : 1 colonne sur mobile (grid-cols-1), 2 sur desktop (md:grid-cols-2) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-6xl mx-auto px-2">
                    
                    {/* CARTE 1 : NETTOYAGE */}
                    <motion.div whileHover={{ y: -10 }} transition={{type: "spring", stiffness: 300}}>
                        <Link 
                            to="/accueil"
                            className="group relative bg-white border border-gray-100 rounded-[2.5rem] md:rounded-[3rem] flex flex-col min-h-[350px] md:min-h-[500px] justify-end p-8 md:p-10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 block"
                        >
                            <img 
                                src="https://i.ibb.co/5Wmt8zDQ/image-b2b426.jpg" 
                                alt="Nettoyage" 
                                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-1000 z-0"
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-eden-dark via-eden-dark/20 to-transparent opacity-80 z-1" />
                            
                            <div className="relative z-10 text-left">
                                <span className="text-eden-gold text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase mb-2 block">Secteur Particuliers</span>
                                <h2 className="font-black-mango text-3xl md:text-6xl text-white leading-none mb-4">
                                    NETTOYAGE
                                </h2>
                                <div className="flex items-center gap-2 md:gap-3 text-white/70 group-hover:text-white transition-colors">
                                    <span className="text-sm md:text-lg font-light italic">eden-group.co</span>
                                    <ArrowRight size={20} className="text-eden-gold group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* CARTE 2 : HOTEL & RESTAURANT */}
                    <motion.a 
                        href="https://eden-group.pro"
                        whileHover={{ y: -10 }}
                        transition={{type: "spring", stiffness: 300}}
                        className="group relative bg-white border border-gray-100 rounded-[2.5rem] md:rounded-[3rem] flex flex-col min-h-[350px] md:min-h-[500px] justify-end p-8 md:p-10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 block"
                    >
                        <img 
                            src="https://i.ibb.co/FbfKjLtG/hotel.jpg" 
                            alt="Hôtellerie" 
                            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-1000 z-0"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-eden-dark via-eden-dark/20 to-transparent opacity-80 z-1" />

                        <div className="relative z-10 text-left">
                            <span className="text-eden-gold text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase mb-2 block">Secteur Professionnel</span>
                            <h2 className="font-black-mango text-3xl md:text-6xl text-white leading-none mb-4">
                                HOTEL & RESTO
                            </h2>
                            <div className="flex items-center gap-2 md:gap-3 text-white/70 group-hover:text-white transition-colors">
                                <span className="text-sm md:text-lg font-light italic">eden-group.pro</span>
                                <ArrowRight size={20} className="text-eden-gold group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </motion.a>
                </div>

                {/* FOOTER RESPONSIVE */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 md:mt-20 text-[10px] md:text-[11px] text-eden-dark/40 uppercase tracking-[0.3em] md:tracking-[0.5em] font-bold px-4"
                >
                    © 2026 EDÈN Group — <span className="text-eden-gold">Signature d'Excellence</span>
                </motion.div>
            </div>
        </div>
    );
};

export default Portal;