import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Row, Col, Card, Table, Spinner
} from 'react-bootstrap';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import { impressionService } from '../../services/impression.service';
import DateInput from '../../components/DateInput';
import { useAuth } from '../../hooks/useAuth';

const COLORS = ['#4caf50', '#f44336', '#2196f3'];

const CommandRealiser = () => {
  const [acceptedOrders, setAcceptedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataTrend, setDataTrend] = useState<{ date: string; revenus: number }[]>([]);
  const [dataRepartition, setDataRepartition] = useState<any[]>([]);

  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = range;

  const { user } = useAuth();

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fr-FR');
  };

  const fetchAccepted = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await impressionService.getCommandesImprimeur(user.id);
      const delivered = data.filter((d: any) => d.statut === 'livré');
      setAcceptedOrders(delivered);
    } catch (err) {
      console.error('Erreur lors du chargement des commandes :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccepted();
  }, [user]);

  const filteredOrders = useMemo(() => {
    return acceptedOrders.filter(o => {
      const date = new Date(o.createdAt);
      if (isNaN(date.getTime())) return false;
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    });
  }, [acceptedOrders, startDate, endDate]);

  const totalCommandes = filteredOrders.length;

  const averageDelai = useMemo(() => {
    const delais = filteredOrders.map(o => {
      const debut = new Date(o.commande?.createdAt);
      const fin = new Date(o.createdAt);
      return (fin.getTime() - debut.getTime()) / (1000 * 3600 * 24);
    }).filter(n => !isNaN(n));

    if (delais.length === 0) return 0;
    const somme = delais.reduce((acc, d) => acc + d, 0);
    return somme / delais.length;
  }, [filteredOrders]);

  useEffect(() => {
    let printerTotal = 0, companyTotal = 0, feesTotal = 0;

    filteredOrders.forEach(o => {
      const price = parseFloat(o.prixUnitaire || '0');
      const qty = o.quantite ?? 0;
      const total = price * qty;
      printerTotal += total * 0.05;
      companyTotal += total * 0.02;
      feesTotal += total * 0.93;
    });

    setDataRepartition([
      { name: 'Imprimeur (5%)', value: +printerTotal.toFixed(2) },
      { name: 'Entreprise (2%)', value: +companyTotal.toFixed(2) },
      { name: 'Frais Fabrication', value: +feesTotal.toFixed(2) }
    ]);

    const trend = filteredOrders.map(o => ({
      date: new Date(o.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      revenus: parseFloat(o.prixUnitaire || '0') * (o.quantite ?? 0)
    }));

    setDataTrend(trend);
  }, [filteredOrders]);

  return (
    <Container fluid className="py-4">
      <Card className="mb-4 shadow">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>📦 Commandes Réalisées</h4>
          <DateInput startDate={startDate} endDate={endDate} setRange={setRange} />
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <Table responsive bordered hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix Unitaire (€)</th>
                  <th>Part Imprimeur (€)</th>
                  <th>Part Entreprise (€)</th>
                  <th>Frais Fabrication (€)</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length ? filteredOrders.map(o => {
                  const price = parseFloat(o.prixUnitaire || '0');
                  const qty = o.quantite ?? 0;
                  const total = price * qty;
                  return (
                    <tr key={o.id}>
                      <td>{formatDate(o.createdAt)}</td>
                      <td>{o.produit?.nom || '—'}</td>
                      <td>{qty}</td>
                      <td>{price.toFixed(2)}</td>
                      <td>{(total * 0.05).toFixed(2)}</td>
                      <td>{(total * 0.02).toFixed(2)}</td>
                      <td>{(total * 0.93).toFixed(2)}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={7} className="text-center">Aucune commande réalisée sur cette période.</td></tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4 text-center shadow">
        <Card.Header><h5>📊 Statistiques générales</h5></Card.Header>
        <Card.Body>
          <Row>
            <Col><h6 className="text-primary">Commandes livrées</h6><p>{totalCommandes}</p></Col>
            <Col><h6 className="text-warning">Délai moyen</h6><p>{averageDelai.toFixed(1)} jours</p></Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        <Col md={6}>
          <Card className="shadow mb-4">
            <Card.Header><h6>📈 Évolution des revenus</h6></Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dataTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenus" stroke="#007bff" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow mb-4">
            <Card.Header><h6>🧾 Répartition des revenus</h6></Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={dataRepartition} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {dataRepartition.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
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
