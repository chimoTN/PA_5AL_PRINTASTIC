import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Produit {
  nom: string;
  description: string;
}

interface DetailCommande {
  reference: string;
  quantite: number;
  prixUnitaire: string;
  produit: Produit;
}

interface Commande {
  id: number;
  reference: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  prixTotal: string;
  createdAt: string;
  detailCommandes: DetailCommande[];
}

interface Props {
  commande: Commande;
}

const FacturePDFGenerator: React.FC<Props> = ({ commande }) => {
  const genererPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('FACTURE', 14, 20);

    doc.setFontSize(12);
    doc.text(`Référence commande : ${commande.reference}`, 14, 30);
    doc.text(`Date : ${new Date(commande.createdAt).toLocaleDateString()}`, 14, 36);

    doc.text(`Client : ${commande.prenom} ${commande.nom}`, 14, 46);
    doc.text(`Email : ${commande.email}`, 14, 52);
    doc.text(`Téléphone : ${commande.telephone}`, 14, 58);
    doc.text(`Adresse : ${commande.adresse}`, 14, 64);

    const rows = commande.detailCommandes.map((d) => [
      d.reference,
      d.produit.nom,
      d.quantite,
      `${parseFloat(d.prixUnitaire).toFixed(2)} €`,
      `${(parseFloat(d.prixUnitaire) * d.quantite).toFixed(2)} €`
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Ref.', 'Produit', 'Quantité', 'Prix unitaire', 'Total']],
      body: rows,
    });

    const finalY = (doc as any).lastAutoTable.finalY || 75;

    doc.setFontSize(14);
    doc.text(`Total TTC : ${commande.prixTotal} €`, 14, finalY + 15);

    doc.save(`facture_${commande.reference}.pdf`);
  };

  return (
    <button onClick={genererPDF} className="btn btn-outline-primary">
      📄 Télécharger la facture PDF
    </button>
  );
};

export default FacturePDFGenerator;
