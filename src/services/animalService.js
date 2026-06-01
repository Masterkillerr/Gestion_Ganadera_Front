import api from './api';

// Updated to support pagination parameters
// backend returns Page<AnimalDTO> — we return the full Page object
// and consumers extract .content as needed
export const getAnimales = async (page = 0, size = 20, filters = {}) => {
  const params = new URLSearchParams({ page, size });
  if (filters.search) params.append('search', filters.search);
  if (filters.estado) params.append('estado', filters.estado);
  if (filters.sexo) params.append('sexo', filters.sexo);
  const response = await api.get(`/api/animal?${params}`);
  return response.data;
};

export const getAnimalById = async (id) => {
  const response = await api.get(`/api/animal/${id}`);
  return response.data;
};

export const createAnimal = async (animalData) => {
  const response = await api.post('/api/animal', animalData);
  return response.data;
};

export const updateAnimal = async (id, animalData) => {
  const response = await api.put(`/api/animal/${id}`, animalData);
  return response.data;
};

export const deleteAnimal = async (id) => {
  const response = await api.delete(`/api/animal/${id}`);
  return response.data;
};

// NOTA: Este endpoint usa MovimientoController (origen único de la relación animal-lote)
export const getAnimalesByLote = async (loteId) => {
  const response = await api.get(`/api/movimiento/lote/${loteId}/animales`);
  return response.data;
};

// NOTA: No existe endpoint backend para animales por finca directamente.
// Usar getAnimalesByLote iterando sobre los lotes de la finca.
export const getAnimalesByFinca = async (fincaId) => {
  const response = await api.get(`/api/animal/finca/${fincaId}`);
  return response.data;
};

// Default export (object-based service) for backward compatibility via services/index.js
const animalService = {
  getAll: getAnimales,
  getById: getAnimalById,
  create: createAnimal,
  update: updateAnimal,
  delete: deleteAnimal,
  getByLote: getAnimalesByLote,
  getByFinca: getAnimalesByFinca,
};

export default animalService;
