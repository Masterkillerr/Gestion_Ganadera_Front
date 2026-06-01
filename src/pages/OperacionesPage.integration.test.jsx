import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { getTodayLocal } from '../utils/date';

// ── Hoisted mocks ──
const mocks = vi.hoisted(() => ({
  getProducciones: vi.fn(),
  getAlimentaciones: vi.fn(),
  deleteProduccion: vi.fn(),
  deleteAlimentacion: vi.fn(),
  getAnimales: vi.fn().mockResolvedValue([]),
  getDietas: vi.fn().mockResolvedValue([]),
  getAlimentos: vi.fn().mockResolvedValue([]),
  apiAlimentacion: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  getTurnosProduccion: vi.fn().mockResolvedValue([]),
  apiProduccion: { create: vi.fn() },
  updateProduccion: vi.fn(),
  createAlimento: vi.fn(),
  updateAlimento: vi.fn(),
  deleteAlimento: vi.fn(),
  createDieta: vi.fn(),
  updateDieta: vi.fn(),
  deleteDieta: vi.fn(),
  getDietaAlimentosByDieta: vi.fn().mockResolvedValue([]),
  createDietaAlimento: vi.fn(),
  updateDietaAlimento: vi.fn(),
  deleteDietaAlimento: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual };
});

vi.mock('../services/ganadoService', () => mocks);

const stableToast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));

vi.mock('../context/ToastContext', () => ({
  useToast: () => stableToast,
}));

vi.mock('../components/LoadingSpinner', () => ({
  LoadingSpinner: ({ fullPage, message }) =>
    fullPage ? <div data-testid="loading-spinner">{message}</div> : null,
}));

vi.mock('../components/Modal', () => ({
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

import OperacionesPage from './OperacionesPage';

const mockAnimales = [
  { id: 1, identificadorArete: 'AR-001', nombre: 'Vaca 1', razaNombre: 'Holstein', loteNombre: 'Lote A' },
  { id: 2, identificadorArete: 'AR-002', nombre: 'Vaca 2', razaNombre: 'Jersey', loteNombre: 'Lote B' },
];

const mockTurnos = [
  { id: 1, nombre: 'Mañana' },
  { id: 2, nombre: 'Tarde' },
];

const mockDietas = [
  { id: 1, nombre: 'Pastura', descripcion: 'Dieta base' },
  { id: 2, nombre: 'Suplemento', descripcion: null },
];

const mockAlimentos = [
  { id: 1, nombre: 'Maíz' },
  { id: 2, nombre: 'Soya' },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <OperacionesPage />
    </MemoryRouter>
  );
}

describe('OperacionesPage — Producción CRUD integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProducciones.mockResolvedValue([
      { id: 1, litros: 25, turno: 'Mañana', fecha: '2026-05-30', animalArete: 'AR-001', animalNombre: 'Vaca 1', animalId: 1 },
    ]);
    mocks.getTurnosProduccion.mockResolvedValue(mockTurnos);
    mocks.getAnimales.mockResolvedValue(mockAnimales);
    mocks.getAlimentaciones.mockResolvedValue([]);
  });

  it('flujo completo: crear producción → editar → eliminar', async () => {
    mocks.apiProduccion.create.mockResolvedValue({ id: 10 });

    renderPage();
    await screen.findByText('AR-001');

    // ── Crear ──
    fireEvent.click(screen.getByText('+ Nueva Producción'));
    await screen.findByText('Nueva Producción');

    // Fill form — selects sin htmlFor, usar getAllByRole
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '2' } }); // Animal

    const litrosInput = screen.getByPlaceholderText('0.0');
    fireEvent.change(litrosInput, { target: { value: '35' } });

    fireEvent.change(selects[1], { target: { value: '2' } }); // Turno

    // Set mock BEFORE click so loadData() gets updated list
    const updatedProducciones = [
      { id: 10, litros: 35, turno: 'Tarde', fecha: '2026-06-01', animalArete: 'AR-002', animalNombre: 'Vaca 2', animalId: 2 },
      { id: 1, litros: 25, turno: 'Mañana', fecha: '2026-05-30', animalArete: 'AR-001', animalNombre: 'Vaca 1', animalId: 1 },
    ];
    mocks.getProducciones.mockResolvedValue(updatedProducciones);

    // Submit via Save button in modal
    const saveBtn = screen.getByText('Guardar');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mocks.apiProduccion.create).toHaveBeenCalledWith({
        animalId: 2,
        litros: 35,
        turnoProduccionId: 2,
        fecha: expect.any(String),
      });
    });

    // ── Editar ──
    mocks.updateProduccion.mockResolvedValue({});

    // Wait for component to re-render with new data
    await screen.findByText('AR-002');

    // Simulate edit click — first item in sorted order is id:10
    const editBtns = screen.getAllByText('Editar');
    fireEvent.click(editBtns[0]); // Edit first item (id:10)
    await screen.findByText('Editar Producción');

    const litrosEdit = screen.getByPlaceholderText('0.0');
    fireEvent.change(litrosEdit, { target: { value: '40' } });

    fireEvent.click(screen.getAllByText('Guardar')[0]);
    await waitFor(() => {
      expect(mocks.updateProduccion).toHaveBeenCalledWith(10, expect.objectContaining({ litros: 40 }));
    });

    // ── Eliminar ──
    // Data re-rendered after edit with same mock
    await screen.findByText('AR-002');
    fireEvent.click(screen.getAllByText('Eliminar')[0]); // Delete first sorted item (id:10)

    await screen.findByText('Eliminar registro');
    fireEvent.click(screen.getByTestId('confirm-yes')); // Confirm button

    await waitFor(() => {
      expect(mocks.deleteProduccion).toHaveBeenCalledWith(10);
    });
  });

  it('no guarda producción si falta animal o litros', async () => {
    renderPage();
    await screen.findByText('AR-001');

    fireEvent.click(screen.getByText('+ Nueva Producción'));
    await screen.findByText('Nueva Producción');

    // Submit without filling required fields
    fireEvent.click(screen.getByText('Guardar'));

    // Should NOT have called create
    expect(mocks.apiProduccion.create).not.toHaveBeenCalled();
  });
});

describe('OperacionesPage — Alimentación CRUD integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProducciones.mockResolvedValue([]);
    mocks.getAlimentaciones.mockResolvedValue([]);
    mocks.getAnimales.mockResolvedValue(mockAnimales);
    mocks.getDietas.mockResolvedValue(mockDietas);
  });

  it('flujo completo: crear alimentación con dieta → delete', async () => {
    mocks.getAlimentaciones.mockResolvedValue([]);
    mocks.apiAlimentacion.create.mockResolvedValue({ id: 5 });

    renderPage();
    // Switch to Alimentación tab
    await screen.findByText('Operaciones');
    fireEvent.click(screen.getByText('Alimentación'));
    await screen.findByText('+ Nueva Alimentación');

    // ── Crear ──
    fireEvent.click(screen.getByText('+ Nueva Alimentación'));
    await screen.findByText('Nueva Alimentación');

    // Fill form
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } }); // Animal
    fireEvent.change(selects[1], { target: { value: '1' } }); // Dieta

    // The date input defaults to today's date via getTodayLocal() — find it by type
    const dateInputs = screen.getAllByDisplayValue(getTodayLocal());
    const dateInput = dateInputs.length > 1 ? dateInputs[1] : dateInputs[0];
    fireEvent.change(dateInput, { target: { value: '2026-06-15' } });

    // Set mock BEFORE click so loadData() gets the right value
    const createdAlimentacion = [{
      id: 5,
      animalId: 1,
      animalArete: 'AR-001',
      animalNombre: 'Vaca 1',
      dietaId: 1,
      dietaNombre: 'Pastura',
      fecha: '2026-06-15T00:00:00',
      observacion: null,
    }];
    mocks.getAlimentaciones.mockResolvedValue(createdAlimentacion);

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(mocks.apiAlimentacion.create).toHaveBeenCalledWith({
        animalId: 1,
        dietaId: 1,
        fecha: '2026-06-15T00:00:00',
        observacion: null,
      });
    });

    // ── Delete ──
    // Component re-rendered with created data after save
    await screen.findByText('AR-001');
    const deleteBtns = screen.getAllByText('Eliminar');
    fireEvent.click(deleteBtns[deleteBtns.length - 1]);

    await screen.findByText('Eliminar registro');
    fireEvent.click(screen.getByTestId('confirm-yes'));

    await waitFor(() => {
      expect(mocks.deleteAlimentacion).toHaveBeenCalledWith(5);
    });
  });

  it('no guarda alimentación si falta animal', async () => {
    renderPage();
    await screen.findByText('Operaciones');
    fireEvent.click(screen.getByText('Alimentación'));
    await screen.findByText('+ Nueva Alimentación');

    fireEvent.click(screen.getByText('+ Nueva Alimentación'));
    await screen.findByText('Nueva Alimentación');

    // Submit without selecting animal
    fireEvent.click(screen.getByText('Guardar'));
    expect(mocks.apiAlimentacion.create).not.toHaveBeenCalled();
  });
});

describe('OperacionesPage — Alimento CRUD integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProducciones.mockResolvedValue([]);
    mocks.getAlimentos.mockResolvedValue([
      { id: 1, nombre: 'Maíz' },
      { id: 2, nombre: 'Soya' },
    ]);
    mocks.getAlimentaciones.mockResolvedValue([]);
  });

  it('flujo completo: crear alimento → editar → eliminar', async () => {
    mocks.createAlimento.mockResolvedValue({ id: 3, nombre: 'Henolaje' });
    mocks.updateAlimento.mockResolvedValue({});
    mocks.deleteAlimento.mockResolvedValue({});

    renderPage();
    await screen.findByText('Operaciones');

    // Go to Alimento tab
    fireEvent.click(screen.getByText('Alimento'));
    await screen.findByText('Maíz');

    // ── Crear ──
    // Set mock BEFORE click so loadData() gets updated data
    mocks.getAlimentos.mockResolvedValue([
      { id: 1, nombre: 'Maíz' },
      { id: 2, nombre: 'Soya' },
      { id: 3, nombre: 'Henolaje' },
    ]);

    fireEvent.click(screen.getByText('+ Nuevo Alimento'));
    await screen.findByText('Nuevo Alimento');

    const nameInput = screen.getByPlaceholderText('Nombre del alimento');
    fireEvent.change(nameInput, { target: { value: 'Henolaje' } });
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(mocks.createAlimento).toHaveBeenCalledWith({ nombre: 'Henolaje' });
    });

    // ── Editar ──
    // Wait for component to re-render with new data (mock already updated)
    await screen.findByText('Henolaje');

    fireEvent.click(screen.getAllByText('Editar')[0]); // Edit Maíz
    await screen.findByText('Editar Alimento');

    const editInput = screen.getByPlaceholderText('Nombre del alimento');
    fireEvent.change(editInput, { target: { value: 'Maíz Orgánico' } });

    // Set mock BEFORE click so loadData() gets updated data
    mocks.getAlimentos.mockResolvedValue([
      { id: 2, nombre: 'Soya' },
      { id: 3, nombre: 'Henolaje' },
    ]);

    fireEvent.click(screen.getAllByText('Guardar')[0]);

    await waitFor(() => {
      expect(mocks.updateAlimento).toHaveBeenCalledWith(1, { nombre: 'Maíz Orgánico' });
    });

    // ── Eliminar ──
    // Wait for component to re-render with Maíz removed
    await screen.findByText('Soya');

    fireEvent.click(screen.getAllByText('Eliminar')[0]);

    await screen.findByText('Eliminar registro');
    fireEvent.click(screen.getByTestId('confirm-yes'));

    await waitFor(() => {
      expect(mocks.deleteAlimento).toHaveBeenCalledWith(2);
    });
  });

  it('no crea alimento con nombre vacío', async () => {
    renderPage();
    await screen.findByText('Operaciones');
    fireEvent.click(screen.getByText('Alimento'));
    await screen.findByText('Maíz');

    fireEvent.click(screen.getByText('+ Nuevo Alimento'));
    await screen.findByText('Nuevo Alimento');
    fireEvent.click(screen.getByText('Guardar'));

    expect(mocks.createAlimento).not.toHaveBeenCalled();
  });
});

describe('OperacionesPage — Dieta CRUD + DietaAlimento integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProducciones.mockResolvedValue([]);
    mocks.getAlimentaciones.mockResolvedValue([]);
    mocks.getDietas.mockResolvedValue([
      { id: 1, nombre: 'Pastura', descripcion: 'Dieta base' },
    ]);
    mocks.getAlimentos.mockResolvedValue(mockAlimentos);
    mocks.getDietaAlimentosByDieta.mockResolvedValue([]);
  });

  it('flujo completo: crear dieta → seleccionar → asignar alimento → eliminar asignación', async () => {
    mocks.createDieta.mockResolvedValue({ id: 3, nombre: 'Engorde' });
    mocks.createDietaAlimento.mockResolvedValue({ id: 10, dietaId: 3, alimentoId: 1 });

    renderPage();
    await screen.findByText('Operaciones');

    // Go to Dietas tab — use the tab button specifically
    const tabButtons = screen.getAllByText('Dietas');
    fireEvent.click(tabButtons[0]); // First one is the tab button
    await screen.findByText('+ Nueva Dieta');

    // ── Crear dieta ──
    // Set mock BEFORE click so loadData() gets updated data
    mocks.getDietas.mockResolvedValue([
      { id: 1, nombre: 'Pastura', descripcion: 'Dieta base' },
      { id: 3, nombre: 'Engorde', descripcion: 'Dieta para engorde intensivo' },
    ]);

    fireEvent.click(screen.getByText('+ Nueva Dieta'));
    await screen.findByText('Nueva Dieta');

    const nameInput = screen.getByPlaceholderText('Nombre de la dieta');
    fireEvent.change(nameInput, { target: { value: 'Engorde' } });

    const descInput = screen.getByPlaceholderText('Descripción...');
    fireEvent.change(descInput, { target: { value: 'Dieta para engorde intensivo' } });

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(mocks.createDieta).toHaveBeenCalledWith({
        nombre: 'Engorde',
        descripcion: 'Dieta para engorde intensivo',
      });
    });

    // ── Seleccionar dieta para ver asignaciones ──
    mocks.getDietaAlimentosByDieta.mockResolvedValue([]);

    // Click on the row for Engorde (it's a clickable row)
    const dietaRows = screen.getAllByText('Engorde');
    fireEvent.click(dietaRows[0]);

    await waitFor(() => {
      expect(mocks.getDietaAlimentosByDieta).toHaveBeenCalledWith(3);
    });

    // ── Asignar alimento ──
    fireEvent.click(screen.getByText('+ Asignar'));
    await screen.findByText('Asignar Alimento a Dieta');

    const alimentoSelect = screen.getByRole('combobox');
    fireEvent.change(alimentoSelect, { target: { value: '1' } }); // Maíz

    // Set mock BEFORE click so getDietaAlimentosByDieta gets updated data
    mocks.getDietaAlimentosByDieta.mockResolvedValue([
      { id: 10, alimentoId: 1, alimentoNombre: 'Maíz', cantidad: null, unidad: null },
    ]);

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(mocks.createDietaAlimento).toHaveBeenCalledWith({
        dietaId: 3,
        alimentoId: 1,
        cantidad: null,
        unidad: null,
      });
    });

    // ── Eliminar asignación ──
    // Scope delete button to the right table (alimentos asignados), not left table (dietas)
    const assignRow = within(screen.getByText('Maíz').closest('tr'));
    fireEvent.click(assignRow.getByText('Eliminar'));
    await screen.findByText('Eliminar registro');
    fireEvent.click(screen.getByTestId('confirm-yes'));

    await waitFor(() => {
      expect(mocks.deleteDietaAlimento).toHaveBeenCalledWith(10);
    });
  });

  it('no asigna alimento sin seleccionar alimento', async () => {
    renderPage();
    await screen.findByText('Operaciones');
    const dietasTabs = screen.getAllByText('Dietas');
    fireEvent.click(dietasTabs[0]);
    await screen.findByText('+ Nueva Dieta');

    // Click Pastura row
    fireEvent.click(screen.getByText('Pastura'));
    await waitFor(() => {
      expect(mocks.getDietaAlimentosByDieta).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('+ Asignar'));
    await screen.findByText('Asignar Alimento a Dieta');

    // Submit without selecting alimento
    fireEvent.click(screen.getByText('Guardar'));
    expect(mocks.createDietaAlimento).not.toHaveBeenCalled();
  });

  it('no crea dieta con nombre vacío', async () => {
    renderPage();
    await screen.findByText('Operaciones');
    const dietasBtns = screen.getAllByText('Dietas');
    fireEvent.click(dietasBtns[0]);
    await screen.findByText('+ Nueva Dieta');

    fireEvent.click(screen.getByText('+ Nueva Dieta'));
    await screen.findByText('Nueva Dieta');
    fireEvent.click(screen.getByText('Guardar'));

    expect(mocks.createDieta).not.toHaveBeenCalled();
  });
});
