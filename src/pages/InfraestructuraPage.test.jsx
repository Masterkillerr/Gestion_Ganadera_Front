import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// ── Hoisted mocks ──
const { mockGetFincas, mockGetLotes, mockDeleteFinca, mockDeleteLote } = vi.hoisted(() => ({
  mockGetFincas: vi.fn(),
  mockGetLotes: vi.fn(),
  mockDeleteFinca: vi.fn(),
  mockDeleteLote: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual };
});

vi.mock('../api/ganado', () => ({
  getFincas: mockGetFincas,
  getLotes: mockGetLotes,
  deleteFinca: mockDeleteFinca,
  deleteLote: mockDeleteLote,
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

import InfraestructuraPage from './InfraestructuraPage';

const mockFincas = [
  { id: 1, nombre: 'Finca Principal', ubicacion: 'Zona Rural', extension: 100 },
  { id: 2, nombre: 'Finca Secundaria', ubicacion: 'Valle Verde', extension: 50 },
];

const mockLotes = [
  { id: 1, nombre: 'Lote A', capacidad: 30, fincaId: 1 },
  { id: 2, nombre: 'Lote B', capacidad: 20, fincaId: 1 },
  { id: 3, nombre: 'Lote C', capacidad: 15, fincaId: 2 },
];

function renderInfraestructuraPage() {
  return render(
    <MemoryRouter>
      <InfraestructuraPage />
    </MemoryRouter>
  );
}

describe('InfraestructuraPage - Botones añadir', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFincas.mockResolvedValue(mockFincas);
    mockGetLotes.mockResolvedValue(mockLotes);
  });

  it('renderiza el título y tabs', async () => {
    renderInfraestructuraPage();
    expect(await screen.findByText('Infraestructura')).toBeDefined();
    expect(screen.getByText('Fincas')).toBeDefined();
    expect(screen.getByText('Lotes')).toBeDefined();
  });

  it('carga y muestra fincas con sus lotes asociados', async () => {
    renderInfraestructuraPage();
    expect(await screen.findByText('Finca Principal')).toBeDefined();
    expect(screen.getByText('Finca Secundaria')).toBeDefined();
    // Lotes should appear under their respective fincas
    expect(screen.getByText('Lote A')).toBeDefined();
    expect(screen.getByText('Lote B')).toBeDefined();
    expect(screen.getByText('Lote C')).toBeDefined();
  });

  it('renderiza botón "+ Añadir" en tab Fincas con ruta correcta', async () => {
    renderInfraestructuraPage();
    await screen.findByText('Finca Principal');

    const addLinks = screen.getAllByText('+ Añadir');
    expect(addLinks.length).toBeGreaterThan(0);
    expect(addLinks[0]).toHaveAttribute('href', '/dashboard/finca/nuevo');
  });

  it('cambia al tab Lotes y muestra tabla', async () => {
    renderInfraestructuraPage();
    await screen.findByText('Finca Principal');

    const lotesTab = screen.getByText('Lotes');
    fireEvent.click(lotesTab);

    expect(await screen.findByText('Lote A')).toBeDefined();
  });

  it('renderiza botón "+ Añadir" en Lotes con ruta correcta', async () => {
    renderInfraestructuraPage();
    await screen.findByText('Finca Principal');

    const lotesTab = screen.getByText('Lotes');
    fireEvent.click(lotesTab);

    await screen.findByText('Lote A');

    const addLinks = screen.getAllByText('+ Añadir');
    expect(addLinks[0]).toHaveAttribute('href', '/dashboard/lote/nuevo');
  });

  it('muestra botón "Ver ficha" para cada finca', async () => {
    renderInfraestructuraPage();
    await screen.findByText('Finca Principal');

    const verFichaBtns = screen.getAllByText('Ver ficha');
    expect(verFichaBtns.length).toBe(2);
  });

  it('muestra "Sin resultados" cuando search no coincide', async () => {
    renderInfraestructuraPage();
    await screen.findByText('Finca Principal');

    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'XXXXXXXX' } });

    expect(screen.getByText('Sin resultados')).toBeDefined();
  });
});
