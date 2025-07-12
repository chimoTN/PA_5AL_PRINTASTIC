import React from 'react';

const GestionRecettes: React.FC = () => {
  const recettesMock = {
    total: 24000,
    mois: 'Juillet',
    chiffreMensuel: 3200,
    commandes: 187,
    commissionAdmin: 2400,
    produitsTop: [
      { nom: 'Figurine Dragon', ventes: 42 },
      { nom: 'Casque VR', ventes: 31 },
      { nom: 'Chat Magique', ventes: 28 },
    ],
    historiqueMensuel: [
      { mois: 'Mai', montant: 8000 },
      { mois: 'Juin', montant: 10200 },
      { mois: 'Juillet', montant: 12400 },
    ],
  };

  return (
    <div className="dashboard-page" style={{ padding: '20px', background: '#f0f4f8', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '30px' }}>
        📊 Recettes - {recettesMock.mois} 2025
      </h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {/* Total des ventes */}
        <div className="card" style={cardStyle}>
          <h4>Total des ventes</h4>
          <p style={bigNumber}>{recettesMock.total.toLocaleString()} €</p>
        </div>

        {/* Chiffre du mois */}
        <div className="card" style={cardStyle}>
          <h4>Chiffre {recettesMock.mois}</h4>
          <p style={bigNumber}>{recettesMock.chiffreMensuel.toLocaleString()} €</p>
        </div>

        {/* Commandes */}
        <div className="card" style={cardStyle}>
          <h4>Commandes reçues</h4>
          <p style={bigNumber}>{recettesMock.commandes}</p>
        </div>

        {/* Commission admin */}
        <div className="card" style={cardStyle}>
          <h4>Commission admin</h4>
          <p style={bigNumber}>{recettesMock.commissionAdmin.toLocaleString()} €</p>
        </div>

        {/* Top produits */}
        <div className="card" style={{ ...cardStyle, flex: '1 1 300px' }}>
          <h4>Top produits</h4>
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            {recettesMock.produitsTop.map((prod, idx) => (
              <li key={idx}>{prod.nom} — {prod.ventes} ventes</li>
            ))}
          </ul>
        </div>

        {/* Historique mensuel */}
        <div className="card" style={{ ...cardStyle, flex: '1 1 300px' }}>
          <h4>Historique mensuel</h4>
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            {recettesMock.historiqueMensuel.map((item, idx) => (
              <li key={idx}>{item.mois} : {item.montant.toLocaleString()} €</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GestionRecettes;

const cardStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '20px',
  minWidth: '200px',
  flex: '1 1 200px',
  background: '#fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

const bigNumber: React.CSSProperties = {
  fontSize: '1.8em',
  fontWeight: 'bold',
  marginTop: '10px',
};
