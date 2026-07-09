import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProfessionsService } from '../professions.service';

const mockPrisma = {
  profession: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ProfessionsService', () => {
  let service: ProfessionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProfessionsService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all professions', async () => {
      const profs = [{ id: '1', name: 'Developer', code: 'DEV' }];
      mockPrisma.profession.findMany.mockResolvedValue(profs);

      const result = await service.findAll();
      expect(result).toEqual(profs);
    });
  });

  describe('findOne', () => {
    it('returns a profession by id', async () => {
      const prof = { id: '1', name: 'Developer', candidates: [] };
      mockPrisma.profession.findUnique.mockResolvedValue(prof);

      const result = await service.findOne('1');
      expect(result).toEqual(prof);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.profession.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a new profession', async () => {
      mockPrisma.profession.findFirst.mockResolvedValue(null);
      mockPrisma.profession.create.mockResolvedValue({ id: '1', name: 'Developer', code: 'DEV' });

      const result = await service.create({ name: 'Developer', code: 'DEV' });
      expect(result.name).toBe('Developer');
    });

    it('throws ConflictException when name or code exists', async () => {
      mockPrisma.profession.findFirst.mockResolvedValue({ id: '1' });
      await expect(service.create({ name: 'Developer', code: 'DEV' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates a profession', async () => {
      mockPrisma.profession.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.profession.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.profession.findUnique.mockResolvedValue(null);
      await expect(service.update('999', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes a profession without candidates', async () => {
      mockPrisma.profession.findUnique.mockResolvedValue({ id: '1', _count: { candidates: 0 } });
      mockPrisma.profession.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result.id).toBe('1');
    });

    it('throws ConflictException when profession has candidates', async () => {
      mockPrisma.profession.findUnique.mockResolvedValue({ id: '1', _count: { candidates: 5 } });
      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });
  });
});
