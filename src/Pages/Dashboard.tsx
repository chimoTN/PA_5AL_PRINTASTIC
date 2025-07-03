// src/Pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import FileClientUpload from '../components/FileClientUpload';
import ProductFileUpload from '../components/ProductFileUpload';
import '../assets/styles/Dashboard.css';
import FilesClientList from '../components/FilesClientList';
import { useFilesClient } from '../hooks/useFilesClient'; // ✅ Utiliser le bon hook

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'files'>('upload');
  
  // ✅ Utiliser le hook existant
  const { files, loading, refreshFiles } = useFilesClient();

  // ✅ Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    const isOwnerOrPrinter = user?.role === 'ADMIN' || user?.role === 'IMPRIMEUR';
    await refreshFiles(isOwnerOrPrinter);
  };

  // ✅ Charger les données au montage
  useEffect(() => {
    if (user) {
      handleRefresh();
    }
  }, [user, refreshTrigger]);

  const handleUploadSuccess = async (response?: any) => {
    setRefreshTrigger(prev => prev + 1);
    
    // Émettre un événement pour rafraîchir d'autres composants
    window.dispatchEvent(new CustomEvent('fileUploaded', { 
      detail: response 
    }));
    
    // Basculer vers l'onglet des fichiers après upload réussi
    setTimeout(() => {
      setActiveTab('files');
    }, 1500);
  };

  const handleUploadError = (error: string | Error | any) => {
    let errorMessage: string;
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object') {
      errorMessage = error.message || error.error || 'Erreur inconnue';
    } else {
      errorMessage = 'Une erreur est survenue lors de l\'upload';
    }
    
    console.error('❌ Erreur d\'upload dans Dashboard:', errorMessage);
  };

  // ✅ Correction des rôles pour correspondre à votre système
  const isOwnerOrPrinter = user?.role === 'ADMIN' || user?.role === 'IMPRIMEUR';

  // ✅ Calculer les statistiques depuis les fichiers
  const verifiedFilesCount = files.filter(file => file.estVerifie).length;
  const pendingFilesCount = files.filter(file => !file.estVerifie).length;

  const handleFileDeleted = async () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleVerificationUpdate = async () => {
    await handleRefresh();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>
            <i className="fas fa-tachometer-alt"></i>
            Mon Espace 3D
          </h1>
          <p className="dashboard-subtitle">
            {isOwnerOrPrinter 
              ? 'Gérez vos produits et les fichiers clients' 
              : 'Uploadez vos modèles 3D personnels et suivez vos impressions'
            }
          </p>
          
          {user && (
            <div className="user-info">
              <span className="welcome-text">
                Bienvenue, {user.prenom} {user.nom}
              </span>
              <span className={`role-badge role-${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </div>
          )}
        </div>

        {/* Navigation par onglets */}
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
            {files.length > 0 && (
              <span className="files-count-badge">{files.length}</span>
            )}
          </button>
        </div>

        {/* Contenu des onglets */}
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
                key={refreshTrigger} // ✅ Force le re-render
                showAllFiles={isOwnerOrPrinter}
                onVerificationUpdate={handleVerificationUpdate}
                onFileSelect={(file) => {
                  console.log('Fichier sélectionné:', file);
                }}
              />
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <i className="fas fa-cube"></i>
            <div className="stat-info">
              <span className="stat-number">
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  files.length
                )}
              </span>
              <span className="stat-label">
                {isOwnerOrPrinter ? 'Fichiers clients' : 'Modèles personnels'}
              </span>
            </div>
          </div>
          
          <div className="stat-card">
            <i className="fas fa-check-circle"></i>
            <div className="stat-info">
              <span className="stat-number">
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  verifiedFilesCount
                )}
              </span>
              <span className="stat-label">Vérifiés</span>
            </div>
          </div>
          
          <div className="stat-card">
            <i className="fas fa-clock"></i>
            <div className="stat-info">
              <span className="stat-number">
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  pendingFilesCount
                )}
              </span>
              <span className="stat-label">En attente</span>
            </div>
          </div>

          {/* ✅ Bouton de rafraîchissement */}
          <div className="stat-card refresh-card">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="refresh-button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#007bff',
                fontSize: '18px',
                padding: '10px',
                borderRadius: '50%',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
        </div>

        {/* Informations contextuelles */}
        <div className="dashboard-info">
          {!isOwnerOrPrinter && (
            <div className="info-card privacy">
              <i className="fas fa-user-lock"></i>
              <div className="info-content">
                <h4>Confidentialité de vos fichiers</h4>
                <p>Vos modèles 3D personnels ne sont visibles que par vous et les imprimeurs autorisés.</p>
              </div>
            </div>
          )}
          
          {isOwnerOrPrinter && (
            <div className="info-card admin">
              <i className="fas fa-shield-alt"></i>
              <div className="info-content">
                <h4>Accès administrateur</h4>
                <p>Vous avez accès à tous les fichiers clients pour validation et impression.</p>
              </div>
            </div>
          )}

          {/* ✅ Nouvelle info pour les formats supportés */}
          <div className="info-card formats">
            <i className="fas fa-file-code"></i>
            <div className="info-content">
              <h4>Formats supportés</h4>
              <p>STL, OBJ, PLY, 3MF, AMF - Taille maximum : 50MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
