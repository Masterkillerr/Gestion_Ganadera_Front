import api from './api';

// Named exports — single source of truth for animal API
export const getAnimales = async () => {
  const response = await api.get('/api/animal');
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

export const getAnimalesByLote = async (loteId) => {
  const response = await api.get(`/api/animal/lote/${loteId}`);
  return response.data;
};

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
