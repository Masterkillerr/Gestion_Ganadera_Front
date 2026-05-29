import api from '../services/api';

// Animales — delegated to animalService (single source of truth)
export {
  getAnimales,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from '../services/animalService';

// --- Catálogos ---
const API_URL = '/api';
// --- Catálogos de catálogos (enums) ---
export const getSexos = async () => {
  const res = await api.get(`${API_URL}/sexo`);
  return res.data;
};

export const getEstadosAnimal = async () => {
  const res = await api.get(`${API_URL}/estado-animal`);
  return res.data;
};

export const getTiposMovimiento = async () => {
  const res = await api.get(`${API_URL}/tipo-movimiento`);
  return res.data;
};

export const getTiposEvento = async () => {
  const res = await api.get(`${API_URL}/tipo-evento`);
  return res.data;
};

export const getTiposReproduccion = async () => {
  const res = await api.get(`${API_URL}/tipo-reproduccion`);
  return res.data;
};

export const getResultadosReproduccion = async () => {
  const res = await api.get(`${API_URL}/resultado-reproduccion`);
  return res.data;
};

export const getTurnosProduccion = async () => {
  const res = await api.get(`${API_URL}/turno-produccion`);
  return res.data;
};

export const getRazas = async () => {
  const res = await api.get(`${API_URL}/razas`);
  return res.data;
};

export const createRaza = async (data) => {
  const res = await api.post(`${API_URL}/razas`, data);
  return res.data;
};

export const getCategorias = async () => {
  const res = await api.get(`${API_URL}/categorias`);
  return res.data;
};

export const createCategoria = async (data) => {
  const res = await api.post(`${API_URL}/categorias`, data);
  return res.data;
};

export const getLotes = async () => {
  const res = await api.get(`${API_URL}/lotes`);
  return res.data;
};

export const createLote = async (data) => {
  const res = await api.post(`${API_URL}/lotes`, data);
  return res.data;
};

export const getFincas = async () => {
  const res = await api.get(`${API_URL}/fincas`);
  return res.data;
};

export const createFinca = async (data) => {
  const res = await api.post(`${API_URL}/fincas`, data);
  return res.data;
};

// --- Historial ---
const createHistorialApi = (endpoint) => ({
  getByAnimal: async (animalId) => {
    const res = await api.get(`${API_URL}/${endpoint}/animal/${animalId}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post(`${API_URL}/${endpoint}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`${API_URL}/${endpoint}/${id}`);
    return res.data;
  }
});

export const apiAlimentacion = createHistorialApi('alimentaciones');
export const apiProduccion = createHistorialApi('producciones');

export const getResumenProduccion = async (year) => {
  const res = await api.get(`${API_URL}/producciones/resumen`, { params: { year } });
  return res.data;
};

export const getMovimientosRecientes = async () => {
  const res = await api.get(`${API_URL}/movimientos/recent`);
  return res.data;
};

export const getMovimientos = async () => {
  const res = await api.get(`${API_URL}/movimientos`);
  return res.data;
};

export const getMovimientoById = async (id) => {
  const res = await api.get(`${API_URL}/movimientos/${id}`);
  return res.data;
};

export const createMovimiento = async (data) => {
  const res = await api.post(`${API_URL}/movimientos`, data);
  return res.data;
};

export const updateMovimiento = async (id, data) => {
  const res = await api.put(`${API_URL}/movimientos/${id}`, data);
  return res.data;
};

export const deleteMovimiento = async (id) => {
  const res = await api.delete(`${API_URL}/movimientos/${id}`);
  return res.data;
};

export const getEventosRecientes = async () => {
  const res = await api.get(`${API_URL}/eventos/recent`);
  return res.data;
};

export const getProximosPartos = async () => {
  const res = await api.get(`${API_URL}/reproducciones/proximos-partos`);
  return res.data;
};

// --- Reproducción CRUD ---
export const getReproducciones = async () => {
  const res = await api.get(`${API_URL}/reproducciones`);
  return res.data;
};

export const getReproduccionById = async (id) => {
  const res = await api.get(`${API_URL}/reproducciones/${id}`);
  return res.data;
};

export const createReproduccion = async (data) => {
  const res = await api.post(`${API_URL}/reproducciones`, data);
  return res.data;
};

export const updateReproduccion = async (id, data) => {
  const res = await api.put(`${API_URL}/reproducciones/${id}`, data);
  return res.data;
};

export const deleteReproduccion = async (id) => {
  const res = await api.delete(`${API_URL}/reproducciones/${id}`);
  return res.data;
};

// --- Partos CRUD ---
export const getPartos = async () => {
  const res = await api.get(`${API_URL}/partos`);
  return res.data;
};

export const getPartosByReproduccion = async (reproduccionId) => {
  const res = await api.get(`${API_URL}/partos/por-reproduccion/${reproduccionId}`);
  return res.data;
};

export const createParto = async (data) => {
  const res = await api.post(`${API_URL}/partos`, data);
  return res.data;
};

export const updateParto = async (id, data) => {
  const res = await api.put(`${API_URL}/partos/${id}`, data);
  return res.data;
};

export const deleteParto = async (id) => {
  const res = await api.delete(`${API_URL}/partos/${id}`);
  return res.data;
};

// --- Producción CRUD ---
export const getProducciones = async () => {
  const res = await api.get(`${API_URL}/producciones`);
  return res.data;
};

export const updateProduccion = async (id, data) => {
  const res = await api.put(`${API_URL}/producciones/${id}`, data);
  return res.data;
};

export const apiEventos = createHistorialApi('eventos');
export const apiTratamientos = createHistorialApi('tratamientos');
export const apiVacunaciones = createHistorialApi('vacunaciones');
