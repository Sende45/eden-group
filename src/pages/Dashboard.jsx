import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Construction, Building2, UserCheck, ArrowRight, 
  ShieldCheck, CheckCircle2, Sparkles, Clock, Camera, PlayCircle 
} from 'lucide-react';

const ServiceCard = ({ title, icon: Icon, description, delay, image }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className="group relative rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col"
  >
    <div className="relative h-72 overflow-hidden bg-gray-200">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute inset-0 bg-eden-dark/10 group-hover:bg-eden-dark/30 transition-colors" />
        <div className="absolute top-6 left-6 w-12 h-12 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow-lg border border-eden-gold/20 group-hover:bg-eden-gold transition-colors duration-500">
            <Icon className="w-6 h-6 text-eden-gold group-hover:text-white" />
        </div>
    </div>
    <div className="p-10 relative z-10 flex flex-col flex-grow">
      <h3 className="font-black-mango text-3xl text-eden-dark mb-4 tracking-tight leading-tight">{title}</h3>
      <p className="text-gray-400 leading-relaxed mb-8 text-sm group-hover:text-gray-600 transition-colors flex-grow">{description}</p>
      <Link to="/devis" className="flex items-center text-eden-gold font-bold text-xs uppercase tracking-widest group/btn cursor-pointer">
        Explorer l'offre <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-3 transition-transform duration-500" />
      </Link>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-eden-gold/30">
      
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-eden-dark text-white">
        <motion.div style={{ y: yRange }} className="absolute inset-0 z-0">
          <div className="absolute inset-0">
              <img src="/assets/imageHome.jpg" alt="Eden Group" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
              <div className="absolute inset-0 bg-[url('/assets/palm-texture.jpg')] bg-cover bg-center opacity-25 mix-blend-overlay" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-eden-dark/30 via-eden-dark/90 to-[#FDFDFD]" />
        </motion.div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-6 bg-eden-gold/50" />
            <span className="text-eden-gold text-[10px] font-bold uppercase tracking-[0.4em] bg-eden-gold/5 backdrop-blur-sm px-5 py-2 rounded-full border border-eden-gold/20 italic">
              L'Excellence de la Propreté
            </span>
            <div className="h-px w-6 bg-eden-gold/50" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="font-black-mango text-6xl md:text-[8rem] mb-10 leading-[0.9]"
          >
            Le Luxe de la <br/>
            <span className="text-eden-gold italic">Transparence</span>
          </motion.h1>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center font-bold">
            <Link to="/devis" className="px-10 py-5 bg-eden-gold text-white rounded-full uppercase tracking-widest text-[10px] hover:shadow-[0_0_30px_rgba(184,151,106,0.3)] transition-all hover:scale-105">
              Demander un Devis
            </Link>
            <a href="#live" className="px-10 py-5 border border-white/20 text-white rounded-full uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" /> Flux Direct
            </a>
          </div>
        </div>
      </section>

      {/* POLES D'EXCELLENCE */}
      <section id="services" className="py-40 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-24 text-center">
          <h2 className="font-black-mango text-5xl md:text-7xl text-eden-dark mb-6 tracking-tight">Nos Pôles d'Excellence</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-px bg-eden-gold/30" />
            <Sparkles className="text-eden-gold w-5 h-5" />
            <div className="w-10 h-px bg-eden-gold/30" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <ServiceCard title="Fin de Chantier" icon={Construction} image="/assets/image_4.png" description="L'excellence opérationnelle pour le nettoyage approfondi après travaux." delay={0.1} />
          <ServiceCard title="Bureaux & Tertiaire" icon={Building2} image="/assets/image_3.png" description="Entretien minutieux des postes de travail pour un cadre stimulant." delay={0.2} />
          <ServiceCard title="Services Particuliers" icon={UserCheck} image="/assets/image_2.png" description="Prestations de grands nettoyages garantissant une satisfaction totale." delay={0.3} />
        </div>
      </section>

      {/* SECTION LIVE FEED - NOUVELLE MODIF */}
      <section id="live" className="py-32 bg-eden-dark text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#FDFDFD] to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <span className="text-eden-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Temps Réel</span>
              <h2 className="font-black-mango text-5xl md:text-6xl leading-tight">Votre chantier <br/><span className="text-eden-gold italic">en direct</span></h2>
            </div>
            <p className="text-gray-400 max-w-sm text-sm font-light leading-relaxed">
              Visualisez l'avancement de vos prestations à travers les rapports photos et vidéos transmis par nos agents sur site.
            </p>
          </div>

          {/* Timeline Simplifiée pour le Dashboard */}
          <div className="grid md:grid-cols-2 gap-10">
            {[1, 2].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i === 1 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm group hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-eden-gold/10 flex items-center justify-center">
                      <Clock className="text-eden-gold w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400">Aujourd'hui - 14:30</p>
                      <p className="text-xs font-bold text-eden-gold">Phase de finitions</p>
                    </div>
                  </div>
                  <CheckCircle2 className="text-green-500 w-5 h-5" />
                </div>
                
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-eden-dark mb-4">
                  <img src={i === 1 ? "/assets/image_3.png" : "/assets/image_2.png"} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Direct" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {i === 2 ? <PlayCircle className="text-white w-12 h-12 opacity-80" /> : <Camera className="text-white w-12 h-12 opacity-80" />}
                  </div>
                </div>
                <p className="text-xs text-gray-300 font-light italic">"Nettoyage haute pression des vitrages extérieurs terminé."</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
             <Link to="/espace-client" className="inline-flex items-center gap-3 text-eden-gold font-bold text-xs uppercase tracking-[0.2em] hover:gap-5 transition-all">
                Voir l'historique complet <ArrowRight size={16} />
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;