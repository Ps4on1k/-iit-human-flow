import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.source.findMany({
      include: { _count: { select: { candidates: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string, code: string) {
    const existing = await this.prisma.source.findFirst({ where: { OR: [{ name }, { code }] } });
    if (existing) throw new ConflictException('Источник с таким именем или кодом уже существует');
    return this.prisma.source.create({ data: { name, code } });
  }

  async update(id: string, data: { name?: string }) {
    const source = await this.prisma.source.findUnique({ where: { id } });
    if (!source) throw new NotFoundException('Источник не найден');
    return this.prisma.source.update({ where: { id }, data });
  }

  async remove(id: string) {
    const source = await this.prisma.source.findUnique({ where: { id }, include: { _count: { select: { candidates: true } } } });
    if (!source) throw new NotFoundException('Источник не найден');
    if (source._count.candidates > 0) throw new ConflictException('Нельзя удалить источник с привязанными кандидатами');
    return this.prisma.source.delete({ where: { id } });
  }
}
