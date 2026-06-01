import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import authService from '../services/authService';

vi.mock('../services/authService', () => ({
  default: { register: vi.fn() },
}));

vi.mock('../context/LoadingContext', () => ({
  useLoading: () => ({ showLoading: vi.fn(), hideLoading: vi.fn() }),
}));

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Nombre Completo/i)).toBeDefined();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeDefined();
    expect(screen.getByLabelText(/^Contraseña$/i)).toBeDefined();
    expect(screen.getByLabelText(/Confirmar Contraseña/i)).toBeDefined();
  });

  it('handles registration submission', async () => {
    authService.register.mockResolvedValue({});
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
    });
  });
});
