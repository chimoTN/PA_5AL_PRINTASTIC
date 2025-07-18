// src/services/user.service.ts
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';

export interface NewUser  {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
}

export const userService = {

  async inscription(data: NewUser): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/inscription`, data);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur API inscription:', err);
      throw new Error("Une erreur s'est produite lors de l’inscription");
    }
  },

  async inscriptionImprimeur(payload) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/imprimeur/inscription/imprimeur`,
        payload
      );
      return response.data; // { success: true, data: { requestId, status } }
    } catch (err) {
      console.error('❌ Erreur API inscription imprimeur:', err);
      throw new Error("Une erreur s'est produite lors de l’inscription");
    }
  },

  /**
   * Met à jour les infos d'un utilisateur (y compris motDePasse)
   * @param {number} id          ID de l'utilisateur à modifier
   * @param {object} data        { email, motDePasse, nom, prenom, role }
   */
  async modifierUtilisateur(id, data) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/auth/utilisateurs/${id}`,
        data,
        { withCredentials: true }  // si tu utilises des cookies de session
      );
      return response.data; // { success: true, message, utilisateur }
    } catch (err) {
      console.error('❌ Erreur API modification utilisateur:', err);
      throw new Error("Une erreur s'est produite lors de la modification du profil");
    }
  },

};
