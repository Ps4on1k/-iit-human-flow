import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfessionsPage } from '@/pages/dictionaries/ProfessionsPage';
import { professionsApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  professionsApi: {
    list: vi.fn().mockResolvedValue({ data: [] }),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}));

describe('ProfessionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    render(
      <MemoryRouter>
        <ProfessionsPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Профессии')).toBeInTheDocument();
  });

  it('renders add button', async () => {
    render(
      <MemoryRouter>
        <ProfessionsPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Добавить')).toBeInTheDocument();
  });

  it('loads professions on mount', async () => {
    render(
      <MemoryRouter>
        <ProfessionsPage />
      </MemoryRouter>
    );
    expect(professionsApi.list).toHaveBeenCalled();
  });
});
