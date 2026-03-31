import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Composant ServiceCard - EDÈN Group
 * @param {string} id - Identifiant pour la redirection (?type=id)
 * @param {string} title - Titre du service
 * @param {React.ElementType} icon - Icône Lucide
 * @param {string} description - Texte descriptif
 * @param {number} delay - Délai d'apparition Framer Motion
 * @param {string} image - URL de l'image (ImgBB)
 */
const ServiceCard = ({ id, title, icon: Icon, description, delay, image }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="group relative rounded-[2.5rem] bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full"
    >
      {/* SECTION IMAGE & ICONE */}
      <div className="relative h-72 overflow-hidden bg-gray-50">
        <img 
          src={image} 
          alt={title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Eden+Group"; }}
        />
        {/* Overlay progressif au survol */}
        <div className="absolute inset-0 bg-eden-dark/10 group-hover:bg-eden-dark/30 transition-colors duration-500" />
        
        {/* Badge Icône Blanc & Or */}
        <div className="absolute top-6 left-6 w-12 h-12 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center shadow-lg border border-eden-gold/10 group-hover:bg-eden-gold transition-colors duration-500">
          <Icon className="w-6 h-6 text-eden-gold group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* SECTION TEXTE */}
      <div className="p-10 flex-grow flex flex-col">
        <h3 className="font-black-mango text-3xl text-eden-dark mb-4 tracking-tight leading-tight">
          {title}
        </h3>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-8 font-light flex-grow">
          {description}
        </p>

        {/* LIEN DYNAMIQUE : Envoie l'ID au formulaire de Devis */}
        <Link 
          to={`/devis?type=${id}`} 
          className="flex items-center text-eden-gold font-bold text-[10px] uppercase tracking-[0.2em] group/link"
        >
          <span className="relative">
            Explorer l'offre
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-eden-gold transition-all duration-500 group-hover/link:w-full" />
          </span>
          <ArrowRight className="ml-2 w-4 h-4 transform group-hover/link:translate-x-2 transition-transform duration-500" />
        </Link>
      </div>
    </motion.div>
  );
};

export default ServiceCard;