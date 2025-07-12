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

  // ✅ Fonctions utilitaires pour le formatage
  const formatPrice = (price: string | number | null | undefined): string => {
    if (!price) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? 'N/A' : `${numPrice.toFixed(2)} €`;
  };

  const formatWeight = (weight: string | number | null | undefined): string => {
    if (!weight) return 'N/A';
    const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
    return isNaN(numWeight) ? 'N/A' : `${numWeight.toFixed(2)} g`;
  };

  const formatVolume = (volume: string | number | null | undefined): string => {
    if (!volume) return 'N/A';
    const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
    return isNaN(numVolume) ? 'N/A' : `${numVolume.toFixed(2)} cm³`;
  };

  const formatDimensions = (file: Modele3DClient): string => {
    const { longueur, largeur, hauteur } = file;
    if (!longueur || !largeur || !hauteur) return 'N/A';
    
    const l = typeof longueur === 'string' ? parseFloat(longueur) : longueur;
    const w = typeof largeur === 'string' ? parseFloat(largeur) : largeur;
    const h = typeof hauteur === 'string' ? parseFloat(hauteur) : hauteur;
    
    if (isNaN(l) || isNaN(w) || isNaN(h)) return 'N/A';
    
    return `${l.toFixed(1)} × ${w.toFixed(1)} × ${h.toFixed(1)} mm`;
  };

  const getStatusInfo = (file: Modele3DClient) => {
    const status = file.statut || 'en_attente';
    const statusConfig = {
      'en_attente': { color: '#ffc107', icon: 'fa-clock', text: 'En attente', bgColor: '#fff3cd' },
      'analyse': { color: '#17a2b8', icon: 'fa-search', text: 'Analyse en cours', bgColor: '#d1ecf1' },
      'pret_impression': { color: '#28a745', icon: 'fa-check-circle', text: 'Prêt à imprimer', bgColor: '#d4edda' },
      'impression': { color: '#fd7e14', icon: 'fa-print', text: 'En impression', bgColor: '#ffeaa7' },
      'termine': { color: '#6c757d', icon: 'fa-flag-checkered', text: 'Terminé', bgColor: '#f8f9fa' },
      'erreur': { color: '#dc3545', icon: 'fa-exclamation-triangle', text: 'Erreur', bgColor: '#f8d7da' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.en_attente;
  };

  // ✅ Charger les fichiers au montage du composant
  useEffect(() => {
    refreshFiles(showAllFiles);
  }, [showAllFiles, refreshFiles]);

  const handleRefresh = () => {
    refreshFiles(showAllFiles);
  };

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
      
      const response = await filesClientService.updateFileClientVerificationStatus(file.id, {
        estVerifie: newStatus
      });

      if (response.success) {
        await refreshFiles(showAllFiles);
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
          onClick={handleRetry}
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
          onClick={handleRefresh}
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {files.map((file) => {
          const statusInfo = getStatusInfo(file);
          
          return (
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
              {/* ✅ Header avec icône et statuts */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <div style={{ fontSize: '24px', color: '#007bff' }}>
                  <i className={filesClientService.getFileIcon(
                    file.fichier3D?.nomFichier || 
                    file.nom || 
                    `fichier.${file.fichier3D?.format || 'unknown'}`
                  )}></i>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                  {/* ✅ Prix en évidence */}
                  <div style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}>
                    <i className="fas fa-euro-sign" style={{ marginRight: '4px' }}></i>
                    {formatPrice(file.prix)}
                  </div>
                  
                  {/* Statut du projet */}
                  <span style={{
                    backgroundColor: statusInfo.bgColor,
                    color: statusInfo.color,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    border: `1px solid ${statusInfo.color}`
                  }}>
                    <i className={`fas ${statusInfo.icon}`}></i>
                    {' '}{statusInfo.text}
                  </span>
                  
                  {/* Statut de vérification */}
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

              {/* ✅ Informations du fichier enrichies */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>
                  {file.nom}
                </h4>
                
                {/* Description */}
                {file.description && (
                  <p style={{ 
                    margin: '0 0 12px 0', 
                    color: '#666', 
                    fontSize: '13px',
                    fontStyle: 'italic',
                    lineHeight: '1.4'
                  }}>
                    "{file.description}"
                  </p>
                )}
                
                {/* ✅ Informations techniques en grille */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <div>
                    <strong>📁 Fichier:</strong><br />
                    {file.fichier3D?.nomFichier || 'N/A'}
                  </div>
                  <div>
                    <strong>📏 Taille:</strong><br />
                    {filesClientService.formatFileSize(file.fichier3D?.tailleFichier)}
                  </div>
                  <div>
                    <strong>📐 Dimensions:</strong><br />
                    {formatDimensions(file)}
                  </div>
                  <div>
                    <strong>🎲 Volume:</strong><br />
                    {formatVolume(file.volume)}
                  </div>
                  <div>
                    <strong>⚖️ Poids:</strong><br />
                    {formatWeight(file.poidsMatiere)}
                  </div>
                  <div>
                    <strong>🎨 Matériau:</strong><br />
                    {file.materiau?.nom || 'N/A'}
                  </div>
                </div>

                {/* ✅ Détail des coûts */}
                {/* {(file.coutMateriau || file.coutExpedition) && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                    <strong>💰 Détail des coûts:</strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                      <span>Matériau:</span>
                      <span>{formatPrice(file.coutMateriau)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Expédition:</span>
                      <span>{formatPrice(file.coutExpedition)}</span>
                    </div>
                    {file.coutMain && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Main d'œuvre:</span>
                        <span>{formatPrice(file.coutMain)}</span>
                      </div>
                    )}
                    <hr style={{ margin: '5px 0', border: 'none', borderTop: '1px solid #dee2e6' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>Total:</span>
                      <span>{formatPrice(file.prix)}</span>
                    </div>
                  </div>
                )} */}

                {/* ✅ Prix total uniquement */}
                {file.prix && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    💰 Prix total: {formatPrice(file.prix)}
                  </div>
                )}
                
                {/* ✅ Métadonnées */}
                <div style={{ 
                  marginTop: '12px',
                  fontSize: '11px', 
                  color: '#999',
                  borderTop: '1px solid #eee',
                  paddingTop: '8px'
                }}>
                  <p style={{ margin: '2px 0' }}>
                    <strong>📅 Créé:</strong> {filesClientService.formatDate(file.dateCreation)}
                  </p>
                  {showAllFiles && file.utilisateur && (
                    <p style={{ margin: '2px 0' }}>
                      <strong>👤 Propriétaire:</strong> {file.utilisateur.email}
                    </p>
                  )}
                </div>
              </div>

              {/* ✅ Actions */}
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
          );
        })}
      </div>
    </div>
  );
};

export default FilesClientList;
