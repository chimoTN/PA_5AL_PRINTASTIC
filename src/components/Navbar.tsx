// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../assets/styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, authLoading, user } = useAuth(); 
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="navbar-link">
          <i className="fas fa-cube"></i>
          PRINTASTIC
        </Link>
      </div>
      
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">
          <i className="fas fa-home"></i>
          Accueil
        </Link>
        
        {!authLoading && isAuthenticated && (
          <>
            <Link to="/dashboard" className="navbar-item">
              <i className="fas fa-tachometer-alt"></i>
              Mon espace
            </Link>
            <Link to="/profil" className="navbar-item">
              <i className="fas fa-user"></i>
              Profil
            </Link>
          </>
        )}
      </div>
      
      <div className="navbar-actions">
        {authLoading ? ( // ✅ authLoading au lieu de isLoading
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Chargement...</span>
          </div>
        ) : isAuthenticated ? (
          <div className="user-menu">
            {user && (
              <span className="user-welcome">
                Bonjour, {user.prenom}
              </span>
            )}
            <button onClick={handleLogout} className="logout-button">
              <i className="fas fa-sign-out-alt"></i>
              Déconnexion
            </button>
          </div>
        ) : (
          <Link to="/connexion" className="login-button">
            <i className="fas fa-sign-in-alt"></i>
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
