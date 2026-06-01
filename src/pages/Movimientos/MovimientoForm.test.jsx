import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MovimientoForm from './MovimientoForm';
import { getAnimales, getLotes, getTiposMovimiento, getTiposEvento } from '../../services/ganadoService';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/ganadoService', () => ({
    getAnimales: vi.fn().mockResolvedValue([]),
    getLotes: vi.fn().mockResolvedValue([]),
    getTiposMovimiento: vi.fn().mockResolvedValue([]),
    getTiposEvento: vi.fn().mockResolvedValue([]),
    createMovimiento: vi.fn(),
    getUltimoLoteIdByAnimal: vi.fn(),
}));

vi.mock('../../services/api', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    }
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

describe('MovimientoForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza el formulario', async () => {
        render(
            <MemoryRouter>
                <MovimientoForm />
            </MemoryRouter>
        );
        expect(await screen.findByRole('heading', { name: /Registrar Movimiento/i })).toBeDefined();
    });
});
