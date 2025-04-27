// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../assets/styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">PRINTASTIC</Link>
      </div>
      
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">Accueil</Link>
        {!isLoading && isAuthenticated && (
          <Link to="/dashboard" className="navbar-item">Mon espace</Link>
        )}
        {/* Autres liens du menu */}
      </div>
      
      <div className="navbar-actions">
        {isLoading ? (
          <span className="loading-indicator">Chargement...</span>
        ) : isAuthenticated ? (
          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i> Déconnexion
          </button>
        ) : (
          <Link to="/login" className="login-button">
            <i className="fas fa-sign-in-alt"></i> Connexion
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;