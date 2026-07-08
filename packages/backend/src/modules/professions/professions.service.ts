import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfessionDto } from './dto/create-profession.dto';
import { UpdateProfessionDto } from './dto/update-profession.dto';

@Injectable()
export class ProfessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.profession.findMany({
      include: { _count: { select: { candidates: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const prof = await this.prisma.profession.findUnique({
      where: { id },
      include: { candidates: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!prof) throw new NotFoundException('Profession not found');
    return prof;
  }

  async create(dto: CreateProfessionDto) {
    const existing = await this.prisma.profession.findFirst({
      where: { OR: [{ name: dto.name }, { code: dto.code }] },
    });
    if (existing) throw new ConflictException('Profession with this name or code already exists');
    return this.prisma.profession.create({ data: dto });
  }

  async update(id: string, dto: UpdateProfessionDto) {
    const prof = await this.prisma.profession.findUnique({ where: { id } });
    if (!prof) throw new NotFoundException('Profession not found');
    return this.prisma.profession.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const prof = await this.prisma.profession.findUnique({ where: { id }, include: { _count: { select: { candidates: true } } } });
    if (!prof) throw new NotFoundException('Profession not found');
    if (prof._count.candidates > 0) {
      throw new ConflictException('Cannot delete profession with existing candidates');
    }
    return this.prisma.profession.delete({ where: { id } });
  }
}
