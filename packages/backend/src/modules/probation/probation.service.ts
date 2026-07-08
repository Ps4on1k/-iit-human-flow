import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProbationService {
  constructor(private prisma: PrismaService) {}

  async create(candidateId: string, userId: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    return this.prisma.probation.create({
      data: {
        candidateId,
        userId,
        status: 'ACTIVE',
        startDate,
        endDate,
      },
    });
  }

  async findOne(candidateId: string) {
    const probation = await this.prisma.probation.findUnique({
      where: { candidateId },
      include: {
        reviews: {
          include: { reviewer: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { month: 'asc' },
        },
      },
    });
    if (!probation) throw new NotFoundException('Probation not found');
    return probation;
  }

  async addReview(probationId: string, month: number, checklist: any, comment: string, score: number, reviewerId: string) {
    return this.prisma.probationReview.create({
      data: {
        probationId,
        month,
        checklist,
        comment,
        score,
        reviewedBy: reviewerId,
      },
    });
  }

  async completeVerdict(candidateId: string, verdict: string, reviewerId: string) {
    return this.prisma.probation.update({
      where: { candidateId },
      data: {
        status: verdict === 'completed' ? 'COMPLETED' : 'FAILED',
        verdict,
        verdictDate: new Date(),
      },
    });
  }
}
