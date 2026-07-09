import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi, vacanciesApi, candidatesApi, departmentsApi, professionsApi, sourcesApi, tagsApi, pipelinesApi } from '@/services/api';

vi.mock('axios', () => {
  const interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        interceptors,
      })),
    },
  };
});

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('authApi has login method', () => {
    expect(typeof authApi.login).toBe('function');
  });

  it('authApi has register method', () => {
    expect(typeof authApi.register).toBe('function');
  });

  it('authApi has getProfile method', () => {
    expect(typeof authApi.getProfile).toBe('function');
  });

  it('vacanciesApi has all methods', () => {
    expect(typeof vacanciesApi.list).toBe('function');
    expect(typeof vacanciesApi.get).toBe('function');
    expect(typeof vacanciesApi.create).toBe('function');
    expect(typeof vacanciesApi.update).toBe('function');
    expect(typeof vacanciesApi.updateStatus).toBe('function');
    expect(typeof vacanciesApi.setTags).toBe('function');
  });

  it('candidatesApi has all methods', () => {
    expect(typeof candidatesApi.list).toBe('function');
    expect(typeof candidatesApi.get).toBe('function');
    expect(typeof candidatesApi.create).toBe('function');
    expect(typeof candidatesApi.update).toBe('function');
    expect(typeof candidatesApi.updateStatus).toBe('function');
  });

  it('departmentsApi has all methods', () => {
    expect(typeof departmentsApi.list).toBe('function');
    expect(typeof departmentsApi.get).toBe('function');
    expect(typeof departmentsApi.create).toBe('function');
    expect(typeof departmentsApi.update).toBe('function');
    expect(typeof departmentsApi.delete).toBe('function');
  });

  it('professionsApi has all methods', () => {
    expect(typeof professionsApi.list).toBe('function');
    expect(typeof professionsApi.get).toBe('function');
    expect(typeof professionsApi.create).toBe('function');
    expect(typeof professionsApi.update).toBe('function');
    expect(typeof professionsApi.delete).toBe('function');
  });

  it('sourcesApi has all methods', () => {
    expect(typeof sourcesApi.list).toBe('function');
    expect(typeof sourcesApi.create).toBe('function');
    expect(typeof sourcesApi.update).toBe('function');
    expect(typeof sourcesApi.delete).toBe('function');
  });

  it('tagsApi has all methods', () => {
    expect(typeof tagsApi.list).toBe('function');
    expect(typeof tagsApi.create).toBe('function');
    expect(typeof tagsApi.update).toBe('function');
    expect(typeof tagsApi.delete).toBe('function');
    expect(typeof tagsApi.getVisibility).toBe('function');
    expect(typeof tagsApi.setVisibility).toBe('function');
  });

  it('pipelinesApi has all methods', () => {
    expect(typeof pipelinesApi.list).toBe('function');
    expect(typeof pipelinesApi.get).toBe('function');
    expect(typeof pipelinesApi.create).toBe('function');
    expect(typeof pipelinesApi.update).toBe('function');
    expect(typeof pipelinesApi.delete).toBe('function');
    expect(typeof pipelinesApi.addStage).toBe('function');
    expect(typeof pipelinesApi.updateStage).toBe('function');
    expect(typeof pipelinesApi.deleteStage).toBe('function');
    expect(typeof pipelinesApi.reorderStages).toBe('function');
  });
});
