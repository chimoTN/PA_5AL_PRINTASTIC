// src/components/UserFiles.tsx

import React, { useState, useEffect } from 'react';
import { filesService, UserFile } from '../services';
import '../assets/styles/UserFiles.css';
import { FileStats } from '../services/files.service';

interface UserFilesProps {
  refreshTrigger?: number;
  userRole?: string;
  showStats?: boolean;
  className?: string;
  onFileDeleted?: () => void;
  maxFiles?: number;
  allowedTypes?: ('produit' | 'modele_client')[];
}

const UserFiles: React.FC<UserFilesProps> = ({ 
  refreshTrigger = 0, 
  userRole,
  showStats = true,
  className = '',
  onFileDeleted,
  maxFiles,
  allowedTypes
}) => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isOwnerOrPrinter = userRole === 'PROPRIETAIRE' || userRole === 'proprietaire' || userRole === 'IMPRIMEUR';

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les fichiers
      const filesData = await filesService.getMyFiles();
      
      // Filtrer par types autorisés si spécifié
      let filteredFiles = filesData;
      if (allowedTypes && allowedTypes.length > 0) {
        filteredFiles = filesData.filter(file => 
          file.type && allowedTypes.includes(file.type)
        );
      }
      
      // Limiter le nombre de fichiers si spécifié
      if (maxFiles) {
        filteredFiles = filteredFiles.slice(0, maxFiles);
      }
      
      setFiles(filteredFiles);
      
      // Charger les stats si demandées
      if (showStats) {
        try {
          const statsData = await filesService.getFileStats();
          setStats(statsData);
        } catch (statsError) {
          console.warn('Erreur lors du chargement des statistiques:', statsError);
        }
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des fichiers:', error);
      setError(error.message || 'Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  // Écouter les événements de fichiers uploadés
  useEffect(() => {
    const handleFileUploaded = () => {
      loadFiles();
    };

    window.addEventListener('fileUploaded', handleFileUploaded);
    window.addEventListener('modelUploaded', handleFileUploaded);
    return () => {
      window.removeEventListener('fileUploaded', handleFileUploaded);
      window.removeEventListener('modelUploaded', handleFileUploaded);
    };
  }, []);

  const handleDownload = async (id: number, filename: string) => {
    try {
      await filesService.downloadFile(id, filename);
    } catch (error: any) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier: ' + (error.message || 'Erreur inconnue'));
    }
  };

  const handleDelete = async (fileId: number) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const entityType = file.type === 'produit' ? 'produit' : 'modèle client';
    const message = `Cette action supprimera définitivement le ${entityType} et son fichier associé.`;

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ce fichier ?\n\n${message}`)) {
      return;
    }

    try {
      setDeletingId(fileId);
      await filesService.deleteFile(fileId);
      
      // Mettre à jour la liste des fichiers
      const updatedFiles = files.filter(f => f.id !== fileId);
      setFiles(updatedFiles);
      
      // Recharger les stats
      if (showStats) {
        try {
          const statsData = await filesService.getFileStats();
          setStats(statsData);
        } catch (error) {
          console.warn('Erreur lors du rechargement des stats:', error);
        }
      }
      
      // Callback si fourni
      if (onFileDeleted) {
        onFileDeleted();
      }
      
      // Émettre un événement pour d'autres composants
      window.dispatchEvent(new CustomEvent('fileDeleted', { detail: { fileId, file } }));
      
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du fichier: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setDeletingId(null);
    }
  };

  const getModelStatus = (file: UserFile): { text: string; className: string; icon: string } => {
    if (!file.modeleClient) {
      return { text: 'Produit', className: 'status-product', icon: '🏷️' };
    }

    if (file.modeleClient.estVerifie === true) {
      return { text: 'Vérifié', className: 'status-verified', icon: '✅' };
    } else if (file.modeleClient.estVerifie === false) {
      return { text: 'Rejeté', className: 'status-rejected', icon: '❌' };
    } else {
      return { text: 'En attente', className: 'status-pending', icon: '⏳' };
    }
  };

  const getFileTypeLabel = (type: string | null): string => {
    switch (type) {
      case 'produit':
        return 'Produit';
      case 'modele_client':
        return 'Modèle client';
      default:
        return 'Fichier';
    }
  };

  const getEmptyStateMessage = (): { title: string; message: string } => {
    if (allowedTypes && allowedTypes.length === 1) {
      if (allowedTypes[0] === 'produit') {
        return {
          title: 'Aucun produit',
          message: 'Vous n\'avez pas encore ajouté de produits.'
        };
      } else {
        return {
          title: 'Aucun modèle 3D',
          message: 'Vous n\'avez pas encore uploadé de modèles 3D.'
        };
      }
    }
    return {
      title: 'Aucun fichier',
      message: isOwnerOrPrinter 
        ? 'Vous n\'avez pas encore ajouté de produits.' 
        : 'Vous n\'avez pas encore uploadé de modèles 3D.'
    };
  };

  const getHeaderTitle = (): string => {
    if (allowedTypes && allowedTypes.length === 1) {
      if (allowedTypes[0] === 'produit') {
        return 'Mes produits';
      } else {
        return 'Mes modèles 3D';
      }
    }
    return isOwnerOrPrinter ? 'Mes produits' : 'Mes modèles 3D';
  };

  if (loading) {
    return (
      <div className={`user-files-container ${className}`}>
        <div className="files-header">
          <h2>
            <i className="fas fa-folder"></i>
            {getHeaderTitle()}
          </h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Chargement des fichiers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`user-files-container ${className}`}>
        <div className="files-header">
          <h2>
            <i className="fas fa-folder"></i>
            {getHeaderTitle()}
          </h2>
        </div>
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Erreur</h3>
          <p>{error}</p>
          <button onClick={loadFiles} className="retry-button">
            <i className="fas fa-redo"></i>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const emptyState = getEmptyStateMessage();

  return (
    <div className={`user-files-container ${className}`}>
      <div className="files-header">
        <h2>
          <i className="fas fa-folder"></i>
          {getHeaderTitle()}
        </h2>
        
        <div className="header-info">
          {stats && showStats && (
            <div className="stats-summary">
              <div className="stat-item">
                <span className="stat-value">{stats.nombreFichiers}</span>
                <span className="stat-label">Fichiers</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.nombreProduits}</span>
                <span className="stat-label">Produits</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.nombreModelesClients}</span>
                <span className="stat-label">Modèles</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.tailleTotaleMo.toFixed(1)} MB</span>
                <span className="stat-label">Espace</span>
              </div>
            </div>
          )}
          
          <div className="files-count">
            <i className="fas fa-file"></i>
            {files.length} fichier{files.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-cube"></i>
          </div>
          <h3>{emptyState.title}</h3>
          <p>{emptyState.message}</p>
        </div>
      ) : (
        <div className="files-grid">
          {files.map((file) => {
            const status = getModelStatus(file);
            const isDeleting = deletingId === file.id;

            return (
              <div key={file.id} className={`file-card ${isDeleting ? 'deleting' : ''}`}>
                <div className="file-icon">
                  <i className={filesService.getFileIcon(file.format)}></i>
                  <span className="file-format">{file.format.toUpperCase()}</span>
                </div>
                
                <div className="file-info">
                  <h3 className="file-name" title={file.nomOriginal || `Fichier ${file.id}`}>
                    {file.nomOriginal || `Fichier ${file.id}`}
                  </h3>
                  
                  <div className="file-details">
                    <span className="file-size">
                      <i className="fas fa-weight"></i>
                      {filesService.formatFileSize(file.tailleFichier)}
                    </span>
                    
                    <span className="file-date">
                      <i className="fas fa-calendar"></i>
                      {filesService.formatDate(file.dateCreation)}
                    </span>
                  </div>
                  
                  {file.type && (
                    <span 
                      className={`file-type type-${file.type}`}
                      style={{ backgroundColor: filesService.getFileTypeColor(file.type) }}
                    >
                      {getFileTypeLabel(file.type)}
                    </span>
                  )}

                  <div className={`model-status ${status.className}`}>
                    {status.icon} {status.text}
                  </div>

                  {file.modeleClient && (
                    <div className="model-info">
                      {file.modeleClient.materiau && (
                        <div className="model-detail">
                          <i className="fas fa-palette"></i>
                          <span>{file.modeleClient.materiau.nom}</span>
                        </div>
                      )}
                      <div className="model-detail">
                        <i className="fas fa-euro-sign"></i>
                        <span>{file.modeleClient.prix.toFixed(2)}€</span>
                      </div>
                      <div className="model-detail">
                        <i className="fas fa-weight"></i>
                        <span>{file.modeleClient.taille}g</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="file-actions">
                  <button
                    onClick={() => handleDownload(file.id, file.nomOriginal || `fichier_${file.id}.${file.format}`)}
                    className="action-button download"
                    title="Télécharger"
                    disabled={isDeleting}
                  >
                    <i className="fas fa-download"></i>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="action-button delete"
                    title="Supprimer"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash"></i>
                    )}
                  </button>
                </div>
                
                {isDeleting && (
                  <div className="deleting-overlay">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Suppression...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserFiles;
