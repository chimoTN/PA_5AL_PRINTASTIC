// src/utils/configTest.ts
import { 
  API_BASE_URL, 
  COOKIE_DOMAIN, 
  COOKIE_SECURE, 
  COOKIE_SAME_SITE, 
  CORS_ORIGINS, 
  SESSION_TIMEOUT, 
  DEBUG_COOKIES, 
  DEBUG_AUTH, 
  IS_PRODUCTION, 
  IS_DEVELOPMENT 
} from '../config/env';

export const testConfiguration = () => {
  console.log('🔧 === TEST CONFIGURATION FRONTEND ===');
  
  const config = {
    API_BASE_URL,
    COOKIE_DOMAIN,
    COOKIE_SECURE,
    COOKIE_SAME_SITE,
    CORS_ORIGINS,
    SESSION_TIMEOUT,
    DEBUG_COOKIES,
    DEBUG_AUTH,
    IS_PRODUCTION,
    IS_DEVELOPMENT
  };
  
  console.log('📋 Configuration actuelle:', config);
  
  // Vérifications
  const checks = [
    {
      name: 'API_BASE_URL',
      value: API_BASE_URL,
      valid: !!API_BASE_URL && API_BASE_URL.startsWith('http'),
      message: 'Doit être une URL valide'
    },
    {
      name: 'COOKIE_DOMAIN',
      value: COOKIE_DOMAIN,
      valid: !!COOKIE_DOMAIN,
      message: 'Doit être défini pour cross-origin'
    },
    {
      name: 'COOKIE_SECURE',
      value: COOKIE_SECURE,
      valid: IS_PRODUCTION ? COOKIE_SECURE : true,
      message: 'Doit être true en production'
    },
    {
      name: 'COOKIE_SAME_SITE',
      value: COOKIE_SAME_SITE,
      valid: ['lax', 'strict', 'none'].includes(COOKIE_SAME_SITE),
      message: 'Doit être lax, strict ou none'
    },
    {
      name: 'CORS_ORIGINS',
      value: CORS_ORIGINS,
      valid: Array.isArray(CORS_ORIGINS) && CORS_ORIGINS.length > 0,
      message: 'Doit être un tableau non vide'
    }
  ];
  
  console.log('✅ Vérifications de configuration:');
  checks.forEach(check => {
    const status = check.valid ? '✅' : '❌';
    console.log(`${status} ${check.name}: ${check.value} - ${check.message}`);
  });
  
  const failedChecks = checks.filter(check => !check.valid);
  if (failedChecks.length > 0) {
    console.warn('⚠️ Problèmes de configuration détectés:', failedChecks.map(c => c.name));
  } else {
    console.log('🎉 Configuration valide !');
  }
  
  console.log('=====================================');
  
  return {
    config,
    checks,
    isValid: failedChecks.length === 0
  };
};

// ✅ TEST AUTOMATIQUE AU CHARGEMENT
if (typeof window !== 'undefined') {
  // Seulement côté client
  setTimeout(() => {
    testConfiguration();
  }, 1000);
} 