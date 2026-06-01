import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReproduccionForm from './ReproduccionForm';
import { getAnimales, getTiposReproduccion, getResultadosReproduccion, getTiposEvento } from '../../services/ganadoService';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/ganadoService', () => ({
    getAnimales: vi.fn().mockResolvedValue([]),
    getReproduccionById: vi.fn(),
    createReproduccion: vi.fn(),
    updateReproduccion: vi.fn(),
    getPartosByReproduccion: vi.fn(),
    createParto: vi.fn(),
    updateParto: vi.fn(),
    deleteParto: vi.fn(),
    getTiposReproduccion: vi.fn().mockResolvedValue([]),
    getResultadosReproduccion: vi.fn().mockResolvedValue([]),
    getTiposEvento: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../services/api', () => ({
    default: { post: vi.fn() }
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

describe('ReproduccionForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza el formulario', async () => {
        render(
            <MemoryRouter>
                <ReproduccionForm />
            </MemoryRouter>
        );
        expect(await screen.findByText('Nuevo Registro Reproductivo')).toBeDefined();
    });
});
