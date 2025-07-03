// src/Pages/ProfilePage.tsx
import  { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../assets/styles/ProfilePage.css';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
    });
  };

  const handleSave = async () => {
    // TODO: Implémenter la sauvegarde des modifications
    setIsEditing(false);
    // Ici, vous pourriez appeler une API pour sauvegarder les modifications
  };

  const getRoleDisplayName = (role: string) => {
    switch (role.toUpperCase()) {
      case 'PROPRIETAIRE':
        return 'Propriétaire';
      case 'IMPRIMEUR':
        return 'Imprimeur';
      case 'CLIENT':
        return 'Client';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'PROPRIETAIRE':
        return 'role-owner';
      case 'IMPRIMEUR':
        return 'role-printer';
      case 'CLIENT':
        return 'role-client';
      default:
        return 'role-default';
    }
  };

  if (!user) {
    return (
      <div className="profile-page loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="profile-title">
            <h1>Mon Profil</h1>
            <p className="profile-subtitle">Gérez vos informations personnelles</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="card-header">
              <h2>Informations personnelles</h2>
            </div>

            <div className="card-content">
              <div className="form-group">
                <label>
                  <i className="fas fa-envelope"></i>
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="form-input"
                  />
                ) : (
                  <div className="form-value">{user.email}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="fas fa-user"></i>
                    Prénom
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.prenom}
                      onChange={(e) => setEditedUser({ ...editedUser, prenom: e.target.value })}
                      className="form-input"
                    />
                  ) : (
                    <div className="form-value">{user.prenom}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-user"></i>
                    Nom
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.nom}
                      onChange={(e) => setEditedUser({ ...editedUser, nom: e.target.value })}
                      className="form-input"
                    />
                  ) : (
                    <div className="form-value">{user.nom}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-id-badge"></i>
                  Rôle
                </label>
                <div className="form-value">
                  <span className={`role-badge ${getRoleColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-calendar-alt"></i>
                  Membre depuis
                </label>
                <div className="form-value">
                  {user.dateCreation 
                    ? new Date(user.dateCreation).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Date inconnue'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Actions du compte */}
          <div className="profile-actions">
            <div className="actions-card">
              <h3>Actions du compte</h3>
              
                <div className="action-item">
                  <div className="action-info">
                    <i className="fas fa-edit"></i>
                    <div>
                      <h4>Changer les informations personnels</h4>
                      <p>Modifiez vos donnée</p>
                    </div>
                  </div>
                    {!isEditing ? (
                      <button className="action-button secondary" onClick={handleEdit}>
                        Modifier
                      </button>
                    ) : (
                      <div>
                        <button className="action-button secondary" onClick={handleSave}>
                          <i className="fas fa-check"></i>
                          Sauvegarder
                        </button>
                        <button className="action-button danger" onClick={handleCancel}>
                          <i className="fas fa-times"></i>
                          Annuler
                        </button>
                      </div>
                    )}
                    
                </div>

              <div className="action-item">
                <div className="action-info">
                  <i className="fas fa-key"></i>
                  <div>
                    <h4>Changer le mot de passe</h4>
                    <p>Modifiez votre mot de passe pour la sécurité</p>
                  </div>
                </div>
                <button className="action-button secondary">
                  Changer
                </button>
              </div>

              <div className="action-item danger">
                <div className="action-info">
                  <i className="fas fa-sign-out-alt"></i>
                  <div>
                    <h4>Se déconnecter</h4>
                    <p>Fermez votre session en cours</p>
                  </div>
                </div>
                <button 
                  className="action-button danger"
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                      logout();
                    }
                  }}
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;