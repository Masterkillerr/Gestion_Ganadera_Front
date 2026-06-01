import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GanadoList from './GanadoList';
import * as ganadoService from '../../services/ganadoService';

vi.mock('../../services/ganadoService', () => ({
  getAnimales: vi.fn(),
  deleteAnimal: vi.fn(),
  getRazas: vi.fn(),
  getLotes: vi.fn(),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}));

vi.mock('../../components/LoadingSpinner', () => ({
  LoadingSpinner: () => null,
  Skeleton: () => null,
}));

vi.mock('../../components/Modal', () => ({
  ConfirmModal: () => null,
}));

describe('GanadoList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of animals', async () => {
    ganadoService.getAnimales.mockResolvedValue({
      content: [
        { id: 1, identificadorArete: 'AR-001', nombre: 'Vaca Test', sexo: 'Hembra', estadoAnimal: 'Activo' },
      ],
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <GanadoList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Vaca Test')).toBeDefined();
    });
  });
});
