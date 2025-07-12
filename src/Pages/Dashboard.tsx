// src/Pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import FileClientUpload from '../components/FileClientUpload';
import ProductFileUpload from '../components/ProductFileUpload';
import '../assets/styles/Dashboard.css';
import FilesClientList from '../components/FilesClientList';
import { useFilesClient } from '../hooks/useFilesClient';

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
    // ✅ Vérifier si les styles n'existent pas déjà
    if (!document.getElementById('dashboard-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'dashboard-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .dashboard-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
          font-weight: 500;
          max-width: 400px;
          word-wrap: break-word;
        }
        
        .dashboard-notification.success {
          background: #28a745;
          color: white;
        }
        
        .dashboard-notification.error {
          background: #dc3545;
          color: white;
        }
        
        .dashboard-notification.slide-out {
          animation: slideOut 0.3s ease-in;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ✅ Fonction pour créer une notification
  const createNotification = (message: string, type: 'success' | 'error', duration: number = 4000) => {
    const notification = document.createElement('div');
    notification.className = `dashboard-notification ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    notification.innerHTML = `
      <i class="${icon}" style="margin-right: 8px;"></i>
      ${message}
    `;
    
    document.body.appendChild(notification);
    
    // ✅ Supprimer la notification après la durée spécifiée
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('slide-out');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, duration);
    
    return notification;
  };

  // ✅ Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    try {
      const isOwnerOrPrinter = user?.role === 'PROPRIETAIRE' || user?.role === 'IMPRIMEUR';
      await refreshFiles(isOwnerOrPrinter);
      console.log('✅ Données du dashboard rafraîchies');
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
    }
  };

  // ✅ Charger les données au montage et quand l'utilisateur change
  useEffect(() => {
    if (isAuthenticated && user) {
      handleRefresh();
    }
  }, [user, isAuthenticated, refreshTrigger]);

  // ✅ Gestion succès upload - VERSION CORRIGÉE
  const handleUploadSuccess = async (response?: any) => {
    console.log('✅ Upload réussi:', response);
    
    // ✅ Analyser la réponse pour extraire les informations
    let fileName = 'Fichier';
    let modelId = null;
    let customName = null;
    
    if (response?.data?.modele) {
      modelId = response.data.modele.id;
      fileName = response.data.modele.fichier3D?.cheminFichier || 'Fichier';
      customName = response.data.modele.nom || null;
    }
    
    // ✅ Afficher une notification de succès
    const displayName = customName || fileName;
    console.log(`✅ Modèle "${displayName}" uploadé avec succès (ID: ${modelId})`);
    
    createNotification(`Modèle "${displayName}" uploadé avec succès !`, 'success', 4000);
    
    // ✅ Rafraîchir les fichiers
    setRefreshTrigger(prev => prev + 1);
    
    // ✅ Émettre un événement pour les autres composants
    window.dispatchEvent(new CustomEvent('fileUploaded', { 
      detail: { 
        ...response, 
        displayName,
        modelId,
        customName 
      } 
    }));
    
    // ✅ Basculer vers l'onglet des fichiers après upload réussi
    setTimeout(() => {
      setActiveTab('files');
    }, 1500);
  };

  // ✅ Gestion erreur upload - VERSION CORRIGÉE
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
    
    // ✅ Afficher une notification d'erreur
    createNotification(`Erreur d'upload : ${errorMessage}`, 'error', 6000);
  };

  // ✅ Vérification des rôles
  const isOwnerOrPrinter = user?.role === 'PROPRIETAIRE' || user?.role === 'IMPRIMEUR';

  // ✅ Calculer les statistiques depuis les fichiers
  const verifiedFilesCount = files.filter(file => file.estVerifie).length;
  const pendingFilesCount = files.filter(file => !file.estVerifie).length;
  const totalFilesCount = files.length;

  // ✅ Handler pour les actions des fichiers
  const handleVerificationUpdate = async () => {
    console.log('✅ Vérification mise à jour, rafraîchissement...');
    await handleRefresh();
  };

  // ✅ Handler pour quand un fichier est sélectionné/modifié
  const handleFileAction = () => {
    console.log('📁 Action sur fichier, rafraîchissement...');
    setRefreshTrigger(prev => prev + 1);
  };

  // ✅ Fonction pour obtenir le label du rôle
  const getRoleLabel = (role: string): string => {
    const roleLabels: { [key: string]: string } = {
      'PROPRIETAIRE': 'Propriétaire',
      'IMPRIMEUR': 'Imprimeur',
      'CLIENT': 'Client'
    };
    return roleLabels[role] || role;
  };

  // ✅ Fonction pour obtenir la couleur du rôle
  const getRoleColor = (role: string): string => {
    const roleColors: { [key: string]: string } = {
      'PROPRIETAIRE': '#dc3545',
      'IMPRIMEUR': '#28a745',
      'CLIENT': '#007bff'
    };
    return roleColors[role] || '#6c757d';
  };

  // ✅ Affichage si pas authentifié
  if (!isAuthenticated) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>
              <i className="fas fa-lock"></i>
              Accès requis
            </h1>
            <p className="dashboard-subtitle">
              Vous devez être connecté pour accéder à votre espace
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* ✅ En-tête du dashboard */}
        <div className="dashboard-header">
          <h1>
            <i className="fas fa-tachometer-alt"></i>
            Mon Espace 3D
          </h1>
          <p className="dashboard-subtitle">
            {isOwnerOrPrinter 
              ? 'Gérez vos produits et les fichiers clients' 
              : 'Uploadez vos modèles 3D personnels avec nom personnalisé et suivez vos impressions'
            }
          </p>
          
          {user && (
            <div className="user-info">
              <span className="welcome-text">
                Bienvenue, {user.prenom} {user.nom}
              </span>
              <span 
                className={`role-badge role-${user.role.toLowerCase()}`}
                style={{ 
                  backgroundColor: getRoleColor(user.role),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {getRoleLabel(user.role)}
              </span>
            </div>
          )}
        </div>

        {/* ✅ Navigation par onglets */}
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
                onVerificationUpdate={handleVerificationUpdate}
                onFileSelect={(file) => {
                  console.log('📁 Fichier sélectionné:', file);
                  handleFileAction();
                }}
              />
            </div>
          )}
        </div>

        {/* ✅ Statistiques */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <i className="fas fa-cube" style={{ color: '#007bff' }}></i>
            <div className="stat-info">
              <span className="stat-number">
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  totalFilesCount
                )}
              </span>
              <span className="stat-label">
                {isOwnerOrPrinter ? 'Fichiers clients' : 'Modèles personnels'}
              </span>
            </div>
          </div>
          
          <div className="stat-card">
            <i className="fas fa-check-circle" style={{ color: '#28a745' }}></i>
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
            <i className="fas fa-clock" style={{ color: '#ffc107' }}></i>
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

          <div className="stat-card refresh-card">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="refresh-button"
              style={{
                background: 'none',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: loading ? '#6c757d' : '#007bff',
                fontSize: '18px',
                padding: '10px',
                borderRadius: '50%',
                transition: 'all 0.3s ease'
              }}
              title="Rafraîchir les données"
            >
              <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
        </div>

        {/* ✅ Messages d'erreur */}
        {error && (
          <div className="dashboard-error" style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            border: '1px solid #f5c6cb'
          }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: '10px' }}></i>
            {error}
            <button 
              onClick={handleRefresh}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ✅ Informations contextuelles */}
        <div className="dashboard-info">
          {!isOwnerOrPrinter && (
            <div className="info-card privacy">
              <i className="fas fa-user-lock" style={{ color: '#007bff' }}></i>
              <div className="info-content">
                <h4>Confidentialité de vos modèles</h4>
                <p>Vos modèles 3D personnels ne sont visibles que par vous et les imprimeurs autorisés. Vous pouvez leur donner un nom personnalisé pour vous y retrouver.</p>
              </div>
            </div>
          )}
          
          {isOwnerOrPrinter && (
            <div className="info-card admin">
              <i className="fas fa-shield-alt" style={{ color: '#28a745' }}></i>
              <div className="info-content">
                <h4>Accès administrateur</h4>
                <p>Vous avez accès à tous les fichiers clients pour validation et impression.</p>
              </div>
            </div>
          )}

          <div className="info-card formats">
            <i className="fas fa-file-code" style={{ color: '#6c757d' }}></i>
            <div className="info-content">
              <h4>Formats supportés</h4>
              <p>STL, OBJ, PLY, 3MF, AMF - Taille maximum : 50MB</p>
            </div>
          </div>

          <div className="info-card country">
            <i className="fas fa-globe-europe" style={{ color: '#28a745' }}></i>
            <div className="info-content">
              <h4>Livraison disponible</h4>
              <p>🇫🇷 France - Expédition rapide et sécurisée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;