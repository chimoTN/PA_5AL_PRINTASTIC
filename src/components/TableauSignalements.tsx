// src/components/SignalementTable.tsx
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { signalementService } from '../services/signalement.service';

const TableauSignalements = () => {
  const [triAsc, setTriAsc] = useState(true);
  const [colonneTriee, setColonneTriee] = useState<'date' | 'type' | null>(null);
  const [selectionId, setSelectionId] = useState<number | null>(null);
  const [signalements, setSignalements] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const trier = (col: 'date' | 'type') => {
    setColonneTriee(col);
    setTriAsc(prev => (colonneTriee === col ? !prev : true));
  };

  const fetchAll = async () => {
    try {
      const data = await signalementService.getAllSignalements();
      const formate = data.map((s: any) => ({
        id: s.id,
        type: s.type?.toUpperCase() ?? '—',
        date: new Date(s.created_at).toISOString().slice(0, 10),
        produit: s.detailCommande?.produit?.nom ?? '—',
        detailCommandeId: s.detail_commande_id,
        commandeReference: s.detailCommande?.commande?.reference ?? '—',
        utilisateurId: s.utilisateur?.id ?? s.utilisateur_id,
        utilisateurNom: `${s.utilisateur?.prenom ?? ''} ${s.utilisateur?.nom ?? ''}`.trim(),
        resolu: s.resolu ?? false
      }));
      setSignalements(formate);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const suspendreUtilisateur = async (utilisateurId: number) => {
    try {
      await signalementService.suspendreUtilisateur(utilisateurId);
      toast.success("Utilisateur suspendu avec succès");
      fetchAll();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const cloreIncident = async (signalementId: number) => {
    try {
      await signalementService.cloreSignalement(signalementId);
      toast.success('Signalement clos avec succès');
      fetchAll();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const renderTable = (donnees: any[], titre: string) => {
    const donneesTriees = [...donnees].sort((a, b) => {
      if (!colonneTriee) return 0;
      const valA = (a[colonneTriee] || '').toString().toLowerCase();
      const valB = (b[colonneTriee] || '').toString().toLowerCase();
      if (valA < valB) return triAsc ? -1 : 1;
      if (valA > valB) return triAsc ? 1 : -1;
      return 0;
    });

    return (
      <div style={{ marginBottom: '40px' }}>
        <h3>{titre}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f1f1f1' }}>
            <tr>
              <th style={thStyle}>référence</th>
              <th style={thStyle}>
                Type{' '}
                <button onClick={() => trier('type')} style={sortBtnStyle}>
                  {colonneTriee === 'type' ? (triAsc ? '⬆️' : '⬇️') : '⇅'}
                </button>
              </th>
              <th style={thStyle}>
                Date{' '}
                <button onClick={() => trier('date')} style={sortBtnStyle}>
                  {colonneTriee === 'date' ? (triAsc ? '⬆️' : '⬇️') : '⇅'}
                </button>
              </th>
              <th style={thStyle}>Produit</th>
            </tr>
          </thead>
          <tbody>
            {donneesTriees.map(sig => (
              <React.Fragment key={sig.id}>
                <tr
                  style={{ cursor: 'pointer', background: selectionId === sig.id ? '#e6f7ff' : 'transparent' }}
                  onClick={() => setSelectionId(selectionId === sig.id ? null : sig.id)}
                >
                  <td style={tdStyle}>{sig.commandeReference}</td>
                  <td style={tdStyle}>{sig.type}</td>
                  <td style={tdStyle}>{sig.date}</td>
                  <td style={tdStyle}>{sig.produit}</td>
                </tr>
                {selectionId === sig.id && (
                  <tr>
                    <td colSpan={4} style={{ padding: 0 }}>
                      <div style={detailBoxStyle}>
                        <h4>🛠 Gestion du signalement #{sig.commandeReference}</h4>
                        <p><strong>Type :</strong> {sig.type}</p>
                        <p><strong>Date :</strong> {sig.date}</p>
                        <p><strong>Produit :</strong> {sig.produit}</p>
                        <p><strong>Utilisateur :</strong> {sig.utilisateurNom}</p>
                        {!sig.resolu && (
                          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <button onClick={() => suspendreUtilisateur(sig.utilisateurId)} className="btn btn-warning">Suspendre l'utilisateur</button>
                            <button onClick={() => cloreIncident(sig.id)} className="btn btn-success">Clore</button>
                          </div>
                        )}
                        <button
                          onClick={() => setSelectionId(null)}
                          style={{ marginTop: '10px', padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}
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
      </div>
    );
  };

  const signalementsResolu = signalements.filter(s => s.resolu);
  const signalementsNonResolu = signalements.filter(s => !s.resolu);

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
      {renderTable(signalementsNonResolu, 'Signalements non résolus')}
      {renderTable(signalementsResolu, 'Historique signalements résolus')}
    </div>
  );
};

export default TableauSignalements;

const thStyle: React.CSSProperties = { padding: '10px', textAlign: 'center' as const };

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #eee'
};

const sortBtnStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1em'
};

const detailBoxStyle = {
  padding: '20px',
  background: '#fafafa',
  borderTop: '1px solid #ccc',
  border: '1px solid #ccc',
  borderBottomLeftRadius: '20px',
  borderBottomRightRadius: '20px',
  animation: 'fadeIn 0.3s ease-in-out'
};