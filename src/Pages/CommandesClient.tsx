// src/Pages/CommandesClient.tsx
import React, { useState, useEffect } from 'react';
import { Badge, Card, Container, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { commandeService } from '../Services/commande.service';
import { useAuth } from '../hooks/useAuth';
import FacturePDFGenerator from '../utilis/pdf/FacturePDFGenerator';

const statutColors: Record<string, string> = {
  'en_attente': 'warning',
  'en_cours': 'info',
  'impression': 'primary',
  'expedie': 'primary',
  'termine': 'success',
  'annule': 'danger',
  // ✅ Conserve vos anciens statuts pour compatibilité
  'en attente': 'warning',
  'en cours': 'info',
  'expédié': 'primary',
  'livré': 'secondary',
  'arrivée': 'success',
  'annulé': 'danger'
};

// ✅ Interface pour les données de commande
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
    } | null;
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedCommande, setExpandedCommande] = useState<number | null>(null);
  
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

    // ✅ CORRECTION: Gestion de la réponse avec typage approprié
    commandeService.getMesCommandes()
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
  }, [user?.id]);

  const annulerProduit = async (idDetailCommande: number) => {
    try {
      setActionLoading(`annuler-${idDetailCommande}`);
      
      await commandeService.changerStatutDetailCommande(idDetailCommande, 'annulé');
      
      setCommandes(prev =>
        prev.map(c => ({
          ...c,
          detailCommandes: c.detailCommandes.map((d: any) =>
            d.id === idDetailCommande ? { ...d, statut: 'annulé' } : d
          )
        }))
      );
      
      setMessage({
        text: 'Produit annulé avec succès',
        type: 'success'
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        text: error.message || 'Erreur lors de l\'annulation',
        type: 'danger'
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const signalerProduit = (index: number) => {
    setMessage({
      text: `Produit #${index + 1} signalé ! (fonction à implémenter)`,
      type: 'info'
    });
    setTimeout(() => setMessage(null), 3000);
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

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement de vos commandes...</p>
        </div>
      </Container>
    );
  }

  // ✅ Gestion du cas où l'utilisateur n'est pas connecté
  if (!user?.id) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Vous devez être connecté pour voir vos commandes.
        </Alert>
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
      <h2 className="mb-4 fw-bold">
        <i className="fas fa-shopping-bag me-2"></i>
        Mes Commandes
      </h2>

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
              {(commande.detailCommandes || []).map((detail: any, index: number) => (
                <ListGroup.Item key={detail.id} className="p-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div className="fw-semibold text-dark mb-2 mb-md-0">
                      {/* ✅ Gestion des modèles 3D ET des produits */}
                      {detail.modele3DClient ? (
                        <div>
                          <i className="fas fa-cube text-primary me-2"></i>
                          <strong>{detail.modele3DClient.nom}</strong>
                          <div className="text-muted small mt-1">
                            Modèle 3D personnalisé
                            {detail.modele3DClient.materiau && (
                              <span className="ms-2">
                                • {detail.modele3DClient.materiau.nom}
                                {detail.modele3DClient.materiau.couleur && (
                                  <span className="text-info"> ({detail.modele3DClient.materiau.couleur})</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <i className="fas fa-box text-success me-2"></i>
                          <strong>{detail.produit?.nom || 'Produit inconnu'}</strong>
                        </div>
                      )}
                      
                      <div className="text-muted small mt-1">
                        {detail.reference && (
                          <span className="me-3">
                            <i className="fas fa-hashtag me-1"></i>
                            {detail.reference}
                          </span>
                        )}
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
                      <Badge bg={statutColors[detail.statut] || 'secondary'} className="me-3 fw-bold text-uppercase">
                        {detail.statut?.replace('_', ' ') || 'Statut inconnu'}
                      </Badge>
                      
                      {(detail.statut === 'en_attente' || detail.statut === 'en attente') && (
                        <CustomButton 
                          variant="danger" 
                          size="sm"
                          className="me-2"
                          disabled={actionLoading === `annuler-${detail.id}`}
                          onClick={() => annulerProduit(detail.id)}
                        >
                          {actionLoading === `annuler-${detail.id}` ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                              Annulation...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-times me-1"></i>
                              Annuler
                            </>
                          )}
                        </CustomButton>
                      )}
                      
                      {(detail.statut === 'termine' || detail.statut === 'arrivée') && (
                        <CustomButton 
                          variant="warning" 
                          size="sm"
                          onClick={() => signalerProduit(index)}
                        >
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Signaler un problème
                        </CustomButton>
                      )}
                    </div>
                  </div>
                  
                  {/* ✅ Détails étendus */}
                  {expandedCommande === commande.id && detail.modele3DClient && (
                    <div className="mt-3 pt-3 border-top">
                      <h6 className="text-muted mb-2">
                        <i className="fas fa-info-circle me-2"></i>
                        Détails du modèle 3D
                      </h6>
                      <div className="row">
                        {detail.modele3DClient.description && (
                          <div className="col-md-6 mb-2">
                            <strong>Description:</strong>
                            <div className="text-muted small">{detail.modele3DClient.description}</div>
                          </div>
                        )}
                        {detail.modele3DClient.fichier3D && (
                          <div className="col-md-6 mb-2">
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
                      </div>
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>

            {/* ✅ Informations de livraison étendues */}
            {expandedCommande === commande.id && (
              <div className="mt-3 pt-3 border-top">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">
                      <i className="fas fa-user me-2"></i>
                      Informations de livraison
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
                      Informations de paiement
                    </h6>
                    {commande.paiements && commande.paiements.length > 0 ? (
                      commande.paiements.map((paiement: any, idx: number) => (
                        <div key={idx} className="text-muted small">
                          <div><strong>Montant:</strong> {formatPrice(paiement.montant)} €</div>
                          <div><strong>Méthode:</strong> {paiement.methodePaiement}</div>
                          <div><strong>Date:</strong> {formatDate(paiement.dateCreation)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted small">Aucun paiement enregistré</div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSignalSubmit}
            disabled={!reason.trim()}
          >
            Faire une réclamation
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CommandesClient;