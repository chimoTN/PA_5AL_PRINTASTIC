// src/Pages/LoginPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Modal, Alert } from 'react-bootstrap';
import { toast } from 'sonner';
import image from '../assets/images/imageConnexion.jpg';
import '../assets/styles/LoginPage.css';
import { userService } from '../services/user.service';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [showCGUModal, setShowCGUModal] = useState(false);
  const [showCreeUnCompte, setShowCreeUnCompte] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
  });

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'PROPRIETAIRE':
          navigate('/dashboard/admin', { replace: true });
          break;
        case 'IMPRIMEUR':
          navigate('/dashboard/impression', { replace: true });
          break;
        case 'CLIENT':
        default:
          navigate('/dashboard/client', { replace: true });
          break;
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !motDePasse.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // console.log('🍪 Cookies AVANT login:', document.cookie);
      
      await login(email.trim(), motDePasse);
      
      // console.log('🍪 Cookies APRÈS login:', document.cookie);
      // console.log('✅ Connexion réussie !');
    

    } catch (error: any) {
      console.error('Erreur attrapée dans le catch:', error);
      // Gestion robuste du message de compte suspendu/banni
      const errorMessage =
        error?.response?.data?.message || // message backend (HTTP 403)
        error?.message ||                 // JS Error
        '';
      if (errorMessage.includes('Votre compte a été suspendu ou banni')) {
        navigate('/compte-suspendu', { replace: true });
        return;
      }
      console.error('error.message:', error.message);
      console.error('error.stack:', error.stack);
      console.error('❌ Erreur lors de la connexion:', error);

      // Redirection si compte suspendu/banni (message ou stack)
      const errorResponseStack = error.response?.data?.stack || '';
      const errorResponseMessage = error.response?.data?.message || '';
      const errorString = error.toString();

      if (
        errorMessage.includes('Votre compte a été suspendu ou banni') ||
        error.stack?.includes('Votre compte a été suspendu ou banni') ||
        errorResponseStack.includes('Votre compte a été suspendu ou banni') ||
        errorResponseMessage.includes('Votre compte a été suspendu ou banni') ||
        errorString.includes('Votre compte a été suspendu ou banni')
      ) {
        navigate('/compte-suspendu', { replace: true });
        return;
      }

      if (error.message?.includes('401') || error.message?.includes('authentifié')) {
        setError('Email ou mot de passe incorrect');
      } else if (error.message?.includes('réseau') || error.message?.includes('serveur')) {
        setError('Problème de connexion au serveur. Réessayez plus tard.');
      } else {
        setError(error.message || 'Erreur lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInscription = async () => {
    setError('');
    
    if (Object.values(newUser).some((v) => !v.trim())) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!acceptCGU) {
      setError('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    try {
      setLoading(true);
      await userService.inscription(newUser);
      
      toast.success('Compte créé avec succès', { 
        position: 'top-center', 
        duration: 3000 
      });
      
      setTimeout(() => {
        setShowCreeUnCompte(false);
        setNewUser({ nom: '', prenom: '', email: '', motDePasse: '' });
        setAcceptCGU(false);
        setError('');
      }, 3000);
      
    } catch (err: any) {
      console.error('Erreur lors de la création du compte', err);
      setError(err.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleForm = () => {
    setShowCreeUnCompte(!showCreeUnCompte);
    setError('');
    setEmail('');
    setMotDePasse('');
    setNewUser({ nom: '', prenom: '', email: '', motDePasse: '' });
    setAcceptCGU(false);
  };

  return (
    <div className="login-fullpage">
      <div className="login-image-side" style={{ backgroundImage: `url(${image})` }} />

      <div className="login-form-side">
        <div className="login-form-container">
          {!showCreeUnCompte ? (
            <>
              <h1>Connexion à Printastic</h1>
              <p>Accédez à votre espace personnel ou professionnel</p>

              {error && (
                <div className="error-message">
                  <i className="fa fa-exclamation-triangle" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-container">
                    <i className="fa fa-envelope input-icon" />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Mot de passe</label>
                  <div className="input-container">
                    <i className="fa fa-lock input-icon" />
                    <input 
                      type="password" 
                      value={motDePasse} 
                      onChange={(e) => setMotDePasse(e.target.value)} 
                      required 
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" className="login-page-button" disabled={loading}>
                  <i className="fa fa-sign-in" /> 
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <hr />

              <div className="login-footer-links">
                <button 
                  className="btn btn-danger" 
                  onClick={handleToggleForm} 
                  disabled={loading}
                >
                  Créer un compte
                </button>
                <button 
                  className="btn btn-dark" 
                  onClick={() => navigate('/devenir-imprimeur')} 
                  disabled={loading}
                >
                  Devenir imprimeur
                </button>
              </div>
            </>
          ) : (
            <>
              <h1>Créer un compte Printastic</h1>
              <p>Rejoignez-nous pour imprimer ou vendre vos modèles 3D</p>

              {error && (
                <div className="error-message">
                  <i className="fa fa-exclamation-triangle" /> {error}
                </div>
              )}

              <div className="form-group">
                <label>Nom</label>
                <div className="input-container">
                  <i className="fa fa-user input-icon" />
                  <input 
                    type="text" 
                    value={newUser.nom} 
                    onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })} 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Prénom</label>
                <div className="input-container">
                  <i className="fa fa-user input-icon" />
                  <input 
                    type="text" 
                    value={newUser.prenom} 
                    onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })} 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <div className="input-container">
                  <i className="fa fa-envelope input-icon" />
                  <input 
                    type="email" 
                    value={newUser.email} 
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <div className="input-container">
                  <i className="fa fa-lock input-icon" />
                  <input 
                    type="password" 
                    value={newUser.motDePasse} 
                    onChange={(e) => setNewUser({ ...newUser, motDePasse: e.target.value })} 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-check mt-3 mb-3">
                <input 
                  type="checkbox" 
                  checked={acceptCGU} 
                  onChange={() => setAcceptCGU(!acceptCGU)} 
                  disabled={loading}
                />
                <label style={{ marginLeft: 8 }}>
                  J'accepte les{' '}
                  <span className="cgu-link" onClick={() => setShowCGUModal(true)}>
                    conditions d'utilisation
                  </span>
                </label>
              </div>

              <button className="login-page-button" onClick={handleInscription} disabled={loading}>
                <i className="fa fa-user-plus" /> 
                {loading ? 'Inscription...' : "S'inscrire"}
              </button>

              <hr />

              <div className="login-footer-links">
                <button 
                  className="btn btn-outline-dark" 
                  onClick={handleToggleForm} 
                  disabled={loading}
                >
                  Retour à la connexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal show={showCGUModal} onHide={() => setShowCGUModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conditions d'utilisation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            En utilisant Printastic, vous acceptez de respecter nos règles générales d'usage et de sécurité. 
            Le service vise à mettre en relation les clients et les imprimeurs 3D...
          </p>
          <p>
            ✅ Vous devez fournir des informations exactes<br />
            ✅ Vos impressions doivent être légales<br />
            ❌ Aucune vente d'objets interdits<br />
            ✅ Respectez les délais une fois une commande acceptée
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setShowCGUModal(false)}
          >
            Fermer
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LoginPage;
