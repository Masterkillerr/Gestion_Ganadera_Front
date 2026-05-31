import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// ── Hoisted mocks ──
const {
  mockGetProducciones, mockGetAlimentaciones, mockDeleteProduccion, mockDeleteAlimentacion,
  mockGetAnimales, mockGetDietas, mockGetAlimentos, mockApiAlimentacion,
  mockGetTurnosProduccion, mockApiProduccion, mockUpdateProduccion
} = vi.hoisted(() => ({
  mockGetProducciones: vi.fn(),
  mockGetAlimentaciones: vi.fn(),
  mockDeleteProduccion: vi.fn(),
  mockDeleteAlimentacion: vi.fn(),
  mockGetAnimales: vi.fn().mockResolvedValue([]),
  mockGetDietas: vi.fn().mockResolvedValue([]),
  mockGetAlimentos: vi.fn().mockResolvedValue([]),
  mockApiAlimentacion: { create: vi.fn(), update: vi.fn() },
  mockGetTurnosProduccion: vi.fn().mockResolvedValue([]),
  mockApiProduccion: { create: vi.fn() },
  mockUpdateProduccion: vi.fn(),
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
  getAnimales: mockGetAnimales,
  getDietas: mockGetDietas,
  getAlimentos: mockGetAlimentos,
  apiAlimentacion: mockApiAlimentacion,
  getTurnosProduccion: mockGetTurnosProduccion,
  apiProduccion: mockApiProduccion,
  updateProduccion: mockUpdateProduccion,
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
  { id: 1, litros: 25, turno: 'Mañana', fecha: '2026-05-30', animalArete: 'AR-001', animalNombre: 'Vaca 1', animalId: 1 },
  { id: 2, litros: 30, turno: 'Tarde', fecha: '2026-05-30', animalArete: 'AR-002', animalNombre: 'Vaca 2', animalId: 2 },
];

const mockAlimentaciones = [
  {
    id: 1,
    animal: { id: 5, identificadorArete: 'AR-001', nombre: 'Vaca 1', razaNombre: 'Holstein', loteNombre: 'Lote A' },
    dieta: { id: 2, nombre: 'Pastura' },
    fecha: '2026-05-30T10:00:00',
    observacion: null,
  },
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
    expect(screen.getByText('Mañana')).toBeDefined();
  });

  it('renderiza botón \"+ Nueva Producción\" en tab Producción', async () => {
    renderOperacionesPage();
    await screen.findByText('AR-001');

    const addBtn = screen.getByText('+ Nueva Producción');
    expect(addBtn).toBeDefined();
  });

  it('cambia al tab Alimentación y muestra datos correctos', async () => {
    mockGetAlimentaciones.mockResolvedValue(mockAlimentaciones);
    renderOperacionesPage();
    await screen.findByText('AR-001');

    const alimentacionTab = screen.getByText('Alimentación');
    fireEvent.click(alimentacionTab);

    expect(await screen.findByText('Pastura')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined(); // animal.id
  });

  it('renderiza botón \"+ Nueva Alimentación\" en tab Alimentación', async () => {
    renderOperacionesPage();
    await screen.findByText('AR-001');

    const alimentacionTab = screen.getByText('Alimentación');
    fireEvent.click(alimentacionTab);

    await screen.findByText('Pastura');

    expect(screen.getByText('+ Nueva Alimentación')).toBeDefined();
  });

  it('muestra botones Editar y Eliminar para cada producción', async () => {
    renderOperacionesPage();
    await screen.findByText('AR-001');

    const editBtns = screen.getAllByText('Editar');
    const deleteBtns = screen.getAllByText('Eliminar');
    expect(editBtns.length).toBe(2);
    expect(deleteBtns.length).toBe(2);
  });

  it('muestra \"Sin registros\" cuando no hay datos', async () => {
    mockGetProducciones.mockResolvedValue([]);
    renderOperacionesPage();
    expect(await screen.findByText('Sin registros de producción')).toBeDefined();
  });
});
