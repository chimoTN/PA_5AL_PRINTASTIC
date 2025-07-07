import React, {  useState } from 'react';
import CommandEnCours from '../components/CommandEnCours';
import CommandeEnAttente from '../components/CommandeEnAttente';
import CommandRealiser from '../components/CommandRealiser';

const DashboardImpression = () => {
  const [activeTab, setActiveTab] = useState('mesCommandesEnCours');

  return (
     <div className="dashboard-page">
      <div className="dashboard-container">

        {/* Navigation par onglets */}
        <div className="dashboard-tabs" style={{ marginTop: '50px' }}>
           {/*Les command accepter */}
          <button 
            className={`tab-button ${activeTab === 'mesCommandesEnCours' ? 'active' : ''}`}
            onClick={() => setActiveTab('mesCommandesEnCours')}
          >
            <i className="fas fa-tasks"></i>
              Commande en  cours
          </button>

          {/* Les demande */}
          <button 
            className={`tab-button ${activeTab === 'lesDemande' ? 'active' : ''}`}
            onClick={() => setActiveTab('lesDemande')}
          >
            <i className="fas fa-inbox"></i>
              Les demande d'impression
          </button>
         
          {/* Les command passer */}
          <button 
            className={`tab-button ${activeTab === 'monHistorique' ? 'active' : ''}`}
            onClick={() => setActiveTab('monHistorique')}
          >
            <i className="fas fa-history"></i>
              Mes impressions
          </button>
        </div>

        {activeTab === 'lesDemande' && (
          <CommandeEnAttente/>
        )}

        {activeTab === 'mesCommandesEnCours' && (
          <CommandEnCours/>
        )}

        {activeTab === 'monHistorique' && (
          <CommandRealiser/>
        )}
        
      </div>
    </div>
  );
};

export default DashboardImpression;
