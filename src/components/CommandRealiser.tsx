import React, { useState } from 'react';
import {
  Container, Row, Col, Card, Table, Form
} from 'react-bootstrap';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,CartesianGrid
} from 'recharts';

// Mock données commandes
const mockCommandes = [
  {
    id: 1,
    date: '2025-07-01',
    produit: 'Figurine Dragon',
    quantite: 2,
    prixUnitaire: 25,
    coutMatiere: 5
  },
  {
    id: 2,
    date: '2025-06-25',
    produit: 'Robot Guerrier',
    quantite: 1,
    prixUnitaire: 40,
    coutMatiere: 10
  },
];

// Données graphiques mockées
const dataMois = [
  { mois: 'Jan', revenus: 300 },
  { mois: 'Fév', revenus: 500 },
  { mois: 'Mars', revenus: 700 },
  { mois: 'Avr', revenus: 200 },
  { mois: 'Mai', revenus: 400 },
  { mois: 'Juin', revenus: 650 },
  { mois: 'Juil', revenus: 900 }
];

const dataRepartition = [
  { name: 'Bénéfices', value: 1800 },
  { name: 'Coûts MP', value: 450 },
];

const COLORS = ['#4caf50', '#f44336'];

const CommandRealiser = () => {
  const [dateFiltre, setDateFiltre] = useState('');

  const commandesFiltrées = mockCommandes.filter(cmd =>
    dateFiltre ? cmd.date === dateFiltre : true
  );

  const totalBénéfices = commandesFiltrées.reduce((acc, cmd) => acc + ((cmd.prixUnitaire - cmd.coutMatiere) * cmd.quantite), 0);
  const totalCout = commandesFiltrées.reduce((acc, cmd) => acc + (cmd.coutMatiere * cmd.quantite), 0);
  const totalRevenu = commandesFiltrées.reduce((acc, cmd) => acc + (cmd.prixUnitaire * cmd.quantite), 0);

  return (
    <Container fluid className="py-4">
      {/* Commandes passées */}
      <Card className="mb-4 shadow">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>📦 Historique des commandes</h4>
          <Form.Control
            type="date"
            value={dateFiltre}
            onChange={(e) => setDateFiltre(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
        </Card.Header>
        <Card.Body>
          <Table responsive bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix Unitaire (€)</th>
                <th>Coût MP (€)</th>
                <th>Revenu (€)</th>
                <th>Bénéfice (€)</th>
              </tr>
            </thead>
            <tbody>
              {commandesFiltrées.map((cmd) => (
                <tr key={cmd.id}>
                  <td>{cmd.date}</td>
                  <td>{cmd.produit}</td>
                  <td>{cmd.quantite}</td>
                  <td>{cmd.prixUnitaire}</td>
                  <td>{cmd.coutMatiere}</td>
                  <td>{(cmd.prixUnitaire * cmd.quantite).toFixed(2)}</td>
                  <td>{((cmd.prixUnitaire - cmd.coutMatiere) * cmd.quantite).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Résumé financier */}
      <Card className="mb-4 text-center shadow">
        <Card.Header><h5>💰 Résumé financier</h5></Card.Header>
        <Card.Body>
          <Row>
            <Col><h6 className="text-success">Bénéfices</h6><p>{totalBénéfices.toFixed(2)} €</p></Col>
            <Col><h6 className="text-danger">Coûts MP</h6><p>{totalCout.toFixed(2)} €</p></Col>
            <Col><h6 className="fw-bold">Revenus totaux</h6><p>{totalRevenu.toFixed(2)} €</p></Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Graphiques */}
      <Row>
        <Col md={6}>
          <Card className="shadow">
            <Card.Header><h6>📊 Revenus mensuels</h6></Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataMois}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenus" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow">
            <Card.Header><h6>🧾 Répartition revenus / coûts</h6></Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataRepartition}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                    dataKey="value"
                  >
                    {dataRepartition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CommandRealiser;
