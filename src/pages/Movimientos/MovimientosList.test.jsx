import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MovimientosList from './MovimientosList';
import { getMovimientos } from '../../services/ganadoService';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/ganadoService', () => ({
    getMovimientos: vi.fn(),
    deleteMovimiento: vi.fn(),
}));

vi.mock('../../context/ToastContext', () => ({
    useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}));

vi.mock('../../components/Modal', () => ({
    ConfirmModal: () => null,
}));

vi.mock('../../components/LoadingSpinner', () => ({
    LoadingSpinner: () => <div data-testid="spinner">Cargando...</div>,
}));

describe('MovimientosList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza la lista de movimientos', async () => {
        getMovimientos.mockResolvedValue([
            { id: 1, animalArete: 'AR-001', tipoMovimiento: 'Ingreso', fecha: '2023-01-01' }
        ]);
        render(
            <MemoryRouter>
                <MovimientosList />
            </MemoryRouter>
        );
        expect(await screen.findByText('Movimientos de Animales')).toBeDefined();
        expect(await screen.findByText('AR-001')).toBeDefined();
    });
});
