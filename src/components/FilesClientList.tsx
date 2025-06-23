// src/components/FilesClientList.tsx
import React, { useState, useEffect } from 'react';
import { filesClientService } from '../services/filesClient.service';
import { useFilesClient } from '../hooks/useFilesClient';
import { useAuth } from '../hooks/useAuth';
import { Modele3DClient } from '../services';

interface FilesClientListProps {
  showAllFiles?: boolean;
  onFileSelect?: (file: Modele3DClient) => void;
  onVerificationUpdate?: () => void;
}

const FilesClientList: React.FC<FilesClientListProps> = ({
  showAllFiles = false,
  onFileSelect,
  onVerificationUpdate
}) => {
  const { user } = useAuth();
  const { files, loading, error, refreshFiles, deleteFile } = useFilesClient();
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const canModifyVerification = user?.role === 'PROPRIETAIRE' || user?.role === 'IMPRIMEUR';
  const canDeleteFile = (file: Modele3DClient) => {
    return user?.role === 'PROPRIETAIRE' || file.utilisateurId === user?.id;
  };

  // ✅ Charger les fichiers au montage du composant
  useEffect(() => {
    refreshFiles(showAllFiles);
  }, [showAllFiles, refreshFiles]);

  // ✅ CORRECTION : Wrapper pour le bouton refresh
  const handleRefresh = () => {
    refreshFiles(showAllFiles);
  };

  // ✅ CORRECTION : Wrapper pour le bouton réessayer
  const handleRetry = () => {
    refreshFiles(showAllFiles);
  };

  const handleDelete = async (file: Modele3DClient) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${file.nom}" ?`)) {
      return;
    }

    setActionLoading(file.id);
    try {
      await deleteFile(file.id);
      // Pas besoin de refreshFiles car deleteFile in hook le fait déjà
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerificationToggle = async (file: Modele3DClient) => {
    setActionLoading(file.id);
    try {
      const newStatus = !file.estVerifie;
      
      // ✅ Utiliser le service pour la vérification
      const response = await filesClientService.updateFileClientVerificationStatus(file.id, {
        estVerifie: newStatus
      });

      if (response.success) {
        await refreshFiles(showAllFiles); // ✅ Refresh avec le bon paramètre
        onVerificationUpdate?.();
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: '15px' }}></i>
        <p>Chargement de vos fichiers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '4px',
        margin: '20px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
        <button 
          onClick={handleRetry} // ✅ CORRECTION
          style={{
            padding: '8px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          <i className="fas fa-redo"></i> Réessayer
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        <i className="fas fa-cube fa-3x" style={{ marginBottom: '20px', opacity: 0.5 }}></i>
        <h3 style={{ marginBottom: '10px', fontWeight: 'normal' }}>Aucun fichier personnel</h3>
        <p>
          {showAllFiles 
            ? "Aucun fichier client n'a encore été uploadé sur la plateforme." 
            : "Vous n'avez encore uploadé aucun fichier 3D personnel."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '15px'
      }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-user-lock" style={{ color: '#007bff' }}></i>
          {showAllFiles ? 'Tous les fichiers clients' : 'Mes fichiers personnels'} 
          <span style={{
            backgroundColor: '#e9ecef',
            color: '#495057',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'normal'
          }}>
            {files.length}
          </span>
        </h3>
        
        <button 
          onClick={handleRefresh} // ✅ CORRECTION
          disabled={loading}
          style={{
            padding: '8px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className="fas fa-sync"></i>
          Actualiser
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {files.map((file) => (
          <div 
            key={file.id}
            style={{
              border: `2px solid ${file.estVerifie ? '#28a745' : '#ffc107'}`,
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {/* Header avec icône et statuts */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '15px'
            }}>
              <div style={{ fontSize: '24px', color: '#007bff' }}>
                <i className={filesClientService.getFileIcon(
                  file.fichier3D?.cheminFichier || 
                  file.nomFichier || 
                  `fichier.${file.fichier3D?.format || 'unknown'}`
                )}></i>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                <span style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px'
                }}>
                  <i className="fas fa-user-lock"></i> Privé
                </span>
                <span style={{
                  backgroundColor: file.estVerifie ? '#28a745' : '#ffc107',
                  color: file.estVerifie ? 'white' : '#000',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px'
                }}>
                  <i className={`fas ${file.estVerifie ? 'fa-check-circle' : 'fa-clock'}`}></i>
                  {file.estVerifie ? 'Vérifié' : 'En attente'}
                </span>
              </div>
            </div>

            {/* Informations du fichier */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{file.fichier3D?.nom}</h4>
              
              <div style={{ fontSize: '13px', color: '#666' }}>
                <p style={{ margin: '3px 0' }}>
                  <strong>Taille:</strong> {filesClientService.formatFileSize(file.fichier3D?.tailleFichier)}
                </p>
                <p style={{ margin: '3px 0' }}>
                  <strong>Créé le:</strong> {filesClientService.formatDate(file.dateCreation)}
                </p>
                
                {showAllFiles && file.utilisateur && (
                  <p style={{ margin: '3px 0' }}>
                    <strong>Propriétaire:</strong> {file.utilisateur.email}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {onFileSelect && (
                <button 
                  onClick={() => onFileSelect(file)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-hand-pointer"></i> Sélectionner
                </button>
              )}

              {canModifyVerification && (
                <button
                  onClick={() => handleVerificationToggle(file)}
                  disabled={actionLoading === file.id}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: file.estVerifie ? '#dc3545' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {actionLoading === file.id ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className={`fas ${file.estVerifie ? 'fa-times' : 'fa-check'}`}></i>
                  )}
                  {' '}
                  {file.estVerifie ? 'Retirer vérification' : 'Vérifier'}
                </button>
              )}

              {canDeleteFile(file) && (
                <button
                  onClick={() => handleDelete(file)}
                  disabled={actionLoading === file.id}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {actionLoading === file.id ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-trash"></i>
                  )}
                  {' '}
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilesClientList;
