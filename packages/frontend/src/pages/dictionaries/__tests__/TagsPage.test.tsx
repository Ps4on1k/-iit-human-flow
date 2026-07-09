import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TagsPage } from '@/pages/dictionaries/TagsPage';
import { tagsApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
  tagsApi: {
    list: vi.fn().mockResolvedValue({ data: [] }),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    getVisibility: vi.fn().mockResolvedValue({ data: [] }),
    setVisibility: vi.fn().mockResolvedValue({}),
  },
}));

describe('TagsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    render(
      <MemoryRouter>
        <TagsPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Теги')).toBeInTheDocument();
  });

  it('renders add button', async () => {
    render(
      <MemoryRouter>
        <TagsPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Добавить')).toBeInTheDocument();
  });

  it('loads tags on mount', async () => {
    render(
      <MemoryRouter>
        <TagsPage />
      </MemoryRouter>
    );
    expect(tagsApi.list).toHaveBeenCalled();
  });
});
