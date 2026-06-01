import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// ── Hoisted mocks ──
const mockGanado = vi.hoisted(() => ({
  getFincas: vi.fn(),
  getLotes: vi.fn(),
  createFinca: vi.fn(),
  updateFinca: vi.fn(),
  deleteFinca: vi.fn(),
  createLote: vi.fn(),
  updateLote: vi.fn(),
  deleteLote: vi.fn(),
  getAnimalesByLote: vi.fn(),
}));

vi.mock('../services/ganadoService', () => mockGanado);

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

import InfraestructuraPage from './InfraestructuraPage';

const mockFincas = [
  { id: 1, nombre: 'Finca Principal', ubicacion: 'Zona Rural', extension: 100 },
  { id: 2, nombre: 'Finca Secundaria', ubicacion: 'Valle Verde', extension: 50 },
];

const mockLotes = [
  { id: 1, nombre: 'Lote A', capacidadMaxima: 30, finca: { id: 1, nombre: 'Finca Principal' }, fincaId: 1, fincaNombre: 'Finca Principal' },
  { id: 2, nombre: 'Lote B', capacidadMaxima: 20, finca: { id: 1, nombre: 'Finca Principal' }, fincaId: 1, fincaNombre: 'Finca Principal' },
  { id: 3, nombre: 'Lote C', capacidadMaxima: 15, finca: { id: 2, nombre: 'Finca Secundaria' }, fincaId: 2, fincaNombre: 'Finca Secundaria' },
];

function renderInfraestructuraPage() {
  return render(
    <MemoryRouter>
      <InfraestructuraPage />
    </MemoryRouter>
  );
}

describe('InfraestructuraPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGanado.getFincas.mockResolvedValue(mockFincas);
    mockGanado.getLotes.mockResolvedValue(mockLotes);
    mockGanado.getAnimalesByLote.mockResolvedValue([]);
  });

  it('renderiza el título y tabs', async () => {
    renderInfraestructuraPage();
    expect(await screen.findByText('Infraestructura')).toBeDefined();
    expect(screen.getByText('Fincas')).toBeDefined();
    expect(screen.getByText('Lotes')).toBeDefined();
    expect(screen.getByText('Animales por Lote')).toBeDefined();
  });

  it('carga y muestra fincas con sus lotes asociados', async () => {
    renderInfraestructuraPage();
    expect(await screen.findByText('Finca Principal')).toBeDefined();
    expect(screen.getByText('Finca Secundaria')).toBeDefined();
  });

  it('cambia al tab Lotes y muestra tabla', async () => {
    renderInfraestructuraPage();
    await screen.findByText('Finca Principal');

    const lotesTab = screen.getByText('Lotes');
    fireEvent.click(lotesTab);

    expect(await screen.findByText('Lote A')).toBeDefined();
  });

  it('cambia al tab Animales por Lote', async () => {
    renderInfraestructuraPage();
    await screen.findByText('Finca Principal');

    const animalesTab = screen.getByText('Animales por Lote');
    fireEvent.click(animalesTab);

    expect(await screen.findByText('Lote A')).toBeDefined();
  });

  it('abre inline form al hacer clic en + Añadir Finca', async () => {
    renderInfraestructuraPage();
    await screen.findByText('Finca Principal');

    const addBtn = screen.getByText('+ Añadir Finca');
    fireEvent.click(addBtn);

    expect(screen.getByText('Nueva Finca')).toBeDefined();
    expect(screen.getByText('Crear')).toBeDefined();
  });

  it('muestra Sin resultados cuando search no coincide', async () => {
    renderInfraestructuraPage();
    await screen.findByText('Finca Principal');

    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'XXXXXXXX' } });

    expect(await screen.findByText('Sin resultados')).toBeDefined();
  });
});
