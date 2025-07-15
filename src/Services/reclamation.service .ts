// src/services/reclamation.service.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/reclamations';

const reclamationService = {
  /**
   * Crée une réclamation
   * @param {{ detailCommandeId: number; libelle: string; description: string; imageFile?: File }} payload
   */

  async createReclamation(payload) {
    try {
      const res = await axios.post(`${API_URL}/faire-une-reclamation`, payload);
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
  async getReclamationById(id) {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
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
      const res = await axios.get(API_URL);
      return res.data; 
    } catch (err) {
      console.error('❌ Erreur API récupération réclamations :', err);
      throw new Error("Impossible de récupérer les réclamations");
    }
  },

};

export default reclamationService;
