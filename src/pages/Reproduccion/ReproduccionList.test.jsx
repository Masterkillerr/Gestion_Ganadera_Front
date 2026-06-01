import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReproduccionList from './ReproduccionList';
import { getReproducciones, getPartos, getTiposEvento } from '../../services/ganadoService';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/ganadoService', () => ({
    getReproducciones: vi.fn(),
    deleteReproduccion: vi.fn(),
    getPartos: vi.fn(),
    deleteParto: vi.fn(),
    updateParto: vi.fn(),
    getTiposEvento: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../services/api', () => ({
    default: { post: vi.fn() }
}));

vi.mock('../../context/ToastContext', () => ({
    useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}));

vi.mock('../../components/Modal', () => ({
    ErrorModal: () => null,
    ConfirmModal: () => null,
}));

vi.mock('../../components/LoadingSpinner', () => ({
    LoadingSpinner: () => <div data-testid="spinner">Cargando...</div>,
}));

describe('ReproduccionList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza la lista de reproducción', async () => {
        getReproducciones.mockResolvedValue([]);
        getPartos.mockResolvedValue([]);
        render(
            <MemoryRouter>
                <ReproduccionList />
            </MemoryRouter>
        );
        expect(await screen.findByText('Reproducción')).toBeDefined();
    });
});
