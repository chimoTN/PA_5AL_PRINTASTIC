import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CommandeLivree {
  createdAt: string;
  produit: { nom: string };
  quantite: number;
  prixUnitaire: string;
}

interface InfosEntreprise {
  nomEntreprise: string;
  email: string;
  telephone: string;
  adresse: string;
  siret: string;
}

export async function generateImpressionReport(
  infos: InfosEntreprise,
  commandes: CommandeLivree[],
  periode: string
) {
  // ✅ Vérification que commandes est bien un tableau
  if (!Array.isArray(commandes)) {
    console.error('❌ Paramètre commandes invalide :', commandes);
    return;
  }

  // ✅ Sécurité : copie pour ne pas muter la prop
  let commandesFiltrees = commandes;

  // 🔥 Filtrage par période 'YYYY-MM'
  if (periode !== 'all') {
    commandesFiltrees = commandes.filter(cmd =>
      new Date(cmd.createdAt).toISOString().startsWith(periode)
    );
  }

  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');

  // 📄 En-tête
  doc.setFontSize(18);
  doc.text(`Rapport d'impression - ${infos.nomEntreprise}`, 14, 20);
  doc.setFontSize(12);
  doc.text(`Période : ${periode}`, 14, 28);
  doc.text(`Généré le : ${dateStr}`, 14, 34);

  // 👤 Infos entreprise
  doc.text(`Email : ${infos.email}`, 14, 44);
  doc.text(`Tél : ${infos.telephone}`, 14, 50);
  doc.text(`Adresse : ${infos.adresse}`, 14, 56);
  doc.text(`SIRET : ${infos.siret}`, 14, 62);

  // 🧾 Données commandes
  const rows = commandesFiltrees.map((c) => {
    const total = parseFloat(c.prixUnitaire) * c.quantite;
    return [
      new Date(c.createdAt).toLocaleDateString('fr-FR'),
      c.produit.nom,
      c.quantite,
      `${parseFloat(c.prixUnitaire).toFixed(2)} €`,
      `${total.toFixed(2)} €`,
      `${(total * 0.05).toFixed(2)} €`,
      `${(total * 0.02).toFixed(2)} €`,
      `${(total * 0.93).toFixed(2)} €`
    ];
  });

  const totalVente = commandesFiltrees.reduce(
    (sum, c) => sum + parseFloat(c.prixUnitaire) * c.quantite,
    0
  );

  // 🧾 Tableau
  autoTable(doc, {
    startY: 70,
    head: [[
      'Date', 'Produit', 'Quantité', 'PU (€)', 'Total (€)',
      'Part Imprimeur', 'Part Entreprise', 'Frais prod.'
    ]],
    body: rows,
    styles: { fontSize: 10 },
  });

  // 📊 Résumé
  const y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total des ventes : ${totalVente.toFixed(2)} €`, 14, y);
  doc.text(`Part imprimeur (5%) : ${(totalVente * 0.05).toFixed(2)} €`, 14, y + 6);
  doc.text(`Frais totaux (95%) : ${(totalVente * 0.95).toFixed(2)} €`, 14, y + 12);

  // 💾 Sauvegarde
  doc.save(`rapport_impression_${periode}.pdf`);
}
