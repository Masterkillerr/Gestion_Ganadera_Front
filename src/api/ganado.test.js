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
  getLotes, createLote,
  getFincas, createFinca,
  apiAlimentacion, apiProduccion,
  getResumenProduccion,
  getMovimientosRecientes, getMovimientos, getMovimientoById,
  createMovimiento, updateMovimiento, deleteMovimiento,
  getEventosRecientes, getProximosPartos,
  getReproducciones, getReproduccionById,
  createReproduccion, updateReproduccion, deleteReproduccion,
  getPartos, getPartosByReproduccion,
  createParto, updateParto, deleteParto,
  getProducciones, updateProduccion,
  apiEventos, apiTratamientos, apiVacunaciones,
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
describe('Catálogos', () => {
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
// Producción
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
// Error handling — all functions reject when api call fails
// ====================================================================
describe('Error handling', () => {
  it('propagates API errors', async () => {
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
});
