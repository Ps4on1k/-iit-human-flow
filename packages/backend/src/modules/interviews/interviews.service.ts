import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(private prisma: PrismaService) {}

  async findByCandidate(candidateId: string) {
    return this.prisma.interview.findMany({
      where: { candidateId },
      include: {
        interviewer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async create(dto: CreateInterviewDto) {
    return this.prisma.interview.create({
      data: dto as any,
      include: { interviewer: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async updateResult(id: string, result: string, feedback?: string, score?: number) {
    return this.prisma.interview.update({
      where: { id },
      data: { result: result as any, feedback, score },
    });
  }

  async remove(id: string) {
    const interview = await this.prisma.interview.findUnique({ where: { id } });
    if (!interview) throw new NotFoundException('Интервью не найдено');
    return this.prisma.interview.delete({ where: { id } });
  }
}
