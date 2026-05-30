import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ── Hoisted mocks ──
const { mockGetVacunas, mockCreateVacuna, mockDeleteVacuna, mockGetVacunaciones } = vi.hoisted(() => ({
  mockGetVacunas: vi.fn(),
  mockCreateVacuna: vi.fn(),
  mockDeleteVacuna: vi.fn(),
  mockGetVacunaciones: vi.fn(),
}));

vi.mock('../api/ganado', () => ({
  getVacunas: mockGetVacunas,
  createVacuna: mockCreateVacuna,
  deleteVacuna: mockDeleteVacuna,
  getVacunaciones: mockGetVacunaciones,
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
  DetailModal: ({ isOpen, onClose, title, fields }) =>
    isOpen ? (
      <div data-testid="detail-modal">
        <p>{title}</p>
        {fields.map((f, i) => <p key={i}>{f.label}: {f.value}</p>)}
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
    vacuna: { nombre: 'Aftosa' },
    evento: { animal: { identificadorArete: 'AR-001', nombre: 'Vaca 1' } },
    proximaDosis: '2026-07-01',
    observacion: 'Dosis de refuerzo',
  },
];

function renderSanidadPage() {
  return render(<SanidadPage />);
}

describe('SanidadPage - Botones crear/añadir', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVacunas.mockResolvedValue(mockVacunas);
    mockGetVacunaciones.mockResolvedValue(mockVacunaciones);
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

  it('renderiza el formulario para crear nueva vacuna con input y botón Añadir', async () => {
    renderSanidadPage();
    await screen.findByText('Aftosa');

    const input = screen.getByPlaceholderText('Nombre de la vacuna');
    expect(input).toBeDefined();

    const addBtn = screen.getByText('Añadir');
    expect(addBtn).toBeDefined();
  });

  it('envía crear vacuna al hacer submit del formulario', async () => {
    mockCreateVacuna.mockResolvedValue({ id: 3, nombre: 'Nueva Vacuna' });
    renderSanidadPage();
    await screen.findByText('Aftosa');

    const input = screen.getByPlaceholderText('Nombre de la vacuna');
    fireEvent.change(input, { target: { value: 'Nueva Vacuna' } });

    const addBtn = screen.getByText('Añadir');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(mockCreateVacuna).toHaveBeenCalledWith({ nombre: 'Nueva Vacuna' });
    });
  });

  it('muestra el botón Eliminar para cada vacuna', async () => {
    renderSanidadPage();
    await screen.findByText('Aftosa');

    const deleteBtns = screen.getAllByText('Eliminar');
    expect(deleteBtns.length).toBe(2); // Una por cada vacuna
  });

  it('carga y cambia al tab de Vacunaciones', async () => {
    renderSanidadPage();
    await screen.findByText('Aftosa');

    const vacunacionesTab = screen.getByText('Vacunaciones');
    fireEvent.click(vacunacionesTab);

    expect(await screen.findByText('AR-001')).toBeDefined();
    expect(screen.getByText('Dosis de refuerzo')).toBeDefined();
  });

  it('muestra botón "Ver ficha" en vacunaciones', async () => {
    renderSanidadPage();
    await screen.findByText('Aftosa');

    const vacunacionesTab = screen.getByText('Vacunaciones');
    fireEvent.click(vacunacionesTab);

    expect(await screen.findByText('AR-001')).toBeDefined();
    const verFichaBtns = screen.getAllByText('Ver ficha');
    expect(verFichaBtns.length).toBeGreaterThan(0);
  });

  it('no llama a createVacuna si el nombre está vacío', async () => {
    renderSanidadPage();
    await screen.findByText('Aftosa');

    const addBtn = screen.getByText('Añadir');
    fireEvent.click(addBtn);

    expect(mockCreateVacuna).not.toHaveBeenCalled();
  });
});
