import api from './api';

const loteService = {
  // Get all lotes
  getAll: async () => {
    const response = await api.get('/api/lote');
    return response.data;
  },

  // Get lote by ID
  getById: async (id) => {
    const response = await api.get(`/api/lote/${id}`);
    return response.data;
  },

  // Create new lote
  create: async (loteData) => {
    const response = await api.post('/api/lote', loteData);
    return response.data;
  },

  // Update lote
  update: async (id, loteData) => {
    const response = await api.put(`/api/lote/${id}`, loteData);
    return response.data;
  },

  // Delete lote
  delete: async (id) => {
    const response = await api.delete(`/api/lote/${id}`);
    return response.data;
  },

  // Get lotes by finca
  getByFinca: async (fincaId) => {
    const response = await api.get(`/api/lote/finca/${fincaId}`);
    return response.data;
  },
};

export default loteService;
