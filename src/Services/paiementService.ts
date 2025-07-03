import axios from 'axios';

const API_BACK = 'http://localhost:3000/api';

export const paiementService = {
  // 🔸 Appel backend pour créer un PaymentIntent Stripe
  async creerPaymentIntent(montantCents: number) {
    const res = await axios.post(`${API_BACK}/create-payment-intent`, {
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
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
    prixTotal: number;
    stripePaymentId: string;
    produits: Array<{ id: number; quantity: number; price: number }>;
    utilisateurId: number;
  }) {
    return axios.post(`${API_BACK}/auth/paiement`, paiementData);
  },
};
