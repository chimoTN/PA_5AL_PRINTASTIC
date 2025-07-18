import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '@/assets/styles/Navbar.css';
import caddie from '../assets/images/caddie.png';
import { Button } from 'react-bootstrap';
import { useCart } from '../hooks/useSoppingCart';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isLoading, user } = useAuth();
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      navigate('/');
    }
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

        {/* Affichage selon le rôle */}
        {!isLoading && isAuthenticated && user && (
          <>  
            {user.role === 'PROPRIETAIRE' && (
              <Link to="/dashboard/admin" className="navbar-item">
                <i className="fas fa-cogs"></i>
                Dashboard Admin
              </Link>
            )}

            {user.role === 'CLIENT' && (
              <>
                <Link to="/dashboard/client" className="navbar-item">
                  <i className="fas fa-tachometer-alt"></i>
                  Dashboard Client
                </Link>
                <Link to="/profil" className="navbar-item">
                  <i className="fas fa-user"></i>
                  Profil
                </Link>
                <Link to="/commande" className="navbar-item">
                  <i className="fas fa-user"></i>
                  commande
                </Link>
              </>
            )}

            {user.role === 'IMPRIMEUR' && (
              <Link to="/dashboard/impression" className="navbar-item">
                <i className="fas fa-print"></i>
                Dashboard Impression
              </Link>
            )}
          </>
        )}
      </div>

      <div className="navbar-actions">
        {isLoading ? (
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Chargement...</span>
          </div>
        ) : isAuthenticated ? (
          <>
            <div className="user-menu">
              {user && (
                <span className="user-welcome">
                  Bonjour, {user.prenom}
                </span>
              )}
            </div>

            <div className="user-menu">
              <button onClick={handleLogout} className="logout-button">
                <i className="fas fa-sign-out-alt"></i>
                Déconnexion
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="login-button">
            <i className="fas fa-sign-in-alt"></i>
            Connexion
          </Link>
        )}

        {/* Panier toujours visible */}
        <div className="cart-container" style={{ position: 'relative', marginLeft: '15px' }}>
          <Button
            variant="primary"
            style={{ 
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#007bff',
              border: 'none'
            }}
            onClick={() => navigate('/shoppingCart')}
            title={`Panier (${totalItems} articles)`}
          >
            <img 
              src={caddie} 
              alt="Caddie" 
              style={{ width: 20, height: 20 }} 
            />
          </Button>

          {totalItems > 0 && (
            <span
              className="cart-badge"
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white'
              }}
            >
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
