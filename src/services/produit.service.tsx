import axios from 'axios';
import { API_BASE_URL } from '@/config/env';

export const produitService = {
  getAll: async () => {
    console.log(`get all de tes mort : ${API_BASE_URL}/produits`)
    const response = await axios.get(`${API_BASE_URL}/produits`);
    return response.data.products;
  },

  getById: async (id: string | number) => {
    const response = await axios.get(`${API_BASE_URL}/produits/${id}`);
    return response.data;
  },

  create: async (produit: any) => {
    const response = await axios.post(`${API_BASE_URL}/produits`, produit);
    return response.data;
  },

  update: async (id: string | number, produit: any) => {
    const response = await axios.put(`${API_BASE_URL}/produits/${id}`, produit);
    return response.data;
  },

  delete: async (id: string | number) => {
    const response = await axios.delete(`${API_BASE_URL}/produits/${id}`);
    return response.data;
  },
};
