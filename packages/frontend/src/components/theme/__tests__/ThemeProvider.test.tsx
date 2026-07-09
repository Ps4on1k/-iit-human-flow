import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { useThemeStore } from '@/store/theme-store';

function TestChild() {
  return <div>Test Content</div>;
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    useThemeStore.getState().setThemeMode('light');
  });

  it('renders children', () => {
    render(
      <ThemeProvider>
        <TestChild />
      </ThemeProvider>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
