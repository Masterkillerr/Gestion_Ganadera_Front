import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// ── Hoisted mocks ──
const { mockGetProducciones, mockGetAlimentaciones, mockDeleteProduccion, mockDeleteAlimentacion } = vi.hoisted(() => ({
  mockGetProducciones: vi.fn(),
  mockGetAlimentaciones: vi.fn(),
  mockDeleteProduccion: vi.fn(),
  mockDeleteAlimentacion: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual };
});

vi.mock('../api/ganado', () => ({
  getProducciones: mockGetProducciones,
  getAlimentaciones: mockGetAlimentaciones,
  deleteProduccion: mockDeleteProduccion,
  deleteAlimentacion: mockDeleteAlimentacion,
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}));

vi.mock('../components/LoadingSpinner', () => ({
  LoadingSpinner: ({ fullPage, message }) =>
    fullPage ? <div data-testid="loading-spinner">{message}</div> : null,
}));

import OperacionesPage from './OperacionesPage';

const mockProducciones = [
  { id: 1, cantidadLeche: '25', turno: 'Mañana', fecha: '2026-05-30', animalArete: 'AR-001' },
  { id: 2, cantidadLeche: '30', turno: 'Tarde', fecha: '2026-05-30', animalArete: 'AR-002' },
];

const mockAlimentaciones = [
  { id: 1, cantidad: '5', alimentoNombre: 'Pasto', fecha: '2026-05-30', animalArete: 'AR-001' },
];

function renderOperacionesPage() {
  return render(
    <MemoryRouter>
      <OperacionesPage />
    </MemoryRouter>
  );
}

describe('OperacionesPage - Botones añadir', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProducciones.mockResolvedValue(mockProducciones);
    mockGetAlimentaciones.mockResolvedValue(mockAlimentaciones);
  });

  it('renderiza el título y tabs', async () => {
    renderOperacionesPage();
    expect(await screen.findByText('Operaciones')).toBeDefined();
    expect(screen.getByText('Producción')).toBeDefined();
    expect(screen.getByText('Alimentación')).toBeDefined();
  });

  it('carga y muestra producciones en el tab Producción', async () => {
    renderOperacionesPage();
    expect(await screen.findByText('AR-001')).toBeDefined();
    expect(screen.getByText('25')).toBeDefined();
    expect(screen.getByText('Mañana')).toBeDefined();
  });

  it('renderiza botón "+ Añadir" en tab Producción', async () => {
    renderOperacionesPage();
    await screen.findByText('AR-001');

    const addLink = screen.getByText('+ Añadir');
    expect(addLink).toBeDefined();
    expect(addLink).toHaveAttribute('href', '/dashboard/produccion/nuevo');
  });

  it('cambia al tab Alimentación y muestra datos', async () => {
    mockGetAlimentaciones.mockResolvedValue(mockAlimentaciones);
    renderOperacionesPage();
    await screen.findByText('AR-001');

    const alimentacionTab = screen.getByText('Alimentación');
    fireEvent.click(alimentacionTab);

    expect(await screen.findByText('Pasto')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
  });

  it('renderiza botón "+ Añadir" con ruta correcta en Alimentación', async () => {
    renderOperacionesPage();
    await screen.findByText('AR-001');

    const alimentacionTab = screen.getByText('Alimentación');
    fireEvent.click(alimentacionTab);

    await screen.findByText('Pasto');

    const addLink = screen.getByText('+ Añadir');
    expect(addLink).toHaveAttribute('href', '/dashboard/alimentacion/nuevo');
  });

  it('muestra botón Eliminar para cada producción', async () => {
    renderOperacionesPage();
    await screen.findByText('AR-001');

    const deleteBtns = screen.getAllByText('Eliminar');
    expect(deleteBtns.length).toBe(2);
  });

  it('muestra "Sin registros" cuando no hay datos', async () => {
    mockGetProducciones.mockResolvedValue([]);
    renderOperacionesPage();
    expect(await screen.findByText('Sin registros de producción')).toBeDefined();
  });
});
