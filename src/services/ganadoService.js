import api from './api';

// Animales — delegated to animalService (single source of truth)
export {
  getAnimales,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from './animalService';

// --- Catálogos (enums / lookup tables) ---
const API_URL = '/api';

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

export const updateVacuna = async (id, data) => {
  const res = await api.put(`${API_URL}/vacuna/${id}`, data);
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

// --- Alimento CRUD ---
export const getAlimentos = async () => {
  const res = await api.get(`${API_URL}/alimento`);
  return res.data;
};

export const createAlimento = async (data) => {
  const res = await api.post(`${API_URL}/alimento`, data);
  return res.data;
};

export const updateAlimento = async (id, data) => {
  const res = await api.put(`${API_URL}/alimento/${id}`, data);
  return res.data;
};

export const deleteAlimento = async (id) => {
  const res = await api.delete(`${API_URL}/alimento/${id}`);
  return res.data;
};

// --- Dieta CRUD ---
export const getDietas = async () => {
  const res = await api.get(`${API_URL}/dieta`);
  return res.data;
};

export const createDieta = async (data) => {
  const res = await api.post(`${API_URL}/dieta`, data);
  return res.data;
};

export const updateDieta = async (id, data) => {
  const res = await api.put(`${API_URL}/dieta/${id}`, data);
  return res.data;
};

export const deleteDieta = async (id) => {
  const res = await api.delete(`${API_URL}/dieta/${id}`);
  return res.data;
};

// --- DietaAlimento CRUD ---
export const getDietaAlimentosByDieta = async (dietaId) => {
  const res = await api.get(`${API_URL}/dieta-alimento/dieta/${dietaId}`);
  return res.data;
};

export const createDietaAlimento = async (data) => {
  const res = await api.post(`${API_URL}/dieta-alimento`, data);
  return res.data;
};

export const updateDietaAlimento = async (id, data) => {
  const res = await api.put(`${API_URL}/dieta-alimento/${id}`, data);
  return res.data;
};

export const deleteDietaAlimento = async (id) => {
  const res = await api.delete(`${API_URL}/dieta-alimento/${id}`);
  return res.data;
};

// --- Metrics ---
export const getPromedioLeche = async () => {
  const res = await api.get(`${API_URL}/metrics/promedio-leche`);
  return res.data;
};

export const getVacasLactancia = async () => {
  const res = await api.get(`${API_URL}/metrics/vacas-lactancia`);
  return res.data;
};

// --- Movimiento helpers ---
export const getUltimoMovimientoByAnimal = async (animalId) => {
  const res = await api.get(`${API_URL}/movimiento/animal/${animalId}/ultimo`);
  return res.data;
};

export const checkLoteCapacity = async (loteId) => {
  const res = await api.get(`${API_URL}/movimiento/lote/${loteId}/capacity`);
  return res.data;
};

// --- Historial factory ---
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
  },
});

export const apiAlimentacion = createHistorialApi('alimentacion');
export const apiProduccion = createHistorialApi('produccion');

export const getResumenProduccion = async (year) => {
  const res = await api.get(`${API_URL}/produccion/resumen`, { params: { year } });
  return res.data;
};

// --- Movimientos CRUD ---
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

// --- Eventos ---
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

export const deleteProduccion = async (id) => {
  const res = await api.delete(`${API_URL}/produccion/${id}`);
  return res.data;
};

// --- Eventos / Tratamientos / Vacunaciones (historial factory instances) ---
export const apiEventos = createHistorialApi('evento');
export const apiTratamientos = createHistorialApi('tratamiento');
export const apiVacunaciones = createHistorialApi('vacunacion');

// --- Finca CRUD ---
export const updateFinca = async (id, data) => {
  const res = await api.put(`${API_URL}/finca/${id}`, data);
  return res.data;
};

export const deleteFinca = async (id) => {
  const res = await api.delete(`${API_URL}/finca/${id}`);
  return res.data;
};

// --- Lote CRUD ---
export const updateLote = async (id, data) => {
  const res = await api.put(`${API_URL}/lote/${id}`, data);
  return res.data;
};

export const getAnimalesByLote = async (loteId) => {
  const res = await api.get(`${API_URL}/movimiento/lote/${loteId}/animales`);
  return res.data;
};

export const deleteLote = async (id) => {
  const res = await api.delete(`${API_URL}/lote/${id}`);
  return res.data;
};

// --- Alimentación standalone (not from historial factory) ---
export const getAlimentaciones = async () => {
  const res = await api.get(`${API_URL}/alimentacion`);
  return res.data;
};

export const deleteAlimentacion = async (id) => {
  const res = await api.delete(`${API_URL}/alimentacion/${id}`);
  return res.data;
};

export const getUltimoLoteIdByAnimal = async (animalId) => {
  const res = await api.get(`${API_URL}/movimiento/animal/${animalId}/ultimo-lote-id`);
  return res.data;
};
