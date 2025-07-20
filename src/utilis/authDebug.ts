// src/utils/authDebug.ts
export const debugAuth = () => {
  console.log('🔍 DEBUG AUTHENTIFICATION SIMPLIFIÉ:');
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

// ✅ NOUVELLE FONCTION : Test de connexion simplifié
export const testSimpleAuth = async () => {
  console.log('🧪 TEST CONNEXION SIMPLIFIÉ...');
  
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
        return { success: false, step: 'cookie_check', error: 'Cookie de session manquant' };
    } else {
        console.log('✅ Cookie de session présent');
    }
    
    // 5. Test de récupération du profil
    console.log('👤 Étape 2: Récupération du profil...');
    const profileResponse = await fetch('https://projet3dback.onrender.com/api/auth/profil', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('👤 Profile response:', {
      status: profileResponse.status,
      ok: profileResponse.ok
    });
    
    if (!profileResponse.ok) {
      const errorData = await profileResponse.json().catch(() => ({}));
      console.error('👤 Profile failed:', errorData);
      return { success: false, step: 'profile', error: errorData };
    }
    
    const profileData = await profileResponse.json();
    console.log('👤 Profile success:', profileData);
    
    console.log('✅ Test de connexion simplifié réussi !');
    return { success: true, loginData, profileData };
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return { success: false, step: 'error', error };
  }
};

// ✅ NOUVELLE FONCTION : Déconnexion forcée simplifiée
export const forceLogout = () => {
  console.log('🔄 FORCE LOGOUT SIMPLIFIÉ - Nettoyage complet...');
  
  // Nettoyer localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  
  console.log('✅ Force logout terminé - localStorage nettoyé');
  console.log('🍪 Cookies après nettoyage:', document.cookie);
};

// ✅ NOUVELLE FONCTION : Vérifier les cookies de session
export const checkSessionCookies = () => {
  console.log('🔍 VÉRIFICATION DES COOKIES DE SESSION...');
  
  const cookies = document.cookie.split(';');
  const sessionCookies = [];
  
  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name === 'connect.sid') {
      sessionCookies.push({ name, value });
    }
  });
  
  console.log('🍪 Cookies de session trouvés:', sessionCookies);
  console.log('🍪 Tous les cookies:', document.cookie);
  
  if (sessionCookies.length === 0) {
    console.log('❌ Aucun cookie de session trouvé');
  } else if (sessionCookies.length > 1) {
    console.log('⚠️ Plusieurs cookies de session trouvés - possible conflit');
  } else {
    console.log('✅ Un seul cookie de session trouvé');
  }
};