// src/components/Historique.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { FileText, ChevronRight, Search, Filter, Download, Zap, X, Calendar, MapPin, Euro, Lock, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FORMAT_DATE = { day: 'numeric', month: 'short', year: 'numeric' };

// Statuts d'un devis côté client
const STATUTS_DEVIS = {
  valide: { libelle: 'En attente de votre réponse', classes: 'bg-amber-100 text-amber-700', Icone: Clock },
  client_valide: { libelle: 'Accepté', classes: 'bg-green-100 text-green-700', Icone: CheckCircle2 },
  client_refuse: { libelle: 'Refusé', classes: 'bg-red-100 text-red-600', Icone: XCircle },
};

// Les polices standard de jsPDF gèrent mal certains caractères (€, ’) : on les remplace
const pdfTexte = (t) => String(t ?? '').replace(/€/g, 'EUR').replace(/[’‘]/g, "'");

const titreElement = (item) => item.type || item.title || item.pole || (item.source === 'devis' ? 'Devis' : 'Intervention');

/** Le PDF n'est disponible que pour les rapports, et pour les devis ACCEPTÉS par le client */
const pdfDisponible = (item) => item.source !== 'devis' || item.status === 'client_valide';

const Historique = () => {
  const { user, userData } = useAuth();
  const [rapports, setRapports] = useState([]);
  const [devis, setDevis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selection, setSelection] = useState(null); // élément ouvert en détail
  const [refusEnCours, setRefusEnCours] = useState(false); // formulaire de refus affiché
  const [motifRefus, setMotifRefus] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const uid = user?.uid || userData?.uid;

  // --- GÉNÉRATION PDF ---
  const generatePDF = (item) => {
    if (!pdfDisponible(item)) return;
    try {
      const pdf = new jsPDF();
      const gold = [184, 151, 106];
      const dark = [10, 26, 30];

      pdf.setFillColor(...dark);
      pdf.rect(0, 0, 210, 45, 'F');
      pdf.setTextColor(...gold);
      pdf.setFontSize(22);
      pdf.text('EDEN GROUP FRANCE', 15, 25);
      pdf.setFontSize(9);
      pdf.text('EXCELLENCE DE LA PROPRETE & SERVICES', 15, 33);

      pdf.setTextColor(...dark);
      pdf.setFontSize(14);
      pdf.text(item.source === 'devis' ? 'DEVIS DE PRESTATION - ACCEPTE' : "RAPPORT D'INTERVENTION", 15, 60);

      // jspdf-autotable v5 : autoTable(doc, options) — et non plus doc.autoTable(options)
      autoTable(pdf, {
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

      const finY = pdf.lastAutoTable?.finalY ?? 100;
      pdf.setFontSize(12);
      pdf.text('Details :', 15, finY + 15);
      pdf.setFontSize(10);
      const splitText = pdf.splitTextToSize(pdfTexte(item.text || item.message || 'Details valides par EDEN Group.'), 180);
      pdf.text(splitText, 15, finY + 25);

      if (item.source === 'devis' && item.confirmedAt?.toDate) {
        pdf.setFontSize(9);
        pdf.setTextColor(120, 120, 120);
        pdf.text(`Devis accepte par le client le ${item.confirmedAt.toDate().toLocaleDateString('fr-FR')}`, 15, 285);
      }

      pdf.save(`EDEN_${item.source}_${String(item.id).substring(0, 5)}.pdf`);
    } catch (e) {
      console.error('Erreur PDF :', e);
      alert("Le PDF n'a pas pu être généré. Réessayez.");
    }
  };

  // --- RÉPONSE DU CLIENT À UN DEVIS ---
  const repondreDevis = async (item, accepte) => {
    if (!uid) return;
    setEnvoi(true);
    try {
      const motif = motifRefus.trim();
      // 1) Mise à jour du devis (les règles Firestore n'autorisent que ce changement de statut)
      await updateDoc(doc(db, 'devis', item.id), accepte
        ? { status: 'client_valide', confirmedAt: serverTimestamp() }
        : { status: 'client_refuse', refusedAt: serverTimestamp(), motifRefusClient: motif || null }
      );

      // 2) Prévenir l'admin : message "non lu" dans son tableau de bord
      await addDoc(collection(db, 'messages'), {
        text: accepte
          ? `✅ J'accepte le devis ${item.pole ?? ''} (${item.prixDefinitif ?? '-'} € HT).`
          : `❌ Je refuse le devis ${item.pole ?? ''} (${item.prixDefinitif ?? '-'} € HT).${motif ? ` Motif : ${motif}` : ''}`,
        senderId: uid,
        senderName: userData?.fullName || 'Client',
        clientTarget: userData?.fullName,
        timestamp: serverTimestamp(),
        role: 'client',
        read: false,
        type: 'reponse_devis',
        devisId: item.id,
        location: userData?.structure || 'Espace Client',
      });

      // Mise à jour immédiate de la fenêtre (le flux temps réel suivra)
      setSelection((s) => (s && s.id === item.id ? { ...s, status: accepte ? 'client_valide' : 'client_refuse', motifRefusClient: motif || null } : s));
      setRefusEnCours(false);
      setMotifRefus('');
      alert(accepte
        ? '✨ Merci ! Votre devis est accepté. Vous pouvez maintenant télécharger le PDF.'
        : 'Votre réponse a bien été transmise à EDÈN Group.');
    } catch (e) {
      console.error('Réponse devis :', e);
      alert("Votre réponse n'a pas pu être envoyée. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnvoi(false);
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
          snap.docs
            .map((d) => {
              const data = d.data();
              const rawDate = data.timestamp?.toDate?.() ?? null;
              return { id: d.id, ...data, source: 'rapport', rawDate, date: rawDate ? rawDate.toLocaleDateString('fr-FR', FORMAT_DATE) : '' };
            })
            // Les réponses du client à un devis ne sont pas des rapports : on ne les affiche pas ici
            .filter((m) => m.type !== 'reponse_devis')
        );
      },
      (err) => console.error('Historique (rapports) :', err)
    );
    return () => unsub();
  }, [userData?.fullName]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'devis'), where('userId', '==', uid), where('status', 'in', ['valide', 'client_valide', 'client_refuse']));
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
  }, [uid]);

  // Garder la fenêtre de détail à jour quand le devis change en temps réel
  useEffect(() => {
    if (!selection || selection.source !== 'devis') return;
    const frais = devis.find((d) => d.id === selection.id);
    if (frais && frais.status !== selection.status) setSelection(frais);
  }, [devis, selection]);

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

  const fermer = () => {
    setSelection(null);
    setRefusEnCours(false);
    setMotifRefus('');
  };

  // Fermer la fenêtre de détail avec la touche Échap
  useEffect(() => {
    if (!selection) return;
    const surTouche = (e) => e.key === 'Escape' && fermer();
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [selection]);

  const BadgeStatut = ({ item }) => {
    if (item.source !== 'devis') return null;
    const st = STATUTS_DEVIS[item.status];
    if (!st) return null;
    const { Icone } = st;
    return (
      <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${st.classes}`}>
        <Icone size={10} /> {st.libelle}
      </span>
    );
  };

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
          filteredData.map((item) => {
            const disponible = pdfDisponible(item);
            return (
              <motion.div
                key={`${item.source}-${item.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                role="button"
                tabIndex={0}
                onClick={() => setSelection(item)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelection(item)}
                className={`group cursor-pointer bg-white p-5 rounded-[2rem] border hover:shadow-xl transition-all flex items-center justify-between outline-none focus-visible:ring-2 focus-visible:ring-eden-gold ${
                  item.source === 'devis' && item.status === 'valide' ? 'border-amber-300' : 'border-gray-100 hover:border-eden-gold/30'
                }`}
              >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all ${item.source === 'devis' ? 'bg-blue-50 text-blue-500' : 'bg-eden-gold/10 text-eden-gold'}`}>
                    {item.source === 'devis' ? <Zap size={24} /> : <FileText size={24} />}
                  </div>
                  <div className="truncate">
                    <div className="flex flex-wrap items-center gap-1 mb-1">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${item.source === 'devis' ? 'bg-blue-100 text-blue-600' : 'bg-eden-gold/20 text-eden-gold'}`}>
                        {item.source === 'devis' ? 'Facturation' : 'Intervention'}
                      </span>
                      <BadgeStatut item={item} />
                    </div>
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
                    disabled={!disponible}
                    onClick={(e) => {
                      e.stopPropagation();
                      generatePDF(item);
                    }}
                    title={disponible ? 'Télécharger en PDF' : 'Disponible après acceptation du devis'}
                    className={`p-3 rounded-2xl transition-all ${disponible ? 'bg-gray-50 text-gray-400 hover:bg-eden-gold hover:text-white' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                  >
                    {disponible ? <Download size={18} /> : <Lock size={18} />}
                  </button>
                  <ChevronRight className="text-gray-300 group-hover:text-eden-gold group-hover:translate-x-1 transition-all" size={20} />
                </div>
              </motion.div>
            );
          })
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
            onClick={fermer}
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
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${selection.source === 'devis' ? 'bg-blue-100 text-blue-600' : 'bg-eden-gold/20 text-eden-gold'}`}>
                      {selection.source === 'devis' ? 'Facturation' : 'Intervention'}
                    </span>
                    <BadgeStatut item={selection} />
                  </div>
                  <h3 className="font-bold text-eden-dark text-lg uppercase leading-tight break-words">{titreElement(selection)}</h3>
                </div>
                <button type="button" onClick={fermer} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400" aria-label="Fermer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-sm text-eden-dark">
                {selection.date ? (
                  <p className="flex items-center gap-3"><Calendar size={16} className="text-eden-gold shrink-0" /> {selection.date}</p>
                ) : null}
                {selection.location || selection.address ? (
                  <p className="flex items-center gap-3"><MapPin size={16} className="text-eden-gold shrink-0" /> {selection.location || selection.address}</p>
                ) : null}
              </div>

              {/* Prix proposé (devis) */}
              {selection.source === 'devis' && selection.prixDefinitif ? (
                <div className="mt-6 p-5 rounded-2xl bg-eden-gold/10 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <Euro size={14} className="text-eden-gold" /> Prix proposé
                  </span>
                  <span className="text-2xl font-black text-eden-dark">{selection.prixDefinitif} € HT</span>
                </div>
              ) : null}

              {selection.text || selection.message ? (
                <div className="mt-6 p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 whitespace-pre-line break-words">
                  {selection.text || selection.message}
                </div>
              ) : null}

              {selection.mediaUrl || selection.imageUrl ? (
                <img src={selection.mediaUrl || selection.imageUrl} alt="" className="mt-6 w-full rounded-2xl object-cover" />
              ) : null}

              {/* ─── Devis en attente : le client répond d'abord ─── */}
              {selection.source === 'devis' && selection.status === 'valide' ? (
                <div className="mt-8 space-y-3">
                  {refusEnCours ? (
                    <>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Motif du refus (facultatif)</label>
                      <textarea
                        value={motifRefus}
                        onChange={(e) => setMotifRefus(e.target.value)}
                        maxLength={500}
                        rows={3}
                        placeholder="Prix trop élevé, date ne convenant pas…"
                        className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none text-eden-dark resize-none"
                      />
                      <button
                        type="button"
                        disabled={envoi}
                        onClick={() => repondreDevis(selection, false)}
                        className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        {envoi ? 'Envoi…' : 'Confirmer le refus'}
                      </button>
                      <button type="button" onClick={() => setRefusEnCours(false)} className="w-full py-3 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 text-center">Donnez votre réponse à EDÈN Group pour finaliser ce devis.</p>
                      <button
                        type="button"
                        disabled={envoi}
                        onClick={() => repondreDevis(selection, true)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-eden-gold text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} /> {envoi ? 'Envoi…' : 'Accepter le devis'}
                      </button>
                      <button
                        type="button"
                        disabled={envoi}
                        onClick={() => setRefusEnCours(true)}
                        className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-gray-100 transition-all disabled:opacity-50"
                      >
                        Refuser
                      </button>
                      <p className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
                        <Lock size={12} /> Le PDF sera disponible après acceptation.
                      </p>
                    </>
                  )}
                </div>
              ) : null}

              {/* ─── Devis refusé ─── */}
              {selection.source === 'devis' && selection.status === 'client_refuse' ? (
                <div className="mt-8 p-4 rounded-2xl bg-red-50 text-sm text-red-600">
                  Vous avez refusé ce devis{selection.motifRefusClient ? ` — ${selection.motifRefusClient}` : ''}. EDÈN Group a été informé.
                </div>
              ) : null}

              {/* ─── PDF : rapports, et devis acceptés uniquement ─── */}
              {pdfDisponible(selection) ? (
                <button
                  type="button"
                  onClick={() => generatePDF(selection)}
                  className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-eden-dark text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-all"
                >
                  <Download size={16} /> Télécharger en PDF
                </button>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Historique;