import React, { useEffect } from 'react';

const StripeErrorHandler: React.FC = () => {
  useEffect(() => {
    // ✅ INTERCEPTER LES ERREURS STRIPE
    const handleStripeError = (event: ErrorEvent) => {
      // Filtrer les erreurs Stripe spécifiques
      if (event.message.includes('Could not establish connection') && 
          event.filename?.includes('stripe.network')) {
        console.warn('⚠️ Erreur Stripe ignorée (extension navigateur):', event.message);
        event.preventDefault();
        return false;
      }
    };

    // ✅ INTERCEPTER LES ERREURS DE PROMESSE
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Could not establish connection') ||
          event.reason?.message?.includes('stripe.network')) {
        console.warn('⚠️ Erreur Stripe ignorée (promesse):', event.reason);
        event.preventDefault();
        return false;
      }
    };

    // ✅ AJOUTER LES ÉCOUTEURS
    window.addEventListener('error', handleStripeError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // ✅ NETTOYAGE
    return () => {
      window.removeEventListener('error', handleStripeError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // Ce composant ne rend rien
};

export default StripeErrorHandler; 