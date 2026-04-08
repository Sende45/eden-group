import React from 'react';
import { Mail, MapPin, Phone, Globe, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-eden-dark text-white pt-20 pb-10 px-6 border-t border-eden-gold/20 relative overflow-hidden">
            {/* Soft Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-eden-gold/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-16">
                    
                    {/* IDENTITÉ */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="font-black-mango text-3xl text-eden-gold mb-6 tracking-tight">EDÈN Group</h4>
                        <p className="text-gray-400 text-sm leading-relaxed italic max-w-xs md:pr-10">
                            "La signature visuelle de votre propre qualité de service."
                        </p>
                        <div className="mt-8 flex gap-4 items-center">
                            <ShieldCheck size={16} className="text-eden-gold/50" />
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Entreprise Agréée</span>
                        </div>
                    </div>

                    {/* IMPLANTATIONS */}
                    <div className="space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-eden-gold font-black text-[10px] uppercase tracking-[0.3em]">Nos Implantations</h4>
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-3 text-sm text-gray-400 group cursor-default">
                                <MapPin className="text-eden-gold shrink-0 mx-auto md:mx-0 group-hover:scale-110 transition-transform" size={18} />
                                <p className="leading-relaxed">
                                    <span className="text-white font-bold block md:inline">Siège :</span> 17 Rue Boucherie Basse, <br className="hidden md:block"/> 43000 Le Puy-en-Velay
                                </p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-3 text-sm text-gray-400 group cursor-default">
                                <MapPin className="text-eden-gold shrink-0 mx-auto md:mx-0 group-hover:scale-110 transition-transform" size={18} />
                                <p className="leading-relaxed">
                                    <span className="text-white font-bold block md:inline">Agence Paris :</span> 7 Place de la Chênaie <br className="hidden md:block"/>  94470 Boissy-Saint-Léger
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CONTACTS */}
                    <div className="space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-eden-gold font-black text-[10px] uppercase tracking-[0.3em]">Contact Direct</h4>
                        <div className="space-y-4 text-sm w-full">
                            <a href="tel:0780801642" className="flex items-center justify-center md:justify-start gap-3 text-gray-400 hover:text-white transition-all group">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-eden-gold transition-colors">
                                    <Phone size={14} className="text-eden-gold group-hover:text-eden-dark" />
                                </div>
                                <span className="font-medium tracking-wide">07 80 80 16 42</span>
                            </a>
                            <a href="mailto:direction@eden-group.pro" className="flex items-center justify-center md:justify-start gap-3 text-gray-400 hover:text-white transition-all group">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-eden-gold transition-colors">
                                    <Mail size={14} className="text-eden-gold group-hover:text-eden-dark" />
                                </div>
                                <span className="font-medium tracking-wide">direction@eden-group.pro</span>
                            </a>
                            <a href="https://www.eden-group.pro" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-3 text-gray-400 hover:text-white transition-all group">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-eden-gold transition-colors">
                                    <Globe size={14} className="text-eden-gold group-hover:text-eden-dark" />
                                </div>
                                <span className="font-medium tracking-wide">www.eden-group.pro</span>
                                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* SIRET / RCS SECTION */}
                <div className="flex justify-center md:justify-start mb-8">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                        <p className="text-[10px] text-eden-gold font-bold uppercase tracking-[0.2em]">
                            SIRET / RCS — <span className="text-white">989 398 839 00013</span>
                        </p>
                    </div>
                </div>

                {/* COPYRIGHT & SIGNATURE */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] md:text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                    <span>© 2026 EDÈN Group — Tous droits réservés</span>
                    <span className="text-gray-700 hidden md:inline">|</span>
                    <span>L'Excellence de la Propreté — Fait à Paris</span>
                </div>
            </div>
        </footer>
    );
}