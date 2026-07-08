import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { UserRole, VacancyStatus } from '@prisma/client';

@Injectable()
export class VacanciesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: UserRole, departmentId?: string) {
    const where: any = {};

    if (role === UserRole.HIRING_MANAGER) {
      where.assignments = { some: { userId } };
    }
    if (departmentId) {
      where.departmentId = departmentId;
    }

    return this.prisma.vacancy.findMany({
      where,
      include: {
        department: true,
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignments: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        tags: { include: { tag: true } },
        _count: { select: { candidates: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id },
      include: {
        department: true,
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignments: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        tags: { include: { tag: true } },
        attachments: true,
        candidates: {
          select: { id: true, firstName: true, lastName: true, status: true, email: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    return vacancy;
  }

  async create(dto: CreateVacancyDto, userId: string) {
    return this.prisma.vacancy.create({
      data: {
        title: dto.title,
        description: dto.description,
        requirements: dto.requirements,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        currency: dto.currency || 'KZT',
        location: dto.location,
        grade: dto.grade,
        urgency: (dto.urgency as any) || 'NORMAL',
        headcount: dto.headcount || 1,
        departmentId: dto.departmentId,
        createdBy: userId,
        assignments: dto.assigneeIds
          ? { create: dto.assigneeIds.map((id) => ({ userId: id, isPrimary: id === userId })) }
          : undefined,
      },
      include: { department: true, assignments: true },
    });
  }

  async update(id: string, dto: UpdateVacancyDto, userId: string, role: UserRole) {
    const vacancy = await this.prisma.vacancy.findUnique({ where: { id } });
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    if (role !== UserRole.ADMIN && vacancy.createdBy !== userId) {
      throw new ForbiddenException('You can only edit your own vacancies');
    }

    return this.prisma.vacancy.update({
      where: { id },
      data: dto as any,
      include: { department: true },
    });
  }

  async updateStatus(id: string, status: VacancyStatus) {
    return this.prisma.vacancy.update({
      where: { id },
      data: { status },
    });
  }
}
