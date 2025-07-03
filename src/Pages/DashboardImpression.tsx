import React, { useState } from 'react';
import { Table, Button, Card, Badge, Container, Row, Col } from 'react-bootstrap';

interface Order {
  id: number;
  productName: string;
  quantity: number;
  customerName: string;
  status: 'pending' | 'a_faire' | 'envoye' | 'livre';
}

const initialPendingOrders: Order[] = [
  { id: 1, productName: 'Figurine Dragon', quantity: 2, customerName: 'Alice Dupont', status: 'pending' },
  { id: 2, productName: 'Figurine Chat', quantity: 1, customerName: 'Bob Martin', status: 'pending' },
  { id: 3, productName: 'Figurine Licorne', quantity: 3, customerName: 'Claire Durand', status: 'pending' },
];

const DashboardImpression: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>(initialPendingOrders);
  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);

  const acceptOrder = (order: Order) => {
    // Move order from pending to accepted (status: a_faire)
    setPendingOrders(pendingOrders.filter(o => o.id !== order.id));
    setAcceptedOrders([...acceptedOrders, { ...order, status: 'a_faire' }]);
  };

  const advanceStatus = (orderId: number) => {
    setAcceptedOrders(
      acceptedOrders.map(order => {
        if (order.id === orderId) {
          let nextStatus: Order['status'] = order.status;
          if (order.status === 'a_faire') nextStatus = 'envoye';
          else if (order.status === 'envoye') nextStatus = 'livre';
          return { ...order, status: nextStatus };
        }
        return order;
      })
    );
  };

  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Badge bg="secondary">En attente</Badge>;
      case 'a_faire': return <Badge bg="warning">À faire</Badge>;
      case 'envoye': return <Badge bg="info">Envoyé</Badge>;
      case 'livre': return <Badge bg="success">Livré</Badge>;
      default: return null;
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Header>Commandes en attente</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Client</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.productName}</td>
                      <td>{order.quantity}</td>
                      <td>{order.customerName}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => acceptOrder(order)}
                        >
                          Accepter
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {pendingOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Aucune commande en attente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>Commandes acceptées</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Client</th>
                    <th>Statut</th>
                    <th>Avancer</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.productName}</td>
                      <td>{order.quantity}</td>
                      <td>{order.customerName}</td>
                      <td>{renderStatusBadge(order.status)}</td>
                      <td>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => advanceStatus(order.id)}
                          disabled={order.status === 'livre'}
                        >
                          Suivant
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {acceptedOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center">
                        Aucune commande acceptée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardImpression;
