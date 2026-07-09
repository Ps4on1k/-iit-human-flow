import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { dashboardApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  dashboardApi: {
    stats: vi.fn().mockResolvedValue({ data: { totalVacancies: 5, openVacancies: 3, totalCandidates: 12 } }),
    funnel: vi.fn().mockResolvedValue({ data: [{ status: 'hired', count: 2, name: 'Наняты' }] }),
    pipelineFunnels: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard title', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Дашборд')).toBeInTheDocument();
  });

  it('renders stat cards', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Вакансии')).toBeInTheDocument();
    expect(screen.getByText('Открытые')).toBeInTheDocument();
    expect(screen.getByText('Кандидаты')).toBeInTheDocument();
    expect(screen.getByText('Наняты')).toBeInTheDocument();
  });

  it('loads stats on mount', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(dashboardApi.stats).toHaveBeenCalled();
    expect(dashboardApi.funnel).toHaveBeenCalled();
    expect(dashboardApi.pipelineFunnels).toHaveBeenCalled();
  });
});
