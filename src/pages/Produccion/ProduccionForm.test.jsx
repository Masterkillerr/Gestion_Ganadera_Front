import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProduccionForm from './ProduccionForm';
import { getAnimales, getTurnosProduccion } from '../../services/ganadoService';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/ganadoService', () => ({
    getAnimales: vi.fn().mockResolvedValue([]),
    getTurnosProduccion: vi.fn().mockResolvedValue([]),
    getProducciones: vi.fn(),
    apiProduccion: { create: vi.fn() },
    updateProduccion: vi.fn(),
    getUltimoMovimientoByAnimal: vi.fn(),
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

describe('ProduccionForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza el formulario', async () => {
        render(
            <MemoryRouter>
                <ProduccionForm />
            </MemoryRouter>
        );
        expect(await screen.findByText('Nuevo Registro de Producción')).toBeDefined();
    });
});
