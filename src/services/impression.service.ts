// src/services/impression.service.ts
import axios, { AxiosResponse } from 'axios';

import { API_BASE_URL } from '@/config/env';

export const impressionService = {
  /**
   * Récupère tous les détails de commandes non attribués à un imprimeur
   */
  async getNonAttribuees() {
    const res: AxiosResponse = await axios.get(`${API_BASE_URL}/impression/non-attribuees`);
    return res.data;
  },

  /**
   * Permet à un imprimeur de prendre en charge plusieurs détails de commande
   * @param idsDetailCommandes Liste des ID de détails à prendre
   * @param userID L’ID de l’imprimeur envoyé dans le body (et non les headers)
   */
  async prendreCommandes(idsDetailCommandes, userID) {
    const res: AxiosResponse = await axios.post(
      `${API_BASE_URL}/impression/prendre`,
      { idsDetailCommandes, userID } // ✅ envoi dans le body
    );
    return res.data;
  },

  
  /**
   * Récupère les détails de commandes déjà acceptés par l’imprimeur
   * @param userID L’ID de l’imprimeur
   */
  async getCommandesImprimeur(userID) {
    const res: AxiosResponse = await axios.get(`${API_BASE_URL}/impression/imprimeur/${userID}`);
    return res.data;
  }
};
