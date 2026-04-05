import { jsPDF } from "jspdf";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const generateEDÈNInvoice = async (data) => {
  try {
    const doc = new jsPDF();
    const goldColor = [197, 165, 114]; // Eden Gold

    // --- DESIGN DU PDF ---
    doc.setFillColor(26, 32, 44); // Eden Dark
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(197, 165, 114);
    doc.setFontSize(22);
    doc.text("EDÈN GROUP", 20, 25);
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("L'EXCELLENCE DE LA PROPRETÉ", 20, 32);

    // --- INFOS CLIENT & PRESTATION ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Facture N°: ${data.id}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 70);
    doc.text(`Client: ${data.clientName}`, 20, 80);

    // Ligne de séparation
    doc.setDrawColor(197, 165, 114);
    doc.line(20, 90, 190, 90);

    doc.text("Description de la prestation", 20, 105);
    doc.setFontSize(10);
    doc.text(`${data.serviceType}`, 20, 115);
    doc.setFontSize(12);
    doc.text(`${data.amount} €`, 170, 115, { align: 'right' });

    // --- BAS DE PAGE (Mentions Légales FR) ---
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const footerY = 280;
    doc.text("EDÈN GROUP - 17 Rue Boucherie Basse, 43000 Le Puy-en-Velay", 105, footerY, { align: 'center' });
    doc.text("SIRET: 989 398 839 - Entreprise Agréée Services à la Personne", 105, footerY + 5, { align: 'center' });

    // --- ÉTAPE MOBILE : SAUVEGARDE ET PARTAGE ---
    
    // 1. Convertir le PDF en Base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    
    // MODIF : Sécurisation du nom de fichier (enlève les caractères spéciaux qui font planter Android)
    const safeId = String(data.id).replace(/[^a-z0-9]/gi, '_');
    const fileName = `Facture_EDEN_${safeId}.pdf`;

    // 2. Écrire le fichier dans le stockage du téléphone
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: pdfBase64,
      directory: Directory.Documents,
      recursive: true // Sécurité supplémentaire pour la création du chemin
    });

    // 3. Ouvrir le menu de partage natif (WhatsApp, Mail, etc.)
    await Share.share({
      title: 'Votre facture EDÈN Group',
      text: `Veuillez trouver ci-joint la facture N°${data.id} pour votre prestation.`,
      url: savedFile.uri, 
      dialogTitle: 'Partager la facture',
    });

  } catch (error) {
    console.error("Erreur lors de la génération/partage du PDF", error);
    alert("Erreur lors de la création ou du partage du document.");
  }
};