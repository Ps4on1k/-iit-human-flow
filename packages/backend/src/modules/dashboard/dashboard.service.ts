import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalVacancies,
      openVacancies,
      totalCandidates,
      hiredCandidates,
      activeOffers,
      pendingBackgroundChecks,
    ] = await Promise.all([
      this.prisma.vacancy.count(),
      this.prisma.vacancy.count({ where: { status: 'OPEN' } }),
      this.prisma.candidate.count(),
      this.prisma.candidate.count({ where: { status: 'hired' } }),
      this.prisma.offer.count({ where: { status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT'] } } }),
      this.prisma.backgroundCheck.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
    ]);

    return {
      totalVacancies,
      openVacancies,
      totalCandidates,
      hiredCandidates,
      activeOffers,
      pendingBackgroundChecks,
    };
  }

  async getFunnel() {
    // Resolve stage codes to display names from pipeline stages
    const stages = await this.prisma.pipelineStage.findMany({
      select: { code: true, name: true, color: true },
    });
    const stageMap: Record<string, { name: string; color: string }> = {};
    for (const s of stages) {
      stageMap[s.code] = { name: s.name, color: s.color || '#3A8DFF' };
    }

    const candidates = await this.prisma.candidate.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return candidates.map((c) => ({
      status: c.status,
      name: stageMap[c.status]?.name || c.status,
      color: stageMap[c.status]?.color || '#8A94A6',
      count: c._count.id,
    }));
  }

  async getPipelineFunnels() {
    const pipelines = await this.prisma.pipeline.findMany({
      include: {
        stages: { orderBy: { sortOrder: 'asc' } },
        vacancies: {
          include: {
            candidates: {
              select: { status: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return pipelines.map((pipeline) => {
      const statusCounts: Record<string, number> = {};
      for (const vacancy of pipeline.vacancies) {
        for (const candidate of vacancy.candidates) {
          statusCounts[candidate.status] = (statusCounts[candidate.status] || 0) + 1;
        }
      }

      const stages = pipeline.stages.map((stage) => ({
        code: stage.code,
        name: stage.name,
        color: stage.color || '#3A8DFF',
        count: statusCounts[stage.code] || 0,
      }));

      const totalCandidates = stages.reduce((sum, s) => sum + s.count, 0);

      return {
        id: pipeline.id,
        name: pipeline.name,
        isDefault: pipeline.isDefault,
        totalCandidates,
        stages,
      };
    });
  }

  async getTimeToHire() {
    const hired = await this.prisma.candidate.findMany({
      where: { status: 'hired' },
      select: { createdAt: true, updatedAt: true },
    });

    if (hired.length === 0) return { averageDays: 0, count: 0 };

    const totalDays = hired.reduce((sum, c) => {
      const days = Math.ceil((c.updatedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return {
      averageDays: Math.round(totalDays / hired.length),
      count: hired.length,
    };
  }
}
