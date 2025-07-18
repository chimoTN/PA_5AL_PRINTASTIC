import baseService from './base.service';

// ✅ Types TypeScript pour les APIs
export interface CommandeModele3D {
  modele3dClientId: number;
  telephone: string;
  adresse: string;
  stripePaymentId: string;
}

export interface PaiementData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  prixTotal: number;
  stripePaymentId: string;
  produits: Array<{ 
    id: number; 
    nom: string;        // ✅ Ajout de la propriété nom
    quantity: number; 
    price: number;
  }>;
  utilisateurId: number;
}

export const paiementService = {
  // 🔸 Appel backend pour créer un PaymentIntent Stripe
  async creerPaymentIntent(montantCents: number, customerEmail: string) {
    return baseService.post('/auth/stripe/create-payment-intent', {
      amount: montantCents,
      customerEmail,
    });
  },

  // 🔸 Vérifie une adresse via API Adresse de la Poste (data.gouv.fr)
  async verifierAdresse(adresse: string) {
    // On garde fetch car c'est une API externe
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`
    );
    return res.json(); // contient les features de l'adresse
  },

  // ✅ NOUVEAU : Commande spécifique modèle 3D
  async commanderModele3D(commandeData: CommandeModele3D) {
    return baseService.post('/auth/commande-modele3d', commandeData);
  },

  // 🔸 Garde l'ancien pour compatibilité (autres types de commandes)
  async enregistrerPaiement(paiementData: PaiementData) {
    return baseService.post('/auth/paiement', paiementData);
  },

  // ✅ Récupérer les infos Stripe d'une commande
  async getStripePaiementByCommandeId(commandeId: number) {
    return baseService.get(`/commandes/${commandeId}/paiement-stripe`);
  },
};
