import React, { useEffect, useState } from 'react';
import reclamationService from '../services/reclamation.service';

interface Ligne {
  id: number;
  codeReclamation: string;
  reference: string;
  imprimeurId: number | null;
  date: string;
  produit: string;
  quantite: number;
  prixUnitaire: string;
  statut: string;
  description: string;
  imagePath?: string | null;
}

const TableauReclamation: React.FC = () => {
  const [triAsc, setTriAsc] = useState(true);
  const [colonneTriee, setColonneTriee] = useState<'date' | 'type' | null>(null);
  const [selectionId, setSelectionId] = useState<number | null>(null);
  const [reclamations, setReclamations] = useState<Ligne[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trier = (col: 'date' | 'type') => {
    setColonneTriee(col);
    setTriAsc(prev => (colonneTriee === col ? !prev : true));
  };

  const donneesTriees = [...reclamations].sort((a, b) => {
    if (!colonneTriee) return 0;
    const valA = (a[colonneTriee] as unknown as string).toLowerCase();
    const valB = (b[colonneTriee] as unknown as string).toLowerCase();
    if (valA < valB) return triAsc ? -1 : 1;
    if (valA > valB) return triAsc ? 1 : -1;
    return 0;
  });

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const recResp = await reclamationService.getAllReclamations();
      const recData = Array.isArray(recResp) ? recResp : recResp.data ?? [];

      const recFormate: Ligne[] = recData.map((r: any) => ({
        id: r.id,
        codeReclamation: r.codeReclamation,
        reference: r.detailCommande?.reference ?? '—',
        imprimeurId: r.detailCommande?.imprimeurId ?? null,
        date: new Date(r.createdAt).toISOString().slice(0, 10),
        produit: r.detailCommande?.produit?.nom ?? '—',
        quantite: r.detailCommande?.quantite ?? 0,
        prixUnitaire: r.detailCommande?.prixUnitaire ?? '0',
        statut: r.detailCommande?.statut ?? '—',
        description: r.description ?? '—',
        imagePath: r.imagePath,
      }));

      setReclamations(recFormate);
    } catch (err) {
      console.error('Erreur chargement réclamations :', err);
      setError("Une erreur s'est produite lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const cloreReclamation = async (id: number) => {
    try {
      await reclamationService.closeReclamation(id);
      loadAll();
    } catch (err) {
      console.error('Erreur clôture :', err);
      setError("Impossible de clore la réclamation");
    }
  };

  const remboursementReclamation = async (id: number) => {
    try {
      await reclamationService.refundReclamation(id);
      loadAll();
    } catch (err) {
      console.error('Erreur remboursement :', err);
      setError("Impossible de rembourser la réclamation");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f1f1f1' }}>
          <tr>
            <th style={thStyle}>Code</th>
            <th style={thStyle}>Réf. Détail</th>
            <th style={thStyle}>Imprimeur</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {donneesTriees.map(rec => (
            <React.Fragment key={rec.id}>
              <tr
                style={{ cursor: 'pointer', background: selectionId === rec.id ? '#e6f7ff' : 'transparent' }}
                onClick={() => setSelectionId(selectionId === rec.id ? null : rec.id)}
              >
                <td style={tdStyle}>{rec.codeReclamation}</td>
                <td style={tdStyle}>{rec.reference}</td>
                <td style={tdStyle}>{rec.imprimeurId ?? '—'}</td>
                <td style={tdStyle}>{new Date(rec.date).toLocaleDateString('fr-FR')}</td>
                <td style={tdStyle}>
                  <button onClick={e => { e.stopPropagation(); remboursementReclamation(rec.id); }} style={actionBtn}>
                    💸 Rembourse
                  </button>
                  <button onClick={e => { e.stopPropagation(); cloreReclamation(rec.id); }} style={closeBtn}>
                    ✅ Clore
                  </button>
                </td>
              </tr>
              {selectionId === rec.id && (
                <tr>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <div style={{ padding: '20px', background: '#fafafa', border: '1px solid #ccc', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                      <h4>🛠 Détails réclamation {rec.codeReclamation}</h4>
                      <p><strong>Description :</strong> {rec.description}</p>
                      {rec.imagePath && (
                        <p><strong>Image :</strong> <a href={rec.imagePath} target="_blank" rel="noopener noreferrer">Voir</a></p>
                      )}
                      <p><strong>Produit :</strong> {rec.produit}</p>
                      <p><strong>Quantité :</strong> {rec.quantite}</p>
                      <p><strong>Prix unitaire :</strong> {rec.prixUnitaire} €</p>
                      <p><strong>Statut :</strong> {rec.statut}</p>
                      <div style={{ marginTop: '15px' }}>
                        <button onClick={() => remboursementReclamation(rec.id)} style={actionBtn}>💸 Rembourser</button>
                        <button onClick={() => cloreReclamation(rec.id)} style={closeBtn}>✅ Clore</button>
                        <button onClick={() => setSelectionId(null)} style={closeDetailBtn}>Fermer</button>
                      </div>
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

export default TableauReclamation;

const thStyle: React.CSSProperties = {
  padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd'
};
const tdStyle: React.CSSProperties = {
  padding: '10px', borderBottom: '1px solid #eee'
};
const actionBtn: React.CSSProperties = {
  padding: '6px 12px', background: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '6px'
};
const closeBtn: React.CSSProperties = { ...actionBtn, background: '#28a745', color: '#fff' };
const closeDetailBtn: React.CSSProperties = { padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '8px' };
