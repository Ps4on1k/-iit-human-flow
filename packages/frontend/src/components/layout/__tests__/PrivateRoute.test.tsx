import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import { useAuthStore } from '@/store/auth-store';

function TestChild() {
  return <div>Protected Content</div>;
}

function LoginPlaceholder() {
  return <div>Login Page</div>;
}

function renderWithRouter(isAuthenticated: boolean) {
  if (isAuthenticated) {
    useAuthStore.getState().login(
      { id: '1', email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'ADMIN' },
      'token'
    );
  } else {
    useAuthStore.getState().logout();
  }

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<LoginPlaceholder />} />
        <Route element={<PrivateRoute />}>
          <Route path="/protected" element={<TestChild />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('renders children when authenticated', () => {
    renderWithRouter(true);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    renderWithRouter(false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
