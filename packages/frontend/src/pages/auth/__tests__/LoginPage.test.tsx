import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { useAuthStore } from '@/store/auth-store';

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('renders login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Инновация ИТ')).toBeInTheDocument();
    expect(screen.getByText('Human Flow — Система найма')).toBeInTheDocument();
  });

  it('renders email input', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });
});
