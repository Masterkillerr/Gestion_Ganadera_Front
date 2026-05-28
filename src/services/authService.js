import api from './api';

const authService = {
  // Register
  register: async (userData) => {
    const response = await api.post('/api/auth/register', {
      nombre: userData.nombre,
      email: userData.email,
      password: userData.password,
      recaptchaToken: userData.recaptchaToken
    });
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Mapear los datos que vienen del backend (nombre, email, rol) al formato que usa el frontend
      const userObj = {
        name: response.data.nombre || 'Usuario',
        email: response.data.email,
        role: response.data.rol
      };
      localStorage.setItem('user', JSON.stringify(userObj));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Check if user has role
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    if (!user?.role) return false;
    if (Array.isArray(user.role)) return user.role.includes(role);
    return user.role === role;
  },
};

export default authService;
