import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '@/store/theme-store';

describe('theme-store', () => {
  beforeEach(() => {
    useThemeStore.getState().setThemeMode('light');
  });

  it('has a valid initial theme mode', () => {
    const mode = useThemeStore.getState().themeMode;
    expect(['light', 'dark']).toContain(mode);
  });

  it('toggleTheme switches between light and dark', () => {
    useThemeStore.getState().setThemeMode('light');
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().themeMode).toBe('dark');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().themeMode).toBe('light');
  });

  it('setThemeMode sets exact mode', () => {
    useThemeStore.getState().setThemeMode('dark');
    expect(useThemeStore.getState().themeMode).toBe('dark');

    useThemeStore.getState().setThemeMode('light');
    expect(useThemeStore.getState().themeMode).toBe('light');
  });
});
