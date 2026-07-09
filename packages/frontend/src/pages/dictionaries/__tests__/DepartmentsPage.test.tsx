import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DepartmentsPage } from '@/pages/dictionaries/DepartmentsPage';
import { departmentsApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  departmentsApi: {
    list: vi.fn().mockResolvedValue({ data: [] }),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}));

describe('DepartmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    render(
      <MemoryRouter>
        <DepartmentsPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Департаменты')).toBeInTheDocument();
  });

  it('renders add button', async () => {
    render(
      <MemoryRouter>
        <DepartmentsPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Добавить')).toBeInTheDocument();
  });

  it('loads departments on mount', async () => {
    render(
      <MemoryRouter>
        <DepartmentsPage />
      </MemoryRouter>
    );
    expect(departmentsApi.list).toHaveBeenCalled();
  });
});
