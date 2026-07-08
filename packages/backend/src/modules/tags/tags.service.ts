import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, isAdmin: boolean) {
    const tags = await this.prisma.tag.findMany({
      include: {
        _count: { select: { vacancyTags: true, candidateTags: true } },
      },
      orderBy: { name: 'asc' },
    });

    if (isAdmin) return tags;

    const visible = await this.prisma.userTagVisibility.findMany({
      where: { userId },
      select: { tagId: true },
    });
    const visibleIds = new Set(visible.map((v) => v.tagId));

    return tags.filter((tag) => visibleIds.has(tag.id));
  }

  async create(name: string, color: string) {
    const existing = await this.prisma.tag.findUnique({ where: { name } });
    if (existing) throw new ConflictException('Тег с таким именем уже существует');
    return this.prisma.tag.create({ data: { name, color } });
  }

  async update(id: string, data: { name?: string; color?: string }) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Тег не найден');
    return this.prisma.tag.update({ where: { id }, data });
  }

  async remove(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id }, include: { _count: { select: { vacancyTags: true, candidateTags: true } } } });
    if (!tag) throw new NotFoundException('Тег не найден');
    if (tag._count.vacancyTags > 0 || tag._count.candidateTags > 0) {
      throw new ConflictException('Нельзя удалить тег с привязанными вакансиями/кандидатами');
    }
    return this.prisma.tag.delete({ where: { id } });
  }

  async setVisibility(tagId: string, userIds: string[]) {
    await this.prisma.userTagVisibility.deleteMany({ where: { tagId } });
    if (userIds.length > 0) {
      await this.prisma.userTagVisibility.createMany({
        data: userIds.map((userId) => ({ tagId, userId })),
      });
    }
    return { success: true };
  }

  async getVisibility(tagId: string) {
    return this.prisma.userTagVisibility.findMany({
      where: { tagId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async getUserTags(userId: string) {
    const visibility = await this.prisma.userTagVisibility.findMany({
      where: { userId },
      include: { tag: true },
    });
    return visibility.map((v) => v.tag);
  }

  async setUserTags(userId: string, tagIds: string[]) {
    await this.prisma.userTagVisibility.deleteMany({ where: { userId } });
    if (tagIds.length > 0) {
      await this.prisma.userTagVisibility.createMany({
        data: tagIds.map((tagId) => ({ userId, tagId })),
      });
    }
    return { success: true };
  }
}
