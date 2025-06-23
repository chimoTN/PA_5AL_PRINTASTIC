// src/utils/authDebug.ts
export const debugAuth = () => {
  console.log('🔍 DEBUG AUTHENTIFICATION:');
  console.log('📝 localStorage items:', {
    authToken: localStorage.getItem('authToken'),
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user'),
    allKeys: Object.keys(localStorage)
  });
  
  console.log('🍪 Cookies:', document.cookie);
  
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
    console.log('❌ Aucun utilisateur trouvé');
  }
};