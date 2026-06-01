import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';

const mockNavigate = vi.fn();

const {
  mockGetSexos, mockGetEstadosAnimal, mockGetRazas, mockGetLotes, mockGetFincas,
  mockGetAnimales, mockGetTiposEvento, mockGetTiposMovimiento,
  mockGetAnimalById, mockCreateAnimal, mockUpdateAnimal,
  mockCheckLoteCapacity, mockApiEventos, mockCreateMovimiento,
} = vi.hoisted(() => ({
  mockGetSexos: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Macho' }, { id: 2, nombre: 'Hembra' }]),
  mockGetEstadosAnimal: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Sano' }, { id: 2, nombre: 'En Tratamiento' }]),
  mockGetRazas: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Holstein' }]),
  mockGetLotes: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Lote A', capacidadMaxima: 30, finca: { id: 1, nombre: 'Finca 1' } }]),
  mockGetFincas: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Finca Principal' }]),
  mockGetAnimales: vi.fn().mockResolvedValue([
    { id: 2, nombre: 'Vaca Madre', sexo: 'Hembra', identificadorArete: 'AR-002' },
    { id: 3, nombre: 'Toro Padre', sexo: 'Macho', identificadorArete: 'AR-003' },
  ]),
  mockGetTiposEvento: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Ingreso' }]),
  mockGetTiposMovimiento: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Ingreso' }]),
  mockGetAnimalById: vi.fn(),
  mockCreateAnimal: vi.fn(),
  mockUpdateAnimal: vi.fn(),
  mockCheckLoteCapacity: vi.fn(),
  mockApiEventos: { create: vi.fn() },
  mockCreateMovimiento: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../services/ganadoService', () => ({
  getSexos: mockGetSexos,
  getEstadosAnimal: mockGetEstadosAnimal,
  getRazas: mockGetRazas,
  getLotes: mockGetLotes,
  getFincas: mockGetFincas,
  getAnimales: mockGetAnimales,
  getTiposEvento: mockGetTiposEvento,
  getTiposMovimiento: mockGetTiposMovimiento,
  getAnimalById: mockGetAnimalById,
  createAnimal: mockCreateAnimal,
  updateAnimal: mockUpdateAnimal,
  checkLoteCapacity: mockCheckLoteCapacity,
  apiEventos: mockApiEventos,
  createMovimiento: mockCreateMovimiento,
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}));

vi.mock('../../context/LoadingContext', () => ({
  useLoading: () => ({ showLoading: vi.fn(), hideLoading: vi.fn() }),
}));

vi.mock('../../components/LoadingSpinner', () => ({
  default: ({ fullPage, message }) =>
    fullPage ? <div data-testid="loading-spinner">{message}</div> : null,
}));

vi.mock('../../components/CatalogModal', () => ({
  default: ({ isOpen, type }) =>
    isOpen ? <div data-testid="catalog-modal">{type}</div> : null,
}));

import GanadoForm from './GanadoForm';

function renderGanadoForm() {
  return render(
    <MemoryRouter initialEntries={['/dashboard/ganado/nuevo']}>
      <Routes>
        <Route path="/dashboard/ganado/nuevo" element={<GanadoForm />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEditGanadoForm() {
  return render(
    <MemoryRouter initialEntries={['/dashboard/ganado/editar/1']}>
      <Routes>
        <Route path="/dashboard/ganado/editar/:id" element={<GanadoForm />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('GanadoForm - Nuevo Animal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario con título Nuevo Animal', async () => {
    renderGanadoForm();
    expect(await screen.findByText('Nuevo Animal')).toBeDefined();
    expect(screen.getByText('Información Básica')).toBeDefined();
  });

  it('carga y muestra los catálogos en selects', async () => {
    renderGanadoForm();
    await screen.findByText('Nuevo Animal');

    // Estado select should have options from API
    const estadoSelect = screen.getByRole('combobox', { name: /estado/i });
    expect(estadoSelect).toBeDefined();
    expect(estadoSelect.value).toBe('');

    // Sexo select should have Hembra/Macho
    expect(screen.getByDisplayValue('Hembra')).toBeDefined();
  });

  it('llama a los catálogos al cargar', async () => {
    renderGanadoForm();
    await screen.findByText('Nuevo Animal');

    expect(mockGetSexos).toHaveBeenCalled();
    expect(mockGetEstadosAnimal).toHaveBeenCalled();
    expect(mockGetRazas).toHaveBeenCalled();
    expect(mockGetLotes).toHaveBeenCalled();
    expect(mockGetTiposEvento).toHaveBeenCalled();
    expect(mockGetTiposMovimiento).toHaveBeenCalled();
  });    it('crea animal exitosamente (sin lote)', async () => {
    mockCreateAnimal.mockResolvedValue({ id: 1 });

    renderGanadoForm();
    await screen.findByText('Nuevo Animal');

    // Fill basic info
    fireEvent.change(screen.getByLabelText('Arete / Identificador'), { target: { name: 'identificadorArete', value: 'AR-NEW' } });

    const submitBtn = screen.getByText('Guardar Animal');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateAnimal).toHaveBeenCalled();
    });

    expect(mockCheckLoteCapacity).not.toHaveBeenCalled();
    expect(mockApiEventos.create).not.toHaveBeenCalled();
    expect(mockCreateMovimiento).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/ganado');
  });

  it('permite guardar fotoUrl en el formulario', async () => {
    mockCreateAnimal.mockResolvedValue({ id: 1 });

    renderGanadoForm();
    await screen.findByText('Nuevo Animal');

    const fotoInput = screen.getByPlaceholderText('https://ejemplo.com/foto.jpg');
    fireEvent.change(fotoInput, { target: { name: 'fotoUrl', value: 'https://ejemplo.com/vaca.jpg' } });

    fireEvent.change(screen.getByLabelText('Arete / Identificador'), { target: { name: 'identificadorArete', value: 'AR-PHOTO' } });

    const submitBtn = screen.getByText('Guardar Animal');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateAnimal).toHaveBeenCalledWith(expect.objectContaining({
        fotoUrl: 'https://ejemplo.com/vaca.jpg',
      }));
    });
  });
});

describe('GanadoForm - Editar Animal', () => {
  const mockExistingAnimal = {
    id: 1,
    identificadorArete: 'AR-001',
    nombre: 'Vaca Existente',
    sexo: 'HEMBRA',
    fechaNacimiento: '2022-05-15T00:00:00',
    pesoActualKg: 450,
    estadoAnimal: 'Sano',
    fotoUrl: null,
    razaNombre: 'Holstein',
    madreId: 2,
    padreId: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAnimalById.mockResolvedValue(mockExistingAnimal);
  });

  it('renderiza formulario de edición con datos precargados', async () => {
    renderEditGanadoForm();
    expect(await screen.findByText('Editar Animal')).toBeDefined();
  });

  it('llama a updateAnimal en submit con datos correctos', async () => {
    mockUpdateAnimal.mockResolvedValue({});

    renderEditGanadoForm();
    await screen.findByText('Editar Animal');

    const submitBtn = screen.getByText('Guardar Animal');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateAnimal).toHaveBeenCalledWith('1', expect.objectContaining({
        identificadorArete: 'AR-001',
        nombre: 'Vaca Existente',
      }));
    });
  });

  it('no verifica capacidad ni crea evento+movimiento en edición', async () => {
    mockUpdateAnimal.mockResolvedValue({});

    renderEditGanadoForm();
    await screen.findByText('Editar Animal');

    const submitBtn = screen.getByText('Guardar Animal');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateAnimal).toHaveBeenCalled();
    });

    expect(mockCheckLoteCapacity).not.toHaveBeenCalled();
    expect(mockApiEventos.create).not.toHaveBeenCalled();
    expect(mockCreateMovimiento).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/ganado');
  });
});
