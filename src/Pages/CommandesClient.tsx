import React, { useState, useEffect } from 'react';
import { Badge, Button, Card, Container, ListGroup } from 'react-bootstrap';
import { commandeService } from '../services/commande.service';
import { useAuth } from '../hooks/useAuth';

const statutColors: Record<string, string> = {
  'en attente': 'warning',
  'en cours': 'info',
  'expédié': 'primary',
  'livré': 'secondary',
  'arrivée': 'success',
  'annulé': 'danger'
};

const CommandesClient = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {

    if (!user?.id) return;

    commandeService.getMesCommandes(user.id)
      .then((data) => {
        setCommandes(data);
      })
      .catch((err) => {
        console.error('Erreur récupération commandes :', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const annulerProduit = (idDetailCommande: number) => {
    commandeService.changerStatutDetailCommande(idDetailCommande, 'annulé')
      .then(() => {
        setCommandes(prev =>
          prev.map(c => ({
            ...c,
            detailCommandes: c.detailCommandes.map((d: any) =>
              d.id === idDetailCommande ? { ...d, statut: 'annulé' } : d
            )
          }))
        );
      })
      .catch(err => console.error('Erreur annulation :', err));
  };

  const signalerProduit = (index: number) => {
    alert(`Produit #${index + 1} signalé ! (fonction à implémenter)`);
  };

  if (loading) return <p>Chargement des commandes...</p>;
  if (!commandes.length) return <p>Aucune commande trouvée.</p>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4 fw-bold">Mes Commandes</h2>

      {commandes.map((commande) => (
        <Card key={commande.id} className="mb-4 shadow-sm" style={{ backgroundColor: '#f9f9f9' }}>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Commande #{commande.reference}</strong> — {commande.prixTotal} €
            </div>
          </Card.Header>

          <Card.Body>
            <ListGroup>
              {(commande.detailCommandes || []).map((detail: any, index: number) => (
                <ListGroup.Item key={detail.id} className="d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3">
                  <div className="fw-semibold text-dark">
                    {detail.produit?.nom || 'Produit inconnu'} — {detail.quantite} x {parseFloat(detail.prixUnitaire).toFixed(2)} €
                  </div>
                  <div className="mt-2 mt-md-0 text-md-end">
                    <Badge bg={statutColors[detail.statut] || 'secondary'} className="me-3 fw-bold text-uppercase">
                      {detail.statut}
                    </Badge>
                    {detail.statut === 'en attente' && (
                      <Button size="sm" variant="danger" className="me-2" onClick={() => annulerProduit(detail.id)}>
                        Annuler
                      </Button>
                    )}
                    {detail.statut === 'arrivée' && (
                      <Button size="sm" variant="warning" onClick={() => signalerProduit(index)}>
                        Signaler un problème
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="text-end mt-3">
              <Button variant="dark" size="sm">
                Détails de la commande
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default CommandesClient;
