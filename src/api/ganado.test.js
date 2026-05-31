import { vi, describe, it, expect, beforeEach } from 'vitest';

// ── Mock api module using vi.hoisted (required so mocks exist before vi.mock is hoisted) ──
const { mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
  },
}));

// Import AFTER mock so hoisting works
import {
  getRazas, createRaza,
  getLotes, createLote, updateLote, deleteLote,
  getFincas, createFinca, updateFinca, deleteFinca,
  getSexos, getEstadosAnimal, getTiposMovimiento, getTiposEvento,
  getTiposReproduccion, getResultadosReproduccion, getTurnosProduccion,
  apiAlimentacion, apiProduccion,
  getResumenProduccion,
  getMovimientosRecientes, getMovimientos, getMovimientoById,
  createMovimiento, updateMovimiento, deleteMovimiento,
  getEventosRecientes, getProximosPartos,
  getReproducciones, getReproduccionById,
  createReproduccion, updateReproduccion, deleteReproduccion,
  getPartos, getPartosByReproduccion,
  createParto, updateParto, deleteParto,
  getProducciones, updateProduccion, deleteProduccion,
  getAlimentaciones, deleteAlimentacion,
  apiEventos, apiTratamientos, apiVacunaciones,
  getVacunas, createVacuna, updateVacuna, deleteVacuna,
  getVacunaciones,
  getAlimentos, createAlimento, updateAlimento, deleteAlimento,
  getDietas, createDieta, updateDieta, deleteDieta,
  getDietaAlimentosByDieta, createDietaAlimento, updateDietaAlimento, deleteDietaAlimento,
  getUltimoMovimientoByAnimal, checkLoteCapacity,
  getAnimalesByLote,
} from './ganado';

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Helpers ──

function mockResolved(data) {
  return { data };
}

function expectGet(url) {
  expect(mockGet).toHaveBeenCalledWith(url);
}

function expectPost(url, body) {
  expect(mockPost).toHaveBeenCalledWith(url, body);
}

function expectPut(url, body) {
  expect(mockPut).toHaveBeenCalledWith(url, body);
}

function expectDelete(url) {
  expect(mockDelete).toHaveBeenCalledWith(url);
}

// ====================================================================
// Catálogos
// ====================================================================
describe('Catálogos de catálogos (enums)', () => {
  describe('getRazas', () => {
    it('calls GET /api/raza and returns data', async () => {
      mockGet.mockResolvedValue(mockResolved(['raza1', 'raza2']));
      const result = await getRazas();
      expectGet('/api/raza');
      expect(result).toEqual(['raza1', 'raza2']);
    });
  });

  describe('createRaza', () => {
    it('calls POST /api/raza with data', async () => {
      const data = { nombre: 'Holstein' };
      mockPost.mockResolvedValue(mockResolved({ id: 1, ...data }));
      const result = await createRaza(data);
      expectPost('/api/raza', data);
      expect(result).toEqual({ id: 1, nombre: 'Holstein' });
    });
  });

  describe('getLotes', () => {
    it('calls GET /api/lote', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getLotes();
      expectGet('/api/lote');
    });
  });

  describe('createLote', () => {
    it('calls POST /api/lote', async () => {
      mockPost.mockResolvedValue(mockResolved({ id: 1 }));
      await createLote({ nombre: 'Lote A' });
      expectPost('/api/lote', { nombre: 'Lote A' });
    });
  });

  describe('updateLote', () => {
    it('calls PUT /api/lote/{id}', async () => {
      const payload = { capacidadMaxima: 50 };
      mockPut.mockResolvedValue(mockResolved({ id: 1, ...payload }));
      await updateLote(1, payload);
      expectPut('/api/lote/1', payload);
    });
  });

  describe('deleteLote', () => {
    it('calls DELETE /api/lote/{id}', async () => {
      mockDelete.mockResolvedValue(mockResolved({}));
      await deleteLote(4);
      expectDelete('/api/lote/4');
    });
  });

  describe('getFincas', () => {
    it('calls GET /api/finca', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getFincas();
      expectGet('/api/finca');
    });
  });

  describe('createFinca', () => {
    it('calls POST /api/finca', async () => {
      mockPost.mockResolvedValue(mockResolved({ id: 1 }));
      await createFinca({ nombre: 'Finca 1' });
      expectPost('/api/finca', { nombre: 'Finca 1' });
    });
  });

  describe('updateFinca', () => {
    it('calls PUT /api/finca/{id}', async () => {
      const payload = { extension: 200 };
      mockPut.mockResolvedValue(mockResolved({ id: 1, ...payload }));
      await updateFinca(1, payload);
      expectPut('/api/finca/1', payload);
    });
  });

  describe('deleteFinca', () => {
    it('calls DELETE /api/finca/{id}', async () => {
      mockDelete.mockResolvedValue(mockResolved({}));
      await deleteFinca(5);
      expectDelete('/api/finca/5');
    });
  });

  describe('getSexos', () => {
    it('calls GET /api/sexo', async () => {
      mockGet.mockResolvedValue(mockResolved([{ id: 1, nombre: 'Macho' }]));
      const result = await getSexos();
      expectGet('/api/sexo');
      expect(result).toHaveLength(1);
    });
  });

  describe('getEstadosAnimal', () => {
    it('calls GET /api/estado-animal', async () => {
      mockGet.mockResolvedValue(mockResolved([{ id: 1, nombre: 'Sano' }]));
      const result = await getEstadosAnimal();
      expectGet('/api/estado-animal');
      expect(result[0].nombre).toBe('Sano');
    });
  });

  describe('getTiposMovimiento', () => {
    it('calls GET /api/tipo-movimiento', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getTiposMovimiento();
      expectGet('/api/tipo-movimiento');
    });
  });

  describe('getTiposEvento', () => {
    it('calls GET /api/tipo-evento', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getTiposEvento();
      expectGet('/api/tipo-evento');
    });
  });

  describe('getTiposReproduccion', () => {
    it('calls GET /api/tipo-reproduccion', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getTiposReproduccion();
      expectGet('/api/tipo-reproduccion');
    });
  });

  describe('getResultadosReproduccion', () => {
    it('calls GET /api/resultado-reproduccion', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getResultadosReproduccion();
      expectGet('/api/resultado-reproduccion');
    });
  });

  describe('getTurnosProduccion', () => {
    it('calls GET /api/turno-produccion', async () => {
      mockGet.mockResolvedValue(mockResolved([{ id: 1, nombre: 'Mañana' }]));
      const result = await getTurnosProduccion();
      expectGet('/api/turno-produccion');
      expect(result[0].nombre).toBe('Mañana');
    });
  });

  describe('getAnimalesByLote', () => {
    it('calls GET /api/movimiento/lote/{id}/animales', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getAnimalesByLote(3);
      expectGet('/api/movimiento/lote/3/animales');
    });
  });
});

// ====================================================================
// createHistorialApi factory
// ====================================================================
describe('createHistorialApi factory', () => {
  const factoryApis = [
    { name: 'apiAlimentacion',  endpoint: 'alimentacion',  obj: apiAlimentacion },
    { name: 'apiProduccion',    endpoint: 'produccion',    obj: apiProduccion },
    { name: 'apiTratamientos',  endpoint: 'tratamiento',    obj: apiTratamientos },
    { name: 'apiVacunaciones',  endpoint: 'vacunacion',    obj: apiVacunaciones },
    { name: 'apiEventos',       endpoint: 'evento',         obj: apiEventos },
  ];

  factoryApis.forEach(({ name, endpoint, obj }) => {
    describe(name, () => {
      it('getByAnimal calls GET /api/' + endpoint + '/animal/{id}', async () => {
        mockGet.mockResolvedValue(mockResolved([{ id: 1 }]));
        const result = await obj.getByAnimal(5);
        expectGet(`/api/${endpoint}/animal/5`);
        expect(result).toEqual([{ id: 1 }]);
      });

      it('create calls POST /api/' + endpoint, async () => {
        const payload = { animalId: 5, cantidad: 10 };
        mockPost.mockResolvedValue(mockResolved({ id: 1 }));
        const result = await obj.create(payload);
        expectPost(`/api/${endpoint}`, payload);
        expect(result).toEqual({ id: 1 });
      });

      it('delete calls DELETE /api/' + endpoint + '/{id}', async () => {
        mockDelete.mockResolvedValue(mockResolved({}));
        await obj.delete(3);
        expectDelete(`/api/${endpoint}/3`);
      });
    });
  });
});

// ====================================================================
// Vacunas y Vacunaciones
// ====================================================================
describe('Vacunas y Vacunaciones', () => {
  it('getVacunas calls GET /api/vacuna', async () => {
    mockGet.mockResolvedValue(mockResolved([{ id: 1, nombre: 'Aftosa' }]));
    const result = await getVacunas();
    expectGet('/api/vacuna');
    expect(result[0].nombre).toBe('Aftosa');
  });

  it('createVacuna calls POST /api/vacuna', async () => {
    const payload = { nombre: 'Brucelosis' };
    mockPost.mockResolvedValue(mockResolved({ id: 2, ...payload }));
    const result = await createVacuna(payload);
    expectPost('/api/vacuna', payload);
    expect(result.nombre).toBe('Brucelosis');
  });

  it('updateVacuna calls PUT /api/vacuna/{id}', async () => {
    const payload = { nombre: 'Aftosa Refuerzo' };
    mockPut.mockResolvedValue(mockResolved({ id: 1, ...payload }));
    const result = await updateVacuna(1, payload);
    expectPut('/api/vacuna/1', payload);
    expect(result.nombre).toBe('Aftosa Refuerzo');
  });

  it('deleteVacuna calls DELETE /api/vacuna/{id}', async () => {
    mockDelete.mockResolvedValue(mockResolved({}));
    await deleteVacuna(3);
    expectDelete('/api/vacuna/3');
  });

  it('getVacunaciones calls GET /api/vacunacion', async () => {
    mockGet.mockResolvedValue(mockResolved([]));
    await getVacunaciones();
    expectGet('/api/vacunacion');
  });
});

// ====================================================================
// Alimentos, Dietas y DietaAlimento
// ====================================================================
describe('Alimentos y Dietas', () => {
  it('getAlimentos calls GET /api/alimento', async () => {
    mockGet.mockResolvedValue(mockResolved([{ id: 1, nombre: 'Maíz' }]));
    const result = await getAlimentos();
    expectGet('/api/alimento');
    expect(result[0].nombre).toBe('Maíz');
  });

  it('createAlimento calls POST /api/alimento', async () => {
    const payload = { nombre: 'Pasto' };
    mockPost.mockResolvedValue(mockResolved({ id: 2, ...payload }));
    const result = await createAlimento(payload);
    expectPost('/api/alimento', payload);
    expect(result.nombre).toBe('Pasto');
  });

  it('updateAlimento calls PUT /api/alimento/{id}', async () => {
    const payload = { nombre: 'Maíz Amarillo' };
    mockPut.mockResolvedValue(mockResolved({ id: 1, ...payload }));
    await updateAlimento(1, payload);
    expectPut('/api/alimento/1', payload);
  });

  it('deleteAlimento calls DELETE /api/alimento/{id}', async () => {
    mockDelete.mockResolvedValue(mockResolved({}));
    await deleteAlimento(5);
    expectDelete('/api/alimento/5');
  });

  it('getDietas calls GET /api/dieta', async () => {
    mockGet.mockResolvedValue(mockResolved([{ id: 1, nombre: 'Engorde' }]));
    const result = await getDietas();
    expectGet('/api/dieta');
    expect(result[0].nombre).toBe('Engorde');
  });

  it('createDieta calls POST /api/dieta', async () => {
    const payload = { nombre: 'Lactancia' };
    mockPost.mockResolvedValue(mockResolved({ id: 3, ...payload }));
    const result = await createDieta(payload);
    expectPost('/api/dieta', payload);
    expect(result.nombre).toBe('Lactancia');
  });

  it('updateDieta calls PUT /api/dieta/{id}', async () => {
    mockPut.mockResolvedValue(mockResolved({}));
    await updateDieta(2, { nombre: 'Destete' });
    expectPut('/api/dieta/2', { nombre: 'Destete' });
  });

  it('deleteDieta calls DELETE /api/dieta/{id}', async () => {
    mockDelete.mockResolvedValue(mockResolved({}));
    await deleteDieta(4);
    expectDelete('/api/dieta/4');
  });

  it('getDietaAlimentosByDieta calls GET /api/dieta-alimento/dieta/{id}', async () => {
    mockGet.mockResolvedValue(mockResolved([]));
    await getDietaAlimentosByDieta(1);
    expectGet('/api/dieta-alimento/dieta/1');
  });

  it('createDietaAlimento calls POST /api/dieta-alimento', async () => {
    const payload = { dietaId: 1, alimentoId: 2, cantidad: 10 };
    mockPost.mockResolvedValue(mockResolved({ id: 1, ...payload }));
    const result = await createDietaAlimento(payload);
    expectPost('/api/dieta-alimento', payload);
    expect(result.cantidad).toBe(10);
  });

  it('updateDietaAlimento calls PUT /api/dieta-alimento/{id}', async () => {
    mockPut.mockResolvedValue(mockResolved({}));
    await updateDietaAlimento(1, { cantidad: 20 });
    expectPut('/api/dieta-alimento/1', { cantidad: 20 });
  });

  it('deleteDietaAlimento calls DELETE /api/dieta-alimento/{id}', async () => {
    mockDelete.mockResolvedValue(mockResolved({}));
    await deleteDietaAlimento(2);
    expectDelete('/api/dieta-alimento/2');
  });
});

// ====================================================================
// Alimentación (standalone)
// ====================================================================
describe('Alimentación (standalone)', () => {
  it('getAlimentaciones calls GET /api/alimentacion', async () => {
    mockGet.mockResolvedValue(mockResolved([{ id: 1 }]));
    const result = await getAlimentaciones();
    expectGet('/api/alimentacion');
    expect(result).toHaveLength(1);
  });

  it('deleteAlimentacion calls DELETE /api/alimentacion/{id}', async () => {
    mockDelete.mockResolvedValue(mockResolved({}));
    await deleteAlimentacion(3);
    expectDelete('/api/alimentacion/3');
  });
});

// ====================================================================
// Producción (extended)
// ====================================================================
describe('Producción', () => {
  describe('getResumenProduccion', () => {
    it('calls GET /api/produccion/resumen with year param', async () => {
      mockGet.mockResolvedValue(mockResolved([{ month: 1, totalLitros: 500 }]));
      const result = await getResumenProduccion(2026);
      expect(mockGet).toHaveBeenCalledWith('/api/produccion/resumen', { params: { year: 2026 } });
      expect(result).toEqual([{ month: 1, totalLitros: 500 }]);
    });
  });

  describe('getProducciones', () => {
    it('calls GET /api/produccion', async () => {
      mockGet.mockResolvedValue(mockResolved([{ id: 1 }]));
      const result = await getProducciones();
      expectGet('/api/produccion');
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('updateProduccion', () => {
    it('calls PUT /api/produccion/{id} with data', async () => {
      const payload = { litros: 200 };
      mockPut.mockResolvedValue(mockResolved({ id: 5, ...payload }));
      const result = await updateProduccion(5, payload);
      expectPut('/api/produccion/5', payload);
      expect(result).toEqual({ id: 5, litros: 200 });
    });
  });

  describe('deleteProduccion', () => {
    it('calls DELETE /api/produccion/{id}', async () => {
      mockDelete.mockResolvedValue(mockResolved({}));
      await deleteProduccion(7);
      expectDelete('/api/produccion/7');
    });
  });
});

// ====================================================================
// Movimientos
// ====================================================================
describe('Movimientos', () => {
  describe('getMovimientosRecientes', () => {
    it('calls GET /api/movimiento/recent', async () => {
      mockGet.mockResolvedValue(mockResolved([{ id: 1 }]));
      await getMovimientosRecientes();
      expectGet('/api/movimiento/recent');
    });
  });

  describe('getMovimientos', () => {
    it('calls GET /api/movimiento', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getMovimientos();
      expectGet('/api/movimiento');
    });
  });

  describe('getMovimientoById', () => {
    it('calls GET /api/movimiento/{id}', async () => {
      mockGet.mockResolvedValue(mockResolved({ id: 3 }));
      const result = await getMovimientoById(3);
      expectGet('/api/movimiento/3');
      expect(result).toEqual({ id: 3 });
    });
  });

  describe('createMovimiento', () => {
    it('calls POST /api/movimiento', async () => {
      const payload = { animalId: 1, tipo: 'ingreso' };
      mockPost.mockResolvedValue(mockResolved({ id: 1, ...payload }));
      const result = await createMovimiento(payload);
      expectPost('/api/movimiento', payload);
      expect(result).toEqual({ id: 1, animalId: 1, tipo: 'ingreso' });
    });
  });

  describe('updateMovimiento', () => {
    it('calls PUT /api/movimiento/{id}', async () => {
      const payload = { tipo: 'egreso' };
      mockPut.mockResolvedValue(mockResolved({ id: 2, ...payload }));
      const result = await updateMovimiento(2, payload);
      expectPut('/api/movimiento/2', payload);
      expect(result).toEqual({ id: 2, tipo: 'egreso' });
    });
  });

  describe('deleteMovimiento', () => {
    it('calls DELETE /api/movimiento/{id}', async () => {
      mockDelete.mockResolvedValue(mockResolved({}));
      await deleteMovimiento(4);
      expectDelete('/api/movimiento/4');
    });
  });
});

// ====================================================================
// Eventos / Partos próximos
// ====================================================================
describe('Eventos', () => {
  describe('getEventosRecientes', () => {
    it('calls GET /api/evento/recent', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getEventosRecientes();
      expectGet('/api/evento/recent');
    });
  });

  describe('getProximosPartos', () => {
    it('calls GET /api/reproduccion/proximos-partos', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getProximosPartos();
      expectGet('/api/reproduccion/proximos-partos');
    });
  });
});

// ====================================================================
// Reproducción CRUD
// ====================================================================
describe('Reproducción CRUD', () => {
  it('getReproducciones calls GET /api/reproduccion', async () => {
    mockGet.mockResolvedValue(mockResolved([{ id: 1 }]));
    const result = await getReproducciones();
    expectGet('/api/reproduccion');
    expect(result).toHaveLength(1);
  });

  it('getReproduccionById calls GET /api/reproduccion/{id}', async () => {
    mockGet.mockResolvedValue(mockResolved({ id: 3 }));
    const result = await getReproduccionById(3);
    expectGet('/api/reproduccion/3');
    expect(result.id).toBe(3);
  });

  it('createReproduccion calls POST /api/reproduccion', async () => {
    const payload = { vacaId: 1, toroId: 2 };
    mockPost.mockResolvedValue(mockResolved({ id: 1, ...payload }));
    const result = await createReproduccion(payload);
    expectPost('/api/reproduccion', payload);
    expect(result.id).toBe(1);
  });

  it('updateReproduccion calls PUT /api/reproduccion/{id}', async () => {
    const payload = { resultado: 'Exitoso' };
    mockPut.mockResolvedValue(mockResolved({ id: 5, ...payload }));
    const result = await updateReproduccion(5, payload);
    expectPut('/api/reproduccion/5', payload);
    expect(result.resultado).toBe('Exitoso');
  });

  it('deleteReproduccion calls DELETE /api/reproduccion/{id}', async () => {
    mockDelete.mockResolvedValue(mockResolved({}));
    await deleteReproduccion(7);
    expectDelete('/api/reproduccion/7');
  });
});

// ====================================================================
// Partos CRUD
// ====================================================================
describe('Partos CRUD', () => {
  it('getPartos calls GET /api/parto', async () => {
    mockGet.mockResolvedValue(mockResolved([]));
    await getPartos();
    expectGet('/api/parto');
  });

  it('getPartosByReproduccion calls GET /api/parto/por-reproduccion/{id}', async () => {
    mockGet.mockResolvedValue(mockResolved([]));
    await getPartosByReproduccion(3);
    expectGet('/api/parto/por-reproduccion/3');
  });

  it('createParto calls POST /api/parto', async () => {
    const payload = { reproduccionId: 1, cantidadCrias: 2 };
    mockPost.mockResolvedValue(mockResolved({ id: 1, ...payload }));
    const result = await createParto(payload);
    expectPost('/api/parto', payload);
    expect(result.cantidadCrias).toBe(2);
  });

  it('updateParto calls PUT /api/parto/{id}', async () => {
    const payload = { observaciones: 'Normal' };
    mockPut.mockResolvedValue(mockResolved({ id: 2, ...payload }));
    const result = await updateParto(2, payload);
    expectPut('/api/parto/2', payload);
    expect(result.observaciones).toBe('Normal');
  });

  it('deleteParto calls DELETE /api/parto/{id}', async () => {
    mockDelete.mockResolvedValue(mockResolved({}));
    await deleteParto(4);
    expectDelete('/api/parto/4');
  });
});

// ====================================================================
// checkLoteCapacity & getUltimoMovimientoByAnimal
// ====================================================================
describe('checkLoteCapacity & getUltimoMovimientoByAnimal', () => {
  it('checkLoteCapacity calls GET /api/movimiento/lote/{id}/capacity', async () => {
    mockGet.mockResolvedValue(mockResolved({ hasSpace: true, occupancy: 5, capacidadMaxima: 30 }));
    const result = await checkLoteCapacity(1);
    expectGet('/api/movimiento/lote/1/capacity');
    expect(result.hasSpace).toBe(true);
    expect(result.occupancy).toBe(5);
  });

  it('getUltimoMovimientoByAnimal calls GET /api/movimiento/animal/{id}/ultimo', async () => {
    mockGet.mockResolvedValue(mockResolved({ id: 10, loteDestinoNombre: 'Lote A' }));
    const result = await getUltimoMovimientoByAnimal(3);
    expectGet('/api/movimiento/animal/3/ultimo');
    expect(result.loteDestinoNombre).toBe('Lote A');
  });
});

// ====================================================================
// Error handling — all functions reject when api call fails
// ====================================================================
describe('Error handling', () => {
  it('propagates API errors from GET', async () => {
    const error = new Error('Network error');
    mockGet.mockRejectedValue(error);
    await expect(getMovimientos()).rejects.toThrow('Network error');
  });

  it('propagates errors from POST', async () => {
    const error = new Error('Bad request');
    mockPost.mockRejectedValue(error);
    await expect(createMovimiento({})).rejects.toThrow('Bad request');
  });

  it('propagates errors from PUT', async () => {
    const error = new Error('Forbidden');
    mockPut.mockRejectedValue(error);
    await expect(updateMovimiento(1, {})).rejects.toThrow('Forbidden');
  });

  it('propagates errors from DELETE', async () => {
    const error = new Error('Not found');
    mockDelete.mockRejectedValue(error);
    await expect(deleteMovimiento(99)).rejects.toThrow('Not found');
  });

  it('propagates errors from checkLoteCapacity', async () => {
    const error = new Error('Lote not found');
    mockGet.mockRejectedValue(error);
    await expect(checkLoteCapacity(999)).rejects.toThrow('Lote not found');
  });

  it('propagates errors from createDietaAlimento', async () => {
    const error = new Error('Invalid reference');
    mockPost.mockRejectedValue(error);
    await expect(createDietaAlimento({})).rejects.toThrow('Invalid reference');
  });

  it('propagates errors from deleteAlimento', async () => {
    const error = new Error('In use');
    mockDelete.mockRejectedValue(error);
    await expect(deleteAlimento(1)).rejects.toThrow('In use');
  });
});
