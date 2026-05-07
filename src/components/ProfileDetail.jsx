import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db, storage } from '../firebase'; // Import de storage ajouté
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Imports Storage ajoutés
import { jsPDF } from "jspdf";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { 
  User as UserIcon, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Award, 
  Camera, 
  Save,
  Loader2,
  CheckCircle,
  FileText
} from 'lucide-react';

const ProfileDetail = ({ userData }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false); // État pour l'upload photo
  const [success, setSuccess] = useState(false);
  
  // États locaux du formulaire
  const [formData, setFormData] = useState({
    fullName: '',
    structure: '',
    phone: ''
  });

  // Synchronisation des données quand userData est disponible
  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        structure: userData.structure || '',
        phone: userData.phone || ''
      });
    }
  }, [userData]);

  // FONCTION D'UPLOAD DE PHOTO DE PROFIL
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!auth.currentUser) return alert("Session expirée.");

    setUploadingPhoto(true);
    try {
      // Création de la référence dans Storage
      const fileRef = ref(storage, `profilePhotos/${auth.currentUser.uid}`);
      
      // Upload du fichier
      await uploadBytes(fileRef, file);
      
      // Récupération de l'URL de téléchargement
      const photoURL = await getDownloadURL(fileRef);
      
      // Mise à jour du document utilisateur dans Firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { photoURL });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur upload photo:", error);
      alert("Impossible de mettre à jour la photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // FONCTION DE GÉNÉRATION DE FACTURE
  const generateEDÈNInvoice = async (data) => {
    try {
      const docPDF = new jsPDF();
      
      docPDF.setFillColor(26, 32, 44); 
      docPDF.rect(0, 0, 210, 40, 'F');
      docPDF.setTextColor(197, 165, 114); 
      docPDF.setFontSize(22);
      docPDF.text("EDÈN GROUP", 20, 25);
      
      docPDF.setFontSize(8);
      docPDF.setTextColor(255, 255, 255);
      docPDF.text("L'EXCELLENCE DE LA PROPRETÉ", 20, 32);

      docPDF.setTextColor(0, 0, 0);
      docPDF.setFontSize(12);
      docPDF.text(`Facture N°: ${data.id}`, 20, 60);
      docPDF.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 70);
      docPDF.text(`Client: ${data.clientName}`, 20, 80);

      docPDF.setDrawColor(197, 165, 114);
      docPDF.line(20, 90, 190, 90);

      docPDF.text("Détails de la prestation :", 20, 105);
      docPDF.setFontSize(10);
      docPDF.text(`${data.serviceType}`, 20, 115);
      docPDF.setFontSize(12);
      docPDF.text(`${data.amount} €`, 170, 115, { align: 'right' });

      docPDF.setFontSize(7);
      docPDF.setTextColor(150, 150, 150);
      docPDF.text("EDÈN GROUP - 17 Rue Boucherie Basse, 43000 Le Puy-en-Velay", 105, 280, { align: 'center' });
      docPDF.text("SIRET: 989 398 839 - Entreprise Agréée Services à la Personne", 105, 285, { align: 'center' });

      const pdfBase64 = docPDF.output('datauristring').split(',')[1];
      const fileName = `Facture_EDEN_${Date.now()}.pdf`;

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: pdfBase64,
        directory: Directory.Documents,
      });

      await Share.share({
        title: 'Facture EDÈN Group',
        url: savedFile.uri,
      });

    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération du PDF.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Session expirée. Veuillez vous reconnecter.");
    
    setLoading(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour des informations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* CARTE DE STATUT (Gauche) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-1 space-y-6"
      >
        <div className="bg-eden-dark rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-center relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-eden-gold" />
          <div className="relative z-10">
            
            {/* ZONE AVATAR AVEC UPLOAD */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-2xl md:rounded-3xl mx-auto mb-4 md:mb-6 flex items-center justify-center border border-white/10 relative group overflow-hidden shadow-inner">
              {uploadingPhoto ? (
                <Loader2 className="animate-spin text-eden-gold" size={32} />
              ) : userData?.photoURL ? (
                <img src={userData.photoURL} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={32} className="text-eden-gold" />
              )}
              
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                <Camera size={24} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} disabled={uploadingPhoto} />
              </label>
            </div>

            <h3 className="font-black-mango text-xl md:text-2xl text-white mb-1 truncate px-2">
                {userData?.fullName || "Chargement..."}
            </h3>
            <p className="text-[9px] md:text-[10px] text-eden-gold uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold">Membre Partenaire</p>
            
            <div className="mt-8 pt-6 border-t border-white/5">
              <button 
                onClick={() => generateEDÈNInvoice({
                  id: "2026-001",
                  clientName: userData?.fullName || "Client",
                  serviceType: "Prestation de Nettoyage de Luxe",
                  amount: "150.00"
                })}
                className="w-full py-4 bg-white/5 hover:bg-eden-gold text-eden-gold hover:text-white border border-eden-gold/30 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 group"
              >
                <FileText size={14} className="group-hover:rotate-12 transition-transform" />
                Générer Facture
              </button>
            </div>

            <div className="mt-6 space-y-3 md:space-y-4">
              <div className="flex justify-between items-center text-[9px] md:text-[10px] uppercase tracking-widest">
                <span className="text-gray-500">Statut Compte</span>
                <span className="text-green-400 font-bold flex items-center gap-2">
                  <ShieldCheck size={12} /> Actif
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-xl">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <Award className="text-eden-gold" size={18} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-eden-dark">Niveau d'Excellence</span>
          </div>
          <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed font-light">
            En tant que partenaire <span className="text-eden-dark font-bold">EDÈN Group</span>, vous bénéficiez d'un accès prioritaire aux interventions.
          </p>
        </div>
      </motion.div>

      {/* FORMULAIRE DE MODIFICATION (Droite) */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2"
      >
        <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-14 shadow-xl border border-gray-100">
          <h2 className="font-black-mango text-2xl md:text-3xl text-eden-dark mb-8 md:mb-10">Informations Personnelles</h2>
          
          <form onSubmit={handleUpdate} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2 md:space-y-3">
                <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-black text-gray-400 ml-4">Nom & Prénom</label>
                <div className="relative group">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-eden-gold transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-gray-50 rounded-xl md:rounded-2xl py-4 md:py-5 pl-14 pr-6 text-sm outline-none focus:ring-2 focus:ring-eden-gold/20 transition-all border-none"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-black text-gray-400 ml-4">Structure / Adresse</label>
                <div className="relative group">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-eden-gold transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.structure}
                    onChange={(e) => setFormData({...formData, structure: e.target.value})}
                    className="w-full bg-gray-50 rounded-xl md:rounded-2xl py-4 md:py-5 pl-14 pr-6 text-sm outline-none focus:ring-2 focus:ring-eden-gold/20 transition-all border-none"
                    placeholder="Nom société ou Adresse"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-black text-gray-400 ml-4">Email de contact (Sécurisé)</label>
              <div className="relative opacity-50">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  disabled
                  type="email" 
                  value={userData?.email || ""}
                  className="w-full bg-gray-100 rounded-xl md:rounded-2xl py-4 md:py-5 pl-14 pr-6 text-sm border-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-[9px] md:text-[10px] text-gray-400 max-w-xs leading-relaxed uppercase tracking-wider font-medium text-center md:text-left">
                Vos données sont protégées selon les normes de discrétion stricte de <span className="text-eden-gold">EDÈN Group</span>.
              </p>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-10 py-4 md:py-5 bg-eden-dark text-white rounded-xl md:rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] md:text-[11px] flex items-center gap-3 hover:bg-eden-gold transition-all shadow-xl active:scale-95 disabled:opacity-50 justify-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin text-eden-gold" size={18} />
                ) : success ? (
                  <CheckCircle size={18} className="text-green-400" />
                ) : (
                  <Save size={18} className="text-eden-gold" />
                )}
                {loading ? "Mise à jour..." : success ? "Données enregistrées" : "Sauvegarder"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileDetail;