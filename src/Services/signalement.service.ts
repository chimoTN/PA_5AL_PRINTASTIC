// src/services/signalement.service.ts
import axios, { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:3000/api/signalements';

export const signalementService = {
  /**
   * Signaler un détail de commande (par l’imprimeur en charge)
   * @param detailId L’ID du détail de commande à signaler
   * @param type Le type de signalement ('fichierEndommage' | 'illégale' | 'problématique')
   * @param userID L’ID de l’utilisateur (imprimeur) dans les headers
   */
  async signalerDetailCommande(
    detailId: number,
    type: string,
    userID: number
  ): Promise<any> {
    try {
      const res: AxiosResponse = await axios.post(
        `${API_URL}/${detailId}/signalement-une-ligne-command`,
        { type },
        {
          headers: {
            'X-User-ID': userID
          }
        }
      );
      return res.data;
    } catch (err) {
      console.error(
        `❌ Erreur lors du signalement du détail ${detailId}:`,
        err
      );
      throw new Error('Impossible de signaler cette commande.');
    }
  },

  /**
   * Récupérer tous les signalements d’un détail de commande
   * @param detailId L’ID du détail de commande
   * @param userID L’ID de l’utilisateur (imprimeur) dans les headers
   */
  async getSignalementsDetail(
    detailId: number,
    userID: number
  ): Promise<any[]> {
    try {
      const res: AxiosResponse<any[]> = await axios.get(
        `${API_URL}/${detailId}/un-signalement`,
        {
          headers: {
            'X-User-ID': userID
          }
        }
      );
      return res.data;
    } catch (err) {
      console.error(
        `❌ Erreur lors de la récupération des signalements pour le détail ${detailId}:`,
        err
      );
      throw new Error('Impossible de récupérer les signalements.');
    }
  }
};
