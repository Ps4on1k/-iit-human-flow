import { NotFoundException, ConflictException } from '@nestjs/common';
import { DepartmentsService } from '../departments.service';

const mockPrisma = {
  department: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DepartmentsService', () => {
  let service: DepartmentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DepartmentsService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all departments', async () => {
      const depts = [{ id: '1', name: 'IT', code: 'IT' }];
      mockPrisma.department.findMany.mockResolvedValue(depts);

      const result = await service.findAll();
      expect(result).toEqual(depts);
      expect(mockPrisma.department.findMany).toHaveBeenCalledWith({
        include: { _count: { select: { vacancies: true } } },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('returns a department by id', async () => {
      const dept = { id: '1', name: 'IT', vacancies: [] };
      mockPrisma.department.findUnique.mockResolvedValue(dept);

      const result = await service.findOne('1');
      expect(result).toEqual(dept);
    });

    it('throws NotFoundException when department not found', async () => {
      mockPrisma.department.findUnique.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a new department', async () => {
      mockPrisma.department.findFirst.mockResolvedValue(null);
      mockPrisma.department.create.mockResolvedValue({ id: '1', name: 'IT', code: 'IT' });

      const result = await service.create({ name: 'IT', code: 'IT' });
      expect(result).toEqual({ id: '1', name: 'IT', code: 'IT' });
    });

    it('throws ConflictException when name or code exists', async () => {
      mockPrisma.department.findFirst.mockResolvedValue({ id: '1', name: 'IT' });
      await expect(service.create({ name: 'IT', code: 'IT' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates a department', async () => {
      mockPrisma.department.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.department.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', { name: 'Updated' });
      expect(result).toEqual({ id: '1', name: 'Updated' });
    });

    it('throws NotFoundException when department not found', async () => {
      mockPrisma.department.findUnique.mockResolvedValue(null);
      await expect(service.update('999', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes a department without vacancies', async () => {
      mockPrisma.department.findUnique.mockResolvedValue({ id: '1', _count: { vacancies: 0 } });
      mockPrisma.department.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result).toEqual({ id: '1' });
    });

    it('throws ConflictException when department has vacancies', async () => {
      mockPrisma.department.findUnique.mockResolvedValue({ id: '1', _count: { vacancies: 5 } });
      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when department not found', async () => {
      mockPrisma.department.findUnique.mockResolvedValue(null);
      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
