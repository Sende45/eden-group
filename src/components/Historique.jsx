// src/components/Historique.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { FileText, ChevronRight, Search, Filter, Download, Zap, X, Calendar, MapPin, Euro } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FORMAT_DATE = { day: 'numeric', month: 'short', year: 'numeric' };

// Les polices standard de jsPDF gèrent mal certains caractères (€, ’) : on les remplace
const pdfTexte = (t) => String(t ?? '').replace(/€/g, 'EUR').replace(/[’‘]/g, "'");

const titreElement = (item) => item.type || item.title || item.pole || (item.source === 'devis' ? 'Devis' : 'Intervention');

const Historique = () => {
  const { userData } = useAuth();
  const [rapports, setRapports] = useState([]);
  const [devis, setDevis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selection, setSelection] = useState(null); // élément ouvert en détail

  // --- GÉNÉRATION PDF ---
  const generatePDF = (item) => {
    try {
      const doc = new jsPDF();
      const gold = [184, 151, 106];
      const dark = [10, 26, 30];

      doc.setFillColor(...dark);
      doc.rect(0, 0, 210, 45, 'F');
      doc.setTextColor(...gold);
      doc.setFontSize(22);
      doc.text('EDEN GROUP FRANCE', 15, 25);
      doc.setFontSize(9);
      doc.text('EXCELLENCE DE LA PROPRETE & SERVICES', 15, 33);

      doc.setTextColor(...dark);
      doc.setFontSize(14);
      doc.text(item.source === 'devis' ? 'DEVIS DE PRESTATION' : "RAPPORT D'INTERVENTION", 15, 60);

      // jspdf-autotable v5 : autoTable(doc, options) — et non plus doc.autoTable(options)
      autoTable(doc, {
        startY: 75,
        head: [['CLIENT', 'DETAILS']],
        body: [[
          pdfTexte(`${userData?.fullName ?? ''}\n${userData?.structure || 'Particulier'}`),
          pdfTexte(
            `Date : ${item.date ?? '-'}\nType : ${titreElement(item)}\nMontant : ${item.prixDefinitif ? `${item.prixDefinitif} EUR HT` : 'N/A'}`
          ),
        ]],
        theme: 'grid',
        headStyles: { fillColor: gold },
      });

      const finY = doc.lastAutoTable?.finalY ?? 100;
      doc.setFontSize(12);
      doc.text('Details :', 15, finY + 15);
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(pdfTexte(item.text || item.message || 'Details valides par EDEN Group.'), 180);
      doc.text(splitText, 15, finY + 25);

      doc.save(`EDEN_${item.source}_${String(item.id).substring(0, 5)}.pdf`);
    } catch (e) {
      console.error('Erreur PDF :', e);
      alert("Le PDF n'a pas pu être généré. Réessayez.");
    }
  };

  // --- ÉCOUTES FIRESTORE (deux écouteurs indépendants, tous deux arrêtés au démontage) ---
  useEffect(() => {
    if (!userData?.fullName) return;
    // Pas d'orderBy : on trie dans le navigateur (évite d'exiger un index composite)
    const q = query(collection(db, 'messages'), where('clientTarget', '==', userData.fullName));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRapports(
          snap.docs.map((d) => {
            const data = d.data();
            const rawDate = data.timestamp?.toDate?.() ?? null;
            return {
              id: d.id,
              ...data,
              source: 'rapport',
              rawDate,
              date: rawDate ? rawDate.toLocaleDateString('fr-FR', FORMAT_DATE) : '',
            };
          })
        );
      },
      (err) => console.error('Historique (rapports) :', err)
    );
    return () => unsub();
  }, [userData?.fullName]);

  useEffect(() => {
    if (!userData?.uid) return;
    const q = query(collection(db, 'devis'), where('userId', '==', userData.uid), where('status', 'in', ['valide', 'client_valide']));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setDevis(
          snap.docs.map((d) => {
            const data = d.data();
            const rawDate = data.createdAt?.toDate?.() ?? null;
            return {
              id: d.id,
              ...data,
              source: 'devis',
              type: `Devis ${data.pole ?? ''}`.trim(),
              rawDate,
              date: rawDate ? rawDate.toLocaleDateString('fr-FR', FORMAT_DATE) : '',
            };
          })
        );
      },
      (err) => console.error('Historique (devis) :', err)
    );
    return () => unsub();
  }, [userData?.uid]);

  // Fusion + tri du plus récent au plus ancien
  const items = useMemo(
    () => [...rapports, ...devis].sort((a, b) => (b.rawDate?.getTime?.() ?? 0) - (a.rawDate?.getTime?.() ?? 0)),
    [rapports, devis]
  );

  const filteredData = items.filter((item) => {
    const recherche = searchTerm.toLowerCase();
    const matchesSearch = [item.text, item.message, item.pole, item.type, item.title, item.location]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(recherche));
    if (filter === 'devis') return matchesSearch && item.source === 'devis';
    if (filter === 'rapport') return matchesSearch && item.source === 'rapport';
    return matchesSearch;
  });

  // Fermer la fenêtre de détail avec la touche Échap
  useEffect(() => {
    if (!selection) return;
    const surTouche = (e) => e.key === 'Escape' && setSelection(null);
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [selection]);

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
              key={`${item.source}-${item.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              role="button"
              tabIndex={0}
              onClick={() => setSelection(item)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelection(item)}
              className="group cursor-pointer bg-white p-5 rounded-[2rem] border border-gray-100 hover:border-eden-gold/30 hover:shadow-xl transition-all flex items-center justify-between outline-none focus-visible:ring-2 focus-visible:ring-eden-gold"
            >
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all ${item.source === 'devis' ? 'bg-blue-50 text-blue-500' : 'bg-eden-gold/10 text-eden-gold'}`}>
                  {item.source === 'devis' ? <Zap size={24} /> : <FileText size={24} />}
                </div>
                <div className="truncate">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mb-1 inline-block ${item.source === 'devis' ? 'bg-blue-100 text-blue-600' : 'bg-eden-gold/20 text-eden-gold'}`}>
                    {item.source === 'devis' ? 'Facturation' : 'Intervention'}
                  </span>
                  <h4 className="font-bold text-eden-dark text-sm uppercase truncate leading-tight">{titreElement(item)}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {item.date}
                    {item.prixDefinitif ? ` • ${item.prixDefinitif}€` : item.location ? ` • ${item.location}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    generatePDF(item);
                  }}
                  title="Télécharger en PDF"
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

      {/* Fenêtre de détail */}
      <AnimatePresence>
        {selection ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelection(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-lg bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block mb-2 ${selection.source === 'devis' ? 'bg-blue-100 text-blue-600' : 'bg-eden-gold/20 text-eden-gold'}`}>
                    {selection.source === 'devis' ? 'Facturation' : 'Intervention'}
                  </span>
                  <h3 className="font-bold text-eden-dark text-lg uppercase leading-tight break-words">{titreElement(selection)}</h3>
                </div>
                <button type="button" onClick={() => setSelection(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400" aria-label="Fermer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-sm text-eden-dark">
                {selection.date ? (
                  <p className="flex items-center gap-3"><Calendar size={16} className="text-eden-gold shrink-0" /> {selection.date}</p>
                ) : null}
                {selection.location ? (
                  <p className="flex items-center gap-3"><MapPin size={16} className="text-eden-gold shrink-0" /> {selection.location}</p>
                ) : null}
                {selection.prixDefinitif ? (
                  <p className="flex items-center gap-3"><Euro size={16} className="text-eden-gold shrink-0" /> {selection.prixDefinitif} € HT</p>
                ) : null}
              </div>

              {selection.text || selection.message ? (
                <div className="mt-6 p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 whitespace-pre-line break-words">
                  {selection.text || selection.message}
                </div>
              ) : null}

              {selection.mediaUrl || selection.imageUrl ? (
                <img src={selection.mediaUrl || selection.imageUrl} alt="" className="mt-6 w-full rounded-2xl object-cover" />
              ) : null}

              <button
                type="button"
                onClick={() => generatePDF(selection)}
                className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-eden-gold text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-all"
              >
                <Download size={16} /> Télécharger en PDF
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Historique;