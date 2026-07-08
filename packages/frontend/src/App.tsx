import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { VacanciesPage } from '@/pages/vacancies/VacanciesPage';
import { VacancyDetailPage } from '@/pages/vacancies/VacancyDetailPage';
import { CandidatesPage } from '@/pages/candidates/CandidatesPage';
import { CandidateDetailPage } from '@/pages/candidates/CandidateDetailPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { DepartmentsPage } from '@/pages/dictionaries/DepartmentsPage';
import { ProfessionsPage } from '@/pages/dictionaries/ProfessionsPage';
import { PipelinesPage } from '@/pages/pipelines/PipelinesPage';
import { SourcesPage } from '@/pages/dictionaries/SourcesPage';
import { TagsPage } from '@/pages/dictionaries/TagsPage';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import { useAuthStore } from '@/store/auth-store';

function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vacancies" element={<VacanciesPage />} />
          <Route path="/vacancies/:id" element={<VacancyDetailPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:id" element={<CandidateDetailPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/professions" element={<ProfessionsPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/pipelines" element={<PipelinesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
