// src/services/signalement.service.ts
import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/config/env';

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
        `${API_BASE_URL}/signalements/${detailId}/signalement-une-ligne-command`,
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
        `${API_BASE_URL}/signalements/${detailId}/un-signalement`,
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
  },

  async getAllSignalements(): Promise<any[]> {
    try {
      const res: AxiosResponse<any[]> = await axios.get(`${API_BASE_URL}/signalements/getAllSignalement`);
      return res.data;
    } catch (err) {
      console.error(`❌ Erreur lors de la récupération de tous les signalements :`, err);
      throw new Error("Impossible de récupérer les signalements.");
    }
  },

    /**
   * Annuler un détail de commande
   * @param detailId L’ID du détail de commande à annuler
   */
  async annulerCommande(detailId: number): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/signalements/${detailId}/annuler-commande`
      );
    } catch (err) {
      console.error(`❌ Erreur lors de l'annulation du détail ${detailId} :`, err);
      throw new Error("Impossible d'annuler cette commande.");
    }
  },

  /**
   * Clore un signalement
   * @param signalementId L’ID du signalement à clore
   */
  async cloreSignalement(signalementId: number): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/signalements/${signalementId}/clore-signalement`
      );
    } catch (err) {
      console.error(`❌ Erreur lors de la clôture du signalement ${signalementId} :`, err);
      throw new Error('Impossible de clore ce signalement.');
    }
  },

  /**
   * Suspendre un utilisateur
   * @param userId L’ID de l’utilisateur à suspendre
   */
  async suspendreUtilisateur(userId: number): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/signalements/${userId}/suspendre-utilisateur`
      );
    } catch (err) {
      console.error(`❌ Erreur lors de la suspension de l'utilisateur ${userId} :`, err);
      throw new Error('Impossible de suspendre cet utilisateur.');
    }
  },
};
