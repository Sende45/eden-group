import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Calendar, FileText, ChevronRight, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Historique = () => {
  const { userData } = useAuth();
  const [interventions, setInterventions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!userData?.fullName) return;

    const q = query(
      collection(db, "messages"), 
      where("clientTarget", "==", userData.fullName),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().timestamp?.toDate().toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric'
        })
      }));
      setInterventions(docs);
    });

    return () => unsubscribe();
  }, [userData]);

  const filteredData = interventions.filter(item => {
    const matchesSearch = item.text?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'photo') return matchesSearch && item.mediaType === 'photo';
    if (filter === 'video') return matchesSearch && item.mediaType === 'video';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Barre de Recherche et Filtre */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 md:p-6 rounded-[2rem] md:rounded-3xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eden-gold transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une intervention..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-eden-gold/20 transition-all text-eden-dark"
          />
        </div>
        <div className="flex items-center gap-2 self-end md:self-center">
          <Filter size={14} className="text-eden-gold" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-gray-500"
          >
            <option value="all">Tous les types</option>
            <option value="photo">Photos</option>
            <option value="video">Vidéos</option>
          </select>
        </div>
      </div>

      {/* Liste des Interventions */}
      <div className="space-y-3 md:space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 hover:border-eden-gold/30 hover:shadow-xl transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-4 md:gap-6 min-w-0">
                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center text-eden-gold group-hover:bg-eden-gold group-hover:text-white transition-all shadow-sm">
                  {item.mediaUrl ? <FileText size={20} md={24} /> : <Calendar size={20} md={24} />}
                </div>
                <div className="truncate">
                  <h4 className="font-bold text-eden-dark text-xs md:text-sm uppercase tracking-tight truncate leading-tight">
                    {item.role === 'admin' ? (item.type || "Rapport d'intervention") : "Votre message"}
                  </h4>
                  <p className="text-[10px] md:text-[11px] text-gray-400 mt-1 truncate">
                    {item.date} <span className="mx-1 hidden md:inline">•</span> <br className="md:hidden" /> {item.location}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4 shrink-0 ml-2">
                {item.mediaUrl && (
                  <span className="hidden sm:block text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 md:px-3 py-1 bg-eden-gold/10 text-eden-gold rounded-full">
                    Média
                  </span>
                )}
                <ChevronRight className="text-gray-300 group-hover:text-eden-gold group-hover:translate-x-1 transition-all" size={18} md={20} />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 md:py-24 bg-gray-50/50 rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-gray-200">
            <Search className="mx-auto text-gray-200 mb-4" size={40} />
            <p className="text-gray-400 font-medium text-xs md:text-sm uppercase tracking-widest px-6">Aucune archive disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Historique;