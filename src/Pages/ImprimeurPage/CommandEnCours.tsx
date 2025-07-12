import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Image, Badge, Button, Form, Modal } from 'react-bootstrap';
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
      setAcceptedOrders(data);
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
      await commandeService.changerStatutDetailCommande(selectedOrder.id, 'expédié', trackingCode);
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
                          src={`http://localhost:3000/${order.produit?.imageUrl}`}
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
                        <Button size="sm" variant="primary" onClick={() => handleManageClick(order)}>
                          Gérer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
                  <Button
                    className="btn-sm"
                    variant="outline-secondary"
                    disabled={isExpedie}
                    href={`http://localhost:3000/${selectedOrder.produit?.fichier3d.cheminFichier}`}
                    download={`modele-${selectedOrder.id}.${selectedOrder.produit?.fichier3d.format}`}
                  >
                    Télécharger le modèle 3D
                  </Button>
                </p>

                <hr />

                <Button
                  variant="success"
                  className="mb-3"
                  onClick={() => setShowForm(!showForm)}
                  disabled={isExpedie}
                >
                  📦 Envoyer la commande
                </Button>

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
                    <Button variant="primary" onClick={envoyerProduit}>
                      Valider l’envoi
                    </Button>
                  </>
                )}

                <hr />

                <Button variant="danger" onClick={abandonnerCommande} disabled={isExpedie}>
                  Abandonner la commande
                </Button>
                
                <Button
                  variant="warning"
                  className="ms-2"
                  onClick={open}
                  disabled={isExpedie}
                >
                  Signalé
                </Button>

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
                      <Button variant="secondary" onClick={close} disabled={submitting}>
                        Annuler
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        {submitting ? 'Envoi...' : 'Envoyer la requête'}
                      </Button>
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
