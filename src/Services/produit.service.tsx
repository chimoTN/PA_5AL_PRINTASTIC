import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/produits';

export const produitService = {
  getAll: async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data.products;
  },

  getById: async (id: string | number) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  create: async (produit: any) => {
    const response = await axios.post(API_BASE_URL, produit);
    return response.data;
  },

  update: async (id: string | number, produit: any) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, produit);
    return response.data;
  },

  delete: async (id: string | number) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },
};
