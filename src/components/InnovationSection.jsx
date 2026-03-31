import { motion } from 'framer-motion';
import { Smartphone, ShieldCheck, BarChart3, Sparkles } from 'lucide-react';

export default function InnovationSection() {
  const points = [
    { 
      title: "Suivi Temps Réel", 
      desc: "Digitalisation totale de nos processus pour une transparence maximale sur chaque site.", 
      icon: Smartphone 
    },
    { 
      title: "Traçabilité & Data", 
      desc: "Reporting précis et outils numériques embarqués pour un historique complet de vos interventions.", 
      icon: BarChart3 
    },
    { 
      title: "Image de Marque", 
      desc: "Des agents formés et équipés, garantissant une image d'excellence pour votre établissement.", 
      icon: ShieldCheck 
    }
  ];

  return (
    <section className="bg-white py-24 md:py-40 px-4 md:px-6 relative overflow-hidden">
      {/* Subtile touche de lumière en arrière-plan */}
      <div className="absolute top-0 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-eden-gold/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-4 md:mb-6"
          >
            <Sparkles size={14} className="text-eden-gold opacity-50" />
            <span className="text-eden-gold text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.5em]">Technologie</span>
            <Sparkles size={14} className="text-eden-gold opacity-50" />
          </motion.div>
          
          <h2 className="font-black-mango text-3xl md:text-7xl text-eden-dark leading-tight">
            L'Innovation au service <br className="hidden md:block"/>
            <span className="text-eden-gold italic text-4xl md:text-8xl">de la Propreté</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {points.map((p, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              className="group text-center p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] hover:bg-gray-50/50 transition-all duration-500 border border-transparent hover:border-gray-100"
            >
              <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white shadow-2xl rounded-[1.4rem] md:rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 md:mb-10 text-eden-gold border border-gray-50 group-hover:bg-eden-gold group-hover:text-white transition-all duration-500 transform group-hover:rotate-6">
                <p.icon size={28} md={32} strokeWidth={1.5} />
                {/* Petit halo doré derrière l'icône */}
                <div className="absolute inset-0 bg-eden-gold/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h3 className="font-black-mango text-xl md:text-2xl text-eden-dark mb-3 md:mb-4 tracking-tight">
                {p.title}
              </h3>
              
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-light px-2 md:px-4">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}