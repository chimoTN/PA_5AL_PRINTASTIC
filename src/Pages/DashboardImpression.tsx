import React, {  useState } from 'react';
import CommandEnCours from './ImprimeurPage/CommandEnCours';
import CommandeEnAttente from './ImprimeurPage/CommandeEnAttente';
import CommandRealiser from './ImprimeurPage/CommandRealiser';
import ProfilImprimeur from './ImprimeurPage/ParamettreImprimeur';

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

          {/*Acces au paramettre de l'imprimeur */}
          <button 
            className={`tab-button ${activeTab === 'parametre' ? 'active' : ''}`}
            onClick={() => setActiveTab('parametre')}
          >
            <i className="fas fa-cog"></i>
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

        {activeTab === 'parametre' && (
          <ProfilImprimeur/>
        )}
        
      </div>
    </div>
  );
};

export default DashboardImpression;
