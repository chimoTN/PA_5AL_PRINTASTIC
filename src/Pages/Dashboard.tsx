// src/Pages/Dashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ClientFileUpload from '../components/ClientFileUpload';
import ProductFileUpload from '../components/ProductFileUpload';
import '../assets/styles/Dashboard.css';
import UserFiles from '../components/UserFiles';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'files'>('upload');

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    // Basculer vers l'onglet des fichiers après upload réussi
    setTimeout(() => {
      setActiveTab('files');
    }, 1500);
  };

  const handleUploadError = (error: string) => {
    console.error('Erreur d\'upload:', error);
  };

  // Déterminer si l'utilisateur peut uploader des produits
  const isOwnerOrPrinter = user?.role === 'PROPRIETAIRE' || user?.role === 'proprietaire';

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
              ? 'Gérez vos produits et les demandes d\'impression' 
              : 'Uploadez vos modèles 3D et suivez vos impressions'
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
            {isOwnerOrPrinter ? 'Ajouter un produit' : 'Nouveau modèle'}
          </button>
          
          <button 
            className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <i className="fas fa-folder"></i>
            {isOwnerOrPrinter ? 'Mes produits' : 'Mes modèles'}
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
                <ClientFileUpload 
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="tab-content files-tab">
              <UserFiles 
                refreshTrigger={refreshTrigger}
                userRole={user?.role}
              />
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <i className="fas fa-cube"></i>
            <div className="stat-info">
              <span className="stat-number">-</span>
              <span className="stat-label">
                {isOwnerOrPrinter ? 'Produits' : 'Modèles uploadés'}
              </span>
            </div>
          </div>
          
          <div className="stat-card">
            <i className="fas fa-print"></i>
            <div className="stat-info">
              <span className="stat-number">-</span>
              <span className="stat-label">
                {isOwnerOrPrinter ? 'Impressions' : 'En cours'}
              </span>
            </div>
          </div>
          
          <div className="stat-card">
            <i className="fas fa-check-circle"></i>
            <div className="stat-info">
              <span className="stat-number">-</span>
              <span className="stat-label">
                {isOwnerOrPrinter ? 'Terminées' : 'Terminées'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;