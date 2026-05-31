import api from './api';

const usuarioService = {
  // Get all usuarios
  getAll: async () => {
    const response = await api.get('/api/usuarios');
    return response.data;
  },

  // Get usuario by ID
  getById: async (id) => {
    const response = await api.get(`/api/usuarios/${id}`);
    return response.data;
  },

  // Create new usuario
  create: async (usuarioData) => {
    const response = await api.post('/api/usuarios', usuarioData);
    return response.data;
  },

  // Update usuario
  update: async (id, usuarioData) => {
    const response = await api.put(`/api/usuarios/${id}`, usuarioData);
    return response.data;
  },

  // Delete usuario
  delete: async (id) => {
    const response = await api.delete(`/api/usuarios/${id}`);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/api/usuarios/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/api/usuarios/profile', userData);
    return response.data;
  },

  // Delete own account
  deleteOwnAccount: async () => {
    const response = await api.delete('/api/usuarios/profile', { headers: { 'Content-Type': 'application/json' } });
    return response.data;
  },
};

export default usuarioService;
