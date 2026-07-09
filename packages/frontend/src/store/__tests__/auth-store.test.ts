import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/auth-store';

describe('auth-store', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('starts unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('login sets user, token, and isAuthenticated', () => {
    const user = { id: '1', email: 'test@test.com', firstName: 'Ivan', lastName: 'Ivanov', role: 'ADMIN' };
    useAuthStore.getState().login(user, 'token123');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.token).toBe('token123');
  });

  it('logout clears state', () => {
    const user = { id: '1', email: 'test@test.com', firstName: 'Ivan', lastName: 'Ivanov', role: 'ADMIN' };
    useAuthStore.getState().login(user, 'token123');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('setUser updates user', () => {
    useAuthStore.getState().login(
      { id: '1', email: 'a@a.com', firstName: 'A', lastName: 'B', role: 'HR' },
      'tok'
    );
    const updated = { id: '1', email: 'b@b.com', firstName: 'C', lastName: 'D', role: 'ADMIN' };
    useAuthStore.getState().setUser(updated);

    expect(useAuthStore.getState().user).toEqual(updated);
  });
});
