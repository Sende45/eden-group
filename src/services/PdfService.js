import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateDevisPDF = (devisData) => {
  const doc = new jsPDF();

  // Design Luxury EDÈN
  doc.setFillColor(10, 26, 30); // eden-dark
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(184, 151, 106); // eden-gold
  doc.setFontSize(22);
  doc.text("EDEN GROUP FRANCE", 14, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("DEVIS D'INTERVENTION PROFESSIONNEL", 14, 33);

  // Infos Client
  doc.setTextColor(0, 0, 0);
  doc.text(`Client : ${devisData.clientName}`, 14, 60);
  doc.text(`Prestation : ${devisData.pole}`, 14, 67);
  doc.text(`Surface : ${devisData.surface} m2`, 14, 74);

  // Tableau du prix
  doc.autoTable({
    startY: 90,
    head: [['Description', 'Quantité', 'Prix Total HT']],
    body: [
      [`Nettoyage professionnel - ${devisData.pole}`, '1', `${devisData.prixDefinitif} €`],
    ],
    headStyles: { fillColor: [184, 151, 106] },
  });

  // Footer
  doc.text("Fait à Paris, le " + new Date().toLocaleDateString(), 14, doc.lastAutoTable.finalY + 20);

  // Téléchargement
  doc.save(`Devis_EDEN_${devisData.clientName.replace(/\s+/g, '_')}.pdf`);
};