import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommandeModal from './CommandeModal';
import { Modele3DClient, FileClientListResponse } from '../types/FileClientData';
import { useAuth } from '../hooks/useAuth';
import { filesClientService } from '../services/filesClient.service';

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
  const navigate = useNavigate();
  
  // ✅ États
  const [files, setFiles] = useState<Modele3DClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // ✅ États pour le modal de commande
  const [showCommandeModal, setShowCommandeModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Modele3DClient | null>(null);

  // ✅ Fonction pour actualiser les fichiers (sans typage strict)
  const refreshFiles = async (showAll: boolean = false) => {
    setLoading(true);
    setError('');
    
    try {
      // ✅ Laissons TypeScript inférer le type pour éviter les conflits
      const response = showAll 
        ? await filesClientService.getFilesClient()
        : await filesClientService.getFilesClient();
      
      if (response.success) {
        // ✅ Vérification plus flexible des propriétés
        const filesList = response.data || response.files || [];
        setFiles(filesList);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des fichiers');
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des fichiers:', err);
      setError(err.message || 'Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour supprimer un fichier
  const deleteFile = async (fileId: number) => {
    try {
      const response = await filesClientService.deleteFileClient(fileId);
      
      if (response.success) {
        await refreshFiles(showAllFiles);
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      throw error;
    }
  };

  // ✅ Fonction pour vérifier si un fichier peut être commandé
  const canOrderFile = (file: Modele3DClient): boolean => {
    // ✅ Conversion plus robuste pour estVerifie
    const isVerified = file.estVerifie === true;
    
    return file.prix && 
           parseFloat(file.prix) > 0;
          //   isVerified && 
          //  (file.statut === 'pret_impression' || file.statut === 'pret') && 
  };

  // ✅ Fonction pour commander un modèle
  const handleCommanderModele = (file: Modele3DClient) => {
    if (!user) {
      alert('Vous devez être connecté pour passer une commande.');
      navigate('/login');
      return;
    }

    if (!canOrderFile(file)) {
      alert('Ce fichier ne peut pas être commandé pour le moment.');
      return;
    }

    setSelectedFile(file);
    setShowCommandeModal(true);
  };

  // ✅ Fonction de suppression avec gestion des erreurs
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

  // ✅ Fonction de succès de commande
  const handleCommandeSuccess = () => {
    refreshFiles(showAllFiles);
    setSelectedFile(null);
    setShowCommandeModal(false);
  };

  // ✅ Fonction de rafraîchissement
  const handleRefresh = () => {
    refreshFiles(showAllFiles);
  };

  // ✅ Chargement initial
  useEffect(() => {
    refreshFiles(showAllFiles);
  }, [showAllFiles]);

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
    
    const l = parseFloat(longueur);
    const w = parseFloat(largeur);
    const h = parseFloat(hauteur);
    
    if (isNaN(l) || isNaN(w) || isNaN(h)) return 'N/A';
    
    return `${l.toFixed(1)} × ${w.toFixed(1)} × ${h.toFixed(1)} mm`;
  };

  const getStatusInfo = (file: Modele3DClient) => {
    const status = file.statut || 'en_attente';
    const statusConfig = {
      'en_attente': { color: '#ffc107', icon: 'fa-clock', text: 'En attente', bgColor: '#fff3cd' },
      'analyse': { color: '#17a2b8', icon: 'fa-search', text: 'Analyse en cours', bgColor: '#d1ecf1' },
      'pret_impression': { color: '#28a745', icon: 'fa-check-circle', text: 'Prêt à imprimer', bgColor: '#d4edda' },
      'pret': { color: '#28a745', icon: 'fa-check-circle', text: 'Prêt', bgColor: '#d4edda' },
      'impression': { color: '#fd7e14', icon: 'fa-print', text: 'En impression', bgColor: '#ffeaa7' },
      'termine': { color: '#6c757d', icon: 'fa-flag-checkered', text: 'Terminé', bgColor: '#f8f9fa' },
      'erreur': { color: '#dc3545', icon: 'fa-exclamation-triangle', text: 'Erreur', bgColor: '#f8d7da' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.en_attente;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ color: '#007bff' }}></i>
        <p style={{ marginTop: '20px', color: '#6c757d' }}>Chargement des fichiers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <i className="fas fa-exclamation-triangle fa-2x" style={{ color: '#dc3545' }}></i>
        <p style={{ marginTop: '20px', color: '#dc3545' }}>Erreur: {error}</p>
        <button 
          onClick={handleRefresh}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Réessayer
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
        <h3 style={{ marginBottom: '10px', fontWeight: 'normal' }}>Aucun fichier trouvé</h3>
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
          // ✅ Conversion robuste pour estVerifie
          const isVerified = file.estVerifie === true;
          
          return (
            <div 
              key={file.id}
              style={{
                border: `2px solid ${isVerified ? '#28a745' : '#ffc107'}`,
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {/* En-tête */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h4 style={{ margin: 0, color: '#333' }}>{file.nom}</h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: statusInfo.bgColor,
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  <i className={`fas ${statusInfo.icon}`} style={{ color: statusInfo.color }}></i>
                  <span style={{ fontSize: '12px', color: statusInfo.color, fontWeight: 'bold' }}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

              {/* Status de vérification */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '15px',
                padding: '8px',
                backgroundColor: isVerified ? '#d4edda' : '#fff3cd',
                borderRadius: '4px'
              }}>
                <i className={`fas ${isVerified ? 'fa-check-circle' : 'fa-clock'}`} 
                   style={{ color: isVerified ? '#28a745' : '#ffc107' }}></i>
                <span style={{ 
                  fontSize: '12px', 
                  color: isVerified ? '#155724' : '#856404',
                  fontWeight: 'bold'
                }}>
                  {isVerified ? 'Vérifié' : 'En attente de vérification'}
                </span>
              </div>

              {/* Description */}
              {file.description && (
                <p style={{ 
                  margin: '0 0 15px 0', 
                  color: '#666', 
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  {file.description}
                </p>
              )}

              {/* Informations techniques */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '15px',
                fontSize: '13px'
              }}>
                <div>
                  <strong>Fichier:</strong> {file.fichier3D.nomFichier}
                </div>
                <div>
                  <strong>Format:</strong> {file.fichier3D.format}
                </div>
                <div>
                  <strong>Matériau:</strong> {file.materiau.nom}
                </div>
                <div>
                  <strong>Couleur:</strong> {file.materiau.couleur}
                </div>
                <div>
                  <strong>Dimensions:</strong> {formatDimensions(file)}
                </div>
                <div>
                  <strong>Volume:</strong> {formatVolume(file.volume)}
                </div>
                <div>
                  <strong>Poids:</strong> {formatWeight(file.poidsMatiere)}
                </div>
                <div>
                  <strong>Prix:</strong> {formatPrice(file.prix)}
                </div>
              </div>

              {/* Informations sur les supports */}
              {file.necessiteSupports && (
                <div style={{
                  backgroundColor: '#fff3cd',
                  padding: '8px',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  fontSize: '12px',
                  color: '#856404'
                }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '5px' }}></i>
                  Ce modèle nécessite des supports pour l'impression
                </div>
              )}

              {/* Boutons d'action */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                {canOrderFile(file) && (
                  <button 
                    onClick={() => handleCommanderModele(file)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    Commander
                  </button>
                )}
                
                <button 
                  onClick={() => handleDelete(file)}
                  disabled={actionLoading === file.id}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-trash"></i>
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Modal de commande */}
      <CommandeModal
        show={showCommandeModal}
        onHide={() => setShowCommandeModal(false)}
        file={selectedFile}
        onCommandeSuccess={handleCommandeSuccess}
      />
    </div>
  );
};

export default FilesClientList;