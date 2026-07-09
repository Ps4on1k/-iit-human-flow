import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VacanciesPage } from '@/pages/vacancies/VacanciesPage';
import { vacanciesApi, departmentsApi, pipelinesApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  vacanciesApi: {
    list: vi.fn().mockResolvedValue({ data: [] }),
    create: vi.fn().mockResolvedValue({}),
  },
  departmentsApi: {
    list: vi.fn().mockResolvedValue({ data: [] }),
  },
  pipelinesApi: {
    list: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

describe('VacanciesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    render(
      <MemoryRouter>
        <VacanciesPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Вакансии')).toBeInTheDocument();
  });

  it('renders create button', async () => {
    render(
      <MemoryRouter>
        <VacanciesPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Создать вакансию')).toBeInTheDocument();
  });

  it('loads vacancies on mount', async () => {
    render(
      <MemoryRouter>
        <VacanciesPage />
      </MemoryRouter>
    );
    expect(vacanciesApi.list).toHaveBeenCalled();
    expect(departmentsApi.list).toHaveBeenCalled();
    expect(pipelinesApi.list).toHaveBeenCalled();
  });

  it('renders empty table when no vacancies', async () => {
    render(
      <MemoryRouter>
        <VacanciesPage />
      </MemoryRouter>
    );
    const noDataElements = screen.getAllByText('No data');
    expect(noDataElements.length).toBeGreaterThan(0);
  });
});
