import React from 'react';
import TableauSignalements from '../../components/TableauSignalements';
const GestionSignalement: React.FC = () => {
  const signalementsMock = [
    { id: 101, type: 'FICHIER_ENDOMMAGE', produit: 'Figurine Chat', date: '2025-07-04' },
    { id: 102, type: 'ILLEGALE', produit: 'Casque VR', date: '2025-07-05' },
    { id: 103, type: 'PROBLEMATIQUE', produit: 'Figurine Dragon', date: '2025-07-06' },
    { id: 104, type: 'FICHIER_ENDOMMAGE', produit: 'Statue Ange', date: '2025-07-03' },
    { id: 105, type: 'ILLEGALE', produit: 'Pistolet 3D', date: '2025-07-02' },
    { id: 106, type: 'PROBLEMATIQUE', produit: 'Masque Horreur', date: '2025-07-01' },
  ];

  return (
    <div className="dashboard-page" style={{ padding: '20px', background: '#f4f4f4', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '20px' }}>⚠️ Signalements reçus</h2>
      <TableauSignalements donnees={signalementsMock} />
    </div>
  );
};

export default GestionSignalement;
