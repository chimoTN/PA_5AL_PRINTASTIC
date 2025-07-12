import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const ProfilImprimeur: React.FC = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);

  const [infos, setInfos] = useState({
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfos((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
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

                {renderField('Nom de l’entreprise', 'nomEntreprise', infos.nomEntreprise, isEditing, handleChange)}
                {renderField('Email professionnel', 'email', infos.email, isEditing, handleChange)}
                {renderField('Téléphone', 'telephone', infos.telephone, isEditing, handleChange)}
                {renderField('Adresse', 'adresse', infos.adresse, isEditing, handleChange)}
                {renderField('SIRET', 'siret', infos.siret, isEditing, handleChange)}

                {renderButtons(isEditing, setIsEditing, handleSave)}
                </>
            )}

          {activeTab === 'pro' && (
            <>
              <h2>🛠 Paramètres professionnels</h2>
              {renderSelect('Statut', 'statut', infos.statut, ['Disponible', 'Indisponible'], isEditing, handleChange)}
              {renderButtons(isEditing, setIsEditing, handleSave)}
            </>
          )}

          {activeTab === 'documents' && (
            <>
              <h2>📄 Documents & sécurité</h2>
              {renderField('IBAN', 'iban', infos.iban, isEditing, handleChange)}
              {renderField('Pièce d’identité', 'identite', infos.identite, isEditing, handleChange)}
              {renderField('Justificatif d’activité', 'justificatif', infos.justificatif, isEditing, handleChange)}

              {renderButtons(isEditing, setIsEditing, handleSave)}
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
