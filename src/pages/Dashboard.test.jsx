import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

vi.mock('../services/animalService', () => ({
    getAnimales: vi.fn().mockResolvedValue([])
}));

vi.mock('../services/ganadoService', () => ({
    getResumenProduccion: vi.fn(),
    getMovimientosRecientes: vi.fn(),
    getProximosPartos: vi.fn(),
    getEventosRecientes: vi.fn(),
    getPromedioLeche: vi.fn(),
    getVacasLactancia: vi.fn(),
}));

vi.mock('../hooks/useAgeDistribution', () => ({ useAgeDistribution: () => ({ adultos: 0, novillos: 0, terneros: 0, sinDatos: 0 }) }));
vi.mock('../hooks/useAnimalStats', () => ({ useAnimalStats: () => ({ total: 0, enTratamiento: 0, activos: 0 }) }));
vi.mock('../hooks/useProductionChartData', () => ({ useProductionChartData: () => [] }));
vi.mock('../hooks/useProductionAverage', () => ({ useProductionAverage: () => 0 }));

vi.mock('../components/LoadingSpinner', () => ({
    LoadingSpinner: () => <div data-testid="spinner">Cargando...</div>,
    Skeleton: () => <div data-testid="skeleton">...</div>,
}));

// Mock Recharts to avoid rendering issues in JSDOM
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div data-testid="recharts-container">{children}</div>,
    LineChart: () => null,
    Line: () => null,
    AreaChart: () => null,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    PieChart: () => null,
    Pie: () => null,
    Cell: () => null,
    BarChart: () => null,
    Bar: () => null,
    Legend: () => null,
}));

describe('Dashboard', () => {
    it('renderiza el dashboard', async () => {
        render(<Dashboard />);
        expect(await screen.findByText('Visión General')).toBeDefined();
    });
});
