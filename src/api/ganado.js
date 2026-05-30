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
  const res = await api.get(`${API_URL}/raza`);
  return res.data;
};

export const createRaza = async (data) => {
  const res = await api.post(`${API_URL}/raza`, data);
  return res.data;
};

// NOTA: No existe CategoriaController en el backend. Eliminar si no se implementa.
export const getLotes = async () => {
  const res = await api.get(`${API_URL}/lote`);
  return res.data;
};

export const createLote = async (data) => {
  const res = await api.post(`${API_URL}/lote`, data);
  return res.data;
};

export const getFincas = async () => {
  const res = await api.get(`${API_URL}/finca`);
  return res.data;
};

export const createFinca = async (data) => {
  const res = await api.post(`${API_URL}/finca`, data);
  return res.data;
};

export const getVacunas = async () => {
  const res = await api.get(`${API_URL}/vacuna`);
  return res.data;
};

export const createVacuna = async (data) => {
  const res = await api.post(`${API_URL}/vacuna`, data);
  return res.data;
};

export const deleteVacuna = async (id) => {
  const res = await api.delete(`${API_URL}/vacuna/${id}`);
  return res.data;
};

export const getVacunaciones = async () => {
  const res = await api.get(`${API_URL}/vacunacion`);
  return res.data;
};

export const getAlimentos = async () => {
  const res = await api.get(`${API_URL}/alimento`);
  return res.data;
};

export const getDietas = async () => {
  const res = await api.get(`${API_URL}/dieta`);
  return res.data;
};

// --- Historial ---
const createHistorialApi = (endpoint) => ({
  getByAnimal: async (animalId) => {
    const res = await api.get(`${API_URL}/${endpoint}/animal/${animalId}`);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get(`${API_URL}/${endpoint}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`${API_URL}/${endpoint}/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post(`${API_URL}/${endpoint}`, data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`${API_URL}/${endpoint}/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`${API_URL}/${endpoint}/${id}`);
    return res.data;
  }
});

export const apiAlimentacion = createHistorialApi('alimentacion');
export const apiProduccion = createHistorialApi('produccion');

export const getResumenProduccion = async (year) => {
  const res = await api.get(`${API_URL}/produccion/resumen`, { params: { year } });
  return res.data;
};

export const getMovimientosRecientes = async () => {
  const res = await api.get(`${API_URL}/movimiento/recent`);
  return res.data;
};

export const getMovimientos = async () => {
  const res = await api.get(`${API_URL}/movimiento`);
  return res.data;
};

export const getMovimientoById = async (id) => {
  const res = await api.get(`${API_URL}/movimiento/${id}`);
  return res.data;
};

export const createMovimiento = async (data) => {
  const res = await api.post(`${API_URL}/movimiento`, data);
  return res.data;
};

export const updateMovimiento = async (id, data) => {
  const res = await api.put(`${API_URL}/movimiento/${id}`, data);
  return res.data;
};

export const deleteMovimiento = async (id) => {
  const res = await api.delete(`${API_URL}/movimiento/${id}`);
  return res.data;
};

export const getEventosRecientes = async () => {
  const res = await api.get(`${API_URL}/evento/recent`);
  return res.data;
};

export const getProximosPartos = async () => {
  const res = await api.get(`${API_URL}/reproduccion/proximos-partos`);
  return res.data;
};

// --- Reproducción CRUD ---
export const getReproducciones = async () => {
  const res = await api.get(`${API_URL}/reproduccion`);
  return res.data;
};

export const getReproduccionById = async (id) => {
  const res = await api.get(`${API_URL}/reproduccion/${id}`);
  return res.data;
};

export const createReproduccion = async (data) => {
  const res = await api.post(`${API_URL}/reproduccion`, data);
  return res.data;
};

export const updateReproduccion = async (id, data) => {
  const res = await api.put(`${API_URL}/reproduccion/${id}`, data);
  return res.data;
};

export const deleteReproduccion = async (id) => {
  const res = await api.delete(`${API_URL}/reproduccion/${id}`);
  return res.data;
};

// --- Partos CRUD ---
export const getPartos = async () => {
  const res = await api.get(`${API_URL}/parto`);
  return res.data;
};

export const getPartosByReproduccion = async (reproduccionId) => {
  const res = await api.get(`${API_URL}/parto/por-reproduccion/${reproduccionId}`);
  return res.data;
};

export const createParto = async (data) => {
  const res = await api.post(`${API_URL}/parto`, data);
  return res.data;
};

export const updateParto = async (id, data) => {
  const res = await api.put(`${API_URL}/parto/${id}`, data);
  return res.data;
};

export const deleteParto = async (id) => {
  const res = await api.delete(`${API_URL}/parto/${id}`);
  return res.data;
};

// --- Producción CRUD ---
export const getProducciones = async () => {
  const res = await api.get(`${API_URL}/produccion`);
  return res.data;
};

export const updateProduccion = async (id, data) => {
  const res = await api.put(`${API_URL}/produccion/${id}`, data);
  return res.data;
};

export const apiEventos = createHistorialApi('evento');
export const apiTratamientos = createHistorialApi('tratamiento');
export const apiVacunaciones = createHistorialApi('vacunacion');

// --- Finca CRUD (delete only; create/get via getFincas/createFinca above) ---
export const deleteFinca = async (id) => {
  const res = await api.delete(`${API_URL}/finca/${id}`);
  return res.data;
};

// --- Lote CRUD (delete only) ---
export const deleteLote = async (id) => {
  const res = await api.delete(`${API_URL}/lote/${id}`);
  return res.data;
};

// --- Alimentación list + delete (standalone, not from historial factory) ---
export const getAlimentaciones = async () => {
  const res = await api.get(`${API_URL}/alimentacion`);
  return res.data;
};

export const deleteAlimentacion = async (id) => {
  const res = await api.delete(`${API_URL}/alimentacion/${id}`);
  return res.data;
};

// --- Producción delete (standalone) ---
export const deleteProduccion = async (id) => {
  const res = await api.delete(`${API_URL}/produccion/${id}`);
  return res.data;
};
