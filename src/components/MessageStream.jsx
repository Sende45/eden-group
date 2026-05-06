import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Send, Camera, PlayCircle, CheckCheck, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, doc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const MediaDisplay = ({ url }) => {
  const isVideo = url?.match(/\.(mp4|webm|ogg|mov)$|^data:video/i) || (url?.includes('firebasestorage') && url?.includes('.mp4'));

  if (isVideo) {
    return (
      <div className="relative rounded-2xl overflow-hidden group bg-black aspect-video flex items-center justify-center mt-3 shadow-lg">
        <video controls className="w-full h-full object-cover max-h-64 md:max-h-96">
          <source src={url} type="video/mp4" />
        </video>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 md:p-2 rounded-lg shadow-lg pointer-events-none">
          <PlayCircle size={14} className="text-eden-gold md:w-4 md:h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden group mt-3 shadow-md">
      <img src={url} alt="Prestation" className="w-full h-auto object-cover max-h-64 md:max-h-96 group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 md:p-2 rounded-lg shadow-lg">
         <Camera size={14} className="text-eden-gold md:w-4 md:h-4" />
      </div>
    </div>
  );
};

const MessageStream = () => {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // --- NOUVEAU : MARQUER COMME LU ---
  // Cette fonction passe tous les messages reçus de l'admin à "read: true"
  const markMessagesAsRead = async (docs) => {
    const batch = writeBatch(db);
    let hasUpdates = false;

    docs.forEach((msgDoc) => {
      // Si le message vient de l'admin et n'est pas encore lu
      if (msgDoc.data().role === 'admin' && msgDoc.data().read === false) {
        const docRef = doc(db, "messages", msgDoc.id);
        batch.update(docRef, { read: true });
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      await batch.commit();
    }
  };

  useEffect(() => {
    if (!userData?.fullName) return;

    const q = query(
      collection(db, "messages"), 
      where("clientTarget", "==", userData.fullName),
      orderBy("timestamp", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "..."
      }));
      
      setMessages(docs);
      setLoading(false);
      
      // On marque les messages reçus comme lus pour l'admin
      markMessagesAsRead(snapshot.docs);
      
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [userData]);

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        senderId: user?.uid,
        senderName: userData?.fullName || "Client",
        clientTarget: userData?.fullName,
        timestamp: serverTimestamp(),
        role: 'client', 
        read: false, // INDISPENSABLE : Pour déclencher la notif sur le Dashboard Admin
        location: userData?.structure || "Espace Client"
      });
      setNewMessage('');
    } catch (error) {
      console.error("Erreur envoi:", error);
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-eden-gold" size={40} />
    </div>
  );

  return (
    <div className="flex flex-col h-[85vh] md:h-[700px] bg-[#FDFDFD] font-sans rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl">
      {/* Header du Flux */}
      <div className="p-5 md:p-8 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-1.5 md:w-2 h-8 md:h-10 bg-eden-gold rounded-full" />
          <div className="truncate">
            <h3 className="font-black-mango text-xl md:text-2xl text-eden-dark truncate">Rapports instantanés</h3>
            <p className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest font-bold truncate">
               Suivi — {userData?.structure || "Privé"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100 shrink-0">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[8px] md:text-[10px] font-black text-green-600 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Zone des Messages */}
      <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 bg-gray-50/30 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`relative max-w-[92%] md:max-w-[85%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm ${
                    isMe 
                    ? 'bg-eden-dark text-white rounded-tr-none' 
                    : 'bg-white text-eden-dark border border-gray-100 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-4 md:gap-8 mb-2">
                      <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isMe ? 'text-eden-gold' : 'text-gray-400'}`}>
                        {msg.role === 'admin' ? "Direction EDÈN" : (isMe ? "Moi" : msg.senderName)}
                      </span>
                      <span className="text-[8px] opacity-60 font-bold">{msg.time}</span>
                    </div>

                    <p className="text-xs md:text-sm font-light leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    {msg.mediaUrl && <MediaDisplay url={msg.mediaUrl} />}
                    
                    {msg.location && (
                      <div className="flex items-center gap-1 mt-3 opacity-40">
                        <MapPin size={10} />
                        <span className="text-[8px] font-bold uppercase">{msg.location}</span>
                      </div>
                    )}
                  </div>
                  {isMe && <div className="mt-1 mr-2 flex justify-end w-full"><CheckCheck size={14} className="text-eden-gold" /></div>}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Formulaire de réponse */}
      <form onSubmit={handleSendResponse} className="p-4 md:p-6 bg-white border-t border-gray-100 flex gap-3 md:gap-4 sticky bottom-0">
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-grow bg-gray-50 border-none rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm outline-none focus:ring-2 focus:ring-eden-gold/20 transition-all text-eden-dark"
        />
        <button 
          type="submit" 
          className="w-12 h-12 md:w-14 md:h-14 bg-eden-gold text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-eden-dark transition-all shadow-lg active:scale-90 group shrink-0"
        >
          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};

export default MessageStream;