import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(candidateId: string, userId: string, action: string, details?: string, context?: string) {
    return this.prisma.activityLog.create({
      data: { candidateId, userId, action, details, context },
    });
  }

  async findByCandidate(candidateId: string) {
    return this.prisma.activityLog.findMany({
      where: { candidateId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
