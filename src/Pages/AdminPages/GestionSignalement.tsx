import React, { useEffect, useState } from 'react';
import TableauSignalements from '../../components/TableauSignalements';
import { signalementService } from '../../services/signalement.service';
import reclamationService from '../../Services/reclamation.service ';

const GestionSignalement: React.FC = () => {

  const [signalements, setSignalements] = useState([]);
  const [reclamations, setReclamations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const data = await signalementService.getAllSignalements();

      const formatees = data.map((s: any) => ({
        id: s.id,
        type: s.type.toUpperCase(),
        date: new Date(s.created_at).toISOString().slice(0, 10),
        produit: s.detailCommande?.produit?.nom || '—',
        reference: s.detailCommande?.reference || '—',
        quantite: s.detailCommande?.quantite || 0,
        statut: s.detailCommande?.statut || '—',
        imprimeurId: s.detailCommande?.imprimeurId || null
      }));

      setSignalements(formatees);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des signalements :', err);
      setError("Une erreur s'est produite");
      setLoading(false);
    }
  };

    const fetchDataReclamation = async () => {
    try {
      const data = await reclamationService.getAllReclamations();

      const reclamationsFormatees = data.map((r: any) => ({
        id: r.id,
        type: r.libelle.toUpperCase(),
        date: new Date(r.createdAt).toISOString().slice(0, 10),
        produit: r.detailCommande?.produit?.nom || '—',
        reference: r.detailCommande?.reference || '—',
        quantite: r.detailCommande?.quantite || 0,
        statut: r.detailCommande?.statut || '—',
        description: r.description || '—'
      }));

      setReclamations(reclamationsFormatees);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des signalements :', err);
      setError("Une erreur s'est produite");
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchData();
    fetchDataReclamation();
  }, []);

  return (
    <div className="dashboard-page" style={{ padding: '20px', background: '#f4f4f4', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '20px' }}>⚠️ Signalements reçus</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : signalements.length === 0 ? (
        <p>Aucun signalement trouvé.</p>
      ) : (
        <>
          <h1> Signalements </h1>
          <TableauSignalements donnees={signalements} />

          <h1> Réclamation </h1>
          <TableauSignalements donnees={reclamations} />
        </>
      )}
    </div>
  );
};

export default GestionSignalement;