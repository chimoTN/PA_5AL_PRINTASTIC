// src/utils/authDebug.ts
export const debugAuth = () => {
  console.log('🔍 DEBUG AUTHENTIFICATION PRODUCTION:');
  console.log('📝 localStorage items:', {
    authToken: localStorage.getItem('authToken'),
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user'),
    allKeys: Object.keys(localStorage)
  });
  
  console.log('🍪 Cookies:', document.cookie);
  console.log('🌍 Domain:', window.location.hostname);
  console.log('🔗 Origin:', window.location.origin);
  console.log('🔗 Protocol:', window.location.protocol);
  console.log('🔗 User Agent:', navigator.userAgent);
  
  // Vérifier si l'utilisateur est connecté selon votre hook
  const currentUser = localStorage.getItem('user');
  if (currentUser) {
    try {
      const userData = JSON.parse(currentUser);
      console.log('👤 Utilisateur connecté:', userData);
    } catch (e) {
      console.error('❌ Erreur parsing user data:', e);
    }
  } else {
    console.log('❌ Aucun utilisateur connecté');
  }
};

// ✅ NOUVELLE FONCTION : Déconnexion forcée
export const forceLogout = () => {
  console.log('🔄 FORCE LOGOUT - Nettoyage complet...');
  
  // Nettoyer localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  
  // Nettoyer tous les cookies liés à l'authentification
  const cookiesToDelete = ['connect.sid', 'debug_session', 'test_samesite', 'test_visible'];
  
  cookiesToDelete.forEach(cookieName => {
    // Supprimer avec différents domaines et chemins
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.onrender.com;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=pa-5al-printastic.onrender.com;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=projet3dback.onrender.com;`;
  });
  
  console.log('✅ Force logout terminé - cookies et localStorage nettoyés');
  console.log('🍪 Cookies après nettoyage:', document.cookie);
};

// ✅ NOUVELLE FONCTION : Test complet avec déconnexion préalable
export const testAuthWithCleanup = async () => {
  console.log('🧪 TEST COMPLET AVEC NETTOYAGE PRÉALABLE...');
  
  // 1. Déconnexion forcée
  forceLogout();
  
  // 2. Attendre un peu pour que les cookies soient supprimés
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 3. Lancer le test d'authentification
  console.log('🧪 Début du test d\'authentification après nettoyage...');
  
  // Ici vous pouvez appeler votre fonction de test d'authentification
  // ou rediriger vers la page de connexion
  window.location.href = '/login';
};

// ✅ Nouvelle fonction pour tester l'authentification
export const testAuth = async () => {
  console.log('🧪 TEST AUTHENTIFICATION...');
  
  try {
    const response = await fetch('https://projet3dback.onrender.com/api/auth/profil', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🧪 Test auth response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('🧪 Test auth success:', data);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('🧪 Test auth failed:', errorData);
      return false;
    }
  } catch (error) {
    console.error('🧪 Test auth error:', error);
    return false;
  }
};

// ✅ Fonction spécifique pour tester l'endpoint my-models
export const testMyModels = async () => {
  console.log('🧪 TEST ENDPOINT MY-MODELS...');
  
  try {
    const response = await fetch('https://projet3dback.onrender.com/api/modele3DClient/my-models', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🧪 Test my-models response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('🧪 Test my-models success:', data);
      return { success: true, data };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('🧪 Test my-models failed:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('🧪 Test my-models error:', error);
    return { success: false, error };
  }
};

// ✅ Test complet avec connexion puis récupération des modèles
export const testCompleteAuth = async () => {
  console.log('🧪 TEST COMPLET AUTHENTIFICATION...');
  
  try {
    // 1. Connexion
    console.log('🔑 Étape 1: Connexion...');
    const loginResponse = await fetch('https://projet3dback.onrender.com/api/auth/connexion', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'client1@example.com',
        motDePasse: 'client1'
      })
    });
    
    console.log('🔑 Login response:', {
      status: loginResponse.status,
      ok: loginResponse.ok,
      headers: Object.fromEntries(loginResponse.headers.entries())
    });
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json().catch(() => ({}));
      console.error('🔑 Login failed:', errorData);
      return { success: false, step: 'login', error: errorData };
    }
    
    const loginData = await loginResponse.json();
    console.log('🔑 Login success:', loginData);
    
    // 2. Vérifier les cookies après connexion
    console.log('🍪 Cookies après connexion:', document.cookie);
    
    // 3. Vérifier les headers Set-Cookie
    const setCookieHeader = loginResponse.headers.get('Set-Cookie');
    console.log('🍪 Set-Cookie header:', setCookieHeader);
    
    // 4. Vérifier spécifiquement le cookie de session
    const hasSessionCookie = document.cookie.includes('connect.sid');
    console.log('🍪 Cookie de session présent:', hasSessionCookie);
    
    if (!hasSessionCookie) {
        console.error('❌ PROBLÈME: Cookie de session manquant !');
        console.error('❌ Le backend doit configurer sameSite: "none" pour cross-origin');
    } else {
        console.log('✅ Cookie de session présent');
    }
    
    // 4. Récupération des modèles
    console.log('📋 Étape 2: Récupération des modèles...');
    const modelsResponse = await fetch('https://projet3dback.onrender.com/api/modele3DClient/my-models', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Models response:', {
      status: modelsResponse.status,
      ok: modelsResponse.ok,
      headers: Object.fromEntries(modelsResponse.headers.entries())
    });
    
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      console.log('📋 Models success:', modelsData);
      return { 
        success: true, 
        login: loginData, 
        models: modelsData,
        setCookieHeader: setCookieHeader
      };
    } else {
      const errorData = await modelsResponse.json().catch(() => ({}));
      console.error('📋 Models failed:', errorData);
      return { success: false, step: 'models', error: errorData, setCookieHeader: setCookieHeader };
    }
    
  } catch (error) {
    console.error('🧪 Test complet error:', error);
    return { success: false, error };
  }
};

// ✅ Fonction pour tester tous les endpoints d'authentification
export const testAllAuthEndpoints = async () => {
  console.log('🧪 TEST TOUS LES ENDPOINTS AUTH...');
  
  const endpoints = [
    { name: 'Profil', url: '/auth/profil' },
    { name: 'My-Models', url: '/modele3DClient/my-models' },
    { name: 'All-Models', url: '/modele3DClient?showAll=true' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`🧪 Test ${endpoint.name}...`);
    
    try {
      const response = await fetch(`https://projet3dback.onrender.com/api${endpoint.url}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      let result: any = {
        name: endpoint.name,
        url: endpoint.url,
        status: response.status,
        ok: response.ok,
        success: response.ok
      };
      
      if (response.ok) {
        const data = await response.json();
        result.data = data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        result.error = errorData;
      }
      
      results.push(result);
      console.log(`🧪 ${endpoint.name} result:`, result);
      
    } catch (error) {
      const result = {
        name: endpoint.name,
        url: endpoint.url,
        error: error,
        success: false
      };
      results.push(result);
      console.log(`🧪 ${endpoint.name} error:`, error);
    }
  }
  
  console.log('🧪 Résultats complets:', results);
  return results;
};