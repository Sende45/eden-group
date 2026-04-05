import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Image as ImageIcon, Send, Video, X, Camera, CheckCircle2, Clock, 
    Loader2, Home, ListCheck, Users, TrendingUp, Zap, LogOut, FileText, 
    CheckCircle, History, ExternalLink, Trash2, Search, Calendar, Phone,
    Star, MessageSquare, MapPin // Ajout de MapPin ici
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db, storage, auth } from '../firebase'; 
import { 
    collection, addDoc, serverTimestamp, getDocs, query, where, 
    orderBy, limit, doc, updateDoc, deleteDoc, onSnapshot // AJOUT onSnapshot ici
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import emailjs from '@emailjs/browser';

export default function DashboardAdmin() {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();

    // --- CONFIGURATION EMAILJS (Tes identifiants réels) ---
    const EMAILJS_CONFIG = {
        SERVICE_ID: "service_f8258dd",
        PUBLIC_KEY: "xX6MHYJpo5d9EY7MK",
        TEMPLATE_DEVIS: "template_ujqrt4i",  // Template pour le devis
        TEMPLATE_RAPPORT: "template_fnbg1qe" // Template pour le compte rendu
    };
    
    // --- ÉTATS GÉNÉRAUX ---
    const [clients, setClients] = useState([]);
    const [stats, setStats] = useState({ totalToday: 0, lastReportTime: '--:--' });
    const [unreadChats, setUnreadChats] = useState([]); // AJOUT : État pour les nouveaux messages

    // --- ÉTATS RAPPORT (EMPLOYÉS) ---
    const [loading, setLoading] = useState(false);
    const [selectedClient, setSelectedClient] = useState('');
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null); 
    const [preview, setPreview] = useState(null);
    const [tasks, setTasks] = useState([
        { id: 1, label: "Dépoussiérage des surfaces", completed: false },
        { id: 2, label: "Nettoyage des vitres / miroirs", completed: false },
        { id: 3, label: "Aspiration & Lavage des sols", completed: false },
        { id: 4, label: "Désinfection des points de contact", completed: false }
    ]);

    // --- ÉTATS DEVIS (ADMIN) ---
    const [devisList, setDevisList] = useState([]);
    const [devisHistory, setDevisHistory] = useState([]); 
    const [loadingDevis, setLoadingDevis] = useState(false);
    const [filterPole, setFilterPole] = useState('Tous');
    
    // --- ÉTATS AVIS CLIENTS (NOUVEAU) ---
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // --- HISTORIQUE ---
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // --- FONCTION GPS (AJOUTÉ) ---
    const openGpsItinerary = (address) => {
        if (!address) return alert("L'adresse n'est pas renseignée.");
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };

    const getPoleBadgeStyle = (pole) => {
        switch (pole) {
            case 'Fin de Chantier': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'Tertiaire & Bureaux': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            case 'Services Particuliers': return 'bg-eden-gold/10 text-eden-gold border-eden-gold/20';
            default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
        }
    };

    // --- INITIALISATION DES DONNÉES ---
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                // Fetch Clients
                const qClients = query(collection(db, "users"), where("role", "==", "client"));
                const snapClients = await getDocs(qClients);
                const clientsList = snapClients.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setClients(clientsList);
                if (clientsList.length > 0) setSelectedClient(clientsList[0].fullName);

                // Fetch Devis, Historique et Avis
                fetchPendingDevis();
                fetchHistory();
                fetchReviews();

                // Calcul Stats
                const qStats = query(collection(db, "messages"), where("role", "==", "admin"), orderBy("timestamp", "desc"), limit(20));
                const snapStats = await getDocs(qStats);
                const today = new Date().toLocaleDateString();
                const todayReports = snapStats.docs.filter(doc => doc.data().timestamp?.toDate().toLocaleDateString() === today);

                setStats({
                    totalToday: todayReports.length,
                    lastReportTime: snapStats.docs[0]?.data().timestamp?.toDate().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) || '--:--'
                });
            } catch (error) { console.error("Erreur Init:", error); }
        };
        fetchAdminData();

        // AJOUT : Écouteur de messagerie temps réel pour l'admin
        const unsubChats = onSnapshot(collection(db, "chats"), (snapshot) => {
            const activeChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUnreadChats(activeChats);
        });

        return () => unsubChats();
    }, []);

    // --- LOGIQUE DEVIS ---
    const fetchPendingDevis = async () => {
        setLoadingDevis(true);
        try {
            const q = query(collection(db, "devis"), where("status", "==", "nouveau"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setDevisList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const qHistory = query(collection(db, "devis"), where("status", "!=", "nouveau"), orderBy("validatedAt", "desc"), limit(10));
            const snapHistory = await getDocs(qHistory);
            setDevisHistory(snapHistory.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) { console.error(err); }
        setLoadingDevis(false);
    };

    const handleApproveDevis = async (devis) => {
        const prixFinal = prompt(`Montant définitif pour ${devis.clientName || devis.email} (€) :`);
        if (!prixFinal || isNaN(prixFinal)) return;

        try {
            const devisRef = doc(db, "devis", devis.id);
            await updateDoc(devisRef, { 
                status: "valide",
                prixDefinitif: parseFloat(prixFinal),
                validatedAt: serverTimestamp() 
            });

            // MODIFIÉ : Utilisation du Template DEVIS (template_ujqrt4i)
            const paramsDevis = {
                client_email: devis.email,
                client_name: devis.clientName || "Cher Client",
                prix_final: parseFloat(prixFinal).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
                pole: devis.pole,
                surface: devis.surface,
                devis_id: devis.id
            };
            await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_DEVIS, paramsDevis, EMAILJS_CONFIG.PUBLIC_KEY);

            fetchPendingDevis();
            alert(`✅ Prix validé (${prixFinal}€) ! Le mail de confirmation est parti.`);
        } catch (error) { console.error(error); }
    };

    // --- LOGIQUE MODÉRATION AVIS ---
    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) { console.error(err); }
        setLoadingReviews(false);
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm("Supprimer cet avis client ?")) return;
        try {
            await deleteDoc(doc(db, "reviews", id));
            fetchReviews();
        } catch (err) { console.error(err); }
    };

    // --- LOGIQUE RAPPORTS ---
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!message) return alert("Veuillez ajouter un message.");
        setLoading(true);
        try {
            let mediaUrl = null;
            if (file) {
                const storageRef = ref(storage, `reports/${selectedClient}/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                mediaUrl = await getDownloadURL(storageRef);
            }

            const targetClient = clients.find(c => c.fullName === selectedClient);
            const completedTasks = tasks.filter(t => t.completed).map(t => `✅ ${t.label}`).join('\n');
            const finalMessage = completedTasks ? `${message}\n\nPoints de contrôle :\n${completedTasks}` : message;

            await addDoc(collection(db, "messages"), {
                text: finalMessage,
                mediaUrl: mediaUrl,
                mediaType: fileType,
                senderName: userData?.fullName || "Agent EDÈN",
                role: 'admin',
                clientTarget: selectedClient, 
                timestamp: serverTimestamp(),
                location: selectedClient,
                type: "Rapport d'Intervention",
                pole: targetClient?.pole || "Service"
            });

            if (targetClient?.email) {
                // MODIFIÉ : Utilisation du Template RAPPORT (template_fnbg1qe)
                const paramsRapport = {
                    client_email: targetClient.email,
                    client_name: selectedClient,
                    message_agent: finalMessage,
                    media_url: mediaUrl || "Aucun média joint",
                    date: new Date().toLocaleDateString('fr-FR')
                };
                await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_RAPPORT, paramsRapport, EMAILJS_CONFIG.PUBLIC_KEY);
            }

            setFile(null); setPreview(null); setMessage(''); setTasks(tasks.map(t => ({ ...t, completed: false })));
            fetchHistory();
            alert("🚀 Rapport propulsé sur l'app et envoyé par mail !");
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const qH = query(collection(db, "messages"), where("role", "==", "admin"), orderBy("timestamp", "desc"), limit(20));
            const snapH = await getDocs(qH);
            setHistory(snapH.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) { console.error(e); }
        setLoadingHistory(false);
    };

    const handleDeleteHistoryItem = async (itemId) => {
        if (!window.confirm("Supprimer ce rapport ?")) return;
        try {
            await deleteDoc(doc(db, "messages", itemId));
            fetchHistory(); 
        } catch (e) { console.error(e); }
    };

    // --- UTILITAIRES ---
    const filteredHistory = useMemo(() => {
        return history.filter(item => item.clientTarget?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [history, searchTerm]);

    const handleLogout = async () => { await logout(); navigate('/login'); };
    const toggleTask = (id) => { setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)); };
    const handleFileSelect = (e, type) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) { setFile(selectedFile); setFileType(type); setPreview(URL.createObjectURL(selectedFile)); }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] pt-20 md:pt-28 pb-10 md:pb-20 px-4 md:px-6 font-sans text-eden-dark selection:bg-eden-gold/20">
            <div className="max-w-7xl mx-auto">
                
                {/* HEADER RESPONSIVE COMPLET */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-16 gap-6">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex items-center gap-4 md:gap-5 mb-4">
                            <Link to="/accueil" className="p-3 md:p-4 bg-white border border-gray-100 rounded-2xl md:rounded-[1.5rem] text-eden-dark hover:text-eden-gold shadow-xl transition-all group">
                                <Home size={20} className="group-hover:scale-110 transition-transform" />
                            </Link>
                            <h1 className="font-black-mango text-3xl md:text-6xl tracking-tight leading-none">Administration</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-eden-gold rounded-full animate-pulse" />
                            <p className="text-eden-gold text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.4em] font-black bg-eden-gold/5 py-1.5 md:py-2 px-4 md:px-5 rounded-full">
                                Agent : {userData?.fullName || 'Chargement...'}
                            </p>
                        </div>
                    </motion.div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* AJOUT : Bouton Messagerie Directe avec badge de notification si nouveaux chats */}
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate('/messages')}
                            className="relative flex items-center justify-center gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-eden-gold text-eden-dark rounded-2xl md:rounded-[1.5rem] text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-lg"
                        >
                            <MessageSquare size={18} /> Messagerie
                            {unreadChats.length > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                    {unreadChats.length}
                                </span>
                            )}
                        </motion.button>

                        <motion.button 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleLogout} 
                            className="w-full md:w-auto flex items-center justify-center gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl md:rounded-[1.5rem] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all border border-red-500/10 shadow-lg"
                        >
                            <LogOut size={16} /> Déconnexion
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    
                    {/* COLONNE GAUCHE : STATS & DEVIS */}
                    <div className="lg:col-span-4 space-y-6 md:space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-eden-dark p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 md:w-40 h-32 md:h-40 bg-eden-gold/20 blur-[80px] rounded-full group-hover:bg-eden-gold/30 transition-colors" />
                            <TrendingUp className="text-eden-gold mb-6 md:mb-8 group-hover:scale-110 transition-transform" size={24} />
                            <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2">Interventions du Jour</h3>
                            <p className="text-5xl md:text-6xl font-black-mango text-white">{stats.totalToday}</p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-50 shadow-2xl shadow-gray-200/50"
                        >
                            <div className="flex justify-between items-center mb-6 md:mb-8">
                                <h4 className="text-[10px] md:text-[11px] uppercase font-black tracking-[0.2em] text-eden-dark">Demandes & Rendez-vous</h4>
                                <span className="bg-eden-gold text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full">{devisList.length}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-8 border-b border-gray-50 pb-6">
                                {['Tous', 'Fin de Chantier', 'Tertiaire & Bureaux', 'Services Particuliers'].map((p) => (
                                    <button 
                                        key={p} onClick={() => setFilterPole(p)} 
                                        className={`text-[8px] md:text-[9px] font-black uppercase px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all ${filterPole === p ? 'bg-eden-dark text-white' : 'bg-gray-50 text-gray-400'}`}
                                    >
                                        {p === 'Tous' ? 'Tout' : p.split(' ')[0]}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar mb-8">
                                <AnimatePresence mode="popLayout">
                                    {loadingDevis ? <div className="flex justify-center py-6 md:py-10"><Loader2 className="animate-spin text-eden-gold" /></div> : 
                                    devisList.filter(d => filterPole === 'Tous' || d.pole === filterPole).map(d => (
                                        <motion.div layout key={d.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="p-4 md:p-5 bg-gray-50/50 rounded-2xl md:rounded-[2rem] border border-gray-100 group hover:border-eden-gold/30 hover:bg-white hover:shadow-xl transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-[11px] md:text-[12px] font-black uppercase text-eden-dark truncate w-2/3 leading-tight">{d.clientName || d.email}</p>
                                                {/* BOUTON GPS INTÉGRÉ ICI */}
                                                <button onClick={() => openGpsItinerary(d.localisation)} className="p-1.5 bg-white border border-gray-100 rounded-lg text-eden-gold hover:scale-110 transition-transform">
                                                    <MapPin size={16} />
                                                </button>
                                            </div>
                                            {d.appointmentDate && (
                                                <div className="mb-3 p-2 bg-eden-gold/5 rounded-lg border border-eden-gold/10">
                                                    <p className="text-[9px] font-black text-eden-gold uppercase italic">
                                                        📅 RDV : {d.appointmentDate.toDate().toLocaleString('fr-FR', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                                                    </p>
                                                </div>
                                            )}
                                            <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase mb-4 tracking-wider">{d.pole}</p>
                                            <div className="flex gap-2">
                                                <a href={`tel:${d.phone || '0780801642'}`} className="p-2.5 bg-white border border-gray-100 rounded-xl text-eden-dark hover:text-eden-gold transition-all"><Phone size={14} /></a>
                                                <button onClick={() => handleApproveDevis(d)} className="flex-grow py-2.5 bg-eden-dark text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-eden-gold transition-all shadow-sm">Valider Prix (€)</button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="pt-6 border-t border-gray-50">
                                <h4 className="text-[10px] md:text-[11px] uppercase font-black tracking-[0.2em] text-gray-400 mb-5 md:mb-6 flex items-center gap-2"><History size={14} /> Historique Devis</h4>
                                <div className="space-y-3">
                                    {devisHistory.map(h => (
                                        <div key={h.id} className="p-3.5 md:p-4 bg-gray-50/30 rounded-xl md:rounded-[1.5rem] flex justify-between items-center border border-gray-50">
                                            <div className="truncate pr-2">
                                                <p className="text-[9px] md:text-[10px] font-black uppercase text-eden-dark truncate">{h.clientName || h.email}</p>
                                                <p className="text-[8px] md:text-[9px] font-bold text-eden-gold">{h.prixDefinitif} €</p>
                                            </div>
                                            <div className={`shrink-0 text-[7px] md:text-[8px] font-black px-2 md:px-3 py-1 rounded-lg uppercase ${h.status === 'client_valide' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {h.status === 'client_valide' ? 'Confirmé' : 'Envoyé'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* COLONNE DROITE : RAPPORT & MODÉRATION AVIS */}
                    <div className="lg:col-span-8 space-y-8 md:space-y-12">
                        <motion.section 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border border-gray-50 shadow-2xl shadow-gray-200/50"
                        >
                            <h2 className="font-black-mango text-3xl md:text-4xl mb-8 tracking-tight">Rapport d'Intervention</h2>
                            <form onSubmit={handleUpload} className="space-y-8 md:space-y-10">
                                <div className="space-y-3 md:space-y-4">
                                    <label className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 ml-4 tracking-[0.2em]">Destinataire</label>
                                    <div className="relative">
                                        <Users className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-eden-gold" size={18} />
                                        <select 
                                            value={selectedClient} 
                                            onChange={(e) => setSelectedClient(e.target.value)} 
                                            className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-2xl md:rounded-[2rem] py-4 md:py-6 pl-12 md:pl-16 pr-6 md:pr-8 outline-none focus:border-eden-gold/30 focus:bg-white text-xs md:text-sm font-black appearance-none cursor-pointer shadow-inner"
                                        >
                                            {clients.map(c => <option key={c.id} value={c.fullName}>{c.fullName} — {c.structure || 'Client'}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-50 space-y-5 md:space-y-6 shadow-inner">
                                    <div className="flex items-center gap-3 mb-1 md:mb-2 px-1 md:px-2">
                                        <ListCheck className="text-eden-gold" size={20} />
                                        <span className="text-[10px] md:text-[11px] uppercase font-black tracking-[0.2em]">Protocole de Qualité</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        {tasks.map((task) => (
                                            <button key={task.id} type="button" onClick={() => toggleTask(task.id)} className={`flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-[1.5rem] border transition-all text-left ${task.completed ? 'bg-eden-dark border-eden-dark text-white shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:border-eden-gold/30'}`}>
                                                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${task.completed ? 'border-eden-gold bg-eden-gold' : 'border-gray-200'}`}>{task.completed && <CheckCircle2 size={12} className="text-white" />}</div>
                                                <span className="text-[10px] md:text-[12px] font-bold leading-tight">{task.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Détails de l'intervention..." className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 outline-none focus:border-eden-gold/30 focus:bg-white text-xs md:text-sm font-bold min-h-[140px] md:min-h-[160px] resize-none transition-all shadow-inner" />

                                <div className="grid grid-cols-2 gap-4 md:gap-8">
                                    <label className="group border-2 border-dashed border-gray-200 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 flex flex-col items-center justify-center hover:border-eden-gold/40 hover:bg-eden-gold/5 transition-all cursor-pointer">
                                        <input type="file" accept="image/*" hidden onChange={(e) => handleFileSelect(e, 'photo')} />
                                        <ImageIcon className="text-gray-300 group-hover:text-eden-gold mb-2 md:mb-3 group-hover:scale-110 transition-all" size={24} />
                                        <span className="text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Capture Photo</span>
                                    </label>
                                    <label className="group border-2 border-dashed border-gray-200 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 flex flex-col items-center justify-center hover:border-eden-gold/40 hover:bg-eden-gold/5 transition-all cursor-pointer">
                                        <input type="file" accept="video/*" hidden onChange={(e) => handleFileSelect(e, 'video')} />
                                        <Video className="text-gray-300 group-hover:text-eden-gold mb-2 md:mb-3 group-hover:scale-110 transition-all" size={24} />
                                        <span className="text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Preuve Vidéo</span>
                                    </label>
                                </div>
                                <button disabled={loading} type="submit" className="w-full py-5 md:py-7 bg-eden-dark text-white rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-[12px] flex items-center justify-center gap-3 md:gap-4 hover:bg-[#0a1a1e] transition-all shadow-2xl disabled:opacity-50">
                                    {loading ? <Loader2 className="animate-spin text-eden-gold" /> : <Send size={18} className="text-eden-gold" />} <span className="truncate">Propulser Rapport (App + Mail)</span>
                                </button>
                            </form>
                        </motion.section>

                        {/* SECTION MODÉRATION AVIS (NOUVEAU) */}
                        <section className="bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border border-gray-50 shadow-2xl shadow-gray-200/50">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="font-black-mango text-3xl md:text-4xl tracking-tight flex items-center gap-4">
                                    <MessageSquare className="text-eden-gold" /> Modération Avis
                                </h2>
                                <button onClick={fetchReviews} className="p-3 bg-gray-50 rounded-full text-eden-gold hover:rotate-180 transition-transform duration-500">
                                    <Clock size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {loadingReviews ? <Loader2 className="animate-spin mx-auto col-span-2 text-eden-gold" /> : 
                                reviews.length > 0 ? reviews.map(rev => (
                                    <div key={rev.id} className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 relative group">
                                        <button onClick={() => handleDeleteReview(rev.id)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < rev.rating ? "fill-eden-gold text-eden-gold" : "text-gray-200"} />)}
                                        </div>
                                        <p className="text-[12px] font-black uppercase text-eden-dark mb-2">{rev.name}</p>
                                        <p className="text-xs text-gray-500 font-light italic mb-4">"{rev.comment}"</p>
                                        {rev.photoUrl && <img src={rev.photoUrl} className="w-full h-32 object-cover rounded-2xl mb-2 border border-white" alt="Avis" />}
                                        <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">Reçu le {rev.createdAt?.toDate().toLocaleDateString()}</p>
                                    </div>
                                )) : <p className="col-span-2 text-center text-gray-400 text-[10px] font-black uppercase py-10">Aucun avis à modérer</p>}
                            </div>
                        </section>

                        {/* HISTORIQUE ADMIN */}
                        <section className="bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border border-gray-50 shadow-2xl shadow-gray-200/50">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
                                <h2 className="font-black-mango text-2xl md:text-3xl flex items-center gap-3 md:gap-4"><History className="text-eden-gold" size={24} /> Historique Admin</h2>
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input type="text" placeholder="Filtrer par client..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-50 rounded-full py-3 pl-12 pr-6 outline-none focus:border-eden-gold/30 text-[12px] font-black shadow-inner" />
                                </div>
                            </div>
                            <div className="space-y-4 md:space-y-6">
                                {loadingHistory ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-eden-gold" /></div> : 
                                filteredHistory.map((item) => (
                                    <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 rounded-2xl md:rounded-[2.5rem] bg-gray-50/50 border border-gray-100 hover:bg-white transition-all group gap-4 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl shadow-sm text-eden-gold group-hover:bg-eden-dark group-hover:text-white transition-all transform group-hover:rotate-6"><Zap size={18} /></div>
                                            <div className="truncate">
                                                <h4 className="text-[11px] md:text-[13px] font-black uppercase text-eden-dark truncate">{item.clientTarget}</h4>
                                                <p className="text-[9px] md:text-[11px] text-gray-400 font-bold uppercase tracking-widest">{item.timestamp?.toDate().toLocaleDateString()} • {item.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {item.mediaUrl && <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-eden-gold transition-all"><ExternalLink size={16} /></a>}
                                            <button onClick={() => handleDeleteHistoryItem(item.id)} className="p-2.5 text-gray-300 hover:text-red-500 transition-all rounded-xl"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            {/* DECOR */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-eden-gold/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-eden-dark/5 blur-[120px] rounded-full" />
            </div>
        </div>
    );
}