import React, { useEffect, useState } from 'react';
import TableauSignalements from '../../components/TableauSignalements';
import { signalementService } from '../../services/signalement.service';
import reclamationService from '../../Services/reclamation.service ';
import TableauReclamation from '../../components/TableauReclamation';

interface Ligne {
  id: number;
  type: string;
  date: string;
  produit: string;
  reference: string;
  quantite: number;
  statut: string;
  description?: string;
  imprimeurId?: number | null;
}

const GestionSignalement: React.FC = () => {

  const [signalements, setSignalements] = useState<Ligne[]>([]);
  const [reclamations, setReclamations] = useState<Ligne[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        // 1) Récupérer les signalements
        const sigResp = await signalementService.getAllSignalements();
        // si votre service renvoie { success, data } ou un tableau directement
        const sigData = Array.isArray(sigResp)
          ? sigResp
          : sigResp.data ?? []; 

        const sigFormate = sigData.map((s: any) => ({
          id: s.id,
          type: s.type.toUpperCase(),
          date: new Date(s.created_at).toISOString().slice(0, 10),
          produit: s.detailCommande?.produit?.nom ?? '—',
          reference: s.detailCommande?.reference ?? '—',
          quantite: s.detailCommande?.quantite ?? 0,
          statut: s.detailCommande?.statut ?? '—',
          imprimeurId: s.detailCommande?.imprimeurId ?? null
        }));

        // 2) Récupérer les réclamations
        const recResp = await reclamationService.getAllReclamations();
        const recData = Array.isArray(recResp)
          ? recResp
          : recResp.data ?? [];

        const recFormate = recData.map((r: any) => ({
          id: r.id,
          type: (r.libelle ?? '').toUpperCase(),
          date: new Date(r.createdAt).toISOString().slice(0, 10),
          produit: r.detailCommande?.produit?.nom ?? '—',
          reference: r.detailCommande?.reference ?? '—',
          quantite: r.detailCommande?.quantite ?? 0,
          statut: r.detailCommande?.statut ?? '—',
          description: r.description ?? '—'
        }));

        setSignalements(sigFormate);
        setReclamations(recFormate);
      } catch (err) {
        console.error('Erreur lors du chargement :', err);
        setError("Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>

      {/* Signalement*/}
      <div className="dashboard-page" style={{ padding: 20, background: '#f4f4f4', minHeight: '80vh', marginBottom: '20px' }}>
        <h2 style={{ marginBottom: 20 }}>Signalements</h2>

        {signalements.length === 0 && reclamations.length === 0
          ? <p>Aucune signalement trouvé.</p>
          : (
            <>
              {signalements.length > 0 && (
                <>
                  <TableauSignalements />
                </>
              )}
            </>
          )
        }
      </div>

      {/* Réclamation*/}
      <div className="dashboard-page" style={{ padding: 20, background: '#f4f4f4', minHeight: '80vh' }}>
        <h2 style={{ marginBottom: 20 }}>Réclamations</h2>

        {signalements.length === 0 && reclamations.length === 0
          ? <p>Aucune réclamation trouvé.</p>
          : (
            <>
              {reclamations.length > 0 && (
                <>
                  <TableauReclamation donnees={reclamations} />
                </>
              )}
            </>
          )
        }
      </div>
    </>

  );
};

export default GestionSignalement;
