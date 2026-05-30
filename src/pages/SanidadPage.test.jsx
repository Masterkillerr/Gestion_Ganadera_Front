import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ── Hoisted mocks ──
const mockGanado = vi.hoisted(() => ({
  getVacunas: vi.fn(),
  createVacuna: vi.fn(),
  updateVacuna: vi.fn(),
  deleteVacuna: vi.fn(),
  getVacunaciones: vi.fn(),
  getAnimales: vi.fn(),
}));

vi.mock('../api/ganado', () => mockGanado);

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
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
    evento: { id: 1, animal: { id: 1, identificadorArete: 'AR-001', nombre: 'Vaca 1' } },
    proximaDosis: '2026-07-01',
    observacion: 'Dosis de refuerzo',
  },
];

const mockAnimales = [
  { id: 1, identificadorArete: 'AR-001', nombre: 'Vaca 1' },
  { id: 2, identificadorArete: 'AR-002', nombre: 'Toro 1' },
];

function renderSanidadPage() {
  return render(<SanidadPage />);
}

describe('SanidadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGanado.getVacunas.mockResolvedValue(mockVacunas);
    mockGanado.getVacunaciones.mockResolvedValue(mockVacunaciones);
    mockGanado.getAnimales.mockResolvedValue(mockAnimales);
  });

  it('renderiza el título y descripción', async () => {
    renderSanidadPage();
    expect(await screen.findByText('Sanidad')).toBeDefined();
    expect(screen.getByText('Control de vacunas y vacunaciones del hato')).toBeDefined();
  });

  it('carga y muestra las vacunas en el tab Vacunas', async () => {
    renderSanidadPage();
    expect(await screen.findByText('Aftosa')).toBeDefined();
    expect(screen.getByText('Brucelosis')).toBeDefined();
  });

  it('renderiza el formulario para crear nueva vacuna', async () => {
    renderSanidadPage();
    await screen.findByText('Aftosa');
    expect(screen.getByPlaceholderText('Nombre de la vacuna')).toBeDefined();
    expect(screen.getByText('Añadir')).toBeDefined();
  });

  it('envía crear vacuna al hacer submit del formulario', async () => {
    mockGanado.createVacuna.mockResolvedValue({ id: 3, nombre: 'Nueva Vacuna' });
    renderSanidadPage();
    await screen.findByText('Aftosa');

    const input = screen.getByPlaceholderText('Nombre de la vacuna');
    fireEvent.change(input, { target: { value: 'Nueva Vacuna' } });

    const addBtn = screen.getByText('Añadir');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(mockGanado.createVacuna).toHaveBeenCalledWith({ nombre: 'Nueva Vacuna' });
    });
  });

  it('muestra botones Editar y Eliminar para cada vacuna', async () => {
    renderSanidadPage();
    await screen.findByText('Aftosa');

    const editBtns = screen.getAllByText('Editar');
    const deleteBtns = screen.getAllByText('Eliminar');
    expect(editBtns.length).toBe(2);
    expect(deleteBtns.length).toBe(2);
  });

  it('cambia al tab de Vacunaciones', async () => {
    renderSanidadPage();
    await screen.findByText('Aftosa');

    const vacunacionesTab = screen.getByText('Vacunaciones');
    fireEvent.click(vacunacionesTab);

    expect(await screen.findByText('AR-001')).toBeDefined();
    expect(screen.getByText('Dosis de refuerzo')).toBeDefined();
  });

  it('muestra botón + Nueva Vacunación en el tab vacunaciones', async () => {
    renderSanidadPage();
    await screen.findByText('Aftosa');

    const vacunacionesTab = screen.getByText('Vacunaciones');
    fireEvent.click(vacunacionesTab);

    expect(await screen.findByText('+ Nueva Vacunación')).toBeDefined();
  });

  it('no llama a createVacuna si el nombre está vacío', async () => {
    renderSanidadPage();
    await screen.findByText('Aftosa');

    const addBtn = screen.getByText('Añadir');
    fireEvent.click(addBtn);

    expect(mockGanado.createVacuna).not.toHaveBeenCalled();
  });
});
