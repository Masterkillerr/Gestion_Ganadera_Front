import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';

// ── Hoisted mocks ──
const mocks = vi.hoisted(() => ({
  getAnimalById: vi.fn(),
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

vi.mock('../../api/ganado', () => mocks);

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

// Mock window.prompt for the quick-add flows
const mockPrompt = vi.fn();

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
    window.prompt = mockPrompt;
    mockPrompt.mockReset();
    mocks.getAnimalById.mockResolvedValue(mockAnimal);
    // By default, all history is empty
    mocks.apiAlimentacion.getByAnimal.mockResolvedValue([]);
    mocks.apiProduccion.getByAnimal.mockResolvedValue([]);
    mocks.apiEventos.getByAnimal.mockResolvedValue([]);
    mocks.apiTratamientos.getByAnimal.mockResolvedValue([]);
    mocks.apiVacunaciones.getByAnimal.mockResolvedValue([]);
  });

  it('quick-add: crear registro de alimentación y verlo en la tabla', async () => {
    mocks.apiAlimentacion.create.mockResolvedValue({ id: 10, fecha: '2026-06-01', cantidad: 15 });

    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    // Mock prompt to return a value
    mockPrompt.mockReturnValue('15');

    // Click "Añadir Registro" in Alimentación tab
    fireEvent.click(screen.getByText('Añadir Registro'));

    await waitFor(() => {
      expect(mockPrompt).toHaveBeenCalledWith('Cantidad (kg):');
      expect(mocks.apiAlimentacion.create).toHaveBeenCalledWith({
        animalId: 1,
        fecha: expect.any(String),
        cantidad: 15,
      });
    });
  });

  it('quick-add: crear registro de producción', async () => {
    mocks.apiProduccion.create.mockResolvedValue({ id: 20, fecha: '2026-06-01', litros: 30 });

    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    // Switch to Producción tab
    fireEvent.click(screen.getByText('Producción'));
    await screen.findByText('Litros');

    mockPrompt.mockReturnValue('30');
    fireEvent.click(screen.getByText('Añadir Registro'));

    await waitFor(() => {
      expect(mockPrompt).toHaveBeenCalledWith('Litros:');
      expect(mocks.apiProduccion.create).toHaveBeenCalledWith({
        animalId: 1,
        fecha: expect.any(String),
        litros: 30,
      });
    });
  });

  it('quick-add: crear evento', async () => {
    mocks.apiEventos.create.mockResolvedValue({ id: 30, fecha: '2026-06-01', descripcion: 'Vacunación' });

    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    // Switch to Eventos tab
    fireEvent.click(screen.getByText('Eventos'));

    mockPrompt.mockReturnValue('Vacunación de refuerzo');
    fireEvent.click(screen.getByText('Añadir Evento'));

    await waitFor(() => {
      expect(mockPrompt).toHaveBeenCalledWith('Descripción del evento:');
      expect(mocks.apiEventos.create).toHaveBeenCalledWith({
        animalId: 1,
        descripcion: 'Vacunación de refuerzo',
      });
    });
  });

  it('quick-add: no crea registro si prompt se cancela (null)', async () => {
    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    mockPrompt.mockReturnValue(null);

    fireEvent.click(screen.getByText('Añadir Registro'));

    // Should NOT have called create
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
    window.prompt = mockPrompt;
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
    await screen.findByText(/AR-001/);

    // "Sin registros" should NOT appear
    await waitFor(() => {
      expect(screen.queryByText('Sin registros')).toBeNull();
    });

    // Click Eliminar on first alimentacion record
    const deleteBtns = screen.getAllByText('Eliminar');
    fireEvent.click(deleteBtns[0]);

    await screen.findByText('Eliminar registro');
    expect(screen.getByText('¿Eliminar este registro?')).toBeDefined();

    // Confirm delete
    mocks.apiAlimentacion.getByAnimal.mockResolvedValue([
      { id: 11, fecha: '2026-05-15', cantidad: 20 },
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
    await screen.findByText(/AR-001/);

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
    await screen.findByText(/AR-001/);

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
    await screen.findByText(/AR-001/);

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
