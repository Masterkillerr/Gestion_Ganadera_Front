import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ── Hoisted mocks ──
const mocks = vi.hoisted(() => ({
  getVacunas: vi.fn(),
  createVacuna: vi.fn(),
  updateVacuna: vi.fn(),
  deleteVacuna: vi.fn(),
  getVacunaciones: vi.fn(),
  getAnimales: vi.fn(),
  getTiposEvento: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Vacunación' }]),
  apiVacunaciones: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));

vi.mock('../api/ganado', () => mocks);

const mockApi = vi.hoisted(() => ({
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  get: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: mockApi,
}));

const stableToast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));

vi.mock('../context/ToastContext', () => ({
  useToast: () => stableToast,
}));

vi.mock('../components/Modal', () => ({
  ConfirmModal: ({ isOpen, onConfirm, onClose, title, message }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <p>{title}</p>
        <p>{message}</p>
        <button data-testid="confirm-yes" onClick={onConfirm}>Confirmar</button>
        <button data-testid="confirm-no" onClick={onClose}>Cancelar</button>
      </div>
    ) : null,
  InlineFormModal: ({ isOpen, onClose, title, children }) =>
    isOpen ? (
      <div data-testid="inline-form-modal">
        <h3>{title}</h3>
        {children}
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
  ErrorModal: ({ isOpen, onClose, error }) =>
    isOpen ? (
      <div data-testid="error-modal">
        <p>{error}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

vi.mock('../components/LoadingSpinner', () => ({
  LoadingSpinner: ({ fullPage, message }) =>
    fullPage ? <div data-testid="loading-spinner">{message}</div> : null,
}));

import SanidadPage from './SanidadPage';

const mockVacunas = [
  { id: 1, nombre: 'Aftosa' },
  { id: 2, nombre: 'Brucelosis' },
];

const mockVacunaciones = [
  {
    id: 1,
    vacuna: { id: 1, nombre: 'Aftosa' },
    evento: { id: 10, animal: { id: 1, identificadorArete: 'AR-001', nombre: 'Vaca 1' } },
    proximaDosis: '2026-07-01',
    observacion: 'Dosis de refuerzo',
  },
];

const mockAnimales = [
  { id: 1, identificadorArete: 'AR-001', nombre: 'Vaca 1' },
  { id: 2, identificadorArete: 'AR-002', nombre: 'Toro 1' },
];

function renderPage() {
  return render(<SanidadPage />);
}

describe('SanidadPage — Vacuna CRUD integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getVacunas.mockResolvedValue(mockVacunas);
    mocks.getVacunaciones.mockResolvedValue(mockVacunaciones);
    mocks.getAnimales.mockResolvedValue(mockAnimales);
  });

  it('vacuna: crear → editar inline → eliminar con confirmación', async () => {
    mocks.createVacuna.mockResolvedValue({ id: 3, nombre: 'Triple' });
    mocks.updateVacuna.mockResolvedValue({});
    mocks.deleteVacuna.mockResolvedValue({});

    renderPage();
    await screen.findByText('Aftosa');

    // ── Crear ──
    // Set mock BEFORE click so loadData() gets updated data
    mocks.getVacunas.mockResolvedValue([
      ...mockVacunas,
      { id: 3, nombre: 'Triple' },
    ]);

    const input = screen.getByPlaceholderText('Nombre de la vacuna');
    fireEvent.change(input, { target: { value: 'Triple' } });
    fireEvent.click(screen.getByText('Añadir'));

    await waitFor(() => {
      expect(mocks.createVacuna).toHaveBeenCalledWith({ nombre: 'Triple' });
    });

    // ── Editar inline ──
    await screen.findByText('Triple');

    const editBtns = screen.getAllByText('Editar');
    fireEvent.click(editBtns[0]); // Edit Aftosa
    await screen.findByDisplayValue('Aftosa');

    const editInput = screen.getByDisplayValue('Aftosa');
    fireEvent.change(editInput, { target: { value: 'Aftosa Plus' } });

    // Set mock BEFORE click so loadData() gets updated data after edit
    mocks.getVacunas.mockResolvedValue([
      { id: 2, nombre: 'Brucelosis' },
      { id: 3, nombre: 'Triple' },
    ]);

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(mocks.updateVacuna).toHaveBeenCalledWith(1, { nombre: 'Aftosa Plus' });
    });

    // ── Eliminar ──
    // Wait for component to re-render before clicking delete
    await screen.findByText('Brucelosis');

    fireEvent.click(screen.getAllByText('Eliminar')[0]);
    await screen.findByText('Confirmar acción');
    expect(screen.getByText('¿Eliminar esta vacuna del catálogo?')).toBeDefined();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(mocks.deleteVacuna).toHaveBeenCalledWith(2);
    });
  });
});

describe('SanidadPage — Vacunación CRUD integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getVacunas.mockResolvedValue(mockVacunas);
    mocks.getVacunaciones.mockResolvedValue(mockVacunaciones);
    mocks.getAnimales.mockResolvedValue(mockAnimales);
    mockApi.post.mockReset();
  });

  it('vacunación: crear (con evento) → editar → eliminar', async () => {
    mockApi.post
      .mockResolvedValueOnce({ data: { id: 20 } }) // evento created
      .mockResolvedValueOnce({ data: { id: 5 } });  // vacunacion created

    mocks.apiVacunaciones.update.mockResolvedValue({});
    mocks.apiVacunaciones.delete.mockResolvedValue({});

    renderPage();
    await screen.findByText('Aftosa');

    // Switch to Vacunaciones tab
    fireEvent.click(screen.getByText('Vacunaciones'));
    await screen.findByText('AR-001');

    // ── Crear ──
    fireEvent.click(screen.getByText('+ Nueva Vacunación'));
    await screen.findByText('Nueva Vacunación');

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { name: 'animalId', value: '2' } }); // Animal: Toro 1
    fireEvent.change(selects[1], { target: { name: 'vacunaId', value: '1' } }); // Vacuna: Aftosa

    fireEvent.click(screen.getByText('Registrar'));

    await waitFor(() => {
      // Should create evento first
      expect(mockApi.post).toHaveBeenNthCalledWith(1, '/api/evento', {
        animalId: 2,
        tipoEventoId: 1,
        descripcion: 'Vacunación',
      });
      // Then create vacunacion
      expect(mockApi.post).toHaveBeenNthCalledWith(2, '/api/vacunacion', {
        eventoId: 20,
        vacunaId: 1,
        proximaDosis: null,
        observacion: null,
      });
    });

    // ── Editar ──
    const updatedVacs = [
      ...mockVacunaciones,
      {
        id: 5,
        vacuna: { id: 1, nombre: 'Aftosa' },
        evento: { id: 20, animal: { id: 2, identificadorArete: 'AR-002', nombre: 'Toro 1' } },
        proximaDosis: null,
        observacion: null,
      },
    ];
    mocks.getVacunaciones.mockResolvedValue(updatedVacs);

    const editBtns = screen.getAllByText('Editar');
    fireEvent.click(editBtns[0]); // Edit first one (AR-001)
    await screen.findByText('Editar Vacunación');

    const fechaInput = screen.getByDisplayValue('2026-07-01');
    fireEvent.change(fechaInput, { target: { name: 'proximaDosis', value: '2026-08-01' } });

    fireEvent.click(screen.getByText('Guardar Cambios'));

    await waitFor(() => {
      expect(mocks.apiVacunaciones.update).toHaveBeenCalledWith(1, {
        eventoId: 10,
        vacunaId: 1,
        proximaDosis: '2026-08-01',
        observacion: 'Dosis de refuerzo',
      });
    });

    // ── Eliminar ──
    mocks.getVacunaciones.mockResolvedValue(updatedVacs);

    fireEvent.click(screen.getAllByText('Eliminar')[0]);
    await screen.findByText('Confirmar acción');
    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(mocks.apiVacunaciones.delete).toHaveBeenCalledWith(1);
    });
  });

  it('vacunación: muestra error si falta animal o vacuna', async () => {
    renderPage();
    await screen.findByText('Aftosa');
    fireEvent.click(screen.getByText('Vacunaciones'));
    await screen.findByText('AR-001');

    fireEvent.click(screen.getByText('+ Nueva Vacunación'));
    await screen.findByText('Nueva Vacunación');

    // Submit without selecting required fields
    const form = document.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });
    expect(screen.getByText('Seleccione animal y vacuna')).toBeDefined();
    expect(mockApi.post).not.toHaveBeenCalled();
  });
});
