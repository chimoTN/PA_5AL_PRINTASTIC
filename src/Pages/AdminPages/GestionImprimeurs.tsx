import React, { useState } from 'react';

const GestionImprimeurs: React.FC = () => {
  const [imprimeurs, setImprimeurs] = useState([
    { id: 1, nom: 'Imprimeur 3D Paris', commandesActives: 5, statut: 'actif', totalFigurinesMois: 42, rendement: 1260 },
    { id: 2, nom: 'PrintLab Lyon', commandesActives: 2, statut: 'actif', totalFigurinesMois: 28, rendement: 840 },
    { id: 3, nom: 'ProtoForm Marseille', commandesActives: 0, statut: 'en attente', totalFigurinesMois: 0, rendement: 0 },
  ]);

  const suspendre = (id: number) => {
    setImprimeurs(prev =>
      prev.map(i => i.id === id ? { ...i, statut: 'suspendu' } : i)
    );
  };

  const accepter = (id: number) => {
    setImprimeurs(prev =>
      prev.map(i => i.id === id ? { ...i, statut: 'actif' } : i)
    );
  };

  const topImprimeurs = [...imprimeurs]
    .filter(i => i.totalFigurinesMois > 0)
    .sort((a, b) => b.totalFigurinesMois - a.totalFigurinesMois)
    .slice(0, 3);

  const rendementTotal = imprimeurs.reduce((sum, i) => sum + i.rendement, 0);

  return (
    <div className="dashboard-page" style={{ padding: '20px', background: '#f5f8fa' }}>
      <h2>🖨️ Gestion des imprimeurs</h2>

      {/* Liste des imprimeurs */}
      <table style={{ width: '100%', marginTop: '20px', background: '#fff', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
        <thead style={{ background: '#ddd' }}>
          <tr>
            <th style={thStyle}>Nom</th>
            <th style={thStyle}>Commandes</th>
            <th style={thStyle}>Statut</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {imprimeurs.map(i => (
            <tr key={i.id}>
              <td style={tdStyle}>{i.nom}</td>
              <td style={tdStyle}>{i.commandesActives}</td>
              <td style={tdStyle}>
                {i.statut === 'actif' ? '✅ Actif' :
                 i.statut === 'en attente' ? '🕓 En attente' :
                 '⛔️ Suspendu'}
              </td>
              <td style={tdStyle}>
                {i.statut === 'en attente' && (
                  <button onClick={() => accepter(i.id)} style={btnStyle}>✅ Accepter</button>
                )}
                {i.statut === 'actif' && (
                  <button onClick={() => suspendre(i.id)} style={btnDanger}>⛔️ Suspendre</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Statistiques */}
      <div style={{ marginTop: '30px', ...cardStyle }}>
        <h3>📊 Performances du mois</h3>
        <p>Total rendement généré : <strong>{rendementTotal} €</strong></p>
        <h4>🏆 Top imprimeurs</h4>
        <ul>
          {topImprimeurs.map(i => (
            <li key={i.id}>{i.nom} – {i.totalFigurinesMois} figurines – {i.rendement} €</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GestionImprimeurs;

// --- STYLES ---
const thStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '1px solid #ccc'
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee'
};

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const btnDanger: React.CSSProperties = {
  ...btnStyle,
  background: '#dc3545'
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};
