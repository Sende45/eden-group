import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Construction, Building2, UserCheck, ArrowRight, 
  Camera, Clock, ShieldCheck, MessageCircle, Sparkles, 
  Star, Quote, Image as ImageIcon, Send, Loader2,
  Plus, X, FileCheck // Ajout de FileCheck ici
} from 'lucide-react';
// Firebase imports
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const IMAGES = {
  hero: "https://i.ibb.co/jZ4ZCMn3/imageHome.jpg",          
  chantier: "https://i.ibb.co/ymL2Kt0c/finChantier.jpg",   
  bureaux: "https://i.ibb.co/SpG4ZpW/imageBureaux.jpg",          
  particulier: "https://i.ibb.co/vC44nPrc/particulier.jpg",
  dashboard: "https://i.ibb.co/nqq8ryP2/dashboard-preview.jpg" 
};

const FadeInText = ({ text, className }) => {
  const words = text.split(" ");
  return (
    <h2 className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          viewport={{ once: true }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </h2>
  );
};

const ServiceCard = ({ id, title, icon: Icon, description, delay, image }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-100px" }}
    whileHover={{ y: -15 }}
    transition={{ duration: 0.6, delay }}
    className="group relative rounded-[2.5rem] bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full"
  >
    <div className="relative h-60 md:h-72 overflow-hidden bg-gray-50">
        <motion.img 
          src={image} 
          alt={title} 
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 1.5 }}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-eden-dark/20 group-hover:bg-eden-dark/40 transition-colors" />
        <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-eden-gold/10 group-hover:bg-eden-gold transition-colors duration-500">
            <Icon className="w-6 h-6 text-eden-gold group-hover:text-white transition-colors" />
        </div>
    </div>
    <div className="p-8 md:p-10 flex-grow flex flex-col relative">
      <motion.div 
        className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="text-eden-gold w-5 h-5" />
      </motion.div>
      <h3 className="font-black-mango text-2xl md:text-3xl text-eden-dark mb-4 tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-8 font-light flex-grow">{description}</p>
      <Link to={`/devis?type=${id}`} className="flex items-center text-eden-gold font-bold text-[10px] uppercase tracking-[0.2em] group/link w-fit">
        <span className="relative">Découvrir l'expertise
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-eden-gold transition-all duration-500 group-hover/link:w-full" />
        </span>
        <ArrowRight className="ml-2 w-4 h-4 transform group-hover/link:translate-x-2 transition-transform duration-500" />
      </Link>
    </div>
  </motion.div>
);

const Home = () => {
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const yRange = useTransform(scaleProgress, [0, 1], [0, -200]);
  const opacityHero = useTransform(scaleProgress, [0, 0.2], [1, 0]);

  // ÉTATS POUR LES AVIS
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAvisForm, setShowAvisForm] = useState(false);
  const [avisData, setAvisData] = useState({ name: '', comment: '', rating: 5 });
  const [avisFile, setAvisFile] = useState(null);
  const [avisPreview, setAvisPreview] = useState(null);

  // Charger les avis depuis Firebase
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        setReviews(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) { console.error("Erreur avis:", err); }
      setLoadingReviews(false);
    };
    fetchReviews();
  }, []);

  const handleAvisSubmit = async (e) => {
    e.preventDefault();
    if (!avisData.name || !avisData.comment) return alert("Veuillez remplir les champs");
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (avisFile) {
        const storageRef = ref(storage, `reviews/${Date.now()}_${avisFile.name}`);
        await uploadBytes(storageRef, avisFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "reviews"), {
        ...avisData,
        photoUrl: imageUrl,
        createdAt: serverTimestamp()
      });
      alert("Merci pour votre confiance ! Votre avis a été ajouté.");
      setAvisData({ name: '', comment: '', rating: 5 });
      setAvisFile(null); setAvisPreview(null); setShowAvisForm(false);
      
      // Refresh local list
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) { console.error(err); }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-eden-gold/30 overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative h-[95vh] md:h-screen flex items-center justify-center overflow-hidden bg-eden-dark">
        <motion.div style={{ y: yRange, opacity: opacityHero }} className="absolute inset-0 z-0">
          <img src={IMAGES.hero} alt="Eden Excellence" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-eden-dark/80 via-transparent to-eden-dark" />
        </motion.div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "backOut" }} className="mb-8 mt-10 md:mt-20">
            <span className="text-eden-gold text-[10px] md:text-[12px] font-bold uppercase tracking-[0.6em] border-b border-eden-gold/30 pb-3">Du chantier au salon</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 50, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.2, delay: 0.2 }} className="font-black-mango text-4xl md:text-7xl lg:text-8xl mb-12 leading-[1.1] tracking-tight max-w-5xl mx-auto">
            Nettoyage de chantier, bureaux et habitations <span className="text-eden-gold italic block mt-4 font-light"> sans compromis</span>
          </motion.h1>
          <motion.div className="flex flex-col sm:flex-row gap-5 md:gap-8 justify-center items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <Link to="/devis" className="w-full sm:w-auto px-10 md:px-12 py-5 bg-eden-gold text-white rounded-full font-bold uppercase tracking-widest text-[10px] md:text-[11px] shadow-xl hover:shadow-eden-gold/50 transition-all hover:-translate-y-1 active:scale-95">Demander mon Devis (€)</Link>
            <a href="https://wa.me/33780801642" className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 md:px-12 py-5 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest text-[10px] md:text-[11px] hover:bg-white/10 transition-all backdrop-blur-md">
              <MessageCircle size={18} className="text-[#25D366]" /> WhatsApp Direct
            </a>
          </motion.div>
        </div>
      </section>

      {/* SECTION SERVICES */}
      <section id="services" className="py-24 md:py-40 px-6 max-w-7xl mx-auto bg-[#FDFDFD]">
        <div className="text-center mb-20 md:mb-32">
          <motion.p initial={{ opacity: 0, letterSpacing: "0em" }} whileInView={{ opacity: 1, letterSpacing: "0.4em" }} className="text-eden-gold text-[9px] md:text-[10px] font-black uppercase mb-4">Nos Pôles d'Excellence</motion.p>
          <FadeInText text="Services Premium" className="font-black-mango text-4xl md:text-7xl text-eden-dark mb-6 tracking-tight" />
          <motion.div initial={{ width: 0 }} whileInView={{ width: "6rem" }} className="h-1 bg-eden-gold/40 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          <ServiceCard id="chantier" title="Fin de Chantier" icon={Construction} image={IMAGES.chantier} description="La remise en état technique après travaux. Une finition chirurgicale pour une livraison sans réserve." delay={0.1} />
          <ServiceCard id="tertiaire" title="Bureaux & Tertiaire" icon={Building2} image={IMAGES.bureaux} description="Entretien rigoureux des environnements de travail pour maximiser la productivité de vos équipes." delay={0.2} />
          <ServiceCard id="particulier" title="Services chez particulier" icon={UserCheck} image={IMAGES.particulier} description="Nettoyage de prestige et discrétion absolue pour les intérieurs les plus exigeants." delay={0.3} />
        </div>
      </section>

      {/* SECTION TÉMOIGNAGES - VERSION SOMBRE LUXE */}
      <section className="py-24 md:py-40 bg-[#0A1A1E] relative overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-eden-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="text-left">
              <span className="text-eden-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Proof of Quality</span>
              <h2 className="font-black-mango text-4xl md:text-7xl text-white tracking-tight">Ils nous font <span className="text-eden-gold italic">Confiance</span></h2>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowAvisForm(!showAvisForm)}
              className="px-8 py-4 bg-eden-gold text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-[0_10px_30px_rgba(184,151,106,0.3)]"
            >
              {showAvisForm ? <X size={16}/> : <Plus size={16}/>} Laisser un avis
            </motion.button>
          </div>

          <AnimatePresence>
            {showAvisForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-20 overflow-hidden">
                <form onSubmit={handleAvisSubmit} className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/10 grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <input type="text" placeholder="Votre Nom / Structure" required className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 outline-none focus:ring-2 ring-eden-gold/50 font-medium text-white placeholder:text-gray-500" value={avisData.name} onChange={e => setAvisData({...avisData, name: e.target.value})}/>
                    <textarea placeholder="Votre expérience avec EDÈN Group..." required className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 outline-none focus:ring-2 ring-eden-gold/50 font-medium h-40 text-white placeholder:text-gray-500" value={avisData.comment} onChange={e => setAvisData({...avisData, comment: e.target.value})}/>
                  </div>
                  <div className="space-y-6 flex flex-col justify-between">
                    <label className="group border-2 border-dashed border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center hover:border-eden-gold/40 hover:bg-eden-gold/5 transition-all cursor-pointer relative overflow-hidden aspect-video text-gray-500">
                      {avisPreview ? <img src={avisPreview} className="absolute inset-0 w-full h-full object-cover" alt="preview" /> : (
                        <>
                          <ImageIcon className="text-gray-600 mb-2" size={32} />
                          <span className="text-[10px] font-black uppercase">Ajouter une photo</span>
                        </>
                      )}
                      <input type="file" accept="image/*" hidden onChange={e => {
                        const file = e.target.files[0];
                        if(file) { setAvisFile(file); setAvisPreview(URL.createObjectURL(file)); }
                      }} />
                    </label>
                    <button disabled={isSubmitting} type="submit" className="w-full py-6 bg-white text-eden-dark rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 hover:bg-eden-gold hover:text-white transition-all disabled:opacity-50 shadow-xl">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18}/>} Envoyer mon avis
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingReviews ? <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-eden-gold" /></div> : 
              reviews.map((rev, i) => (
                <motion.div key={rev.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] border border-white/10 flex flex-col h-full relative group hover:border-eden-gold/30 transition-colors">
                  <Quote className="absolute top-8 right-8 text-white/5 w-12 h-12" />
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, star) => <Star key={star} size={14} className={star < rev.rating ? "fill-eden-gold text-eden-gold" : "text-white/10"} />)}
                  </div>
                  <p className="text-gray-300 font-light leading-relaxed mb-8 flex-grow italic text-sm md:text-base">"{rev.comment}"</p>
                  <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    {rev.photoUrl ? <img src={rev.photoUrl} className="w-12 h-12 rounded-full object-cover border-2 border-eden-gold/20" alt="client" /> : <div className="w-12 h-12 rounded-full bg-eden-gold/20 flex items-center justify-center text-eden-gold font-bold">{rev.name?.charAt(0)}</div>}
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase tracking-wider">{rev.name}</h4>
                      <p className="text-[10px] text-eden-gold/60 font-bold uppercase tracking-widest">Client Vérifié</p>
                    </div>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </div>
      </section>

      {/* SECTION NETTOYAGE CONNECTÉ */}
      <section className="bg-eden-dark py-24 md:py-48 relative overflow-hidden text-white px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div initial={{ opacity: 0, x: -100 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 50 }}>
            <span className="text-eden-gold text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">Innovation Digitale</span>
            <h2 className="font-black-mango text-4xl md:text-8xl mb-8 md:mb-10 leading-tight">Le Nettoyage <br/> <span className="text-eden-gold italic">Connecté</span></h2>
            <p className="text-gray-400 text-sm md:text-lg mb-8 md:mb-12 font-light leading-relaxed max-w-xl">
              EDÈN Group digitalise la propreté. Suivez en temps réel la réalisation de vos prestations via votre Espace Client dédié. 
              <motion.span className="block mt-4 text-eden-gold font-medium italic" whileInView={{ x: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>validation de devis, suivi temps réel, ⁠rapport photo : la transparence totale.</motion.span>
            </p>
            <div className="space-y-8 md:space-y-10">
              {[
                { icon: FileCheck, t: "Validation de devis", d: "Validez vos devis directement en ligne pour un lancement d'intervention immédiat." },
                { icon: Clock, t: "Suivi temps réel", d: "Contrôlez l'avancement des interventions depuis votre dashboard." }, 
                { icon: Camera, t: "Rapports Photos", d: "Chaque fin de mission déclenche l'envoi d'un rapport visuel complet." }
              ].map((item, i) => (
                <motion.div key={i} className="flex gap-4 md:gap-6 group" whileHover={{ x: 20 }}>
                  <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl bg-eden-gold/10 border border-eden-gold/20 flex items-center justify-center group-hover:bg-eden-gold transition-all duration-500">
                    <item.icon className="w-5 h-5 text-eden-gold group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-black-mango text-xl md:text-2xl mb-1 group-hover:text-eden-gold transition-colors">{item.t}</h4>
                    <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed">{item.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8, rotateY: 30 }} whileInView={{ opacity: 1, scale: 1, rotateY: 0 }} viewport={{ once: true }} transition={{ duration: 1.5 }} className="relative mt-10 md:mt-0 perspective-1000">
            <div className="bg-[#0A1A1E] p-2 md:p-4 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-white/5 overflow-hidden">
               <motion.img src={IMAGES.dashboard} alt="Dashboard EDÈN" className="rounded-[1.8rem] md:rounded-[2.8rem] w-full opacity-80 shadow-inner" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 10, repeat: Infinity }} />
            </div>
            <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-6 -right-4 md:-bottom-10 md:-right-6 z-20 bg-eden-gold p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-white/10 hidden sm:block">
              <ShieldCheck className="w-8 h-8 md:w-12 md:h-12 text-white" />
              <p className="text-white text-[7px] md:text-[9px] font-bold mt-2 md:mt-4 uppercase tracking-widest text-center leading-tight">Sécurité</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;