import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// ── Hoisted mocks ──
const mocks = vi.hoisted(() => ({
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

vi.mock('../api/ganado', () => mocks);

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
        <button data-testid="modal-close" onClick={onClose}>Cerrar</button>
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
  { id: 3, nombre: 'Lote X', capacidadMaxima: 15, finca: { id: 2, nombre: 'Finca Secundaria' }, fincaId: 2, fincaNombre: 'Finca Secundaria' },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <InfraestructuraPage />
    </MemoryRouter>
  );
}

describe('InfraestructuraPage — Finca CRUD integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getFincas.mockResolvedValue(mockFincas);
    mocks.getLotes.mockResolvedValue(mockLotes);
    mocks.getAnimalesByLote.mockResolvedValue([]);
  });

  it('finca: crear → editar → eliminar con confirmación', async () => {
    mocks.createFinca.mockResolvedValue({ id: 3, nombre: 'Finca Nueva' });
    mocks.updateFinca.mockResolvedValue({});
    mocks.deleteFinca.mockResolvedValue({});

    renderPage();
    await screen.findByText('Finca Principal');

    // ── Crear ──
    fireEvent.click(screen.getByText('+ Añadir Finca'));
    const modal = await screen.findByTestId('inline-form-modal');

    const { getByRole, getAllByRole, getByText } = within(modal);
    const textboxes = getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { name: 'nombre', value: 'Finca Nueva' } });
    fireEvent.change(textboxes[1], { target: { name: 'ubicacion', value: 'Llanos' } });

    const extensionInput = getByRole('spinbutton');
    fireEvent.change(extensionInput, { target: { name: 'extension', value: '200' } });

    fireEvent.click(getByText('Crear'));

    await waitFor(() => {
      expect(mocks.createFinca).toHaveBeenCalledWith({
        nombre: 'Finca Nueva',
        ubicacion: 'Llanos',
        extension: 200,
      });
    });

    // ── Editar ──
    mocks.getFincas.mockResolvedValue([
      ...mockFincas,
      { id: 3, nombre: 'Finca Nueva', ubicacion: 'Llanos', extension: 200 },
    ]);
    mocks.getLotes.mockResolvedValue(mockLotes);

    // Click Editar on Finca Principal
    const editBtns = screen.getAllByText('Editar');
    fireEvent.click(editBtns[0]); // Edit Finca Principal
    const editModal = await screen.findByTestId('inline-form-modal');

    const { getByDisplayValue, getByText: getByTextEdit } = within(editModal);
    const editName = getByDisplayValue('Finca Principal');
    fireEvent.change(editName, { target: { name: 'nombre', value: 'Finca Principal Renovada' } });

    fireEvent.click(getByTextEdit('Guardar Cambios'));

    await waitFor(() => {
      expect(mocks.updateFinca).toHaveBeenCalledWith(1, {
        nombre: 'Finca Principal Renovada',
        ubicacion: 'Zona Rural',
        extension: 100,
      });
    });

    // ── Eliminar ──
    mocks.getFincas.mockResolvedValue([
      { id: 2, nombre: 'Finca Secundaria', ubicacion: 'Valle Verde', extension: 50 },
      { id: 3, nombre: 'Finca Nueva', ubicacion: 'Llanos', extension: 200 },
    ]);
    mocks.getLotes.mockResolvedValue(mockLotes);

    fireEvent.click(screen.getAllByText('Eliminar')[0]);
    await screen.findByText('Confirmar acción');
    expect(screen.getByText('¿Eliminar esta finca?')).toBeDefined();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(mocks.deleteFinca).toHaveBeenCalledWith(1);
    });
  });

  it('finca: muestra error del backend al crear', async () => {
    mocks.createFinca.mockRejectedValue({
      response: { data: { message: 'La finca ya existe' } },
    });

    renderPage();
    await screen.findByText('Finca Principal');

    fireEvent.click(screen.getByText('+ Añadir Finca'));
    const modal = await screen.findByTestId('inline-form-modal');

    const { getAllByRole, getByText } = within(modal);
    const textboxes = getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { name: 'nombre', value: 'Finca Nueva' } });

    fireEvent.click(getByText('Crear'));

    await waitFor(() => {
      expect(screen.getByText('La finca ya existe')).toBeDefined();
    });
  });
});

describe('InfraestructuraPage — Lote CRUD integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getFincas.mockResolvedValue(mockFincas);
    mocks.getLotes.mockResolvedValue(mockLotes);
    mocks.getAnimalesByLote.mockResolvedValue([]);
  });

  it('lote: crear → editar → eliminar con confirmación', async () => {
    mocks.createLote.mockResolvedValue({ id: 4, nombre: 'Lote Nuevo' });
    mocks.updateLote.mockResolvedValue({});
    mocks.deleteLote.mockResolvedValue({});

    renderPage();
    await screen.findByText('Finca Principal');

    // Go to Lotes tab
    fireEvent.click(screen.getByText('Lotes'));
    await screen.findByText('Lote A');

    // ── Crear ──
    fireEvent.click(screen.getByText('+ Añadir Lote'));
    const loteModal = await screen.findByTestId('inline-form-modal');

    const { getAllByRole: getAllByRoleLote, getByText: getByTextLote } = within(loteModal);
    const loteTextboxes = getAllByRoleLote('textbox');
    fireEvent.change(loteTextboxes[0], { target: { name: 'nombre', value: 'Lote Nuevo' } });

    const comboboxes = getAllByRoleLote('combobox');
    fireEvent.change(comboboxes[0], { target: { name: 'fincaId', value: '1' } });

    const capInput = loteTextboxes.length > 1 ? loteTextboxes[1] : getAllByRoleLote('spinbutton')[0];
    fireEvent.change(capInput, { target: { name: 'capacidadMaxima', value: '50' } });

    fireEvent.click(getByTextLote('Crear'));

    await waitFor(() => {
      expect(mocks.createLote).toHaveBeenCalledWith({
        nombre: 'Lote Nuevo',
        fincaId: 1,
        capacidadMaxima: 50,
        hectareas: null,
        tipoPasto: null,
        estado: null,
      });
    });

    // ── Editar ──
    mocks.getLotes.mockResolvedValue([
      ...mockLotes,
      { id: 4, nombre: 'Lote Nuevo', capacidadMaxima: 50, finca: { id: 1, nombre: 'Finca Principal' }, fincaId: 1, fincaNombre: 'Finca Principal' },
    ]);

    const editBtns = screen.getAllByText('Editar');
    fireEvent.click(editBtns[0]); // Edit Lote A
    const editLoteModal = await screen.findByTestId('inline-form-modal');

    const { getByDisplayValue: getByDvLote, getByText: getByTextEditLote } = within(editLoteModal);
    const editName = getByDvLote('Lote A');
    fireEvent.change(editName, { target: { name: 'nombre', value: 'Lote A Ampliado' } });

    fireEvent.click(getByTextEditLote('Guardar Cambios'));

    await waitFor(() => {
      expect(mocks.updateLote).toHaveBeenCalledWith(1, {
        nombre: 'Lote A Ampliado',
        fincaId: 1,
        capacidadMaxima: 30,
        hectareas: null,
        tipoPasto: null,
        estado: null,
      });
    });

    // ── Eliminar ──
    mocks.getLotes.mockResolvedValue([
      { id: 2, nombre: 'Lote B', capacidadMaxima: 20, finca: { id: 1, nombre: 'Finca Principal' }, fincaId: 1, fincaNombre: 'Finca Principal' },
      { id: 3, nombre: 'Lote X', capacidadMaxima: 15, finca: { id: 2, nombre: 'Finca Secundaria' }, fincaId: 2, fincaNombre: 'Finca Secundaria' },
      { id: 4, nombre: 'Lote Nuevo', capacidadMaxima: 50, finca: { id: 1, nombre: 'Finca Principal' }, fincaId: 1, fincaNombre: 'Finca Principal' },
    ]);

    fireEvent.click(screen.getAllByText('Eliminar')[0]);
    await screen.findByText('Confirmar acción');
    expect(screen.getByText('¿Eliminar este lote?')).toBeDefined();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(mocks.deleteLote).toHaveBeenCalledWith(1);
    });
  });

  it('lote: muestra error del backend al crear', async () => {
    mocks.createLote.mockRejectedValue({
      response: { data: { error: 'Capacidad máxima excede el límite permitido' } },
    });

    renderPage();
    await screen.findByText('Finca Principal');
    fireEvent.click(screen.getByText('Lotes'));
    await screen.findByText('Lote A');

    fireEvent.click(screen.getByText('+ Añadir Lote'));
    const loteErrorModal = await screen.findByTestId('inline-form-modal');

    const { getAllByRole: errGetAllByRole, getByText: errGetByText } = within(loteErrorModal);
    const errTextboxes = errGetAllByRole('textbox');
    fireEvent.change(errTextboxes[0], { target: { name: 'nombre', value: 'Lote Grande' } });

    const errCombo = errGetAllByRole('combobox');
    fireEvent.change(errCombo[0], { target: { name: 'fincaId', value: '1' } });

    fireEvent.click(errGetByText('Crear'));

    await waitFor(() => {
      expect(screen.getByText('Capacidad máxima excede el límite permitido')).toBeDefined();
    });
  });
});
