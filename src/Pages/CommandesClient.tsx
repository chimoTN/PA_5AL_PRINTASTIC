import React, { useState, useEffect } from 'react';
import {
  Badge,
  Button,
  Card,
  Container,
  ListGroup,
  Spinner,
  Modal,
  Form,
  Alert,
} from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { commandeService } from '../services/commande.service';
import reclamationService from '../services/reclamation.service';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import FacturePDFGenerator from '../utilis/pdf/FacturePDFGenerator';
import { filesClientService } from '../services/filesClient.service';
import { paiementService } from '../services/paiementService';

const stripePromise = loadStripe('pk_test_51RbQFLIPwrA3cz1VnsMIcmzz0oxAzJ78wR0Qh18WLVdfXDTTNeYaFS87PFVSRyo8lTvyxgs0vOyqQuWzgdRdehhS00W1CoJzoq');

const statutColors: Record<string, string> = {
  'en_attente': 'warning',
  'en_cours': 'info',
  'impression': 'primary',
  'expedie': 'primary',
  'termine': 'success',
  'annule': 'danger',
  'en attente': 'warning',
  'en cours': 'info',
  expédié: 'primary',
  livré: 'secondary',
  arrivée: 'success',
  annulé: 'danger',
};
interface CommandeData {
  id: number;
  reference: string;
  prixTotal: string | number;
  dateCreation?: string;
  statut?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  detailCommandes: Array<{
    id: number;
    statut: string;
    quantite: number;
    prixUnitaire: string | number;
    reference?: string;
    produit?: {
      nom: string;
    } | null;
    modele3DClient?: {
      nom: string;
      description?: string;
      fichier3D?: {
        nomFichier: string;
        tailleFichier: number;
      };
      materiau?: {
        nom: string;
        couleur?: string;
      };
      pricing?: {
        breakdown: {
          coutMatiere: number;
          coutSupports: number;
          coutElectricite: number;
          coutUsureMachine: number;
          coutExpedition: number;
          margeImprimeur: number;
          margePlateforme: number;
          prixHT: number;
          tva: number;
          prixTTC: number;
        };
        analyse: {
          materiauNom: string;
          volume: number;
          tauxRemplissage: number;
          poidsMatiere: number;
        };
      };
    } | null;
    modele3dClientId?: number; // Added for fetching model details
  }>;
  paiements?: Array<{
    id: number;
    montant: string | number;
    methodePaiement: string;
    dateCreation: string;
  }>;
}

// ✅ Composant Button personnalisé pour éviter l'erreur union type
const CustomButton: React.FC<{
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info' | 'outline-light' | 'outline-dark';
  size?: 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}> = ({ variant = 'primary', size, className = '', disabled = false, onClick, children, type = 'button' }) => {
  const baseClasses = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size ? `btn-${size}` : '';
  const classes = `${baseClasses} ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const CommandesClient = () => {
  const [commandes, setCommandes] = useState<CommandeData[]>([]);
  const [loading, setLoading] = useState(true);

  // Pour le modal de réclamation
  const [showModal, setShowModal] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [selectedLibelle, setSelectedLibelle] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedCommande, setExpandedCommande] = useState<number | null>(null);
  const [stripePaiement, setStripePaiement] = useState<any | null>(null);
  const [modeles3D, setModeles3D] = useState<{ [id: number]: any }>({});
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Gestion des messages de notification
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'danger' | 'warning' | 'info';
  } | null>(null);

    useEffect(() => {
    // ✅ Récupérer le message depuis la navigation
    if (location.state?.message) {
      setMessage({
        text: location.state.message,
        type: location.state.type === 'success' ? 'success' : 'info'
      });
      
      // Nettoyer le state
      navigate(location.pathname, { replace: true });
      
      // Masquer le message après 5 secondes
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    // ✅ CORRECTION: Vérification que user.id existe
    if (!user?.id) {
      setLoading(false);
      return;
    }

    commandeService
      .getMesCommandes()
      .then((response) => {
        // ✅ Vérifier si c'est une réponse API avec wrapper ou directement les données
        if (Array.isArray(response)) {
          // Réponse directe (array)
          setCommandes(response);
        } else if (response && typeof response === 'object') {
          // Réponse avec wrapper
          const commandeResponse = response as any;
          if (commandeResponse.success && commandeResponse.data) {
            setCommandes(commandeResponse.data);
          } else if (commandeResponse.commandes) {
            setCommandes(commandeResponse.commandes);
          } else {
            // Si la réponse est un objet mais pas dans le format attendu
            setCommandes([]);
          }
        } else {
          setCommandes([]);
        }
      })
      .catch((err) => {
        console.error('Erreur récupération commandes :', err);
        setMessage({
          text: 'Erreur lors du chargement des commandes',
          type: 'danger'
        });
        setCommandes([]);
      })
       .finally(() => setLoading(false));
  }, [user]);

  const annulerProduit = (idDetailCommande: number) => {
    commandeService
      .changerStatutDetailCommande(idDetailCommande, 'annulé')
      .then(() => {
        setCommandes((prev) =>
          prev.map((c) => ({
            ...c,
            detailCommandes: c.detailCommandes.map((d: any) =>
              d.id === idDetailCommande ? { ...d, statut: 'annulé' } : d
            ),
          }))
        );
      })
      .catch((err) => console.error('Erreur annulation :', err));
  };

  const openSignalModal = (detailId: number) => {
    setSelectedDetailId(detailId);
    setReason('');
    setShowModal(true);
  };

const handleSignalSubmit = async () => {
  if (!selectedLibelle || !reason.trim()) {
    toast.error('Merci de sélectionner une raison et de décrire le problème');
    return;
  }
  // appel du service
  await reclamationService.createReclamation({
    detailCommandeId: selectedDetailId!,
    libelle: selectedLibelle,
    description: reason,
  });
};

  const toggleCommandeDetails = (commandeId: number) => {
    setExpandedCommande(expandedCommande === commandeId ? null : commandeId);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0,00' : numPrice.toFixed(2);
  };

  const navigateToProducts = () => {
    navigate('/mes-fichiers');
  };

  // Récupérer les infos Stripe lors de l'affichage des détails
  useEffect(() => {
    if (expandedCommande) {
      paiementService.getStripePaiementByCommandeId(expandedCommande)
        .then(setStripePaiement)
        .catch(() => setStripePaiement(null));
    } else {
      setStripePaiement(null);
    }
  }, [expandedCommande]);

  // Charger dynamiquement les modèles 3D nécessaires
  useEffect(() => {
    commandes.forEach(commande => {
      commande.detailCommandes.forEach(detail => {
        if (detail.modele3dClientId && !modeles3D[detail.modele3dClientId]) {
          filesClientService.getFileClientById(detail.modele3dClientId)
            .then(data => {
              if (data) {
                setModeles3D(prev => ({
                  ...prev,
                  [String(detail.modele3dClientId)]: data
                }));
              }
            });
        }
      });
    });
  }, [commandes]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </Container>
    );
  }

  if (!commandes.length) {
    return (
      <Container className="mt-4">
        <h2 className="mb-4 fw-bold">Mes Commandes</h2>
        <Alert variant="info">
          <i className="fas fa-info-circle me-2"></i>
          Aucune commande trouvée. 
          <span 
            className="text-primary text-decoration-underline ms-2"
            style={{ cursor: 'pointer' }}
            onClick={navigateToProducts}
          >
            Découvrir nos produits
          </span>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4 fw-bold">Mes Commandes</h2>

      {/* ✅ Message de notification */}
      {message && (
        <Alert 
          variant={message.type} 
          dismissible 
          onClose={() => setMessage(null)}
          className="mb-4"
        >
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 
                              message.type === 'danger' ? 'fa-exclamation-triangle' : 
                              'fa-info-circle'} me-2`}></i>
          {message.text}
        </Alert>
      )}

      {commandes.map((commande) => (
        <Card
          key={commande.id}
          className="mb-4 shadow-sm"
          style={{ backgroundColor: '#f9f9f9' }}
        >
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Commande #{commande.reference}</strong> — {formatPrice(commande.prixTotal)} €
              {commande.dateCreation && (
                <div className="text-muted small mt-1">
                  <i className="fas fa-calendar me-1"></i>
                  Commandé le {formatDate(commande.dateCreation)}
                </div>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge bg={statutColors[commande.statut || 'en_attente'] || 'secondary'} className="fw-bold text-uppercase">
                {commande.statut?.replace('_', ' ') || 'En attente'}
              </Badge>
              <CustomButton 
                variant="outline-primary" 
                size="sm"
                onClick={() => toggleCommandeDetails(commande.id)}
              >
                <i className={`fas fa-chevron-${expandedCommande === commande.id ? 'up' : 'down'}`}></i>
              </CustomButton>
            </div>
          </Card.Header>

          <Card.Body>
            <ListGroup>
              {(commande.detailCommandes || []).map((detail: any) => (
                <ListGroup.Item
                  key={detail.id}
                  className="d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3"
                >
                  <div className="fw-semibold text-dark">
                    {/* Affichage du nom du modèle 3D ou du produit */}
                    {detail.produit ? (
                      <div>
                        <i className="fas fa-box text-success me-2"></i>
                        <strong>{detail.produit.nom}</strong>
                        {/* autres infos produit si besoin */}
                      </div>
                    ) : detail.modele3dClientId ? (
                      <div>
                        <i className="fas fa-cube text-primary me-2"></i>
                        <strong>{modeles3D[detail.modele3dClientId]?.nom || 'Modèle 3D'}</strong>
                        {modeles3D[detail.modele3dClientId]?.materiau && (
                          <span className="ms-2 text-muted small">
                            • {modeles3D[detail.modele3dClientId].materiau.nom}
                            {modeles3D[detail.modele3dClientId].materiau.couleur && (
                              <span> ({modeles3D[detail.modele3dClientId].materiau.couleur})</span>
                            )}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <strong>Produit inconnu</strong>
                      </div>
                    )}
                    <div className="text-muted small mt-1">
                      <span className="me-3">
                        <i className="fas fa-sort-numeric-up me-1"></i>
                        Quantité: {detail.quantite}
                      </span>
                      <span>
                        <i className="fas fa-euro-sign me-1"></i>
                        {formatPrice(detail.prixUnitaire)} € x {detail.quantite} = {formatPrice(parseFloat(detail.prixUnitaire.toString()) * detail.quantite)} €
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 mt-md-0 text-md-end">
                    <Badge
                      bg={statutColors[detail.statut] || 'secondary'}
                      className="me-3 fw-bold text-uppercase"
                    >
                      {detail.statut}
                    </Badge>
                  </div>
                  {/* Détails étendus uniquement si demandé */}
                  {expandedCommande === commande.id && (
                    <div className="mt-3 pt-3 border-top">
                      {detail.modele3DClient?.description && (
                        <div className="mb-2">
                          <strong>Description:</strong>
                          <div className="text-muted small">{detail.modele3DClient.description}</div>
                        </div>
                      )}
                      {detail.modele3DClient?.fichier3D && (
                        <div className="mb-2">
                          <strong>Fichier:</strong>
                          <div className="text-muted small">
                            {detail.modele3DClient.fichier3D.nomFichier}
                            {detail.modele3DClient.fichier3D.tailleFichier && (
                              <span className="ms-2">
                                ({(detail.modele3DClient.fichier3D.tailleFichier / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Détail du pricing si présent */}
                      {detail.modele3DClient?.pricing && (
                        <div style={{ marginTop: '10px', background: '#f8f9fa', borderRadius: 6, padding: 10 }}>
                          <h5 style={{ marginBottom: 8 }}>Détail du prix</h5>
                          <ul style={{ fontSize: 13, marginBottom: 0 }}>
                            <li><strong>Coût matière :</strong> {detail.modele3DClient.pricing.breakdown.coutMatiere.toFixed(2)} €</li>
                            <li><strong>Coût supports :</strong> {detail.modele3DClient.pricing.breakdown.coutSupports.toFixed(2)} €</li>
                            <li><strong>Électricité :</strong> {detail.modele3DClient.pricing.breakdown.coutElectricite.toFixed(2)} €</li>
                            <li><strong>Usure machine :</strong> {detail.modele3DClient.pricing.breakdown.coutUsureMachine.toFixed(2)} €</li>
                            <li><strong>Expédition :</strong> {detail.modele3DClient.pricing.breakdown.coutExpedition.toFixed(2)} €</li>
                            <li><strong>Marge imprimeur :</strong> {detail.modele3DClient.pricing.breakdown.margeImprimeur.toFixed(2)} €</li>
                            <li><strong>Marge plateforme :</strong> {detail.modele3DClient.pricing.breakdown.margePlateforme.toFixed(2)} €</li>
                            <li><strong>Prix HT :</strong> {detail.modele3DClient.pricing.breakdown.prixHT.toFixed(2)} €</li>
                            <li><strong>TVA :</strong> {detail.modele3DClient.pricing.breakdown.tva.toFixed(2)} €</li>
                            <li><strong>Prix TTC :</strong> {detail.modele3DClient.pricing.breakdown.prixTTC.toFixed(2)} €</li>
                          </ul>
                          {/* Affichage analyse */}
                          <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
                            <strong>Analyse :</strong> {detail.modele3DClient.pricing.analyse.materiauNom}, {detail.modele3DClient.pricing.analyse.volume.toFixed(2)} cm³, {detail.modele3DClient.pricing.analyse.tauxRemplissage}% remplissage, {detail.modele3DClient.pricing.analyse.poidsMatiere.toFixed(2)} g
                          </div>
                        </div>
                      )}
                      {/* Paiement et livraison */}
                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="text-muted mb-2">
                            <i className="fas fa-user me-2"></i>
                            Livraison
                          </h6>
                          <div className="text-muted small">
                            <div><strong>Nom:</strong> {commande.prenom} {commande.nom}</div>
                            <div><strong>Email:</strong> {commande.email}</div>
                            <div><strong>Téléphone:</strong> {commande.telephone}</div>
                            <div><strong>Adresse:</strong> {commande.adresse}</div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <h6 className="text-muted mb-2">
                            <i className="fas fa-credit-card me-2"></i>
                            Paiement
                          </h6>
                          {stripePaiement ? (
                            <div>
                              <div><strong>Montant :</strong> {(stripePaiement.amount / 100).toFixed(2)} €</div>
                              <div><strong>Statut :</strong> {stripePaiement.status}</div>
                              <div><strong>Email :</strong> {stripePaiement.receipt_email}</div>
                              <div><strong>Date :</strong> {new Date(stripePaiement.created * 1000).toLocaleString()}</div>
                            </div>
                          ) : (
                            <div className="text-muted small">Paiement Stripe non trouvé</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <div className="text-end mt-3">
              <CustomButton 
                variant="dark" 
                size="sm"
                onClick={() => toggleCommandeDetails(commande.id)}
              >
                <i className={`fas fa-${expandedCommande === commande.id ? 'eye-slash' : 'eye'} me-1`}></i>
                {expandedCommande === commande.id ? 'Masquer les détails' : 'Voir les détails'}
              </CustomButton>
            </div>
          </Card.Body>
        </Card>
      ))}

      {/* Modal de réclamation */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Signaler un problème</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Sélection du libellé de réclamation */}
          <Form.Group className="mb-3">
            <Form.Label>Libellé de la réclamation</Form.Label>
            <Form.Select
              value={selectedLibelle}
              onChange={(e) => setSelectedLibelle(e.target.value)}
            >
              <option value="">-- Choisir une raison --</option>
              <option value="non livré">Non livré</option>
              <option value="défectueux">Défectueux</option>
              <option value="pas le bon produit">Pas le bon produit</option>
              <option value="cassé">Cassé</option>
            </Form.Select>
          </Form.Group>

          {/* Description libre */}
          <Form.Group>
            <Form.Label>Description détaillée</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <CustomButton variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </CustomButton>
          <CustomButton
            variant="primary"
            onClick={handleSignalSubmit}
            disabled={!reason.trim()}
          >
            Faire une réclamation
          </CustomButton>
          {expandedCommande && commandes.find(c => c.id === expandedCommande) ? (
            <FacturePDFGenerator
              commande={{
                ...commandes.find(c => c.id === expandedCommande)!,
                createdAt: commandes.find(c => c.id === expandedCommande)!.dateCreation || new Date().toISOString(),
                prenom: commandes.find(c => c.id === expandedCommande)!.prenom || '',
                nom: commandes.find(c => c.id === expandedCommande)!.nom || '',
                email: commandes.find(c => c.id === expandedCommande)!.email || '',
                telephone: commandes.find(c => c.id === expandedCommande)!.telephone || '',
                adresse: commandes.find(c => c.id === expandedCommande)!.adresse || '',
                prixTotal: (commandes.find(c => c.id === expandedCommande)!.prixTotal ?? '').toString(),
                detailCommandes: commandes.find(c => c.id === expandedCommande)!.detailCommandes.map((d: any) => ({
                  ...d,
                  reference: d.reference || ''
                }))
              }}
            />
          ) : null}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CommandesClient;