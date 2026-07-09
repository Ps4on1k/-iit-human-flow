import { NotFoundException, ConflictException } from '@nestjs/common';
import { SourcesService } from '../sources.service';

const mockPrisma = {
  source: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SourcesService', () => {
  let service: SourcesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SourcesService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all sources', async () => {
      const sources = [{ id: '1', name: 'LinkedIn', code: 'linkedin' }];
      mockPrisma.source.findMany.mockResolvedValue(sources);

      const result = await service.findAll();
      expect(result).toEqual(sources);
    });
  });

  describe('create', () => {
    it('creates a new source', async () => {
      mockPrisma.source.findFirst.mockResolvedValue(null);
      mockPrisma.source.create.mockResolvedValue({ id: '1', name: 'LinkedIn', code: 'linkedin' });

      const result = await service.create('LinkedIn', 'linkedin');
      expect(result.name).toBe('LinkedIn');
    });

    it('throws ConflictException when name or code exists', async () => {
      mockPrisma.source.findFirst.mockResolvedValue({ id: '1' });
      await expect(service.create('LinkedIn', 'linkedin')).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates a source', async () => {
      mockPrisma.source.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.source.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.source.findUnique.mockResolvedValue(null);
      await expect(service.update('999', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes a source without candidates', async () => {
      mockPrisma.source.findUnique.mockResolvedValue({ id: '1', _count: { candidates: 0 } });
      mockPrisma.source.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result.id).toBe('1');
    });

    it('throws ConflictException when source has candidates', async () => {
      mockPrisma.source.findUnique.mockResolvedValue({ id: '1', _count: { candidates: 5 } });
      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });
  });
});
