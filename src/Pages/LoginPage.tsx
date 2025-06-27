// src/Pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../assets/styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !motDePasse.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('🔑 Tentative de connexion avec:', { email: email.trim() });
      
      await login(email.trim(), motDePasse);
      
      console.log('✅ Connexion réussie !');
      
      // ✅ Petite temporisation pour laisser le contexte se mettre à jour
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion:', error);
      
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


  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>PRINTASTIC</h1>
            <p>Connectez-vous à votre compte</p>
          </div>
          
          <div className="login-form">
            <h2>Connexion</h2>
            
            {error && (
              <div className="error-message">
                <i className="fa fa-exclamation-triangle"></i>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-container">
                  <i className="input-icon fa fa-envelope"></i>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <div className="input-container">
                  <i className="input-icon fa fa-lock"></i>
                  <input
                    id="password"
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="Votre mot de passe"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="login-button"
                disabled={loading || !email.trim() || !motDePasse.trim()}
              >
                {loading ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <i className="fa fa-sign-in"></i>
                    Se connecter
                  </>
                )}
              </button>
            </form>
            
            {/* ✅ Ajout d'un compte de test pour debug
            {process.env.NODE_ENV === 'development' && (
              <div style={{ 
                marginTop: '20px', 
                padding: '10px', 
                background: '#f8f9fa', 
                borderRadius: '4px',
                fontSize: '12px',
                color: '#666'
              }}>
                <strong>Test :</strong> client1@example.com / client1
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
