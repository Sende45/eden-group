import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Clock, FileCheck, ShieldCheck } from 'lucide-react';

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="flex gap-6 group">
    <div className="w-14 h-14 shrink-0 rounded-2xl bg-eden-gold/10 border border-eden-gold/20 flex items-center justify-center group-hover:bg-eden-gold transition-all duration-500">
      <Icon className="w-6 h-6 text-eden-gold group-hover:text-white transition-colors" />
    </div>
    <div>
      <h4 className="font-black-mango text-xl text-white mb-2">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed font-light">{desc}</p>
    </div>
  </div>
);

export default function ConnecteSection() {
  return (
    <section className="bg-eden-dark py-40 relative overflow-hidden">
      {/* Effet de lumière diffuse en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-eden-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center relative z-10">
        
        {/* TEXTE & ARGUMENTS */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <span className="text-eden-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">
            Innovation Digitale
          </span>
          <h2 className="font-black-mango text-5xl md:text-7xl text-white mb-10 leading-[1.1]">
            Le Nettoyage <br/>
            <span className="text-eden-gold italic">Connecté</span>
          </h2>
          
          <p className="text-gray-300 text-lg mb-16 font-light leading-relaxed max-w-xl">
            Grâce à notre activité numérique, suivez en temps réel la réalisation de vos prestations, 
            accédez à vos rapports photos et gérez vos devis en ligne. 
            <span className="block mt-4 text-eden-gold font-medium italic">
              La transparence EDÈN Group au service de votre sérénité.
            </span>
          </p>

          <div className="grid sm:grid-cols-1 gap-10">
            <Feature 
              icon={Clock} 
              title="Suivi Temps Réel" 
              desc="Visualisez l'avancement de nos équipes sur vos différents sites en direct." 
            />
            <Feature 
              icon={Camera} 
              title="Rapports Photos" 
              desc="Accès instantané aux preuves visuelles (Avant/Après) pour chaque intervention." 
            />
            <Feature 
              icon={FileCheck} 
              title="Gestion Simplifiée" 
              desc="Consultez vos devis, factures et plannings depuis votre espace client sécurisé." 
            />
          </div>
        </motion.div>

        {/* VISUEL MAQUETTE (Dashboard sur mobile/tablette) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="relative z-10 bg-[#0A1A1E] p-4 rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.6)] border border-white/5">
            <img 
              src="/assets/dashboard-preview.jpg" 
              alt="Interface Nettoyage Connecté" 
              className="rounded-[2.8rem] w-full shadow-inner opacity-90"
            />
          </div>
          
          {/* Badge de confiance flottant */}
          <div className="absolute -bottom-10 -right-6 z-20 bg-eden-gold p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-md border border-white/10 hidden md:block">
            <ShieldCheck className="w-12 h-12 text-white mb-4" />
            <p className="text-white text-[9px] font-bold uppercase tracking-widest text-center leading-tight">
              Données <br/> Sécurisées
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}