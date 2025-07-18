import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  Button,
  Card,
  Badge,
  Container,
  Row,
  Col,
  Image,
  Form
} from 'react-bootstrap';
import { impressionService } from '../../services/impression.service';
import { useAuth } from '../../hooks/useAuth';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const statutColors: Record<string, string> = {
  'en attente': 'secondary',
  'en cours': 'warning',
  'envoyé': 'info',
  'livré': 'success',
};

type SortOption = 'plus_recentes' | 'plus_proches' | 'plus_cheres';

const CommandeEnAttente = () => {
  const { user } = useAuth();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('plus_recentes');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
 
 const API_BACK = import.meta.env.API_BACK_SANS;

  useEffect(() => {
    if (user?.id) {
      fetchCommandes();
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

  const acceptOrder = async (order) => {
    if (!user?.id) return;
    try {
      await impressionService.prendreCommandes([order.id], user.id);
      fetchCommandes();
    } catch (err) {
      console.error('❌ Erreur lors de la prise de commande :', err);
    }
  };

  const renderStatusBadge = (status: string) => (
    <Badge bg={statutColors[status] || 'dark'}>{status}</Badge>
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const extractCity = (adresse: string = '') => {
    const parts = adresse.split(',');
    return parts.length > 1 ? parts[1].trim() : adresse;
  };

  // Combine recherche + tri + direction
  const displayedOrders = useMemo(() => {
    let arr = pendingOrders
      // recherche par produit
      .filter(o =>
        o.produit?.nom.toLowerCase().includes(search.toLowerCase())
      );

    // tri
    arr = arr.sort((a, b) => {
      let cmp = 0;
      switch (sortOption) {
        case 'plus_recentes':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'plus_proches':
          cmp = extractCity(a.commande?.adresse)
            .localeCompare(extractCity(b.commande?.adresse));
          break;
        case 'plus_cheres':
          cmp = parseFloat(a.prixUnitaire) - parseFloat(b.prixUnitaire);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return arr;
  }, [pendingOrders, search, sortOption, sortDirection]);

  // Permute la direction sur click entête
  const toggleDirection = () =>
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));

  return (
    <Container fluid className="py-4">
      <Row className="mb-3 align-items-center">
        <Col md={4}>
          <h1>Tableau de bord Impression</h1>
        </Col>
        <Col md={4}>
          <Form.Control
            placeholder="Rechercher par produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col md={4} className="text-end">
          <Form.Select
            style={{ width: 'auto', display: 'inline-block' }}
            value={sortOption}
            onChange={e => setSortOption(e.target.value as SortOption)}
          >
            <option value="plus_recentes">Plus récentes</option>
            <option value="plus_proches">Plus proches</option>
            <option value="plus_cheres">Plus chères</option>
          </Form.Select>
        </Col>
      </Row>

      <Card>
        <Card.Header>📥 Commandes en attente</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Image</th>
                <th>Produit</th>
                <th>
                  Référence
                  <FaSort style={{ cursor: 'pointer' }} onClick={toggleDirection} />
                </th>
                <th>Quantité</th>
                <th>
                  Prix unitaire
                  <FaSort style={{ cursor: 'pointer' }} onClick={toggleDirection} />
                </th>
                <th>Client</th>
                <th>
                  Date création
                  <FaSort style={{ cursor: 'pointer' }} onClick={toggleDirection} />
                </th>
                <th>
                  Ville livraison
                  <FaSort style={{ cursor: 'pointer' }} onClick={toggleDirection} />
                </th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.length > 0 ? (
                displayedOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <Image
                        src={`${API_BACK}/${order.produit?.imageUrl}`}
                        alt={order.produit?.nom}
                        thumbnail
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td>{order.produit?.nom}</td>
                    <td>{order.reference}</td>
                    <td>{order.quantite}</td>
                    <td>{parseFloat(order.prixUnitaire).toFixed(2)} €</td>
                    <td>
                      {order.commande?.prenom} {order.commande?.nom}
                      <br />
                      <small>{order.commande?.email}</small>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{extractCity(order.commande?.adresse)}</td>
                    <td>{renderStatusBadge(order.statut)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => acceptOrder(order)}
                      >
                        Accepter
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center">
                    Aucune commande en attente.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CommandeEnAttente;
