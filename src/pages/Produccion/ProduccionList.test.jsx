import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProduccionList from './ProduccionList';
import { getProducciones, getAnimales } from '../../services/ganadoService';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/ganadoService', () => ({
    getProducciones: vi.fn(),
    getAnimales: vi.fn(),
    apiProduccion: { delete: vi.fn() },
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

// Mock Recharts
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div data-testid="recharts-container">{children}</div>,
    BarChart: () => null,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
}));

describe('ProduccionList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza la lista de producción', async () => {
        getProducciones.mockResolvedValue([]);
        getAnimales.mockResolvedValue([]);
        render(
            <MemoryRouter>
                <ProduccionList />
            </MemoryRouter>
        );
        expect(await screen.findByText('Producción de Leche')).toBeDefined();
    });
});
