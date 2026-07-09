import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SourcesPage } from '@/pages/dictionaries/SourcesPage';
import { sourcesApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  sourcesApi: {
    list: vi.fn().mockResolvedValue({ data: [] }),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}));

describe('SourcesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    render(
      <MemoryRouter>
        <SourcesPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Источники кандидатов')).toBeInTheDocument();
  });

  it('renders add button', async () => {
    render(
      <MemoryRouter>
        <SourcesPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Добавить')).toBeInTheDocument();
  });

  it('loads sources on mount', async () => {
    render(
      <MemoryRouter>
        <SourcesPage />
      </MemoryRouter>
    );
    expect(sourcesApi.list).toHaveBeenCalled();
  });
});
