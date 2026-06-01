import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AlimentacionForm from './AlimentacionForm';
import { getAnimales, apiAlimentacion } from '../../services/ganadoService';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/ganadoService', () => ({
  getAnimales: vi.fn(),
  apiAlimentacion: { create: vi.fn() },
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}));

vi.mock('../../context/LoadingContext', () => ({
  useLoading: () => ({ showLoading: vi.fn(), hideLoading: vi.fn() }),
}));

vi.mock('../../components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="spinner">Cargando...</div>,
}));

describe('AlimentacionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario', async () => {
    getAnimales.mockResolvedValue([{ id: 1, nombre: 'Vaca 1', sexo: 'HEMBRA' }]);
    render(
        <MemoryRouter>
            <AlimentacionForm />
        </MemoryRouter>
    );
    expect(await screen.findByText('Nuevo Registro de Alimentación')).toBeDefined();
  });
});
