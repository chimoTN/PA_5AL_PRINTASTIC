// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../assets/styles/Navbar.css';
import caddie from '../assets/images/caddie.png';
import { Button } from 'react-bootstrap';
import { useCart } from '../hooks/useSoppingCart';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isLoading } = useAuth();

  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (

    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">PRINTASTIC</Link>
        </div>

        <div className="navbar-menu">
          <Link to="/" className="navbar-item">Accueil</Link>
          {!isLoading && isAuthenticated && (
            <Link to="/dashboard" className="navbar-item">Mon espace</Link>
          )}
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

          <div style={{ position: 'relative' }}>
            <Button
              variant="primary"
              style={{ padding: '6px 10px' }}
              onClick={() => navigate('/shoppingCart')}
            >
              <img src={caddie} alt="Caddie" style={{ width: 20, height: 20 }} />
            </Button>

            {totalItems > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                }}
              >
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>

  );
};

export default Navbar;