import React, { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from '../firebase'; 
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, Search, MoreVertical, CheckCheck, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Messages() {
  const { user, userData } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [dynamicContacts, setDynamicContacts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // --- RÉCUPÉRATION DYNAMIQUE DES CONTACTS ---
  useEffect(() => {
    if (!userData) return;

    if (userData.role === 'admin') {
      const q = query(collection(db, 'users'), where("role", "==", "client"), orderBy('fullName', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDynamicContacts(clients);
      });
      return () => unsubscribe();
    } else {
      const q = query(collection(db, 'users'), where("role", "==", "admin"), limit(1));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const adminDoc = snapshot.docs[0];
          setDynamicContacts([{
            id: adminDoc.id,
            fullName: 'EDÈN Group (Support Officiel)',
            initiales: 'EG',
            role: 'admin'
          }]);
        }
      });
      return () => unsubscribe();
    }
  }, [userData]);

  // --- LOGIQUE FIREBASE MESSAGES ---
  useEffect(() => {
    if (!activeChat || !auth.currentUser) return;
    
    const chatId = [auth.currentUser.uid, activeChat.id].sort().join('_');
    
    // On écoute la sous-collection messages
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      // Si erreur de permission, c'est que le doc parent n'existe pas encore ou participants est absent
      console.warn("En attente de l'initialisation du chat...");
    });

    return () => unsubscribe();
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // --- FONCTION DE SÉLECTION DE CONTACT (CORRIGÉ) ---
  const handleSelectContact = async (contact) => {
    const chatId = [auth.currentUser.uid, contact.id].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    
    try {
      // On force la création/mise à jour du doc parent AVANT d'ouvrir le chat
      // Cela active les Security Rules immédiatement
      await setDoc(chatRef, {
        participants: [auth.currentUser.uid, contact.id],
        lastUpdate: serverTimestamp(),
        chatId: chatId,
        // On stocke les noms pour faciliter la recherche admin
        participantNames: [userData.fullName, contact.fullName]
      }, { merge: true });

      setActiveChat(contact);
    } catch (error) {
      console.error("Erreur initialisation chat:", error);
    }
  };

  // --- ENVOI DE FICHIERS ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const chatId = [auth.currentUser.uid, activeChat.id].sort().join('_');
    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
    const storageRef = ref(storage, `chats/${chatId}/${Date.now()}_${file.name}`);
    
    setUploading(true);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', null, 
      (error) => { console.error(error); setUploading(false); }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          fileUrl: downloadURL,
          fileType: fileType,
          senderId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });
        setUploading(false);
      }
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    const chatId = [auth.currentUser.uid, activeChat.id].sort().join('_');

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        senderId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Erreur envoi message:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-eden-dark pt-24 pb-4 px-4 flex flex-col h-screen overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => activeChat ? setActiveChat(null) : navigate(-1)} className="p-2 bg-white/5 rounded-full text-eden-gold">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-black-mango text-xl text-white">
          {activeChat ? (activeChat.fullName || activeChat.name) : "Messagerie"}
        </h1>
        <button className="p-2 bg-white/5 rounded-full text-eden-gold"><MoreVertical size={20} /></button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
        {!activeChat ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="text-eden-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-2 ml-2">
              {userData?.role === 'admin' ? "Répertoires Clients" : "Support Officiel"}
            </p>
            {dynamicContacts.map((contact) => (
              <button 
                key={contact.id} 
                onClick={() => handleSelectContact(contact)} // Utilisation de la nouvelle fonction
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-eden-gold flex items-center justify-center font-bold text-eden-dark uppercase">
                  {contact.initiales || contact.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm">{contact.fullName || contact.name}</h3>
                  <p className="text-white/40 text-[10px] truncate">
                    {userData?.role === 'admin' ? "Client EDÈN Group" : "Réponse prioritaire"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest">Début de la conversation sécurisée</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === auth.currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${msg.senderId === auth.currentUser.uid ? 'bg-eden-gold text-eden-dark rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/10'}`}>
                    {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                    {msg.fileType === 'image' && (
                      <img src={msg.fileUrl} alt="pj" className="rounded-lg max-h-60 w-full object-cover mb-1" />
                    )}
                    {msg.fileType === 'video' && (
                      <video src={msg.fileUrl} controls className="rounded-lg max-h-60 w-full mb-1" />
                    )}
                    <div className="text-[8px] mt-1 flex items-center gap-1 opacity-60">
                      {msg.createdAt?.toDate() ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                      {msg.senderId === auth.currentUser.uid && <CheckCheck size={10} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-eden-dark/80 border-t border-white/10 flex items-center gap-2">
              <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" />
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()} 
                disabled={uploading}
                className="p-2 text-eden-gold hover:bg-white/5 rounded-full transition-colors"
              >
                {uploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
              </button>

              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Votre message..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 px-6 text-white text-xs outline-none focus:border-eden-gold"
              />
              <button type="submit" className="p-3 bg-eden-gold text-eden-dark rounded-full shadow-lg active:scale-95 transition-transform">
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}