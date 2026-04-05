import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Calendar, FileText, ChevronRight, Search, Filter, Download, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Historique = () => {
  const { userData } = useAuth();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // --- GÉNÉRATION PDF ---
  const generatePDF = (item) => {
    const doc = new jsPDF();
    const gold = [184, 151, 106];
    const dark = [10, 26, 30];

    doc.setFillColor(...dark);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(...gold);
    doc.setFontSize(22);
    doc.text("EDEN GROUP FRANCE", 15, 25);
    doc.setFontSize(9);
    doc.text("EXCELLENCE DE LA PROPRETÉ & SERVICES", 15, 33);

    doc.setTextColor(...dark);
    doc.setFontSize(14);
    doc.text(item.source === 'devis' ? "DEVIS DE PRESTATION" : "RAPPORT D'INTERVENTION", 15, 60);

    doc.autoTable({
      startY: 75,
      head: [['CLIENT', 'DÉTAILS']],
      body: [[
        `${userData?.fullName}\n${userData?.structure || "Particulier"}`,
        `Date : ${item.date}\nType : ${item.type || item.pole || "Service"}\nMontant : ${item.prixDefinitif ? item.prixDefinitif + '€' : 'N/A'}`
      ]],
      theme: 'grid',
      headStyles: { fillColor: gold }
    });

    doc.text("Détails :", 15, doc.lastAutoTable.finalY + 15);
    const splitText = doc.splitTextToSize(item.text || item.message || "Détails validés par EDÈN Group.", 180);
    doc.text(splitText, 15, doc.lastAutoTable.finalY + 25);

    doc.save(`EDEN_${item.source}_${item.id.substring(0, 5)}.pdf`);
  };

  useEffect(() => {
    if (!userData?.fullName && !userData?.email) return;

    // 1. Écouter les MESSAGES (Rapports)
    const qMessages = query(
      collection(db, "messages"),
      where("clientTarget", "==", userData.fullName),
      orderBy("timestamp", "desc")
    );

    // 2. Écouter les DEVIS (Validés)
    const qDevis = query(
      collection(db, "devis"),
      where("userId", "==", userData.uid),
      where("status", "in", ["valide", "client_valide"]),
      orderBy("createdAt", "desc")
    );

    const unsubMessages = onSnapshot(qMessages, (snapM) => {
      const msgDocs = snapM.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        source: 'rapport',
        date: doc.data().timestamp?.toDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        rawDate: doc.data().timestamp?.toDate()
      }));

      onSnapshot(qDevis, (snapD) => {
        const devisDocs = snapD.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          source: 'devis',
          type: `Devis ${doc.data().pole}`,
          date: doc.data().createdAt?.toDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          rawDate: doc.data().createdAt?.toDate()
        }));

        // Fusion et tri par date
        const combined = [...msgDocs, ...devisDocs].sort((a, b) => b.rawDate - a.rawDate);
        setItems(combined);
      });
    });

    return () => unsubMessages();
  }, [userData]);

  const filteredData = items.filter(item => {
    const matchesSearch = (item.text || item.pole || "").toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'devis') return matchesSearch && item.source === 'devis';
    if (filter === 'rapport') return matchesSearch && item.source === 'rapport';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher dans vos archives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm outline-none text-eden-dark"
          />
        </div>
        <div className="flex items-center gap-4">
          <Filter size={14} className="text-eden-gold" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-gray-500"
          >
            <option value="all">Toutes les archives</option>
            <option value="devis">Mes Devis</option>
            <option value="rapport">Mes Rapports</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white p-5 rounded-[2rem] border border-gray-100 hover:border-eden-gold/30 hover:shadow-xl transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all ${item.source === 'devis' ? 'bg-blue-50 text-blue-500' : 'bg-eden-gold/10 text-eden-gold'}`}>
                  {item.source === 'devis' ? <Zap size={24} /> : <FileText size={24} />}
                </div>
                <div className="truncate">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mb-1 inline-block ${item.source === 'devis' ? 'bg-blue-100 text-blue-600' : 'bg-eden-gold/20 text-eden-gold'}`}>
                    {item.source === 'devis' ? 'Facturation' : 'Intervention'}
                  </span>
                  <h4 className="font-bold text-eden-dark text-sm uppercase truncate leading-tight">
                    {item.type || item.pole}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.date} • {item.prixDefinitif ? `${item.prixDefinitif}€` : item.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); generatePDF(item); }}
                  className="p-3 bg-gray-50 text-gray-400 hover:bg-eden-gold hover:text-white rounded-2xl transition-all"
                >
                  <Download size={18} />
                </button>
                <ChevronRight className="text-gray-300 group-hover:text-eden-gold group-hover:translate-x-1 transition-all" size={20} />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <Search className="mx-auto text-gray-200 mb-4" size={40} />
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Aucun élément trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Historique;