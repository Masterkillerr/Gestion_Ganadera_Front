import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';

// ── Hoisted mocks ──
const { mockGetAnimalById, mockGetByAnimal, mockCreate, mockDelete } = vi.hoisted(() => ({
  mockGetAnimalById: vi.fn(),
  mockGetByAnimal: vi.fn().mockResolvedValue([]),
  mockCreate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual };
});

vi.mock('../../services/ganadoService', () => ({
  getAnimalById: mockGetAnimalById,
  getUltimoLoteIdByAnimal: vi.fn().mockResolvedValue('No asignado'),
  getDietas: vi.fn().mockResolvedValue([]),
  getTurnosProduccion: vi.fn().mockResolvedValue([]),
  apiAlimentacion: { getByAnimal: mockGetByAnimal, create: mockCreate, delete: mockDelete },
  apiProduccion:   { getByAnimal: mockGetByAnimal, create: mockCreate, delete: mockDelete },
  apiEventos:      { getByAnimal: mockGetByAnimal, create: mockCreate, delete: mockDelete },
  apiTratamientos: { getByAnimal: mockGetByAnimal, create: mockCreate, delete: mockDelete },
  apiVacunaciones: { getByAnimal: mockGetByAnimal, create: mockCreate, delete: mockDelete },
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}));

vi.mock('../../context/LoadingContext', () => ({
  useLoading: () => ({ showLoading: vi.fn(), hideLoading: vi.fn() }),
}));

vi.mock('../../components/LoadingSpinner', () => ({
  LoadingSpinner: ({ fullPage, message }) =>
    fullPage ? <div data-testid="loading-spinner">{message}</div> : <div data-testid="loading-spinner-inline">{message}</div>,
}));

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

describe('GanadoDetail - Botones Añadir Registro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAnimalById.mockResolvedValue(mockAnimal);
  });

  it('renderiza la ficha del animal', async () => {
    renderGanadoDetail();
    // screen.debug(); // Debug
    expect(await screen.findByText((content, element) => content.includes('AR-001'))).toBeDefined();
    expect(screen.getByText(/- Vaca Test/)).toBeDefined();
  });

  it('renderiza todos los tabs correctamente', async () => {
    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    expect(screen.getByText('Alimentación')).toBeDefined();
    expect(screen.getByText('Producción')).toBeDefined();
    expect(screen.getByText('Sanidad')).toBeDefined();
    expect(screen.getByText('Eventos')).toBeDefined();
  });

  it('renderiza botón "+ Nueva Alimentación" en tab Alimentación', async () => {
    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    expect(await screen.findByText('+ Nueva Alimentación')).toBeDefined();
  });

  it('renderiza botón "+ Nueva Producción" en tab Producción', async () => {
    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    // Click Producción tab
    const produccionTab = screen.getByText('Producción');
    produccionTab.click();

    expect(await screen.findByText('+ Nueva Producción')).toBeDefined();
  });

  it('renderiza botón "Añadir Evento" en tab Eventos', async () => {
    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    // Click Eventos tab
    const eventosTab = screen.getByText('Eventos');
    eventosTab.click();

    expect(await screen.findByText('Añadir Evento')).toBeDefined();
  });

  it('muestra "Sin registros de alimentación" cuando no hay historial', async () => {
    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    expect(await screen.findByText('Sin registros de alimentación')).toBeDefined();
  });

  it('llama a getAnimalById con el ID correcto', async () => {
    renderGanadoDetail();
    await screen.findByText(/AR-001/);

    expect(mockGetAnimalById).toHaveBeenCalledWith('1');
  });
});
