import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { generateImpressionReport } from '../../utilis/pdf/generateImpressionReport';
import { useAuth } from '../../hooks/useAuth';
import { impressionService } from '../../services/impression.service';

const ProfilImprimeur: React.FC = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [infos, setInfos] = useState();
  const [loading,setLoading] = useState(false);

  const { user } = useAuth();

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfos((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: envoi des données au back si nécessaire
  };

  const fetchAccepted = async () => {
    if (!user) return;
    setLoading(true);
    try {

      const data = await impressionService.getCommandesImprimeur(user.id);
      const delivered = data.filter((d: any) => d.statut === 'livré');

      setInfos(delivered);
    } catch (err) {
      console.error('Erreur lors du chargement des commandes :', err);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    {Le nombre de mois avec des champ validé}
  ];

  useEffect(() => {
    fetchAccepted();
  },[])
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
                    {renderField('Nom de l’entreprise', 'nomEntreprise', infos.nomEntreprise, isEditing, handleChange)}
                    {renderField('Email professionnel', 'email', infos.email, isEditing, handleChange)}
                    {renderField('Téléphone', 'telephone', infos.telephone, isEditing, handleChange)}
                    {renderField('Adresse', 'adresse', infos.adresse, isEditing, handleChange)}
                    {renderField('SIRET', 'siret', infos.siret, isEditing, handleChange)}
                    {!isEditing ? (
                      <button className="action-button secondary" onClick={() => setIsEditing(true)}>
                        Modifier
                      </button>
                    ) : (
                      <div>
                        <button className="action-button secondary" onClick={handleSave}>
                          <i className="fas fa-check"></i> Sauvegarder
                        </button>
                        <button className="action-button danger" onClick={() => setIsEditing(false)}>
                          <i className="fas fa-times"></i> Annuler
                        </button>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'pro' && (
                  <>
                    <h2>🛠 Paramètres professionnels</h2>
                    {[
                      { label: 'Statut', name: 'statut', options: ['Disponible', 'Indisponible'] },
                      { label: 'Capacité max', name: 'capacite', options: [] },
                      { label: 'Délai (en jours)', name: 'delai', options: [] },
                      { label: 'Transporteur', name: 'transporteur', options: ['La Poste', 'Mondial Relay'] },
                    ].map(({ label, name, options }) => (
                      <div className="form-group" key={name}>
                        <label>{label}</label>
                        {isEditing ? (
                          options.length > 0 ? (
                            <select name={name} value={infos[name]} onChange={handleChange} className="form-input">
                              {options.map((opt) => (
                                <option key={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className="form-input"
                              name={name}
                              type="number"
                              value={infos[name]}
                              onChange={handleChange}
                            />
                          )
                        ) : (
                          <div className="form-value">{infos[name]}</div>
                        )}
                      </div>
                    ))}
                    {!isEditing ? (
                      <button className="action-button secondary" onClick={() => setIsEditing(true)}>
                        Modifier
                      </button>
                    ) : (
                      <div>
                        <button className="action-button secondary" onClick={handleSave}>
                          <i className="fas fa-check"></i> Sauvegarder
                        </button>
                        <button className="action-button danger" onClick={() => setIsEditing(false)}>
                          <i className="fas fa-times"></i> Annuler
                        </button>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'documents' && (
                  <>
                    <h2>📄 Documents</h2>
                    <p>Retrouvez vos rapports d'impression</p>

                    <select className="form-input" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                      <option value="all">Toute l'année</option>
                      {months.map(({ label, value }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>

                    <Button
                      variant="primary"
                      className="mt-3"
                      onClick={() => generateImpressionReport(infos, selectedPeriod)}
                    >
                      📥 Télécharger rapport d'impression
                    </Button>
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
