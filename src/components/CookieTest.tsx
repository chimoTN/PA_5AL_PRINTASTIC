import React, { useState } from 'react';
import { testSimpleAuth, checkSessionCookies, forceLogout } from '../utilis/authDebug';
import { testConfiguration } from '../utilis/configTest';
import { testUpload } from '../utilis/uploadTest';

const CookieTest: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [configResult, setConfigResult] = useState<any>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestAuth = async () => {
    setLoading(true);
    try {
      const result = await testSimpleAuth();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCookies = () => {
    checkSessionCookies();
  };

  const handleForceLogout = () => {
    forceLogout();
    setTestResult(null);
    setUploadResult(null);
  };

  const handleTestConfig = () => {
    const result = testConfiguration();
    setConfigResult(result);
  };

  const handleTestUpload = async () => {
    setLoading(true);
    try {
      const result = await testUpload();
      setUploadResult(result);
    } catch (error) {
      setUploadResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 Test de Gestion des Cookies et Upload</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleTestConfig}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Configuration
        </button>
        
        <button 
          onClick={handleTestAuth}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Test en cours...' : 'Test Connexion'}
        </button>
        
        <button 
          onClick={handleTestUpload}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Test en cours...' : 'Test Upload'}
        </button>
        
        <button 
          onClick={handleCheckCookies}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Vérifier Cookies
        </button>
        
        <button 
          onClick={handleForceLogout}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Force Logout
        </button>
      </div>

      {configResult && (
        <div style={{ 
          padding: '15px', 
          borderRadius: '5px',
          backgroundColor: configResult.isValid ? '#d4edda' : '#f8d7da',
          border: `1px solid ${configResult.isValid ? '#c3e6cb' : '#f5c6cb'}`,
          color: configResult.isValid ? '#155724' : '#721c24',
          marginBottom: '20px'
        }}>
          <h3>Résultat Configuration:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {JSON.stringify(configResult, null, 2)}
          </pre>
        </div>
      )}

      {testResult && (
        <div style={{ 
          padding: '15px', 
          borderRadius: '5px',
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          color: testResult.success ? '#155724' : '#721c24',
          marginBottom: '20px'
        }}>
          <h3>Résultat du Test Connexion:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {uploadResult && (
        <div style={{ 
          padding: '15px', 
          borderRadius: '5px',
          backgroundColor: uploadResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${uploadResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          color: uploadResult.success ? '#155724' : '#721c24',
          marginBottom: '20px'
        }}>
          <h3>Résultat du Test Upload:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {JSON.stringify(uploadResult, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Cliquez sur "Test Configuration" pour vérifier les variables d'environnement</li>
          <li>Cliquez sur "Test Connexion" pour tester l'authentification complète</li>
          <li>Cliquez sur "Test Upload" pour tester l'upload de fichiers</li>
          <li>Cliquez sur "Vérifier Cookies" pour voir les cookies actuels</li>
          <li>Cliquez sur "Force Logout" pour nettoyer et recommencer</li>
        </ol>
        
        <h3>Ce qui est testé:</h3>
        <ul>
          <li>✅ Configuration des variables d'environnement</li>
          <li>✅ Connexion avec credentials: 'include'</li>
          <li>✅ Réception des cookies de session</li>
          <li>✅ Persistance des cookies entre les requêtes</li>
          <li>✅ Récupération du profil utilisateur</li>
          <li>✅ Test d'upload de fichiers</li>
          <li>✅ Gestion des erreurs d'upload</li>
        </ul>
      </div>
    </div>
  );
};

export default CookieTest; 