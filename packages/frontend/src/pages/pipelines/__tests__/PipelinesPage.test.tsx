import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PipelinesPage } from '@/pages/pipelines/PipelinesPage';
import { pipelinesApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  pipelinesApi: {
    list: vi.fn().mockResolvedValue({ data: [] }),
    get: vi.fn().mockResolvedValue({ data: { stages: [] } }),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    addStage: vi.fn().mockResolvedValue({}),
    updateStage: vi.fn().mockResolvedValue({}),
    deleteStage: vi.fn().mockResolvedValue({}),
    reorderStages: vi.fn().mockResolvedValue({}),
  },
}));

describe('PipelinesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    render(
      <MemoryRouter>
        <PipelinesPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Флоу найма')).toBeInTheDocument();
  });

  it('renders create button', async () => {
    render(
      <MemoryRouter>
        <PipelinesPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Создать флоу')).toBeInTheDocument();
  });

  it('loads pipelines on mount', async () => {
    render(
      <MemoryRouter>
        <PipelinesPage />
      </MemoryRouter>
    );
    expect(pipelinesApi.list).toHaveBeenCalled();
  });
});
