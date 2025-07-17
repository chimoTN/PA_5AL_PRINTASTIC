import axios from 'axios';
import { API_BASE_URL } from '../config/env';

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
    nom: string;      
    quantity: number; 
    price: number;
  }>;
  utilisateurId: number;
}

export const paiementService = {
  // 🔸 Appel backend pour créer un PaymentIntent Stripe
  async creerPaymentIntent(montantCents: number) {
    const res = await axios.post(`${API_BASE_URL}/create-payment-intent`, {
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

  // ✅ NOUVEAU : Commande spécifique modèle 3D
  async commanderModele3D(commandeData: CommandeModele3D) {
    return axios.post(`${API_BASE_URL}/auth/commande-modele3d`, commandeData);
  },

  // 🔸 Garde l'ancien pour compatibilité (autres types de commandes)
  async enregistrerPaiement(paiementData: PaiementData) {
    return axios.post(`${API_BASE_URL}/auth/paiement`, paiementData);
  },
  /*
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
    return axios.post(`${API_BASE_URL}/auth/paiement`, paiementData);
  },
  */
};
