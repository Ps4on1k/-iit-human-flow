import { NotFoundException, ConflictException } from '@nestjs/common';
import { PipelinesService } from '../pipelines.service';

const mockPrisma = {
  pipeline: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
  pipelineStage: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn((ops: any[]) => Promise.all(ops)),
};

describe('PipelinesService', () => {
  let service: PipelinesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PipelinesService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all pipelines', async () => {
      const pipelines = [{ id: '1', name: 'Default', stages: [] }];
      mockPrisma.pipeline.findMany.mockResolvedValue(pipelines);

      const result = await service.findAll();
      expect(result).toEqual(pipelines);
    });
  });

  describe('findOne', () => {
    it('returns a pipeline by id', async () => {
      const pipeline = { id: '1', name: 'Default', stages: [], vacancies: [] };
      mockPrisma.pipeline.findUnique.mockResolvedValue(pipeline);

      const result = await service.findOne('1');
      expect(result).toEqual(pipeline);
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a new pipeline', async () => {
      mockPrisma.pipeline.create.mockResolvedValue({ id: '1', name: 'New', stages: [] });

      const result = await service.create('New');
      expect(result.name).toBe('New');
    });
  });

  describe('update', () => {
    it('updates a pipeline', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.pipeline.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue(null);
      await expect(service.update('999', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes a non-default pipeline without vacancies', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue({ id: '1', isDefault: false, _count: { vacancies: 0 } });
      mockPrisma.pipeline.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result.id).toBe('1');
    });

    it('throws ConflictException when pipeline is default', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue({ id: '1', isDefault: true, _count: { vacancies: 0 } });
      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when pipeline has vacancies', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue({ id: '1', isDefault: false, _count: { vacancies: 5 } });
      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });
  });

  describe('addStage', () => {
    it('adds a stage to a pipeline', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue({ id: '1', stages: [] });
      mockPrisma.pipelineStage.create.mockResolvedValue({ id: 's1', name: 'New', code: 'new' });

      const result = await service.addStage('1', 'New', 'new', '#FF0000');
      expect(result.name).toBe('New');
    });

    it('throws NotFoundException when pipeline not found', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue(null);
      await expect(service.addStage('999', 'New', 'new')).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when stage code exists', async () => {
      mockPrisma.pipeline.findUnique.mockResolvedValue({ id: '1', stages: [{ code: 'new' }] });
      await expect(service.addStage('1', 'New', 'new')).rejects.toThrow(ConflictException);
    });
  });

  describe('removeStage', () => {
    it('deletes a stage', async () => {
      mockPrisma.pipelineStage.findUnique.mockResolvedValue({ id: 's1' });
      mockPrisma.pipelineStage.delete.mockResolvedValue({ id: 's1' });

      const result = await service.removeStage('s1');
      expect(result.id).toBe('s1');
    });

    it('throws NotFoundException when stage not found', async () => {
      mockPrisma.pipelineStage.findUnique.mockResolvedValue(null);
      await expect(service.removeStage('999')).rejects.toThrow(NotFoundException);
    });
  });
});
