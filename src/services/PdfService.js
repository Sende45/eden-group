// src/services/PdfService.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Les polices standard de jsPDF gèrent mal le symbole € : on écrit EUR
const pdfTexte = (t) => String(t ?? '').replace(/€/g, 'EUR');

export const generateDevisPDF = (devisData) => {
  const doc = new jsPDF();
  const nomClient = devisData?.clientName || 'Client';

  // Design Luxury EDÈN
  doc.setFillColor(10, 26, 30); // eden-dark
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(184, 151, 106); // eden-gold
  doc.setFontSize(22);
  doc.text('EDEN GROUP FRANCE', 14, 25);

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("DEVIS D'INTERVENTION PROFESSIONNEL", 14, 33);

  // Infos client
  doc.setTextColor(0, 0, 0);
  doc.text(pdfTexte(`Client : ${nomClient}`), 14, 60);
  doc.text(pdfTexte(`Prestation : ${devisData?.pole ?? '-'}`), 14, 67);
  if (devisData?.surface) doc.text(`Surface : ${devisData.surface} m2`, 14, 74);

  // Tableau du prix — jspdf-autotable v5 : autoTable(doc, options)
  autoTable(doc, {
    startY: 90,
    head: [['Description', 'Quantite', 'Prix total HT']],
    body: [[pdfTexte(`Nettoyage professionnel - ${devisData?.pole ?? ''}`), '1', `${devisData?.prixDefinitif ?? '-'} EUR`]],
    headStyles: { fillColor: [184, 151, 106] },
  });

  // Pied de page
  const finY = doc.lastAutoTable?.finalY ?? 110;
  doc.text('Fait a Paris, le ' + new Date().toLocaleDateString('fr-FR'), 14, finY + 20);

  // Téléchargement
  doc.save(`Devis_EDEN_${nomClient.replace(/\s+/g, '_')}.pdf`);
};