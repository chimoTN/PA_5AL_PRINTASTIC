// src/services/reclamation.service.js
import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const reclamationService = {
  /**
   * Crée une réclamation
   * @param {{ detailCommandeId: number; libelle: string; description: string; imageFile?: File }} payload
   */
  
  async createReclamation(payload: { detailCommandeId: number; libelle: string; description: string; imageFile?: File }) {
    try {
      const res = await axios.post(`${API_BASE_URL}/reclamations/faire-une-reclamation`, payload);
      return res.data;
    } catch (err) {
      console.error('❌ Erreur API création réclamation :', err);
      throw new Error("Impossible de créer la réclamation");
    }
  },

  /**
   * Récupère une réclamation par son ID
   * @param {number} id
   */
  async getReclamationById(id: number) {
    try {
      const res = await axios.get(`${API_BASE_URL}/reclamations/${id}`);
      return res.data; // { success: true, data: { ... } }
    } catch (err) {
      console.error(`❌ Erreur API récupération réclamation #${id} :`, err);
      throw new Error("Impossible de récupérer la réclamation");
    }
  },

  /**
   * Récupère toutes les réclamations
   */
  async getAllReclamations() {
    try {
      const res = await axios.get(`${API_BASE_URL}/reclamations/getAll`);
      return res.data;
    } catch (err) {
      console.error('❌ Erreur API récupération réclamations :', err);
      throw new Error("Impossible de récupérer les réclamations");
    }
  },

  /**
   * Clôture une réclamation sans remboursement
   * @param {number} id
   */
  async closeReclamation(id) {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/reclamations/close/${id}`
      );
      return res.data;
    } catch (err) {
      console.error(`❌ Erreur API clôture réclamation #${id} :`, err);
      throw new Error("Impossible de clôturer la réclamation");
    }
  },

  /**
   * Rembourse et clôture une réclamation
   * @param {number} id
   */
  async refundReclamation(id) {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/reclamations/refund/${id}`
      );
      return res.data;
    } catch (err) {
      console.error(`❌ Erreur API remboursement réclamation #${id} :`, err);
      throw new Error("Impossible de rembourser la réclamation");
    }
  },
};

export default reclamationService;
