import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// Vacancies API
export const vacanciesApi = {
  list: (departmentId?: string) =>
    api.get('/vacancies', { params: { departmentId } }),
  get: (id: string) => api.get(`/vacancies/${id}`),
  create: (data: any) => api.post('/vacancies', data),
  update: (id: string, data: any) => api.put(`/vacancies/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/vacancies/${id}/status`, { status }),
};

// Candidates API
export const candidatesApi = {
  list: (vacancyId: string, status?: string) =>
    api.get('/candidates', { params: { vacancyId, status } }),
  get: (id: string) => api.get(`/candidates/${id}`),
  create: (data: any) => api.post('/candidates', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/candidates/${id}/status`, { status }),
};

// Interviews API
export const interviewsApi = {
  list: (candidateId: string) =>
    api.get('/interviews', { params: { candidateId } }),
  create: (data: any) => api.post('/interviews', data),
  updateResult: (id: string, result: string, feedback?: string, score?: number) =>
    api.patch(`/interviews/${id}/result`, { result, feedback, score }),
};

// Background Check API
export const bgCheckApi = {
  get: (candidateId: string) =>
    api.get('/background-checks', { params: { candidateId } }),
  initiate: (candidateId: string) =>
    api.post('/background-checks', { candidateId }),
  updateChecklist: (id: string, data: any) =>
    api.patch(`/background-checks/${id}/checklist`, data),
  complete: (id: string, status: string) =>
    api.patch(`/background-checks/${id}/complete`, { status }),
};

// Offers API
export const offersApi = {
  list: (candidateId: string) =>
    api.get('/offers', { params: { candidateId } }),
  create: (data: any) => api.post('/offers', data),
  sendForApproval: (id: string, approverIds: string[]) =>
    api.patch(`/offers/${id}/send-for-approval`, { approverIds }),
  approve: (id: string, approved: boolean, comment?: string) =>
    api.patch(`/offers/${id}/approve`, { approved, comment }),
  send: (id: string) => api.patch(`/offers/${id}/send`),
  respond: (id: string, accepted: boolean) =>
    api.patch(`/offers/${id}/respond`, { accepted }),
};

// Comments API
export const commentsApi = {
  list: (candidateId: string) =>
    api.get('/comments', { params: { candidateId } }),
  create: (candidateId: string, content: string) =>
    api.post('/comments', { candidateId, content }),
};

// Notifications API
export const notificationsApi = {
  list: (unreadOnly?: boolean) =>
    api.get('/notifications', { params: { unreadOnly } }),
  count: () => api.get('/notifications/count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// Dashboard API
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  funnel: () => api.get('/dashboard/funnel'),
  pipelineFunnels: () => api.get('/dashboard/pipeline-funnels'),
  timeToHire: () => api.get('/dashboard/time-to-hire'),
};

// Departments API
export const departmentsApi = {
  list: () => api.get('/departments'),
  get: (id: string) => api.get(`/departments/${id}`),
  create: (data: any) => api.post('/departments', data),
  update: (id: string, data: any) => api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

// Professions API
export const professionsApi = {
  list: () => api.get('/professions'),
  get: (id: string) => api.get(`/professions/${id}`),
  create: (data: any) => api.post('/professions', data),
  update: (id: string, data: any) => api.put(`/professions/${id}`, data),
  delete: (id: string) => api.delete(`/professions/${id}`),
};

// Pipelines API
export const pipelinesApi = {
  list: () => api.get('/pipelines'),
  get: (id: string) => api.get(`/pipelines/${id}`),
  create: (name: string) => api.post('/pipelines', { name }),
  update: (id: string, data: any) => api.put(`/pipelines/${id}`, data),
  delete: (id: string) => api.delete(`/pipelines/${id}`),
  addStage: (pipelineId: string, data: { name: string; code: string; color?: string }) =>
    api.post(`/pipelines/${pipelineId}/stages`, data),
  updateStage: (stageId: string, data: { name?: string; color?: string }) =>
    api.patch(`/pipelines/stages/${stageId}`, data),
  deleteStage: (stageId: string) => api.delete(`/pipelines/stages/${stageId}`),
  reorderStages: (pipelineId: string, stageIds: string[]) =>
    api.put(`/pipelines/${pipelineId}/stages/reorder`, { stageIds }),
};

// Sources API
export const sourcesApi = {
  list: () => api.get('/sources'),
  create: (data: { name: string; code: string }) => api.post('/sources', data),
  update: (id: string, data: { name: string }) => api.put(`/sources/${id}`, data),
  delete: (id: string) => api.delete(`/sources/${id}`),
};

// Tags API
export const tagsApi = {
  list: () => api.get('/tags'),
  create: (data: { name: string; color: string }) => api.post('/tags', data),
  update: (id: string, data: { name?: string; color?: string }) => api.put(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
  getVisibility: (id: string) => api.get(`/tags/${id}/visibility`),
  setVisibility: (id: string, userIds: string[]) => api.patch(`/tags/${id}/visibility`, { userIds }),
  getUserTags: (userId: string) => api.get(`/tags/by-user/${userId}`),
  setUserTags: (userId: string, tagIds: string[]) => api.patch(`/tags/by-user/${userId}`, { tagIds }),
};

// Candidate Notes API
export const candidateNotesApi = {
  list: (candidateId: string) => api.get(`/candidates/${candidateId}/notes`),
  create: (candidateId: string, content: string) => api.post(`/candidates/${candidateId}/notes`, { content }),
  delete: (candidateId: string, noteId: string) => api.delete(`/candidates/${candidateId}/notes/${noteId}`),
};

// Candidate Attachments API
export const candidateAttachmentsApi = {
  list: (candidateId: string) => api.get(`/candidates/${candidateId}/attachments`),
  upload: (candidateId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/candidates/${candidateId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (candidateId: string, attachmentId: string) => api.delete(`/candidates/${candidateId}/attachments/${attachmentId}`),
};
