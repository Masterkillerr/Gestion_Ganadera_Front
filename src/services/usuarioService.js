import api from './api';

const usuarioService = {
  // Get all usuarios
  getAll: async () => {
    const response = await api.get('/api/usuario');
    return response.data;
  },

  // Get usuario by ID
  getById: async (id) => {
    const response = await api.get(`/api/usuario/${id}`);
    return response.data;
  },

  // Create new usuario
  create: async (usuarioData) => {
    const response = await api.post('/api/usuario', usuarioData);
    return response.data;
  },

  // Update usuario
  update: async (id, usuarioData) => {
    const response = await api.put(`/api/usuario/${id}`, usuarioData);
    return response.data;
  },

  // Delete usuario
  delete: async (id) => {
    const response = await api.delete(`/api/usuario/${id}`);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/api/usuario/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/api/usuario/profile', userData);
    return response.data;
  },

  // Delete own account
  deleteOwnAccount: async () => {
    const response = await api.delete('/api/usuario/profile', { headers: { 'Content-Type': 'application/json' } });
    return response.data;
  },
};

export default usuarioService;
