import React, { useState } from 'react';
import { Badge } from 'react-bootstrap';

interface Commande {
  id: number;
  client: string;
  produit: string;
  date: string;
  statut: 'en attente' | 'en cours' | 'expédié' | 'livré';
}

const GestionCommandesEnCours: React.FC = () => {
  const [triAsc, setTriAsc] = useState(true);
  const [colonneTriee, setColonneTriee] = useState<'statut' | null>(null);

  const commandesMock: Commande[] = [
    { id: 1, client: 'Alice Dupont', produit: 'Figurine Dragon', date: '2025-07-06', statut: 'en cours' },
    { id: 2, client: 'Bob Martin', produit: 'Casque VR', date: '2025-07-05', statut: 'en attente' },
    { id: 3, client: 'Charlie Dubois', produit: 'Chat Magique', date: '2025-07-04', statut: 'expédié' },
    { id: 4, client: 'Diane Petit', produit: 'Statue Ange', date: '2025-07-03', statut: 'livré' },
    { id: 5, client: 'Eliot Morel', produit: 'Masque Horreur', date: '2025-07-02', statut: 'en cours' },
  ];

  const renderBadge = (statut: Commande['statut']) => {
    switch (statut) {
      case 'en attente': return <Badge bg="secondary">En attente</Badge>;
      case 'en cours': return <Badge bg="warning">En cours</Badge>;
      case 'expédié': return <Badge bg="primary">Expédié</Badge>;
      case 'livré': return <Badge bg="success">Livré</Badge>;
    }
  };

  const trier = (col: 'statut') => {
    setColonneTriee(col);
    setTriAsc(prev => (colonneTriee === col ? !prev : true));
  };

  const commandesTriees = [...commandesMock].sort((a, b) => {
    if (!colonneTriee) return 0;
    const valA = a[colonneTriee];
    const valB = b[colonneTriee];
    if (valA < valB) return triAsc ? -1 : 1;
    if (valA > valB) return triAsc ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
      <h3>📦 Commandes en cours</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f1f1f1' }}>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Client</th>
            <th style={thStyle}>Produit</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>
              Statut{' '}
              <button onClick={() => trier('statut')} style={sortBtnStyle}>
                {colonneTriee === 'statut' ? (triAsc ? '⬆️' : '⬇️') : '⇅'}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {commandesTriees.map(cmd => (
            <tr key={cmd.id}>
              <td style={tdStyle}>{cmd.id}</td>
              <td style={tdStyle}>{cmd.client}</td>
              <td style={tdStyle}>{cmd.produit}</td>
              <td style={tdStyle}>{cmd.date}</td>
              <td style={tdStyle}>{renderBadge(cmd.statut)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestionCommandesEnCours;

const thStyle: React.CSSProperties = {
  padding: '10px',
  textAlign: 'left'
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee'
};

const sortBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1em'
};