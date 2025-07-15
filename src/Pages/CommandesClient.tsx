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
} from 'react-bootstrap';
import { toast } from 'sonner';
import { commandeService } from '../services/commande.service';
import reclamationService from '../Services/reclamation.service ';
import { useAuth } from '../hooks/useAuth';
import FacturePDFGenerator from '../utilis/pdf/FacturePDFGenerator';

const statutColors: Record<string, string> = {
  'en attente': 'warning',
  'en cours': 'info',
  expédié: 'primary',
  livré: 'secondary',
  arrivée: 'success',
  annulé: 'danger',
};

const CommandesClient = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pour le modal de réclamation
  const [showModal, setShowModal] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [selectedLibelle, setSelectedLibelle] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    commandeService
      .getMesCommandes(user.id)
      .then((data) => setCommandes(data))
      .catch((err) => console.error('Erreur récupération commandes :', err))
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
      <Container className="text-center mt-5">
        <h1 className="fw-bold display-3 mb-4">
          Vous n'avez pas encore passé de commande !
        </h1>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3468/3468823.png"
          alt="Colis"
          style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4 fw-bold">Mes Commandes</h2>

      {commandes.map((commande) => (
        <Card
          key={commande.id}
          className="mb-4 shadow-sm"
          style={{ backgroundColor: '#f9f9f9' }}
        >
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Commande #{commande.reference}</strong> — {commande.prixTotal} €
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
                    {detail.produit?.nom || 'Produit inconnu'} — {detail.quantite} ×{' '}
                    {parseFloat(detail.prixUnitaire).toFixed(2)} €
                  </div>
                  <div className="mt-2 mt-md-0 text-md-end">
                    <Badge
                      bg={statutColors[detail.statut] || 'secondary'}
                      className="me-3 fw-bold text-uppercase"
                    >
                      {detail.statut}
                    </Badge>

                    {detail.statut === 'en attente' && (
                      <Button
                        size="sm"
                        variant="danger"
                        className="me-2"
                        onClick={() => annulerProduit(detail.id)}
                      >
                        Annuler
                      </Button>
                    )}
                    {detail.statut === 'livré' && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => openSignalModal(detail.id)}
                      >
                        Signaler un problème
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="text-end mt-3">
              
              <FacturePDFGenerator commande={commande} />

              <Button variant="dark" size="sm">
                Détails de la commande
              </Button>
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
