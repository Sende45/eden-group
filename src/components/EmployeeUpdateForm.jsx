import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, PlayCircle, Send, X, Video, Loader2 } from 'lucide-react';
// Importations Firebase
import { db, storage } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EmployeeUpdateForm = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'photo' ou 'video'
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Gestion de la sélection de fichier
  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileType(type);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handlePublish = async () => {
    if (!message || !file) return alert("Veuillez ajouter un message et un média.");

    setIsUploading(true);
    try {
      // 1. Upload vers Firebase Storage
      const storageRef = ref(storage, `reports/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const mediaUrl = await getDownloadURL(storageRef);

      // 2. Ajout du document dans Firestore
      await addDoc(collection(db, "reports"), {
        message: message,
        mediaUrl: mediaUrl,
        mediaType: fileType,
        timestamp: serverTimestamp(),
        location: "Chantier en cours", 
        type: fileType === 'video' ? "Mise à jour Vidéo" : "Mise à jour Photo"
      });

      // Reset
      setMessage('');
      setFile(null);
      setPreview(null);
      alert("Rapport publié avec succès !");
    } catch (error) {
      console.error("Erreur publication:", error);
      alert("Une erreur est survenue lors de la publication.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-gray-100 font-sans">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-eden-dark flex items-center justify-center text-eden-gold shrink-0">
            <Video size={20} md={24} />
        </div>
        <div>
            <h4 className="font-black-mango text-xl md:text-2xl text-eden-dark">Nouveau Rapport</h4>
            <p className="text-gray-400 text-xs md:text-sm">Transmettez l'excellence en direct.</p>
        </div>
      </div>

      <div className="space-y-5 md:space-y-6">
        {/* Message */}
        <div className="space-y-2">
            <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-gray-400 ml-4">Votre Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez l'action en cours..." 
              className="w-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-eden-gold/20 outline-none text-sm h-28 md:h-32 leading-relaxed resize-none"
            />
        </div>
        
        {/* Aperçu */}
        {preview && (
          <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 p-1.5 md:p-2">
            {fileType === 'photo' ? (
              <img src={preview} alt="Aperçu" className="w-full h-40 md:h-48 object-cover rounded-lg md:rounded-xl" />
            ) : (
              <video src={preview} className="w-full h-40 md:h-48 object-cover rounded-lg md:rounded-xl" muted />
            )}
            <button 
              onClick={() => { setPreview(null); setFile(null); }}
              className="absolute top-3 right-3 md:top-4 md:right-4 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-white shadow-lg transition-transform active:scale-90"
            >
              <X size={14} md={16} />
            </button>
          </div>
        )}

        {/* Sélection Média */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-gray-100">
          <label className="flex items-center justify-center gap-2 md:gap-3 py-4 md:py-5 rounded-xl md:rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-eden-gold/30 hover:text-eden-gold transition-all group hover:bg-eden-gold/5 cursor-pointer">
            <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, 'photo')} />
            <Camera size={18} md={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Photo</span>
          </label>
          
          <label className="flex items-center justify-center gap-2 md:gap-3 py-4 md:py-5 rounded-xl md:rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-eden-gold/30 hover:text-eden-gold transition-all group hover:bg-eden-gold/5 cursor-pointer">
            <input type="file" accept="video/*" hidden onChange={(e) => handleFileChange(e, 'video')} />
            <PlayCircle size={18} md={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Vidéo</span>
          </label>
        </div>

        <button 
          onClick={handlePublish}
          disabled={isUploading || !message || !file}
          className="w-full py-5 md:py-6 bg-eden-dark text-white rounded-xl md:rounded-2xl font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-[11px] flex items-center justify-center gap-3 hover:bg-eden-dark/90 transition-all shadow-xl active:scale-95 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-eden-gold" />
          ) : (
            <Send size={16} md={18} className="text-eden-gold" />
          )}
          <span>{isUploading ? "Publication..." : "Propulser le rapport"}</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeUpdateForm;