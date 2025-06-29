import axios from 'axios';

const API_BACK = 'http://localhost:3000/api'; // ← adapte selon ton backend
const STRIPE_BACK = 'http://localhost:3000/stripe'; // ← si tu as un endpoint dédié à Stripe

export const paiementService = {
  // 🔸 Appel backend pour créer un PaymentIntent Stripe
  async creerPaymentIntent(montantCents: number) {
    const res = await axios.post(`${STRIPE_BACK}/create-payment-intent`, {
      amount: montantCents,
    });
    return res.data; // { clientSecret: "pi_xxx_secret_..." }
  },

  // 🔸 Vérifie une adresse via API Adresse de la Poste (data.gouv.fr)
  async verifierAdresse(adresse: string) {
    const res = await axios.get(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`
    );
    return res.data; // contient les features de l'adresse
  },

  // 🔸 Enregistre le paiement finalisé dans ton backend (optionnel)
  async enregistrerPaiement(paiementData: {
    montant: number;
    produits: any[];
    adresse: any;
    stripePaymentId: string;
  }) {
    return axios.post(`${API_BACK}/paiement`, paiementData);
  },
};
