import axios, { AxiosResponse } from 'axios';

const API_BACK = 'http://localhost:3000/api/imprimeur'; 

const API_BACK_stripe = 'http://localhost:3000/api'; 

export const imprimeurService = {
  /**
   * Envoie une demande d'inscription imprimeur
   */
  async postInscriptionDemande(payload: {
    companyName: string;
    siret: string;
    address: string;
    phone: string;
    sampleFile?: string;
    requesterEmail: string;
    requesterName?: string;
  }) {
    const res: AxiosResponse = await axios.post(`${API_BACK}/printer-requests`, payload);
    return res.data;
  },

  /**
   * Accepte une demande d'inscription
   */
  async approveRequest(id: number, reviewedById: number) {
    const res: AxiosResponse = await axios.post(`${API_BACK}/demande/${id}/approve`, {
      reviewedById,
    });
    return res.data;
  },

  /**
   * Refuse une demande d'inscription
   */
  async rejectRequest(id: number, reviewedById: number) {
    const res: AxiosResponse = await axios.post(`${API_BACK}/demande/${id}/reject`, {
      reviewedById,
    });
    return res.data;
  },

  /**
   * Récupère toutes les demandes d'imprimeur
   */
  async getAllPrinterRequests() {
    const res: AxiosResponse = await axios.get(`${API_BACK}/printer-requests`);
    return res.data;
  },

  /**
 * Crée un compte Stripe pour l'imprimeur et envoie l'email d'onboarding
 */
    async createStripeAccount(id: number) {
    const res: AxiosResponse = await axios.post(`${API_BACK_stripe}/stripe/create-imprimeur-account`, {
        imprimeurId: id
    });
    return res.data;
    }

};
