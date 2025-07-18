import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { generateImpressionReport } from '../../utilis/pdf/generateImpressionReport';
import { useAuth } from '../../hooks/useAuth';
import { impressionService } from '../../services/impression.service';

const ProfilImprimeur: React.FC = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [commandesLivrees, setCommandesLivrees] = useState<any[]>([]);
  const [moisDispo, setMoisDispo] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // A adapter si tu as d'autres champs modifiables plus tard
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: sauvegarder les infos modifiées (à implémenter si besoin)
  };

  const moisLabel = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const extraireMoisUtilises = (commandes: any[]) => {
    const moisSet = new Set<string>();

    commandes.forEach((cmd) => {
      if (cmd.createdAt) {
        const mois = cmd.createdAt.slice(0, 7); // 'YYYY-MM'
        moisSet.add(mois);
      }
    });

    const moisLabel = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    return Array.from(moisSet)
      .sort((a, b) => b.localeCompare(a)) // tri du plus récent au plus ancien
      .map((val) => {
        const [year, month] = val.split('-');
        return {
          label: `${moisLabel[+month - 1]} ${year}`,
          value: val,
        };
      });
  };


  const fetchAccepted = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await impressionService.getCommandesImprimeur(user.id);
      const delivered = data.filter((d: any) => d.statut === 'livré');
      setCommandesLivrees(delivered);
      setMoisDispo(extraireMoisUtilises(delivered));
    } catch (err) {
      console.error('Erreur lors du chargement des commandes :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccepted();
  }, []);

  const infosEntreprise = {
    nomEntreprise: 'PrintLab Lyon',
    email: 'contact@printlab.fr',
    telephone: '06 12 34 56 78',
    adresse: '12 rue de l’Impression, 69001 Lyon',
    siret: '123 456 789 00010',
        statut: 'Disponible',
    capacite: 5,
    delai: 2,
    transporteur: 'La Poste',
    iban: 'FR76 XXXX XXXX XXXX XXXX',
    identite: 'piece_identite.pdf',
    justificatif: 'kbis.pdf',
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <div className="profile-header" style={{ textAlign: 'left' }}>
          <div className="profile-title">
            <h1>Gestion de votre compte</h1>
            <p className="profile-subtitle">Bienvenue dans votre espace d’impression !</p>
          </div>
        </div>
      </Row>

      <Row>
        <Col md={3}>
          <div className="sidebar-tabs">
            <button className={`tab-button-vertical ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
              <i className="fas fa-user-cog"></i> Infos personnelles
            </button>
            <button className={`tab-button-vertical ${activeTab === 'pro' ? 'active' : ''}`} onClick={() => setActiveTab('pro')}>
              <i className="fas fa-cogs"></i> Paramètres pro
            </button>
            <button className={`tab-button-vertical ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
              <i className="fas fa-file-alt"></i> Documents & sécurité
            </button>
          </div>
        </Col>

        <Col md={9}>
          <div className="profile-content">
            <div className="profile-card">
              <div className="card-content">
                {activeTab === 'info' && (
                  <>
                    <div className="card-header">
                        <h2>Informations personnelles</h2>
                    </div>

                    {renderField('Nom de l’entreprise', 'nomEntreprise', infosEntreprise.nomEntreprise, isEditing, handleChange)}
                    {renderField('Email professionnel', 'email', infosEntreprise.email, isEditing, handleChange)}
                    {renderField('Téléphone', 'telephone', infosEntreprise.telephone, isEditing, handleChange)}
                    {renderField('Adresse', 'adresse', infosEntreprise.adresse, isEditing, handleChange)}
                    {renderField('SIRET', 'siret', infosEntreprise.siret, isEditing, handleChange)}

                    {renderButtons(isEditing, setIsEditing, handleSave)}
                  </>
                )}

              {activeTab === 'pro' && (
                <>
                  <h2>🛠 Paramètres professionnels</h2>
                  {renderSelect('Statut', 'statut', infosEntreprise.statut, ['Disponible', 'Indisponible'], isEditing, handleChange)}
                  {renderButtons(isEditing, setIsEditing, handleSave)}
                </>
              )}

                {activeTab === 'documents' && (
                  <>
                    <h2>📄 Documents</h2>
                    <p>Retrouvez vos rapports d'impression</p>

                    <select className="form-input" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                      <option value="all">Toute l'année</option>
                      {moisDispo.map(({ label, value }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>


                    <button
                      type="button"
                      className="btn btn-primary mt-3"
                      onClick={() => generateImpressionReport(infosEntreprise, commandesLivrees, selectedPeriod)}
                    >
                      📥 Télécharger rapport d'impression
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilImprimeur;

// Rendu d’un champ texte
function renderField(label, name, value, isEditing, handleChange, type = 'text') {
  return (
    <div className="form-group">
      <label>{label}</label>
      {isEditing ? (
        <input className="form-input" name={name} type={type} value={value} onChange={handleChange} />
      ) : (
        <div className="form-value">{value}</div>
      )}
    </div>
  );
}

// Rendu d’un select
function renderSelect(label, name, value, options, isEditing, handleChange) {
  return (
    <div className="profile-field">
      <label>{label}</label>
      {isEditing ? (
        <select className="form-input" name={name} value={value} onChange={handleChange}>
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <div className="form-value">{value}</div>
      )}
    </div>
  );
}

// Boutons de contrôle
function renderButtons(isEditing, setIsEditing, handleSave) {
  return !isEditing ? (
    <button className="action-button secondary" onClick={() => setIsEditing(true)}>
        Modifier
    </button>
  ) : (
    <div>
        <button className="action-button secondary" onClick={handleSave}>
            <i className="fas fa-check"></i>
            Sauvegarder
        </button>
        <button className="action-button danger" onClick={() => setIsEditing(false)}>
            <i className="fas fa-times"></i>
            Annuler
        </button>
    </div>
  );
}
