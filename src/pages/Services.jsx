import React from 'react';
import { motion } from 'framer-motion';
import { 
    Sparkles, 
    Building2, 
    ShieldCheck, 
    ArrowRight, 
    CheckCircle2, 
    Droplets, 
    Gem,
    MessageCircle,
    Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
    {
        id: "chantier", // Identifiant synchronisé avec Devis
        title: "Fin de Chantier",
        subtitle: "L'art de la finition",
        icon: <Droplets className="text-eden-gold" size={32} />,
        image: "https://i.ibb.co/ymL2Kt0c/finChantier.jpg",
        description: "Transformation radicale après travaux. Une finition chirurgicale pour une livraison clé en main sans compromis.",
        features: [
            "Élimination des voiles de ciment",
            "Dégraissage intensif vitrages",
            "Aspiration poussières fines",
            "Remise à neuf des sols"
        ]
    },
    {
        id: "tertiaire", // Identifiant synchronisé avec Devis
        title: "Bureaux & Tertiaire",
        subtitle: "Performance & Sérénité",
        icon: <Building2 className="text-eden-gold" size={32} />,
        image: "https://i.ibb.co/d41QJvQd/imageBureaux.jpg",
        description: "Maintenance invisible et rigoureuse. Nous créons des environnements sains pour booster votre productivité.",
        features: [
            "Entretien postes de travail",
            "Nettoyage de points de contacts",
            "Désinfection microbiologique",
            "Gestion des consommables",
            "Nettoyage des sanitaires"
        ]
    },
    {
        id: "particulier", // Identifiant synchronisé avec Devis
        title: "Chez particulier",
        subtitle: "Discrétion & Excellence",
        icon: <Gem className="text-eden-gold" size={32} />,
        image: "https://i.ibb.co/vC44nPrc/particulier.jpg",
        description: "Standards de l'hôtellerie haut de gamme. Nous prenons soin de votre patrimoine avec une attention extrême.",
        features: [
            "Mobilier de haute valeur",
            "Vitrages accès difficiles",
            "Nettoyage de points de contacts",
            "Nettoyage des sanitaires",
            "Nettoyage vapeur des textiles délicats"
        ]
    }
];

const Services = () => {
    return (
        <div className="min-h-screen bg-[#0A1A1E] text-white selection:bg-eden-gold/30 overflow-x-hidden">
            
            {/* HERO SECTION */}
            <section className="relative pt-40 pb-24 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-eden-gold/10 blur-[150px] rounded-full -z-10" />
                
                <div className="max-w-7xl mx-auto text-center">
                  <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-8"
                    >
                        <Zap size={14} className="text-eden-gold fill-eden-gold" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-eden-gold">Expertise Signature</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="font-black-mango text-6xl md:text-9xl mb-8 leading-[0.8] tracking-tighter"
                    >
                        Solutions <br />
                        <span className="text-eden-gold italic">Premium</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-2xl mx-auto text-gray-400 font-light text-lg md:text-xl leading-relaxed"
                    >
                        Nous ne nettoyons pas seulement. Nous restaurons l'éclat de vos actifs immobiliers avec une rigueur absolue.
                    </motion.p>
                </div>
            </section>

            {/* SERVICES CARDS */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div 
                            key={service.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] overflow-hidden hover:border-eden-gold/50 transition-all duration-500 flex flex-col"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A1E] to-transparent" />
                                <div className="absolute top-6 left-6 p-4 bg-[#0A1A1E]/80 backdrop-blur-md rounded-2xl border border-white/10 group-hover:bg-eden-gold transition-colors duration-500">
                                    {service.icon}
                                </div>
                            </div>

                            <div className="p-10 pt-4 flex-grow flex flex-col">
                                <span className="text-eden-gold text-[10px] font-black uppercase tracking-[0.3em] mb-3 block">{service.subtitle}</span>
                                <h3 className="font-black-mango text-4xl mb-6 group-hover:text-eden-gold transition-colors">{service.title}</h3>
                                
                                <p className="text-gray-400 text-sm leading-relaxed mb-8 font-light italic">
                                    "{service.description}"
                                </p>

                                <ul className="space-y-4 mb-10 flex-grow">
                                    {service.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <CheckCircle2 size={16} className="text-eden-gold shrink-0" />
                                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest leading-none">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* MODIF ICI : Redirection directe avec paramètre type */}
                                <Link 
                                    to={`/devis?type=${service.id}`} 
                                    className="inline-flex items-center justify-between w-full p-6 bg-white/10 text-white rounded-2xl border border-white/10 group/btn hover:bg-eden-gold hover:border-eden-gold transition-all duration-300"
                                >
                                    <span className="font-black text-[10px] uppercase tracking-[0.2em]">Configurer ma prestation</span>
                                    <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* TRUST SECTION */}
            <section className="py-32 relative">
                <div className="max-w-7xl mx-auto px-6 border-y border-white/10 py-20 bg-white/[0.02]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { v: "100%", l: "Satisfaction Client" },
                            { v: "48", l: "Points de Contrôle" },
                            { v: "+500", l: "Chantiers / An" },
                            { v: "Rapide", l: "Temps de Réponse" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center border-x border-white/5 first:border-l-0 last:border-r-0">
                                <p className="font-black-mango text-5xl md:text-6xl text-eden-gold mb-2">{stat.v}</p>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">{stat.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="max-w-6xl mx-auto px-6 mb-32">
                <div className="relative bg-gradient-to-br from-[#12332E] to-[#0A1A1E] p-12 md:p-24 rounded-[4rem] border border-white/10 overflow-hidden text-center shadow-2xl shadow-black/50">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-eden-gold/10 blur-[100px] rounded-full" />
                    
                    <h2 className="font-black-mango text-5xl md:text-7xl text-white mb-8 relative z-10 leading-[0.9]">
                        Donnez vie à votre <br /> <span className="text-eden-gold italic">Projet</span>
                    </h2>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12 relative z-10">
                        <Link to="/devis" className="w-full md:w-auto px-12 py-6 bg-eden-gold text-white rounded-full font-black uppercase text-[11px] tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl">
                            Demander un devis en ligne
                        </Link>
                        <a 
                            href="https://wa.me/33780801642" 
                            className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-6 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white/10 transition-all"
                        >
                            <MessageCircle size={18} className="text-[#25D366]" />
                            WhatsApp Expert
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Services;