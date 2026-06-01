import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

describe('Home Page', () => {
  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/Gestión Ganadera/i)).toBeDefined();
    expect(screen.getByText(/La nueva forma de gestionar tu ganado/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /Iniciar Sesión/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Registrarse/i })).toBeDefined();
  });
});
