import React, { useEffect, useState } from 'react';
import { imprimeurService } from '../../services/imprimeur.service';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../config/env';

interface Demande {
  id: number;
  companyName: string;
  requesterEmail: string;
  phone: string;
  address: string;
  siret: string;
  status: string;
  sampleFile?: string | null;
  requesterName?: string | null;
  createdAt: string;
}

const GestionImprimeurs: React.FC = () => {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { user } = useAuth();

  const fetchDemandes = async () => {
    try {
      const res = await imprimeurService.getAllPrinterRequests();
      setDemandes(res.data);
    } catch (err) {
      console.error('Erreur récupération demandes imprimeur', err);
    }
  };

  const handleApprove = async (id: number) => {
    if (!user) return;
    try {
      // 1. Approbation côté backend
      const res = await imprimeurService.approveRequest(id, user.id);

      console.log("res de tes mort", res)

      // 2. Création du compte Stripe et envoi mail onboarding
      await imprimeurService.createStripeAccount(res.imprimeurId);

      fetchDemandes();
    } catch (err) {
      console.error('Erreur validation demande', err);
    }
  };

  const handleReject = async (id: number) => {
    if (!user) return;
    try {
      await imprimeurService.rejectRequest(id, user.id);
      fetchDemandes();
    } catch (err) {
      console.error('Erreur rejet demande', err);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  return (
    <div className="dashboard-page" style={{ padding: '20px', background: '#f5f8fa' }}>
      <h2>📩 Demandes d'inscription Imprimeur</h2>

      <table style={{ width: '100%', marginTop: '20px', background: '#fff', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
        <thead style={{ background: '#ddd' }}>
          <tr>
            <th style={thStyle}>Entreprise</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Statut</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {demandes
            .filter(d => d.status !== 'rejected') // 🔍 on masque les approuvées
            .map((d) => (

            <React.Fragment key={d.id}>
              <tr
                style={{ cursor: 'pointer', background: selectedId === d.id ? '#e6f7ff' : 'transparent' }}
                onClick={() => setSelectedId(selectedId === d.id ? null : d.id)}
              >
                <td style={tdStyle}>{d.companyName}</td>
                <td style={tdStyle}>{d.requesterEmail}</td>
                <td style={tdStyle}>
                  {d.status === 'pending' ? '🕓 En attente' :
                  d.status === 'approved' ? '✅ Approuvée' : '⛔ Refusée'}
                </td>
                <td style={tdStyle}>
                  {d.status === 'pending' && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); handleApprove(d.id); }} style={btnStyle}>✅ Accepter</button>
                      <button onClick={(e) => { e.stopPropagation(); handleReject(d.id); }} style={btnDanger}>⛔ Refuser</button>
                    </>
                  )}
                </td>
              </tr>

              {selectedId === d.id && (
                <tr>
                  <td colSpan={4} style={{ padding: 0 }}>
                    <div style={{
                      padding: '20px',
                      background: '#fafafa',
                      borderTop: '1px solid #ccc',
                      animation: 'fadeIn 0.3s ease-in-out',
                      border: '1px solid rgb(204, 204, 204)',
                      borderBottomLeftRadius: '20px',
                      borderBottomRightRadius: '20px',
                    }}>
                      <h4>📝 Détails de la demande #{d.id}</h4>
                      <p><strong>Nom du demandeur :</strong> {d.requesterName || 'Inconnu'}</p>
                      <p><strong>Téléphone :</strong> {d.phone}</p>
                      <p><strong>Adresse :</strong> {d.address}</p>
                      <p><strong>SIRET :</strong> {d.siret}</p>
                      <p><strong>Date de soumission :</strong> {new Date(d.createdAt).toLocaleDateString()}</p>
                      {d.sampleFile && (
                        <p>
                          <strong>Fichier échantillon :</strong>{' '}
                          <a href={`${API_BASE_URL}/${d.sampleFile}`} target="_blank" rel="noopener noreferrer">
                            📎 Voir le fichier
                          </a>
                        </p>
                      )}
                      <button onClick={() => setSelectedId(null)} style={{ ...btnDanger, marginTop: '10px' }}>
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




      {/* Les demande refusé */}
      <h2>📩 Demandes d'inscription rejetée</h2>

      <table style={{ width: '100%', marginTop: '20px', background: '#fff', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
        <thead style={{ background: '#ddd' }}>
          <tr>
            <th style={thStyle}>Entreprise</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Statut</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {demandes
            .filter(d => d.status === 'rejected')
            .map((d) => (

            <React.Fragment key={d.id}>
              <tr
                style={{ cursor: 'pointer', background: selectedId === d.id ? '#e6f7ff' : 'transparent' }}
                onClick={() => setSelectedId(selectedId === d.id ? null : d.id)}
              >
                <td style={tdStyle}>{d.companyName}</td>
                <td style={tdStyle}>{d.requesterEmail}</td>
                <td style={tdStyle}>
                  {d.status === 'pending' ? '🕓 En attente' :
                  d.status === 'approved' ? '✅ Approuvée' : '⛔ Refusée'}
                </td>
                <td style={tdStyle}>
                  {d.status === 'pending' && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); handleApprove(d.id); }} style={btnStyle}>✅ Accepter</button>
                      <button onClick={(e) => { e.stopPropagation(); handleReject(d.id); }} style={btnDanger}>⛔ Refuser</button>
                    </>
                  )}
                </td>
              </tr>

              {selectedId === d.id && (
                <tr>
                  <td colSpan={4} style={{ padding: 0 }}>
                    <div style={{
                      padding: '20px',
                      background: '#fafafa',
                      borderTop: '1px solid #ccc',
                      animation: 'fadeIn 0.3s ease-in-out',
                      border: '1px solid rgb(204, 204, 204)',
                      borderBottomLeftRadius: '20px',
                      borderBottomRightRadius: '20px',
                    }}>
                      <h4>📝 Détails de la demande #{d.id}</h4>
                      <p><strong>Nom du demandeur :</strong> {d.requesterName || 'Inconnu'}</p>
                      <p><strong>Téléphone :</strong> {d.phone}</p>
                      <p><strong>Adresse :</strong> {d.address}</p>
                      <p><strong>SIRET :</strong> {d.siret}</p>
                      <p><strong>Date de soumission :</strong> {new Date(d.createdAt).toLocaleDateString()}</p>
                      {d.sampleFile && (
                        <p>
                          <strong>Fichier échantillon :</strong>{' '}
                          <a href={`${API_BASE_URL}/${d.sampleFile}`} target="_blank" rel="noopener noreferrer">
                            📎 Voir le fichier
                          </a>
                        </p>
                      )}
                      <button onClick={() => setSelectedId(null)} style={{ ...btnDanger, marginTop: '10px' }}>
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

    </div>
  );
};

export default GestionImprimeurs;

// --- STYLES ---
const thStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '1px solid #ccc'
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee'
};

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginRight: '6px'
};

const btnDanger: React.CSSProperties = {
  ...btnStyle,
  background: '#dc3545'
};
