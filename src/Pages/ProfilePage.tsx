import { useAuth } from '../hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <h1>Profil utilisateur</h1>
      {user ? (
        <div>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Nom:</strong> {user.nom}</p>
          <p><strong>Prénom:</strong> {user.prenom}</p>
          <p><strong>Rôle:</strong> {user.role}</p>
        </div>
      ) : (
        <p>Chargement du profil...</p>
      )}
    </div>
  );
};

export default ProfilePage;