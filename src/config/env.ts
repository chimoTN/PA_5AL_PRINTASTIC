// src/config/env.ts

// ✅ CONFIGURATION COMPLÈTE DES VARIABLES D'ENVIRONNEMENT

// URL de l'API backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://projet3dback.onrender.com';

// Configuration Stripe
export const REACT_APP_STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIP_PUBLIC;

// ✅ NOUVELLES VARIABLES POUR LA GESTION DES COOKIES
export const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN || '.onrender.com';
export const COOKIE_SECURE = import.meta.env.VITE_COOKIE_SECURE === 'true' || import.meta.env.MODE === 'production';
export const COOKIE_SAME_SITE = import.meta.env.VITE_COOKIE_SAME_SITE || 'none';

// Configuration CORS
export const CORS_ORIGINS = import.meta.env.VITE_CORS_ORIGINS?.split(',') || [
  'https://pa-5al-printastic.onrender.com',
  'https://projet3dback.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Configuration de session
export const SESSION_TIMEOUT = parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '86400000'); // 24h en ms

// Configuration de debug
export const DEBUG_COOKIES = import.meta.env.VITE_DEBUG_COOKIES === 'true';
export const DEBUG_AUTH = import.meta.env.VITE_DEBUG_AUTH === 'true';

// Configuration de l'environnement
export const IS_PRODUCTION = import.meta.env.MODE === 'production';
export const IS_DEVELOPMENT = import.meta.env.MODE === 'development';

// ✅ FONCTION POUR VALIDER LA CONFIGURATION
export const validateConfig = () => {
  const requiredVars = {
    API_BASE_URL: API_BASE_URL,
    REACT_APP_STRIPE_PUBLISHABLE_KEY: REACT_APP_STRIPE_PUBLISHABLE_KEY
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn('⚠️ Variables d\'environnement manquantes:', missingVars);
  }

  if (IS_DEVELOPMENT) {
    console.log('🔧 Configuration Frontend:', {
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
    });
  }
};

// ✅ VALIDATION AUTOMATIQUE AU CHARGEMENT
validateConfig();