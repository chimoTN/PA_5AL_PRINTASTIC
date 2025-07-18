import React, { useEffect, useState } from 'react';
import { Badge } from 'react-bootstrap';
import { commandeService } from '../../Services/commande.service';

interface ProduitCommande {
  id: number;
  nom: string;
  quantite: number;
  prixUnitaire: string;
  statut: string;
  reference: string;
}

interface Commande {
  id: number;
  reference: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  prixTotal: string;
  statut: string;
  date: string;
  detailCommandes: ProduitCommande[];
}

const GestionCommandesEnCours: React.FC = () => {
  const [triAsc, setTriAsc] = useState(true);
  const [colonneTriee, setColonneTriee] = useState<'statut' | null>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionId, setSelectionId] = useState<number | null>(null);
  const [recherche, setRecherche] = useState('');

  const fetchData = async () => {
    try {
      const res = await commandeService.commandeGetAll();
      const data = res.commandes.map((cmd: any) => ({
        id: cmd.id,
        reference: cmd.reference,
        prenom: cmd.prenom,
        nom: cmd.nom,
        email: cmd.email,
        telephone: cmd.telephone,
        adresse: cmd.adresse,
        prixTotal: cmd.prixTotal,
        statut: cmd.statut,
        date: new Date(cmd.createdAt).toISOString().slice(0, 10),
        detailCommandes: cmd.detailCommandes.map((d: any) => ({
          id: d.id,
          reference: d.reference,
          quantite: d.quantite,
          prixUnitaire: d.prixUnitaire,
          statut: d.statut,
          nom: d.produit?.nom || 'Produit inconnu'
        }))
      }));
      setCommandes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes :', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderBadge = (statut: Commande['statut']) => {
    switch (statut) {
      case 'en attente': return <Badge bg="secondary">En attente</Badge>;
      case 'en cours': return <Badge bg="warning">En cours</Badge>;
      case 'expédié': return <Badge bg="primary">Expédié</Badge>;
      case 'livré': return <Badge bg="success">Livré</Badge>;
      default: return <Badge bg="light">{statut}</Badge>;
    }
  };

  const trier = (col: 'statut') => {
    setColonneTriee(col);
    setTriAsc(prev => (colonneTriee === col ? !prev : true));
  };

  const commandesFiltrées = commandes.filter(cmd =>
    cmd.reference.toLowerCase().includes(recherche.toLowerCase()) ||
    cmd.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    cmd.prenom.toLowerCase().includes(recherche.toLowerCase()) ||
    cmd.email.toLowerCase().includes(recherche.toLowerCase())
  );

  const commandesTriees = [...commandesFiltrées].sort((a, b) => {
    if (!colonneTriee) return 0;
    const valA = a[colonneTriee];
    const valB = b[colonneTriee];
    if (valA < valB) return triAsc ? -1 : 1;
    if (valA > valB) return triAsc ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
      <h3>📦 Commandes en cours</h3>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f1f1f1' }}>
            <tr>
              <th style={thStyle}>Référence <input
                  type="text"
                  placeholder="🔍 Rechercher par référence, nom ou email"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  style={{
                    marginBottom: '10px',
                    padding: '8px',
                    width: '100%',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </th>
              <th style={thStyle}>Client</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Statut
                <button onClick={() => trier('statut')} style={sortBtnStyle}>
                  {colonneTriee === 'statut' ? (triAsc ? '⬆️' : '⬇️') : '⇅'}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {commandesTriees.map(cmd => (
              <React.Fragment key={cmd.id}>
                <tr
                  style={{ cursor: 'pointer', background: selectionId === cmd.id ? '#e6f7ff' : 'transparent' }}
                  onClick={() => setSelectionId(selectionId === cmd.id ? null : cmd.id)}
                >
                  <td style={tdStyle}>{cmd.reference}</td>
                  <td style={tdStyle}>{cmd.prenom} {cmd.nom}</td>
                  <td style={tdStyle}>{cmd.date}</td>
                  <td style={tdStyle}>{renderBadge(cmd.statut)}</td>
                </tr>
                {selectionId === cmd.id && (
                  <tr>
                    <td colSpan={4} style={{ padding: 0 }}>
                      <div style={detailBox}>
                        <h4>Détail de la commande #{cmd.reference}</h4>
                        <p><strong>Client :</strong> {cmd.prenom} {cmd.nom}</p>
                        <p><strong>Email :</strong> {cmd.email}</p>
                        <p><strong>Téléphone :</strong> {cmd.telephone}</p>
                        <p><strong>Adresse :</strong> {cmd.adresse}</p>
                        <p><strong>Prix Total :</strong> {cmd.prixTotal} €</p>
                        <p><strong>Statut :</strong> {renderBadge(cmd.statut)}</p>

                        <h5>Produits :</h5>
                        <ul>
                          {cmd.detailCommandes.map(p => (
                            <li key={p.id}>
                              {p.nom} — {p.quantite} × {p.prixUnitaire} € ({p.statut})
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => setSelectionId(null)}
                          style={{ marginTop: '10px', padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}
                        >
                          Fermer
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GestionCommandesEnCours;

// Styles
const thStyle: React.CSSProperties = {
  padding: '10px',
  textAlign: 'left'
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee'
};

const sortBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1em'
};

const detailBox: React.CSSProperties = {
  padding: '20px',
  background: '#fafafa',
  border: '1px solid #ccc',
  borderBottomLeftRadius: '20px',
  borderBottomRightRadius: '20px'
};
