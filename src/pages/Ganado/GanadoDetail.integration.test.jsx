import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';

// ── Hoisted mocks ──
const mocks = vi.hoisted(() => ({
  getAnimalById: vi.fn(),
  getDietas: vi.fn().mockResolvedValue([]),
  getTurnosProduccion: vi.fn().mockResolvedValue([]),
  apiAlimentacion: { getByAnimal: vi.fn(), create: vi.fn(), delete: vi.fn() },
  apiProduccion:   { getByAnimal: vi.fn(), create: vi.fn(), delete: vi.fn() },
  apiEventos:      { getByAnimal: vi.fn(), create: vi.fn(), delete: vi.fn() },
  apiTratamientos: { getByAnimal: vi.fn(), create: vi.fn(), delete: vi.fn() },
  apiVacunaciones: { getByAnimal: vi.fn(), create: vi.fn(), delete: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual };
});

vi.mock('../../services/ganadoService', () => ({
  ...mocks,
  getUltimoLoteIdByAnimal: vi.fn().mockResolvedValue('No asignado'),
}));

const stableToast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
const stableLoading = vi.hoisted(() => ({ showLoading: vi.fn(), hideLoading: vi.fn() }));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => stableToast,
}));

vi.mock('../../context/LoadingContext', () => ({
  useLoading: () => stableLoading,
}));

vi.mock('../../components/LoadingSpinner', () => ({
  LoadingSpinner: ({ fullPage, message }) =>
    fullPage ? <div data-testid="loading-spinner">{message}</div> : <div data-testid="loading-spinner-inline">{message}</div>,
}));

vi.mock('../../components/Modal', () => ({
  ConfirmModal: ({ isOpen, onConfirm, onClose, title, message, confirmText }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <p>{title}</p>
        <p>{message}</p>
        <button data-testid="confirm-yes" onClick={onConfirm}>{confirmText || 'Eliminar'}</button>
        <button data-testid="confirm-no" onClick={onClose}>Cancelar</button>
      </div>
    ) : null,
}));

// Mock window.prompt is no longer used by the component (uses modal forms)

import GanadoDetail from './GanadoDetail';

const mockAnimal = {
  id: 1,
  identificadorArete: 'AR-001',
  nombre: 'Vaca Test',
  sexo: 'HEMBRA',
  razaNombre: 'Holstein',
  categoriaNombre: 'Vaca',
  loteNombre: 'Lote A',
  fincaNombre: 'Finca 1',
  pesoNacimiento: 40,
  pesoActual: 450,
  fotoUrl: null,
  madreId: null,
  padreId: null,
  madreArete: null,
  padreArete: null,
};

function renderGanadoDetail() {
  return render(
    <MemoryRouter initialEntries={['/dashboard/ganado/1']}>
      <Routes>
        <Route path="/dashboard/ganado/:id" element={<GanadoDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('GanadoDetail — Quick-Add CRUD integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAnimalById.mockResolvedValue(mockAnimal);
    // By default, all history is empty
    mocks.apiAlimentacion.getByAnimal.mockResolvedValue([]);
    mocks.apiProduccion.getByAnimal.mockResolvedValue([]);
    mocks.apiEventos.getByAnimal.mockResolvedValue([]);
    mocks.apiTratamientos.getByAnimal.mockResolvedValue([]);
    mocks.apiVacunaciones.getByAnimal.mockResolvedValue([]);
  });

  it('quick-add: crear registro de alimentación y verlo en la tabla', async () => {
    mocks.apiAlimentacion.create.mockResolvedValue({ id: 10, fecha: '2026-06-01', animalId: 1 });

    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    // Click "+ Nueva Alimentación" in Alimentación tab
    fireEvent.click(screen.getByText('+ Nueva Alimentación'));

    // Modal should open
    await screen.findByText('Nueva Alimentación');

    // Fill form - add observacion
    const obsInput = screen.getByPlaceholderText('Notas...');
    fireEvent.change(obsInput, { target: { value: 'Pasto fresco' } });

    // Submit
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(mocks.apiAlimentacion.create).toHaveBeenCalledWith({
        animalId: 1,
        fecha: expect.any(String),
        dietaId: null,
        observacion: 'Pasto fresco',
      });
    });
  });

  it('quick-add: crear registro de producción', async () => {
    mocks.apiProduccion.create.mockResolvedValue({ id: 20, fecha: '2026-06-01', litros: 30 });

    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    // Switch to Producción tab
    fireEvent.click(screen.getByText('Producción'));
    await screen.findByText('Historial de Producción');

    // Click "+ Nueva Producción"
    fireEvent.click(screen.getByText('+ Nueva Producción'));

    // Modal should open
    await screen.findByText('Nueva Producción');

    // Fill form
    const litrosInput = screen.getByPlaceholderText('0.0');
    fireEvent.change(litrosInput, { target: { value: '30' } });

    // Submit
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(mocks.apiProduccion.create).toHaveBeenCalledWith({
        animalId: 1,
        fecha: expect.any(String),
        litros: 30,
        turnoProduccionId: null,
      });
    });
  });

  it('quick-add: crear evento', async () => {
    mocks.apiEventos.create.mockResolvedValue({ id: 30, fecha: '2026-06-01', descripcion: 'Vacunación' });

    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    // Switch to Eventos tab
    fireEvent.click(screen.getByText('Eventos'));
    await screen.findByText('Registro de Eventos');

    // Click "Añadir Evento"
    fireEvent.click(screen.getByText('Añadir Evento'));

    // Modal should open
    await screen.findByText('Nuevo Evento');

    // Fill form
    const descInput = screen.getByPlaceholderText('Describe lo ocurrido...');
    fireEvent.change(descInput, { target: { value: 'Vacunación de refuerzo' } });

    // Submit
    fireEvent.click(screen.getByText('Guardar Evento'));

    await waitFor(() => {
      expect(mocks.apiEventos.create).toHaveBeenCalledWith({
        animalId: 1,
        tipoEventoId: 10,
        fecha: expect.any(String),
        descripcion: 'Vacunación de refuerzo',
      });
    });
  });

  it('quick-add: cierra modal sin crear al cancelar', async () => {
    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    fireEvent.click(screen.getByText('+ Nueva Alimentación'));
    await screen.findByText('Nueva Alimentación');

    // Click Cancelar
    const cancelBtns = screen.getAllByText('Cancelar');
    fireEvent.click(cancelBtns[0]);

    await waitFor(() => {
      expect(screen.queryByText('Nueva Alimentación')).toBeNull();
    });
    expect(mocks.apiAlimentacion.create).not.toHaveBeenCalled();
  });
});

describe('GanadoDetail — Delete historial integración', () => {
  const mockHistorial = {
    alimentacion: [
      { id: 10, fecha: '2026-05-01', cantidad: 15 },
      { id: 11, fecha: '2026-05-15', cantidad: 20 },
    ],
    produccion: [
      { id: 20, fecha: '2026-05-01', litros: 25 },
    ],
    eventos: [
      { id: 30, fecha: new Date().toISOString(), descripcion: 'Revisión' },
    ],
    tratamientos: [],
    vacunaciones: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAnimalById.mockResolvedValue(mockAnimal);
    mocks.apiAlimentacion.getByAnimal.mockResolvedValue(mockHistorial.alimentacion);
    mocks.apiProduccion.getByAnimal.mockResolvedValue(mockHistorial.produccion);
    mocks.apiEventos.getByAnimal.mockResolvedValue(mockHistorial.eventos);
    mocks.apiTratamientos.getByAnimal.mockResolvedValue(mockHistorial.tratamientos);
    mocks.apiVacunaciones.getByAnimal.mockResolvedValue(mockHistorial.vacunaciones);
  });

  it('eliminar registro de alimentación con confirmación', async () => {
    mocks.apiAlimentacion.delete.mockResolvedValue({});

    renderGanadoDetail();
    await screen.findAllByText(/AR-001/);

    // "Sin registros de alimentación" should NOT appear
    await waitFor(() => {
      expect(screen.queryByText('Sin registros de alimentación')).toBeNull();
    });

    // Click Eliminar on first alimentacion record
    const deleteBtns = screen.getAllByText('Eliminar');
    fireEvent.click(deleteBtns[0]);

    await screen.findByText('Eliminar registro');
    expect(screen.getByText('¿Eliminar este registro?')).toBeDefined();

    // Confirm delete
    mocks.apiAlimentacion.getByAnimal.mockResolvedValue([
      { id: 11, fecha: '2026-05-15', animalId: 1 },
    ]);

    fireEvent.click(screen.getByTestId('confirm-yes'));

    await waitFor(() => {
      expect(mocks.apiAlimentacion.delete).toHaveBeenCalledWith(10);
    });
    // Data reloaded
    expect(mocks.apiAlimentacion.getByAnimal).toHaveBeenCalledTimes(2);
  });

  it('elimina registro de producción', async () => {
    mocks.apiProduccion.delete.mockResolvedValue({});

    renderGanadoDetail();
    await screen.findAllByText(/AR-001/);

    // Switch to Producción tab
    fireEvent.click(screen.getByText('Producción'));
    await screen.findByText('25');

    fireEvent.click(screen.getByText('Eliminar'));

    await screen.findByText('Eliminar registro');

    mocks.apiProduccion.getByAnimal.mockResolvedValue([]);

    fireEvent.click(screen.getByTestId('confirm-yes'));

    await waitFor(() => {
      expect(mocks.apiProduccion.delete).toHaveBeenCalledWith(20);
    });
  });

  it('elimina registro de evento', async () => {
    mocks.apiEventos.delete.mockResolvedValue({});

    renderGanadoDetail();
    await screen.findAllByText(/AR-001/);

    // Switch to Eventos tab
    fireEvent.click(screen.getByText('Eventos'));
    await screen.findByText('Revisión');

    fireEvent.click(screen.getByText('Eliminar'));

    await screen.findByText('Eliminar registro');

    mocks.apiEventos.getByAnimal.mockResolvedValue([]);

    fireEvent.click(screen.getByTestId('confirm-yes'));

    await waitFor(() => {
      expect(mocks.apiEventos.delete).toHaveBeenCalledWith(30);
    });
  });

  it('cancela eliminación y no borra nada', async () => {
    mocks.apiAlimentacion.delete.mockResolvedValue({});

    renderGanadoDetail();
    await screen.findAllByText(/AR-001/);

    fireEvent.click(screen.getAllByText('Eliminar')[0]);
    await screen.findByText('Eliminar registro');

    // Click Cancelar via testid
    fireEvent.click(screen.getByTestId('confirm-no'));

    await waitFor(() => {
      expect(screen.queryByText('Eliminar registro')).toBeNull();
    });
    expect(mocks.apiAlimentacion.delete).not.toHaveBeenCalled();
  });
});
