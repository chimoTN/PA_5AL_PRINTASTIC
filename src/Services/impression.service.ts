// src/services/impression.service.ts
import axios, { AxiosResponse } from 'axios';

const API_BACK = 'http://localhost:3000/api/impression';

export const impressionService = {
  /**
   * Récupère tous les détails de commandes non attribués à un imprimeur
   */
  async getNonAttribuees() {
    const res: AxiosResponse = await axios.get(`${API_BACK}/non-attribuees`);
    return res.data;
  },

  /**
   * Permet à un imprimeur de prendre en charge plusieurs détails de commande
   * @param idsDetailCommandes Liste des ID de détails à prendre
   * @param userID L’ID de l’imprimeur envoyé dans le body (et non les headers)
   */
  async prendreCommandes(idsDetailCommandes, userID) {
    const res: AxiosResponse = await axios.post(
      `${API_BACK}/prendre`,
      { idsDetailCommandes, userID } // ✅ envoi dans le body
    );
    return res.data;
  },

  
  /**
   * Récupère les détails de commandes déjà acceptés par l’imprimeur
   * @param userID L’ID de l’imprimeur
   */
  async getCommandesImprimeur(userID) {
    const res: AxiosResponse = await axios.get(`${API_BACK}/imprimeur/${userID}`);
    return res.data;
  }
};
