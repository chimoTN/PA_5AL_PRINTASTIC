import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Badge, Container, Row, Col, Image } from 'react-bootstrap';
import { impressionService } from '../services/impression.service';
import { useAuth } from '../hooks/useAuth';

const DashboardImpressionOld = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('mesCommandesEnCours');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchCommandes();
      fetchAccepted();
    }
  }, [user]);

  const fetchCommandes = async () => {
    try {
      const data = await impressionService.getNonAttribuees();
      setPendingOrders(data);
    } catch (err) {
      console.error('❌ Erreur chargement commandes non attribuées :', err);
    }
  };

  const fetchAccepted = async () => {
    try {
      const data = await impressionService.getCommandesImprimeur(user.id);
      setAcceptedOrders(data);
    } catch (err) {
      console.error('❌ Erreur chargement commandes acceptées :', err);
    }
  };

  const acceptOrder = async (order) => {
    if (!user?.id) {
      console.error("⛔ L'utilisateur n'est pas identifié.");
      return;
    }

    try {
      await impressionService.prendreCommandes([order.id], user.id);
      fetchCommandes();
      fetchAccepted();
    } catch (err) {
      console.error('❌ Erreur lors de la prise de commande :', err);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'en attente': return <Badge bg="secondary">En attente</Badge>;
      case 'en cours': return <Badge bg="warning">À faire</Badge>;
      case 'envoye': return <Badge bg="info">Envoyé</Badge>;
      case 'livre': return <Badge bg="success">Livré</Badge>;
      default: return null;
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  const reachedLimit = acceptedOrders.length >= 1;

  return (
     <div className="dashboard-page">
      <div className="dashboard-container">

        {/* Navigation par onglets */}
        <div className="dashboard-tabs" style={{ marginTop: '50px' }}>
           {/*Les command accepter */}
          <button 
            className={`tab-button ${activeTab === 'mesCommandesEnCours' ? 'active' : ''}`}
            onClick={() => setActiveTab('mesCommandesEnCours')}
          >
            <i className="fas fa-folder"></i>
              Commande en  cours
          </button>

          {/* Les demande */}
          <button 
            className={`tab-button ${activeTab === 'lesDemande' ? 'active' : ''}`}
            onClick={() => setActiveTab('lesDemande')}
          >
            <i className="fas fa-cloud-upload-alt"></i>
              Les demande d'impression
          </button>
         
          {/* Les command passer */}
          <button 
            className={`tab-button ${activeTab === 'monHistorique' ? 'active' : ''}`}
            onClick={() => setActiveTab('monHistorique')}
          >
            <i className="fas fa-folder"></i>
              Mes impressions
          </button>
        </div>

      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h1>Tableau de bord Impression</h1>
            <p>Bienvenue dans votre espace d’impression ! Ici, vous pouvez gérer vos commandes de figurines.</p>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card className="mb-4">
              <Card.Header>📥 Commandes en attente</Card.Header>
              <Card.Body>
                 {/* Commandes en attente */}
                {reachedLimit && (
                  <div className="alert alert-info text-center">
                    Vous avez atteint la limite de 5 figurines à imprimer.<br />
                    Terminez votre travail avant d’en prendre d’autres 💪
                  </div>
                )}

                <div style={reachedLimit ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Produit</th>
                        <th>Référence</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => (
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
                          <td>{parseFloat(order.prixUnitaire).toFixed(2)} €</td>
                          <td>{order.commande?.prenom} {order.commande?.nom}<br />
                            <small>{order.commande?.email}</small>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>{renderStatusBadge(order.statut)}</td>
                          <td>
                            <Button variant="primary" size="sm" onClick={() => acceptOrder(order)}>
                              Accepter
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {pendingOrders.length === 0 && (
                        <tr>
                          <td colSpan={9} className="text-center">
                            Aucune commande en attente.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Commandes acceptées */}
        <Row>
          <Col>
            <Card>
              <Card.Header>✅ Commandes acceptées</Card.Header>
              <Card.Body>
                {acceptedOrders.length === 0 && (
                  <div className="text-center mb-3 text-muted">
                    🦥 Pour l’instant, c’est tranquille… Pas une seule figurine à imprimer. Profite !
                  </div>
                )}

                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Produit</th>
                      <th>Référence</th>
                      <th>Quantité</th>
                      <th>Prix unitaire</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Statut</th>
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
                        <td>{parseFloat(order.prixUnitaire).toFixed(2)} €</td>
                        <td>{order.commande?.prenom} {order.commande?.nom}<br />
                          <small>{order.commande?.email}</small>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{renderStatusBadge(order.statut)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      </div>
    </div>
  );
};

export default DashboardImpressionOld;
