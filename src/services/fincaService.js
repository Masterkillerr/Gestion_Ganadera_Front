import api from './api';

const fincaService = {
  // Get all fincas
  getAll: async () => {
    const response = await api.get('/api/finca');
    return response.data;
  },

  // Get finca by ID
  getById: async (id) => {
    const response = await api.get(`/api/finca/${id}`);
    return response.data;
  },

  // Create new finca
  create: async (fincaData) => {
    const response = await api.post('/api/finca', fincaData);
    return response.data;
  },

  // Update finca
  update: async (id, fincaData) => {
    const response = await api.put(`/api/finca/${id}`, fincaData);
    return response.data;
  },

  // Delete finca
  delete: async (id) => {
    const response = await api.delete(`/api/finca/${id}`);
    return response.data;
  },

  // Get finca statistics
  getStats: async (id) => {
    const response = await api.get(`/api/finca/${id}/stats`);
    return response.data;
  },
};

export default fincaService;
