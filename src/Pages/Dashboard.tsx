// src/Pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import FileClientUpload from '../components/FileClientUpload';
import ProductFileUpload from '../components/ProductFileUpload';
import '../assets/styles/Dashboard.css';
import FilesClientList from '../components/FilesClientList';
import { useFilesClient } from '../hooks/useFilesClient';
import { debugAuth, testAuth, testMyModels, testAllAuthEndpoints, testCompleteAuth } from '../utilis/authDebug';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'files'>('upload');
  
  // ✅ Hook pour gérer les fichiers
  const { 
    files, 
    loading, 
    error,
    refreshFiles
  } = useFilesClient();

  // ✅ Ajout des styles CSS pour les animations (une seule fois)
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .dashboard-container {
        animation: fadeIn 0.5s ease-out;
      }
      
      .tab-content {
        animation: fadeIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ✅ Fonction de débogage temporaire pour la production
  const handleDebugAuth = async () => {
    console.log('🔍 Début du débogage d\'authentification...');
    debugAuth();
    
    console.log('🧪 Test complet d\'authentification...');
    const completeResult = await testCompleteAuth();
    console.log('🧪 Résultat du test complet:', completeResult);
    
    if (completeResult.success) {
      alert(`
✅ TEST COMPLET RÉUSSI !

🔑 Connexion: OK
📋 Récupération modèles: OK
🍪 Cookies: Fonctionnels

Le problème vient probablement de votre service baseService.
Vérifiez les logs dans la console (F12).
      `);
    } else {
      alert(`
❌ TEST COMPLET ÉCHOUÉ

Étape: ${completeResult.step || 'inconnue'}
Erreur: ${completeResult.error?.message || 'Erreur inconnue'}

Vérifiez les logs dans la console (F12).
      `);
    }
  };

  // ✅ Fonction de rafraîchissement des fichiers
  const handleRefreshFiles = async () => {
    try {
      await refreshFiles();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  };

  // ✅ Gestion des succès/erreurs d'upload
  const handleUploadSuccess = () => {
    handleRefreshFiles();
  };

  const handleUploadError = (error: string) => {
    console.error('Erreur upload:', error);
  };

  // ✅ Calculs pour l'affichage
  const isOwnerOrPrinter = user?.role === 'PROPRIETAIRE' || user?.role === 'IMPRIMEUR';
  const totalFilesCount = files.length;

  // ✅ Affichage du loading
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div className="loading-auth">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ✅ Header avec informations utilisateur */}
      <div className="dashboard-header">
        <div className="user-info">
          <h2>Bienvenue, {user?.prenom} {user?.nom}</h2>
          <p className="user-role">
            <i className="fas fa-user-tag"></i>
            {user?.role === 'PROPRIETAIRE' && 'Administrateur'}
            {user?.role === 'IMPRIMEUR' && 'Imprimeur'}
            {user?.role === 'CLIENT' && 'Client'}
          </p>
        </div>
        
        {/* ✅ Bouton de débogage temporaire pour la production */}
        <div className="debug-section">
          <button 
            onClick={handleDebugAuth}
            className="btn btn-warning btn-sm"
            style={{ marginRight: '10px' }}
          >
            <i className="fas fa-bug"></i> Debug Auth
          </button>
          
          <button 
            onClick={handleRefreshFiles}
            className="btn btn-info btn-sm"
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i> Actualiser
          </button>
        </div>
      </div>

      {/* ✅ Onglets */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <i className="fas fa-cloud-upload-alt"></i>
          {isOwnerOrPrinter ? 'Ajouter un produit' : 'Nouveau modèle personnel'}
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <i className="fas fa-folder"></i>
          {isOwnerOrPrinter ? 'Fichiers clients' : 'Mes modèles personnels'}
          {totalFilesCount > 0 && (
            <span className="files-count-badge">{totalFilesCount}</span>
          )}
        </button>
      </div>

      {/* ✅ Contenu des onglets */}
      <div className="dashboard-content">
        {activeTab === 'upload' && (
          <div className="tab-content upload-tab">
            {isOwnerOrPrinter ? (
              <ProductFileUpload 
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            ) : (
              <FileClientUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="tab-content files-tab">
            <FilesClientList
              key={refreshTrigger}
              showAllFiles={isOwnerOrPrinter}
            />
          </div>
        )}
      </div>

      {/* ✅ Statistiques */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <i className="fas fa-cube" style={{ color: '#007bff' }}></i>
          <div className="stat-info">
            <h4>{totalFilesCount}</h4>
            <p>Fichiers {isOwnerOrPrinter ? 'clients' : 'personnels'}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <i className="fas fa-check-circle" style={{ color: '#28a745' }}></i>
          <div className="stat-info">
            <h4>{files.filter(f => f.estVerifie).length}</h4>
            <p>Fichiers vérifiés</p>
          </div>
        </div>
        
        <div className="stat-card">
          <i className="fas fa-clock" style={{ color: '#ffc107' }}></i>
          <div className="stat-info">
            <h4>{files.filter(f => !f.estVerifie).length}</h4>
            <p>En attente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;