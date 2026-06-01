import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UsuariosPage from './UsuariosPage';
import usuarioService from '../../services/usuarioService';
import authService from '../../services/authService';
import { useToast } from '../../context/ToastContext';

vi.mock('../../services/usuarioService', () => ({
  default: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}));

describe('UsuariosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra mensaje de acceso restringido si no es admin', async () => {
    authService.getCurrentUser.mockReturnValue({ role: 'OPERARIO' });
    render(<UsuariosPage />);
    expect(screen.getByText('Acceso Restringido')).toBeDefined();
  });

  it('renderiza la tabla de usuarios si es admin', async () => {
    authService.getCurrentUser.mockReturnValue({ role: 'ADMINISTRADOR' });
    usuarioService.getAll.mockResolvedValue([
      { id: 1, nombre: 'Admin', email: 'admin@test.com', rol: 'ADMINISTRADOR' }
    ]);
    
    render(<UsuariosPage />);
    
    expect(await screen.findByText('Administración')).toBeDefined();
    // Use getAllByText because 'Admin' appears in both the table and mobile card views
    const adminElements = screen.getAllByText('Admin');
    expect(adminElements.length).toBeGreaterThanOrEqual(1);
  });
});
