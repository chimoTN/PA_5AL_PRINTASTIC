import React, { useState } from 'react';
import GestionProduits from './AdminPages/GestionProduits';
import GestionImprimeurs from './AdminPages/GestionImprimeurs';
import GestionSignalement from './AdminPages/GestionSignalement';
import GestionCommandesEnCours from './AdminPages/commandEnCours';

const DashboardAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('produits');

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

      {/* Menu */}
      <div className="dashboard-tabs" style={{ marginTop: '50px' }}>
          <button className={`tab-button ${activeTab === 'produits' ? 'active' : ''}`} onClick={() => setActiveTab('produits')}>
            📦 Produits
          </button>
          <button className={`tab-button ${activeTab === 'imprimeurs' ? 'active' : ''}`} onClick={() => setActiveTab('imprimeurs')}>
            🖨️ Imprimeurs
          </button>
          <button className={`tab-button ${activeTab === 'signalements' ? 'active' : ''}`} onClick={() => setActiveTab('signalements')}>
            ⚠️ Signalements
          </button>
          <button className={`tab-button ${activeTab === 'commandEnCours' ? 'active' : ''}`} onClick={() => setActiveTab('commandEnCours')}>
            command en cours
          </button>
      </div>

      {/* Contenu */}
      <div style={{ padding: '20px', flex: 1 }}>

        {activeTab === 'produits' && (
          <GestionProduits/>
        )}

        {activeTab === 'imprimeurs' && (
          <GestionImprimeurs/>
        )}

        {activeTab === 'signalements' && (
          <GestionSignalement/>
        )}

        {activeTab === 'commandEnCours' && (
          <GestionCommandesEnCours/>
        )}

      </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
