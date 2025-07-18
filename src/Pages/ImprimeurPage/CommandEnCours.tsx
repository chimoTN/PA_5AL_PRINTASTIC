import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Image, Badge, Form, Modal } from 'react-bootstrap';
import { impressionService } from '../../services/impression.service';
import { commandeService } from '../../services/commande.service';
import { useAuth } from '../../hooks/useAuth';
import { signalementService } from '../../services/signalement.service';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { TypeSignalement } from '../../types/Signalement';

const CommandEnCours = () => {
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [signalType, setSignalType] = useState<TypeSignalement>(TypeSignalement.FICHIER_ENDOMMAGE);
  const [submitting, setSubmitting] = useState(false);

 const API_BACK = import.meta.env.API_BACK_SANS;

  const open = () => {
    console.log("🚨 OPEN MODAL TRIGGERED");
    setShowModal(true);
  };

  const close = () => setShowModal(false);


  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchAccepted();
    }
  }, []);

  const fetchAccepted = async () => {
    try {
      const data = await impressionService.getCommandesImprimeur(user.id);

      // Ici data est Array<DetailCommande>, on ne garde que ceux non livrés
      const nonLivrees = data.filter((detail: any) => detail.statut !== 'livré');

      console.log('Commandes acceptées (non livrées) :', nonLivrees);
      setAcceptedOrders(nonLivrees);
    } catch (err) {
      console.error('❌ Erreur chargement commandes acceptées :', err);
    }
  };




  const renderStatusBadge = (status) => {
    switch (status) {
      case 'en attente': return <Badge bg="secondary">En attente</Badge>;
      case 'en cours': return <Badge bg="warning">En cours</Badge>;
      case 'expédié': return <Badge bg="primary">Expédié</Badge>;
      case 'livré': return <Badge bg="info">Livré</Badge>;
      case 'arrivée': return <Badge bg="success">Arrivée</Badge>;
      case 'annulé': return <Badge bg="dark">Annulé</Badge>;
      default: return null;
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  const handleManageClick = (order) => {
    setSelectedOrder(order);
    setTrackingCode(order.codeSuivi || '');
    setShowForm(false);
  };

  /* on abandonne la commande */

  const abandonnerCommande = async () => {
    try {
      await commandeService.changerStatutDetailCommande(selectedOrder.id, 'en attente');
      await fetchAccepted();
      setSelectedOrder(null);
    } catch (err) {
      console.error('Erreur annulation :', err);
    }
  };

  /* on envoie la commande */
  const envoyerProduit = async () => {
    try {
      await commandeService.changerStatutDetailCommande(selectedOrder.id, 'expédié');
      await fetchAccepted();
      setSelectedOrder(null);
    } catch (err) {
      console.error('Erreur envoi :', err);
    }
  };


  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await signalementService.signalerDetailCommande(
        selectedOrder.id,
        signalType,
        user.id
      );
      toast.success('Signalement effectué avec succès !', {
        description: 'Nous avons bien reçu votre signalement.',
        duration: 5000
      });

      fetchAccepted();      // recharger la liste
      setSelectedOrder(null);
      close();
    } catch {
      toast.error('Erreur lors du signalement', {
        description: 'Une erreur est survenue lors du signalement. Veuillez réessayer plus tard ou nous contacter.',
        duration: 5000
      });
    } finally {
      setSubmitting(false);
    }
  };


  const isExpedie = selectedOrder?.statut === 'expédié' || selectedOrder?.statut === 'livré';

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <div className="profile-header">
          <div className="profile-title">
            <h1>Tableau de bord Impression</h1>
            <p className="profile-subtitle">Bienvenue dans votre espace d’impression !</p>
          </div>
        </div>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>✅ Commandes acceptées</Card.Header>
            <Card.Body>
              {acceptedOrders.length === 0 && (
                <div className="text-center text-muted">
                  🦥 Pour l’instant, aucune commande. Profitez-en !
                </div>
              )}

              {acceptedOrders.length > 0 && (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Produit</th>
                    <th>Référence</th>
                    <th>Quantité</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Image
                          src={`${API_BACK}/${order.produit?.imageUrl}`}
                          alt="visuel"
                          thumbnail
                          style={{ width: '60px' }}
                        />
                      </td>
                      <td>{order.produit?.nom}</td>
                      <td>{order.reference}</td>
                      <td>{order.quantite}</td>
                      <td>{order.commande?.prenom} {order.commande?.nom}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{renderStatusBadge(order.statut)}</td>
                      <td>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => handleManageClick(order)}>
                          Gérer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {selectedOrder && (
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header>🔧 Gérer la commande #{selectedOrder.id}</Card.Header>
              <Card.Body>
                <p><strong>Statut actuel :</strong> {renderStatusBadge(selectedOrder.statut)}</p>

                <hr />

                <p>
                  <strong>Téléchargement :</strong>{' '}
                  <a
                    className="btn btn-sm btn-outline-secondary"
                    href={`${API_BACK}/${selectedOrder.produit?.fichier3d.cheminFichier}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: '10px' }}
                  >
                    Télécharger le modèle 3D
                  </a>
                </p>

                <hr />

                <button
                  type="button"
                  className="btn btn-success mb-3"
                  onClick={() => setShowForm(!showForm)}
                  disabled={isExpedie}
                >
                  📦 Envoyer la commande
                </button>

                {showForm && !isExpedie && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Numéro de suivi</Form.Label>
                      <Form.Control
                        type="text"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        placeholder="Ex: XX12345678FR"
                      />
                    </Form.Group>
                    <button type="button" className="btn btn-primary" onClick={envoyerProduit}>
                      Valider l’envoi
                    </button>
                  </>
                )}

                <hr />

                <button type="button" className="btn btn-danger" onClick={abandonnerCommande} disabled={isExpedie}>
                  Abandonner la commande
                </button>
                
                <button
                  type="button"
                  className="btn btn-warning ms-2"
                  onClick={open}
                  disabled={isExpedie}
                >
                  Signalé
                </button>

                <Modal show={showModal} onHide={close} centered>
                    <Modal.Header closeButton>
                      <Modal.Title>Signaler un produit</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form>
                        <Form.Group>
                          <Form.Label>Quel est le souci ?</Form.Label>
                          <Form.Check
                            type="radio"
                            name="signalementType"
                            id="sig-file"
                            label="Fichier endommagé"
                            value={TypeSignalement.FICHIER_ENDOMMAGE}
                            checked={signalType === TypeSignalement.FICHIER_ENDOMMAGE}
                            onChange={() =>
                              setSignalType(TypeSignalement.FICHIER_ENDOMMAGE)
                            }
                          />
                          <Form.Check
                            type="radio"
                            name="signalementType"
                            id="sig-illegale"
                            label="Contenu illégal"
                            value={TypeSignalement.ILLEGALE}
                            checked={signalType === TypeSignalement.ILLEGALE}
                            onChange={() =>
                              setSignalType(TypeSignalement.ILLEGALE)
                            }
                          />
                          <Form.Check
                            type="radio"
                            name="signalementType"
                            id="sig-problematique"
                            label="Problématique"
                            value={TypeSignalement.PROBLEMATIQUE}
                            checked={signalType === TypeSignalement.PROBLEMATIQUE}
                            onChange={() =>
                              setSignalType(TypeSignalement.PROBLEMATIQUE)
                            }
                          />
                        </Form.Group>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <button type="button" className="btn btn-secondary" onClick={close} disabled={submitting}>
                        Annuler
                      </button>
                      <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Envoi...' : 'Envoyer la requête'}
                      </button>
                    </Modal.Footer>
                </Modal>

                
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CommandEnCours;
