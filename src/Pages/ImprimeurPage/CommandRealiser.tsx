import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Table, Form
} from 'react-bootstrap';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,CartesianGrid, LineChart, Line
} from 'recharts';

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Spinner } from 'react-bootstrap';
import { InputGroup, FormControl } from 'react-bootstrap';
import DateInput from '../../components/DateInput';
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

const dataRepartition = [
  { name: 'Bénéfices', value: 1800 },
  { name: 'Coûts MP', value: 450 },
];

const COLORS = ['#4caf50', '#f44336'];

const CommandRealiser = () => {
  const [periode, setPeriode] = useState<'Ce mois' | '3 mois' | '6 mois' | '1 an' | 'Cette année'>('Ce mois');
  const [data, setData] = useState<{ date: string; revenus: number }[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Simule un appel API avec delay
  const fetchDonneesParPeriode = async (periode: string) => {
    setLoading(true);

    // Simule un délai réseau
    await new Promise((res) => setTimeout(res, 500));

    // Exemple d’un backend qui renverrait un tableau brut (pouvant changer de structure)
    const responseMock = {
      data: [
        { label: '01/07', valeur: 120 },
        { label: '05/07', valeur: 200 },
        { label: '10/07', valeur: 150 },
        { label: '15/07', valeur: 300 },
        { label: '20/07', valeur: 250 },
        { label: '25/07', valeur: 320 },
      ],
    };

    // Parser pour s'assurer du format compatible avec Recharts
    const parsed = responseMock.data.map((entry) => ({
      date: entry.label,
      revenus: entry.valeur,
    }));

    setData(parsed);
    setLoading(false);
  };

  useEffect(() => {
    fetchDonneesParPeriode(periode);
  }, [periode]);

  const [dateFiltre, setDateFiltre] = useState('');

  const commandesFiltrées = mockCommandes.filter(cmd =>
    dateFiltre ? cmd.date === dateFiltre : true
  );

  const totalBénéfices = commandesFiltrées.reduce((acc, cmd) => acc + ((cmd.prixUnitaire - cmd.coutMatiere) * cmd.quantite), 0);
  const totalCout = commandesFiltrées.reduce((acc, cmd) => acc + (cmd.coutMatiere * cmd.quantite), 0);
  const totalRevenu = commandesFiltrées.reduce((acc, cmd) => acc + (cmd.prixUnitaire * cmd.quantite), 0);

  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = range;

  return (
    <Container fluid className="py-4">
      {/* Commandes passées */}
      <Card className="mb-4 shadow">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>📦 Historique des commandes</h4>

          <DateInput dateFiltre={dateFiltre} setDateFiltre={setDateFiltre} />

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
              <Card.Header>
                <h6>📈 Revenus ({periode.toLowerCase()})</h6>
              </Card.Header>
              <Card.Body>
                <Form.Select
                  className="mb-3"
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value as typeof periode)}
                >
                  <option>Ce mois</option>
                  <option>3 mois</option>
                  <option>6 mois</option>
                  <option>1 an</option>
                  <option>Cette année</option>
                </Form.Select>

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenus" stroke="#007bff" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Card.Body>
            </Card>
          </Col>

        <Col md={6}>
          <Card className="shadow">
            <Card.Header><h6>🧾 Répartition revenus / coûts</h6></Card.Header>
            <Card.Body>
              <Form.Select
                  className="mb-3"
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value as typeof periode)}
                >
                  <option>Ce mois</option>
                  <option>3 mois</option>
                  <option>6 mois</option>
                  <option>1 an</option>
                  <option>Cette année</option>
                </Form.Select>

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
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
                )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CommandRealiser;
