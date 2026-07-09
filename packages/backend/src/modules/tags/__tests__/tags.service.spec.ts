import { NotFoundException, ConflictException } from '@nestjs/common';
import { TagsService } from '../tags.service';

const mockPrisma = {
  tag: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userTagVisibility: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
};

describe('TagsService', () => {
  let service: TagsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TagsService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all tags for admin', async () => {
      const tags = [{ id: '1', name: 'Urgent', color: '#FF0000' }];
      mockPrisma.tag.findMany.mockResolvedValue(tags);

      const result = await service.findAll('user1', true);
      expect(result).toEqual(tags);
    });

    it('filters tags by visibility for non-admin', async () => {
      const tags = [
        { id: '1', name: 'Urgent', color: '#FF0000' },
        { id: '2', name: 'Hidden', color: '#0000FF' },
      ];
      mockPrisma.tag.findMany.mockResolvedValue(tags);
      mockPrisma.userTagVisibility.findMany.mockResolvedValue([{ tagId: '1' }]);

      const result = await service.findAll('user1', false);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('create', () => {
    it('creates a new tag', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(null);
      mockPrisma.tag.create.mockResolvedValue({ id: '1', name: 'Urgent', color: '#FF0000' });

      const result = await service.create('Urgent', '#FF0000');
      expect(result.name).toBe('Urgent');
    });

    it('throws ConflictException when tag name exists', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue({ id: '1', name: 'Urgent' });
      await expect(service.create('Urgent', '#FF0000')).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates a tag', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.tag.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException when not found', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(null);
      await expect(service.update('999', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes a tag without associations', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue({ id: '1', _count: { vacancyTags: 0, candidateTags: 0 } });
      mockPrisma.tag.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result.id).toBe('1');
    });

    it('throws ConflictException when tag has associations', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue({ id: '1', _count: { vacancyTags: 5, candidateTags: 0 } });
      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });
  });

  describe('setVisibility', () => {
    it('sets tag visibility for users', async () => {
      mockPrisma.userTagVisibility.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.userTagVisibility.createMany.mockResolvedValue({ count: 2 });

      const result = await service.setVisibility('tag1', ['user1', 'user2']);
      expect(result.success).toBe(true);
    });

    it('clears visibility when empty array', async () => {
      mockPrisma.userTagVisibility.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.setVisibility('tag1', []);
      expect(result.success).toBe(true);
      expect(mockPrisma.userTagVisibility.createMany).not.toHaveBeenCalled();
    });
  });

  describe('getVisibility', () => {
    it('returns visibility list', async () => {
      const vis = [{ user: { id: '1', firstName: 'Ivan', lastName: 'Ivanov', email: 'i@i.com' } }];
      mockPrisma.userTagVisibility.findMany.mockResolvedValue(vis);

      const result = await service.getVisibility('tag1');
      expect(result).toEqual(vis);
    });
  });
});
