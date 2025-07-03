import axios from 'axios';

const API_URL = 'http://localhost:3000/api/commandes';


export const commandeService = {

  async getMesCommandes(userID: number) {
    try {
      const res = await axios.get(`${API_URL}/mes-commandes`, {
        headers: {
          'X-User-ID': userID
        }
      });
      return res.data;
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des commandes:', err);
      throw new Error('Impossible de récupérer vos commandes.');
    }
  },

  async getCommandeById(id: number, userID: number) {
    try {
      const res = await axios.get(`${API_URL}/${id}`, {
        headers: {
          'X-User-ID': userID
        }
      });
      return res.data;
    } catch (err) {
      console.error(`❌ Erreur lors de la récupération de la commande ${id}:`, err);
      throw new Error("La commande n'a pas pu être récupérée.");
    }
  },

  async changerStatutDetailCommande(idDetailCommande: number, statut: string) {
    try {
      const res = await axios.put(`${API_URL}/detail/${idDetailCommande}/statut`, { statut });
      return res.data;
    } catch (err) {
      console.error(`❌ Erreur lors de la mise à jour du statut du détail ${idDetailCommande}:`, err);
      throw new Error("Impossible de mettre à jour le statut.");
    }
  }
};
